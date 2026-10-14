"""Seal the explicit 480-session contextual review; never classify from patterns.

Run only after reviewing edited ledger entries against complete transcripts.
The sealed source hashes let the normal dashboard build reject stale reviews.
"""
import hashlib
import json
from collections import Counter
from build_sampled_conversation_analysis import ROOT, load_transcripts


def definition(label, meaning, boundary):
    return dict(label=label, definition=meaning, boundary=boundary)


# Consolidated AFTER the session-by-session observation ledger was written.
CODEBOOK = {
    'lesson': definition('跟随课后练习', '回应本课问题、选择选项、复述句式，或明确要求回到课程。', '必须有实际课内回应；仅准备好或处于 POST_CLASS 不自动计入。Sing、Guess、I read a book 要看上一轮问的是什么。'),
    'games': definition('想一起玩游戏', '明确发起、选择或接受与 Dino 玩一项互动游戏。', '谈自己玩的游戏不等于要求陪玩；受邀接受与自发发起均可计入，不能据此推断全是主动需求。课内说会唱歌或用手机玩游戏不计。'),
    'stories': definition('想听故事、歌曲或笑话', '希望 Dino 提供或继续一段可听的故事、歌曲、儿歌或笑话。', '提及音乐、分享歌手偏好或回答课内故事题不计；区分点播内容与互动游戏。'),
    'social': definition('自由聊天与陪伴', '明确想和 Dino 聊天、建立朋友关系，或向 Dino 表达亲近。', '普通 Hello / How are you、课内 My friend 及 you/juice 含混转写不单独计入；不据此推断依恋或长期关系。'),
    'self_expression': definition('自我表达与倾诉', '主动分享自己的生活、兴趣、感受或想法，也包括表达孤独、难受或不适，希望 Dino 倾听、关心、安慰或帮助。', '合并原“寻求关心与情绪支持”，同一 Session 即使同时分享经历和寻求支持也只计一次，保留两者的原文证据。课内简短作答、情绪词、Dino 单方面安慰或含混转写不自动计入；需结合上下文确认主动分享或倾诉诉求，不判断实际病情、家庭事实或危险。'),
    'identity_curiosity': definition('对Dino身份、能力好奇', '主动了解 Dino 的名字、年龄、来历、偏好、交互方式、能力，或是否认识和记得自己。', '合并身份好奇与能力、记忆探索，同一 Session 只计一次。需结合上下文确认学生在了解 Dino；复述示范问句、要求改变角色、直接请求办事和询问外部知识不自动计入，粗口或识别失败也不自动视为能力测试。'),
    'practice': definition('英语练习与表达求助', '明确请求练词句、学习拼写，或求助于如何用英语说出自己想表达的内容。', '解释词句含义归入“请求澄清与解释”，不再计入本类。Dino 自行纠错、仅提到 read 或学习经历不计；单纯指定交流语言另列。若同一 Session 另有独立练习或表达请求，可凭不同证据同时保留。'),
    'language': definition('希望调整交流语言', '明确选择英语或本地语，或请求用另一种语言辅助理解。', '使用本地语本身不等于要求切换或翻译；选择说英语不自动等于求英语教学。'),
    'clarification': definition('请求澄清与解释', '表示没听清或没听懂当前对话，请 Dino 重说、换个说法、解释词句含义或说明当前玩法。', '合并原“听不懂”和“解释词义”证据，同一 Session 只计一次，并从原两类移除相应命中。不是获取外部知识，也不是要求 Dino 听懂自己；不能仅凭 What、I don’t know 或 Dino 主动释义命中。需结合前后问答确认澄清诉求，听不清不自动视为词义不懂。'),
    'repair': definition('希望被准确理解', '纠正 Dino 对自己话语、姓名、回答或操作要求的误听与误解，希望它正确理解并回应。', '学生没听懂 Dino、请求重说和询问词义均归入“请求澄清与解释”，不再计入本类。若同一 Session 另有纠正误解的独立证据，可同时保留；单次含混音节或 Dino 单方面猜测不计。'),
    'tool_use': definition('把Dino当成工具使用', '希望 Dino 提供具体事实、知识或方法答案，或帮忙查找图片、拨打电话、联系他人、完成具体操作。', '合并原“希望 Dino 帮忙办事”与“询问具体事实与解释”，同一 Session 即使同时求知和办事也只计一次，两种证据均保留。只计上下文明确的请求，不保证答案正确或任务实际可执行。身份好奇、词句澄清、英语练习及已单列的计算请求不在本次合并范围。'),
    'calculation': definition('请求计算答案', '直接给出算式并希望 Dino 算出结果。', '来自课后样本中连续询问具体加法的案例；与课程数数、星期练习或数学游戏分开，不恢复旧的宽泛知识类。'),
    'product_help': definition('想找老师／切换学习入口', '希望找到老师、回到老师入口，或进入指定学习级别。', '这是产品使用诉求，不等于让 Dino 扮演老师或直接教学。'),
    'director': definition('想设定 Dino 的角色与行动', '明确给 Dino 设定身份、称呼、外观或说话规则，希望它按自己的安排行动。', '你是我的朋友等关系表达不自动当角色指令；请求具体内容或游戏优先记录实际活动。'),
}


def seal():
    transcripts = load_transcripts()
    ledger = ROOT / 'analysis/intent-context-review.tsv'
    samples = {entry: {} for entry in ('HOME', 'EXPLORE', 'POST_CLASS')}
    for line in ledger.read_text().splitlines():
        if not line or line.startswith('#'):
            continue
        entry, sid, findings, note = line.split('\t')
        assert sid not in samples[entry], (entry, sid, 'duplicate')
        session = transcripts[sid]
        keys, anchors = [], {}
        if findings not in ('-', '~'):
            for finding in findings.split(','):
                key, number = finding.split('@')
                assert key in CODEBOOK, (sid, key)
                indices = [int(n) - 1 for n in number.split('+')]
                assert len(indices) == len(set(indices)), (sid, key, 'duplicate anchor')
                for index in indices:
                    assert 0 <= index < len(session['messages']), (sid, key, index)
                    assert session['messages'][index]['role'] == 'user', (sid, key, index)
                assert key not in keys, (sid, key, 'duplicate intent')
                keys.append(key)
                anchors[key] = indices[0] if len(indices) == 1 else indices
        samples[entry][sid] = {
            'intents': keys, 'anchors': anchors, 'rationale': note,
            'status': 'coded' if keys else ('participation_only' if findings == '~' else 'insufficient'),
            'messageCount': len(session['messages']),
            'sourceHash': hashlib.sha256(json.dumps(session, ensure_ascii=False, sort_keys=True).encode()).hexdigest(),
        }
    assert all(len(rows) == 160 for rows in samples.values())
    result = {
        'version': 'context-review-20261013-home-tool-use-1',
        'reviewer': 'AI full-session contextual review; user corrections retained',
        'ledgerHash': hashlib.sha256(ledger.read_bytes()).hexdigest(),
        'codebook': CODEBOOK,
        'samples': samples,
    }
    (ROOT / 'analysis/intent-context-review.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({entry: {'sessions': len(rows), 'statuses': dict(Counter(r['status'] for r in rows.values())), 'intents': dict(Counter(k for r in rows.values() for k in r['intents']))} for entry, rows in samples.items()}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    seal()
