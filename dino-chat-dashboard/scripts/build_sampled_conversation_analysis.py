#!/usr/bin/env python3
"""Build fixed, reviewable sample coding for topic, behavior and student intent.

The public payload contains anonymous dashboard indexes only. Categories are a
snapshot-specific codebook developed after reading the sampled conversations;
rates describe the fixed sample, not the full population.
"""
from __future__ import annotations

import hashlib
import json
import re
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SAMPLE_PER_LEVEL = 40


def category(label, definition, pattern="", detector=None):
    value = {"label": label, "definition": definition, "pattern": pattern}
    if detector:
        value["detector"] = detector
    return value


TOPICS = {
    "HOME": {
        "food": category("食物与吃喝", "围绕水果、正餐、零食或口味展开。", r"\b(food|eat|drink|apple|banana|orange|pizza|rice|cake|bread|juice|ice cream|breakfast|lunch|dinner)\b|吃|水果|饭|苹果|香蕉"),
        "animals": category("动物与恐龙", "谈论宠物、野生动物、恐龙或动物特征。", r"\b(cat|dog|animal|dinosaur|pet|horse|cow|rabbit|tiger|lion|monkey|bird|fish|hamster|turtle)\w*\b|动物|恐龙|猫|狗|马"),
        "games_stories": category("游戏、故事与歌曲", "想玩游戏、听故事、猜谜、唱歌或继续虚构情节。", r"\b(game|guess|riddle|story|stories|song|sing|music|roblox|minecraft)\w*\b|游戏|故事|唱歌|猜"),
        "school": category("学校与学习生活", "谈论学校、作业、老师、科目或英语学习。", r"\b(school|homework|teacher|class|study|learn|english|math|science|book|read)\w*\b|学校|学习|老师|作业|英语"),
        "family_daily": category("家人、朋友与日常", "讲自己的家人、朋友、家庭场景或当天经历。", r"\b(mom|mum|mother|dad|father|brother|sister|family|friend|home|today|yesterday|weekend)\w*\b|妈妈|爸爸|家人|朋友|今天|昨天"),
        "sports": category("运动与户外活动", "谈论足球、篮球、游泳、骑行或户外玩耍。", r"\b(football|soccer|basketball|swim|running|run|bike|cycling|park|outside|sport|jump rope|ronaldo|messi)\w*\b|足球|篮球|游泳|运动|公园"),
        "colors_objects": category("颜色、数字与身边物品", "从颜色、数字、玩具或家中物品开始对话。", r"\b(red|blue|green|yellow|pink|purple|black|white|color|colour|number|toy|phone|car|ball)\w*\b|颜色|数字|玩具|手机|汽车"),
        "feelings": category("情绪与个人经历", "孩子说出开心、害怕、无聊、疲惫或一段个人经历。", r"\b(happy|sad|scared|afraid|angry|bored|boring|tired|lonely|feel|feeling|happened)\w*\b|开心|难过|害怕|无聊|累|心情"),
    },
    "EXPLORE": {
        "animals_nature": category("动物与自然", "围绕动物名称、特征、栖息地或自然现象展开。", r"\b(cat|dog|animal|hamster|horse|cow|rabbit|tiger|lion|monkey|bird|fish|squirrel|nature|ocean|tree)\w*\b|动物|猫|狗|马|海洋|树"),
        "food": category("食物与口味偏好", "通过食物、水果、饮料和喜好来展开。", r"\b(food|eat|drink|apple|banana|orange|pizza|rice|cake|bread|juice|ice cream|onion|strawberr)\w*\b|吃|食物|水果|苹果|香蕉"),
        "games": category("猜谜、游戏与挑战", "请 Dino 启动游戏、猜谜、给线索或继续一项挑战。", r"\b(game|guess|riddle|clue|challenge|roblox|minecraft|play)\w*\b|游戏|猜谜|线索|挑战"),
        "stories_music": category("故事、歌曲与表演", "请 Dino 讲故事、唱歌、朗读或参与表演。", r"\b(story|stories|song|sing|music|dance|movie|read me|once upon)\w*\b|故事|唱歌|歌曲|电影|跳舞"),
        "colors_objects": category("颜色、数字与物品", "从颜色、数字、玩具、手机或汽车等具体对象展开。", r"\b(red|blue|green|yellow|pink|purple|black|white|color|colour|number|toy|phone|car|ball)\w*\b|颜色|数字|玩具|手机|汽车"),
        "space_dinosaurs": category("恐龙、太空与想象世界", "聊恐龙、星球、宇宙、超级英雄或其他想象性题材。", r"\b(dinosaur|space|planet|star|moon|rocket|superhero|spider.?man|dragon|magic)\w*\b|恐龙|太空|月亮|星球|魔法"),
        "school_learning": category("学校、英语与知识探索", "说学校经历、英语学习、词义或一个想知道的问题。", r"\b(school|homework|teacher|class|study|learn|english|meaning|what is|why|how|science|book|read)\w*\b|学校|学习|老师|英语|什么意思|为什么"),
        "feelings": category("情绪、关系与个人经历", "把对话用于表达情绪、倾诉经历或寻求陪伴回应。", r"\b(happy|sad|scared|afraid|angry|bored|tired|lonely|feel|feeling|my mom|my dad|my friend|happened)\w*\b|开心|难过|害怕|无聊|家人|朋友|心情"),
    },
}


BEHAVIORS = {
    "HOME": {
        "brief_opening_reply": category("用简短回答承接首页引导", "首条可见学生消息不超过 4 个词；它可能是在承接 chat history 中缺失的 Dino 首句。", detector="first_short"),
        "question": category("从回答转为主动提问", "学生不只回答首页引导，还主动向 Dino 提出问题。", r"\?|\b(what|why|how|where|when|who|which|can you|do you|are you|will you|would you)\b|为什么|怎么|什么|哪里|你会|你是"),
        "preference": category("表达自己的偏好或选择", "学生明确说出喜欢、不喜欢、想要或选择什么，让首页闲聊转向个人兴趣。", r"\b(i like|i love|my favorite|i prefer|i want|i would like|i choose|i pick|i don.t like)\b|我喜欢|我想要|我选|最喜欢"),
        "extended_reply": category("把回答扩展成较长表达", "任一学生消息达到 12 个及以上词，表现出超出短答的连续表达。", detector="long_message"),
        "request_action": category("主动要求 Dino 做一件事", "学生要求 Dino 讲、读、唱、玩、展示或切换交流方式。", r"\b(can you|please|let.s|i want you to|could you).{0,28}(play|tell|sing|say|read|give|show|make|speak|talk)|\b(tell me a story|play a game|sing a song|give me|show me)\b|请你|给我|讲故事|玩游戏|唱歌"),
        "capability": category("试探 Dino 的能力与身份", "学生询问 Dino 是否能看见、听见、记住，或追问它是谁、叫什么。", r"\b(can you see|can you hear|do you remember|what can you do|are you real|who are you|your name|how old are you)\b|你看得见|你听得见|你记得|你是谁|你叫什么"),
        "confusion": category("表达听不懂／不知道／不会", "学生明确表示不理解、不知道答案或不会完成当前表达。", r"\b(i don.t know|don.t understand|what do you mean|how to say|say again|repeat|cannot understand|can.t say)\b|不知道|听不懂|不明白|不会|怎么说|再说一遍"),
        "early_exit": category("主动结束首页闲聊", "学生主动说再见，或明确要求停止当前对话。", r"\b(stop talking|shut up|leave me|bye|goodbye|gotta go|have to go|end (the )?(chat|conversation))\b|别说了|停止对话|结束对话|再见|拜拜"),
    },
    "EXPLORE": {
        "brief_explore_reply": category("用短词完成探索提示", "首条可见学生消息不超过 4 个词，常以一个选项、主题词或简短回答进入探索。", detector="first_short"),
        "question": category("主动追问或验证信息", "学生围绕正在探索的内容继续提问、确认或追问。", r"\?|\b(what|why|how|where|when|who|which|can you|do you|are you|will you|would you)\b|为什么|怎么|什么|哪里|你会|你是"),
        "preference": category("表达偏好并选择探索方向", "学生通过喜欢、不喜欢、想要或选择来决定接下来探索什么。", r"\b(i like|i love|my favorite|i prefer|i want|i would like|i choose|i pick|i don.t like)\b|我喜欢|我想要|我选|最喜欢"),
        "extended_reply": category("围绕主题持续扩展表达", "任一学生消息达到 12 个及以上词，开始补充细节、理由或连续内容。", detector="long_message"),
        "topic_control": category("主动指定或切换探索主题", "学生明确提出想聊的内容、要求换题或引导 Dino 进入另一个主题。", r"\b(talk about|chat about|change (the )?topic|another topic|something else|can we talk|let.s talk|i want to talk)\b|聊聊|换个话题|说说|我们聊"),
        "request_activity": category("发起游戏、故事或表演互动", "学生主动要求玩游戏、讲故事、唱歌、猜谜或进行其他互动活动。", r"\b(play (a )?game|tell (me )?(a )?story|sing (me )?(a )?song|let.s play|riddle|guessing game|read me)\b|玩游戏|讲故事|唱歌|猜谜|朗读"),
        "capability": category("探索 Dino 的能力边界", "学生试探 Dino 是否能看见、听见、记住或完成某项能力。", r"\b(can you see|can you hear|do you remember|what can you do|are you real|who are you|your name|how old are you)\b|你看得见|你听得见|你记得|你是谁|你叫什么"),
        "local_language": category("使用本地语言／要求切换语言", "学生使用有英文译文的本地语，或明确要求 Dino 改用指定语言。", r"\b(speak|talk|say|translate).{0,18}(chinese|arabic|korean|vietnamese|thai|indonesian|malay)|in (chinese|arabic|korean|vietnamese|thai|indonesian|malay)\b|说中文|说越南语|说泰语|说阿拉伯语|翻译"),
        "confusion": category("探索过程中表示不理解", "学生明确表示不知道、听不懂，或要求 Dino 重复说明。", r"\b(i don.t know|don.t understand|what do you mean|how to say|say again|repeat|cannot understand|can.t say)\b|不知道|听不懂|不明白|不会|怎么说|再说一遍"),
        "early_exit": category("拒绝或提前结束探索", "学生拒绝继续当前探索、要求停止，或主动告别。", r"\b(i don.t want|do not want|no more|stop talking|shut up|leave me|bye|goodbye|gotta go|have to go|end (the )?(chat|conversation))\b|不想|别说了|停止对话|结束对话|再见|拜拜"),
    },
}




def load_js(path, prefix):
    text = path.read_text(encoding="utf-8")
    return json.loads(text[len(prefix):-2])


def load_transcripts():
    result = {}
    for path in (ROOT / "analysis" / "transcripts").glob("*.json"):
        result.update(json.loads(path.read_text(encoding="utf-8")))
    return result


def text_for(message):
    return " ".join(filter(None, [message.get("text", ""), message.get("translation") or ""]))


def first_hit(messages, config):
    regex = re.compile(config["pattern"], re.I)
    for message in messages:
        if message.get("role") == "user" and regex.search(text_for(message)):
            return message
    return None


def behavior_hit(messages, config):
    users = [message for message in messages if message.get("role") == "user" and message.get("text", "").strip()]
    if config.get("detector") == "first_short":
        if users and len(re.findall(r"\b[\w'-]+\b", users[0].get("text", ""), re.UNICODE)) <= 4:
            return users[0]
        return None
    if config.get("detector") == "long_message":
        return next((message for message in users if len(re.findall(r"\b[\w'-]+\b", message.get("text", ""), re.UNICODE)) >= 12), None)
    return first_hit(messages, config)


def fallback_quote(messages):
    users = [m for m in messages if m.get("role") == "user" and m.get("text", "").strip()]
    return max(users, key=lambda m: len(m.get("text", "")), default=(messages[0] if messages else {}))


def quote_payload(message):
    return {"original": message.get("text", ""), "translation": message.get("translation") or "", "timestamp": message.get("timestamp", "")}


def translation_safe(session):
    return bool(session.get("messages")) and all(
        m.get("language") not in (1, 2) or not m.get("text", "").strip() or (m.get("translation") or "").strip()
        for m in session["messages"]
    )


def local_language_message(messages):
    return next((
        message for message in messages
        if message.get("role") == "user"
        and message.get("text", "").strip()
        and (message.get("translation") or "").strip()
    ), None)


def coding(messages, configs, *, fallback=None):
    keys, quotes = [], {}
    for key, config in configs.items():
        if config["pattern"] == "^$":
            continue
        hit = first_hit(messages, config)
        if hit:
            keys.append(key)
            quotes[key] = quote_payload(hit)
    if not keys and fallback:
        keys.append(fallback)
        quotes[fallback] = quote_payload(fallback_quote(messages))
    return keys, quotes


def behavior_coding(entry, messages):
    configs = BEHAVIORS.get(entry, {})
    keys, quotes = [], {}
    for key, config in configs.items():
        hit = behavior_hit(messages, config)
        if hit:
            keys.append(key)
            quotes[key] = quote_payload(hit)
    if entry == "EXPLORE":
        language_hit = local_language_message(messages)
        if language_hit and "local_language" not in keys:
            keys.append("local_language")
            quotes["local_language"] = quote_payload(language_hit)
    return keys, quotes


def reviewed_intents(review, entry, sid, session):
    """Read reviewed assignments only; changed/unseen transcripts fail closed."""
    record = review['samples'][entry][str(sid)]
    source_hash = hashlib.sha256(json.dumps(session, ensure_ascii=False, sort_keys=True).encode()).hexdigest()
    if source_hash != record['sourceHash']:
        raise ValueError(f'Session {sid} changed since contextual review; review it again')
    messages = session['messages']
    quotes = {}
    for key, anchor in record['anchors'].items():
        indices = anchor if isinstance(anchor, list) else [anchor]
        index = indices[0]
        quote = quote_payload(messages[index])
        quote['messageIndex'] = index
        quote['messageIndices'] = indices
        quote['context'] = [dict(quote_payload(m), role=m['role'], messageIndex=i)
                            for i, m in enumerate(messages)
                            if any(max(0, pos - 1) <= i <= min(len(messages) - 1, pos + 2) for pos in indices)]
        quotes[key] = quote
    # Unresolved sessions remain in the denominator, with inspectable evidence.
    if not record['intents']:
        index = next((i for i, m in enumerate(messages) if m['role'] == 'user'), 0)
        quotes['review_' + record['status']] = dict(
            quote_payload(messages[index]), messageIndex=index,
            context=[dict(quote_payload(m), role=m['role'], messageIndex=i)
                     for i, m in enumerate(messages[:4])],
        )
    return list(record['intents']), quotes, {
        'status': record['status'], 'rationale': record['rationale'],
        'version': review['version'], 'messageCount': record['messageCount'],
    }




def sample_rows(data, transcripts, entry_index):
    rows = [row for row in data["sessionRows"] if row[0] == entry_index and translation_safe(transcripts[str(row[2])])]
    groups = defaultdict(list)
    for row in rows:
        level = data["dimensions"]["levels"][data["userProfiles"][row[1]][1]]
        if level in ("1", "2", "3", "4"):
            groups[level].append(row)
    chosen = []
    for level in ("1", "2", "3", "4"):
        ordered = sorted(groups[level], key=lambda row: hashlib.sha256(f"open-code-v1:{entry_index}:{row[2]}".encode()).hexdigest())
        chosen.extend(ordered[:SAMPLE_PER_LEVEL])
    return chosen


def build():
    data = load_js(ROOT / "data.js", "window.DINO_DATA=")
    transcripts = load_transcripts()
    review = json.loads((ROOT / 'analysis/intent-context-review.json').read_text())
    ledger_hash = hashlib.sha256((ROOT / 'analysis/intent-context-review.tsv').read_bytes()).hexdigest()
    if ledger_hash != review['ledgerHash']:
        raise ValueError('Review ledger changed: inspect it and seal the review before building')
    payload = {
        "meta": {
            "sampleSizePerEntry": SAMPLE_PER_LEVEL * 4,
            "sampleMethod": "保留原有固定样本：每入口按 Level 1–4 分层，每级 40 段，共 160 段。学生意图于 2026-10-13 逐段重读完整已记录对话后归纳；话题与行为本次未重标。",
            "denominator": "百分比 = 当前 Level／年龄／国家筛选后命中该类别的抽样 Session 数 ÷ 当前抽样 Session 数。允许多标签，合计可超过 100%。",
            "limits": "意图是 AI 上下文复核的定性判断，保留既有人工更正，并非人工逐条验收或真实心理测量。分母包含证据不足与仅见承接的样本。原抽样依赖已有译文字段，转写及少量未翻译片段仍可能影响判断。各 Level 等量抽样且未按真实流量加权，不能直接当作全量用户概率。",
            "intentReviewVersion": review['version'],
            "intentReviewMethod": "先逐段阅读学生与 Dino 的完整已记录上下文，写下诉求及不确定性，再归并类别；按明确请求、受邀选择、主动转题及持续纠正等语境判断，不按关键词、句长或单个问句自动归类。新对话或原文变化必须另行复核。",
            "timeBasis": "北京时间",
        },
        "codebooks": {"topics": TOPICS, "behaviors": BEHAVIORS, "intents": review['codebook']},
        "samples": {},
    }
    for entry_index, entry in enumerate(data["dimensions"]["entries"]):
        result = []
        selected = sample_rows(data, transcripts, entry_index)
        if {str(row[2]) for row in selected} != set(review['samples'][entry]):
            raise ValueError(f'{entry} sample changed; do not silently classify unreviewed sessions')
        for row in selected:
            session = transcripts[str(row[2])]
            messages = session["messages"]
            profile = data["userProfiles"][row[1]]
            topic_keys, topic_quotes = (coding(messages, TOPICS[entry], fallback=None) if entry in TOPICS else ([], {}))
            behavior_keys, behavior_quotes = behavior_coding(entry, messages)
            intent_keys, intent_quotes, intent_review = reviewed_intents(review, entry, row[2], session)
            result.append({
                "sid": row[2],
                "date": data["dimensions"]["dates"][row[3]],
                "level": data["dimensions"]["levels"][profile[1]],
                "age": data["dimensions"]["ageBands"][profile[0]],
                "country": data["dimensions"]["countries"][profile[2]],
                "topics": topic_keys,
                "behaviors": list(dict.fromkeys(behavior_keys)),
                "intents": list(dict.fromkeys(intent_keys)),
                "intentReview": intent_review,
                "quotes": {"topics": topic_quotes, "behaviors": behavior_quotes, "intents": intent_quotes},
            })
        payload["samples"][entry] = result
    return payload


def main():
    payload = build()
    output = ROOT / "sampled-conversation-analysis-data.js"
    output.write_text("window.DINO_SAMPLED_CONVERSATION_ANALYSIS=" + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
    print(json.dumps({entry: len(rows) for entry, rows in payload["samples"].items()}, ensure_ascii=False))


if __name__ == "__main__":
    main()
