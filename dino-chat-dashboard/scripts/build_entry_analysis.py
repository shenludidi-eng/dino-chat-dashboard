#!/usr/bin/env python3
"""Reproducible, descriptive full-corpus scan with independent entry codebooks.

No prompt objectives, quality scores, inferred personality, or LLM claims.
The codebooks were developed from each entry's observed words and utterances.
Counts are rule hits, not validated semantic prevalence. Text is loaded separately
on evidence drilldown; identifiers are replaced with the existing dashboard indexes.
"""
import argparse
import collections
import hashlib
import json
import re
from pathlib import Path

from build_data import BUSINESS_TIMEZONE, ENTRY_ORDER, business_date, business_datetime, lang


TRANSCRIPT_SCHEMA_VERSION = 2


def tag(label, pattern, condition=None):
    return {"label": label, "pattern": pattern, "condition": condition}


def group(key, title, role, tags, note):
    return {"key": key, "title": title, "role": role, "tags": tags, "note": note}


# Each entry has its own topics and behavior axes; shared field structure only.
HOME_TOPICS = [
    tag("颜色与物品", r"\b(colou?rs?|red|blue|yellow|green|pink|white|black)\b|颜色|蓝色|黄色"),
    tag("游戏与猜谜", r"\b(games?|guess|clues?|riddles?)\b|游戏|猜谜"),
    tag("学校与学习生活", r"\b(school|homework|teacher|study|learning|learn|weekends?)\b|学校|作业|学习"),
    tag("食物与吃喝", r"\b(apple|banana|oranges?|dinner|breakfast|lunch|food|eat|rice|cake)\b|吃|水果|饭"),
    tag("家人和朋友", r"\b(mom|mum|mother|dad|father|brother|sister|family|friends?)\b|妈妈|爸爸|朋友|姐姐|弟弟"),
    tag("动物与恐龙", r"\b(cats?|dogs?|animals?|dinosaurs?|pets?)\b|动物|恐龙|小猫|小狗"),
    tag("故事与歌曲", r"\b(story|stories|songs?|sing|sang)\b|故事|唱歌|歌曲"),
    tag("运动和户外活动", r"\b(football|soccer|basketball|swim|swimming|park|outside|bike)\b|足球|游泳|公园"),
]
EXPLORE_TOPICS = [
    tag("猫狗与动物特征", r"\b(cats?|dogs?|animals?|meow|bark|fur|tails?)\b|动物|小猫|小狗"),
    tag("颜色与颜色物品", r"\b(colou?rs?|blue|yellow|red|pink|purple|green|white|black)\b|颜色|蓝色|红色"),
    tag("动物猜谜与线索游戏", r"\b(guess|clues?|riddles?|animal game|animal clues)\b|猜谜"),
    tag("水果与喜欢的食物", r"\b(food|apple|banana|strawberr\w*|chicken|ice cream|eat|yummy)\b|水果|食物|苹果"),
    tag("恐龙与太空", r"\b(dinosaurs?|space|planets?|stars?|moon|rocket|t[ -]?rex)\b|恐龙|太空|月亮"),
    tag("玩具与电子游戏", r"\b(toys?|roblox|minecraft|phone|video games?|computer games?)\b|玩具|手机"),
    tag("足球与体育", r"\b(football|soccer|basketball|ronaldo|messi|sports?)\b|足球|篮球"),
    tag("唱歌与编故事", r"\b(song|sing|story|stories|once upon)\b|唱歌|故事"),
]
POST_TOPICS = [
    tag("面包、果汁与苹果", r"\b(bread|juice|apples?)\b|面包|果汁|苹果"),
    tag("猫、牛与马", r"\b(cats?|cows?|horses?)\b|猫|牛|马"),
    tag("跳跃、攀爬与飞行", r"\b(jump\w*|climb\w*|fly|flying)\b|跳|爬|飞"),
    tag("星期与先后顺序", r"\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|days?)\b|星期|周一|周二"),
    tag("月份与日历", r"\b(months?|january|february|march|april|june|july|august|september|october|november|december)\b|月份|几月"),
    tag("课程与科目", r"\b(class|music|math|art|school)\b|音乐|数学|美术|课程"),
    tag("文具与物品使用", r"\b(pencil|crayon|bag|book|pen|eraser)\b|铅笔|蜡笔|书包"),
    tag("购买、价格与价值", r"\b(bargain|worth|buy|price|cost|money|shop)\b|购买|价格|便宜"),
]


def topic_group(key, title, role, tags):
    # Clone definitions so each entry/role can evolve independently.
    return group(key, title, role, [dict(t) for t in tags],
                 "从本入口高频词与原文整理的主题线索；提及不等于偏好，也不证明课程相关性。允许多个主题。")


CONFIGS = [
    {"entry": "HOME", "subtitle": "日常话题、互动邀请与反复澄清", "color": "#c55735", "groups": [
        group("home_directions", "Dino：日常聊天如何展开", "assistant", [
            tag("请求重说或澄清", r"didn.t catch|missed a part|not sure.{0,20}(heard|mean)|(?:could you|can you|please).{0,15}(?:say|repeat)|repeat.{0,12}slow|没听清|再说一遍|nghe rõ|(?:bạn|con|em) nói lại|فاتني|لم أفهم"),
            tag("邀请游戏或故事", r"(?:want|like|let.s|play|try).{0,35}(?:game|story|guess)|游戏|讲故事"),
            tag("询问学习频率或时长", r"(?:how often|how long|often or sometimes|days a week)|(?:study|learn).{0,40}(?:often|minutes|week|long)|多久|学习.{0,10}(?:时间|几次)"),
            tag("介绍 Dino 或询问称呼", r"(?:i.m|i am|my name is) dino|your name|call you|from ora|我叫|你叫什么"),
            tag("询问喜好或日常经历", r"(?:do you like|what.{0,25}favou?rite|what did you|did you.{0,25}today)|喜欢什么|今天.{0,12}(?:做|玩)"),
            tag("解释含义或给表达示例", r"(?:it|that|this|word).{0,10}means|you can say|try saying|的意思|可以说|意思是"),
            tag("回应情绪并陪伴", r"(?:that hurts|sorry.{0,20}(?:sad|happened)|here with you|sounds.{0,10}(?:sad|scary)|don.t worry)|别担心|难过|陪着你"),
            tag("明确谈及切换语言", r"(?:speak|talk|say).{0,18}(?:chinese|arabic|korean|vietnamese|thai|english)|用中文|说中文|نتكلم بالعربي"),
        ], "描述 Dino 文本中出现的动作；一次回应可同时含澄清、解释或提问。"),
        topic_group("home_dino_topics", "Dino 提及的生活与互动主题", "assistant", HOME_TOPICS),
        topic_group("home_child_topics", "孩子实际说到的生活内容", "user", HOME_TOPICS),
        group("home_child_actions", "孩子：分享、提问与互动请求", "user", [
            tag("讲自己的生活或家人", r"\b(my (?:mom|dad|mother|father|friend|sister|brother|school)|i (?:went|played|have|had|saw))\b|我今天|我昨天|我家|我的妈妈"),
            tag("询问 Dino 的身份或能力", r"your name|who are you|how old are you|can you (?:sing|dance|speak)|你叫什么|你是谁|你会"),
            tag("提出 why / how / what 问题", r"(?:^|[.!?]\s*)(?:why|how|what|where|when|who)\b|为什么|怎么|什么|哪里"),
            tag("表达心情", r"\bi(?:.m| am| feel).{0,12}(?:happy|sad|angry|scared|lonely|tired|bored)\b|我.{0,4}(?:难过|开心|害怕|生气|无聊)"),
            tag("问候或告别", r"\b(hi|hello|bye|goodbye|see you)\b|你好|再见|مرحبا|안녕"),
            tag("简短肯定或否定", r"^(?:yes|no|yeah|ok|okay|yep|nope|嗯|好|是的|不是|نعم|لا)[.! ,。！]*$"),
        ], "一个孩子表达可以同时包含生活分享、提问和情绪。短回答不被解释为能力不足。"),
        group("home_preferences", "孩子明确表达的偏好与主动请求", "user", [
            tag("明确说喜欢或不喜欢", r"\bi (?:like|love|prefer|dislike|don.t like)\b|my favou?rite|我喜欢|我不喜欢|最喜欢"),
            tag("主动要求游戏", r"(?:want|can we|let.s|please).{0,20}play|(?:play|want).{0,15}game|玩游戏|我要玩"),
            tag("主动要求故事或歌曲", r"(?:tell|want|sing|give).{0,25}(?:story|song)|sing (?:me|for)|讲故事|唱歌"),
            tag("主动指定聊天语言", r"(?:speak|talk|say|in).{0,12}(?:arabic|chinese|korean|vietnamese|thai|english)|说中文|用中文|تكلم بالعربي"),
            tag("明确拒绝或要求停止", r"don.t want|do not want|stop (?:talking|asking)|leave me|不想|别说|不要问"),
        ], "只统计用户明确说出的偏好或请求；回答某个话题、聊得多都不等于喜欢，不推断固定人格。"),
        group("home_support", "孩子在开放聊天中的帮助信号", "user", [
            tag("明确表示不理解", r"don.t understand|do not understand|what does.{0,50}mean|听不懂|不明白|什么意思|لا أفهم|没听懂"),
            tag("询问如何用英语说", r"how (?:do|can) i say|how to say|can.t say|英文怎么|不会说|怎么说"),
            tag("不知道答案或说什么", r"don.t know|do not know|no idea|不知道|答不上"),
            tag("明确请求重复", r"say.{0,10}again|repeat.{0,15}(?:please|that|it)|再说一遍|重复"),
        ], "这里记录显式文字信号；不知道某个事实不一定是语言困难。不能从文本推断真实沉默或 ASR 失败。"),
    ]},
    {"entry": "EXPLORE", "subtitle": "选题、兴趣展开与表达尝试", "color": "#138b83", "groups": [
        group("explore_directions", "Dino：选题与兴趣表达的展开方式", "assistant", [
            tag("提供或确认聊天话题", r"(?:want to|let.s|we can|like to) talk about|choose.{0,15}topic|what.{0,15}talk about|想聊|聊一聊"),
            tag("给出可以说的英文表达", r"you can say|try saying|try[: ,]+[\"“]|in english.{0,10}say|say[: ]+[\"“]|可以说|试着说"),
            tag("猜测并重述孩子表达", r"i think you mean|did you mean|do you mean|你的意思|你是说"),
            tag("启动猜谜或说明规则", r"let.s play|i.{0,10}(?:give|say).{0,15}clue|you guess|take turns|same game|游戏规则|你来猜"),
            tag("询问颜色或动物特征", r"what colou?r|what sound|what.{0,12}animal|does.{0,18}(?:eat|live|like)|什么颜色|什么动物"),
            tag("让孩子补充经历或细节", r"tell me more|what happened|what did you|what do you.{0,15}(?:play|build|do)|发生了什么"),
            tag("询问下一话题或另一选项", r"something else|another topic|different topic|what.{0,10}next|换个话题|别的话题"),
            tag("告别或邀请下次再聊", r"\b(goodbye|bye|come back|see you|next time)\b|再见|下次"),
        ], "这些动作来自本入口实际文本，包括自然话题、示例表达和猜谜；不按当前 Prompt 判定是否符合目标。"),
        topic_group("explore_dino_topics", "Dino 展开的兴趣主题", "assistant", EXPLORE_TOPICS),
        topic_group("explore_child_topics", "孩子实际参与的兴趣内容", "user", EXPLORE_TOPICS),
        group("explore_child_actions", "孩子：选题、描述与表达尝试", "user", [
            tag("主动提出想聊什么", r"(?:i want|let.s|can we|want) to?\s*talk about|let.s talk|想聊|我们聊"),
            tag("直接说出动物或颜色词", r"^(?:(?:a |the |i like )?)(?:cat|dog|animal|animals|dinosaur|blue|red|yellow|pink|white|green|purple)[.! ,]*$"),
            tag("描述动物、物品或颜色", r"\b(?:it|cat|dog|apple|animal).{0,15}(?:is|are|has|can)\b|\b(?:is|are) (?:red|blue|yellow|cute|big|small)\b"),
            tag("分享个人活动或经历", r"\bi (?:play|played|went|have|eat|ate)\b|\bmy (?:mom|friend|sister|school)\b|我玩|我去|我今天"),
            tag("向 Dino 提问", r"(?:^|[.!?]\s*)(?:what|why|how|where|can you|do you|is he|is it)\b|为什么|什么|怎么|너는"),
            tag("回应中含上一条示例原文", r"", "echo_example"),
            tag("告别或说要离开", r"\b(bye|goodbye|see you|go to sleep)\b|再见|不聊了"),
        ], "示例复用只按上一条 Dino 明确给出的英文引号内容匹配；不把长回答自动识别为跟读。"),
        group("explore_choices", "孩子明确选择与提出的活动", "user", [
            tag("明确表达话题喜好", r"i (?:like|love|prefer|don.t like)|my favou?rite|我喜欢|我不喜欢"),
            tag("主动请求游戏或猜谜", r"(?:play|want).{0,15}game|let.s play|can we play|guess|玩游戏|猜谜"),
            tag("主动请求换题或表达无聊", r"another topic|something else|different topic|boring|bored|换个|无聊"),
            tag("请求唱歌或故事", r"sing|tell.{0,15}story|song please|唱歌|讲故事"),
            tag("明确请求特定语言", r"(?:speak|in|talk).{0,12}(?:chinese|arabic|korean|vietnamese|thai)|中文|韩语|تكلم|한국어"),
        ], "记录明确选择和请求；话题参与次数不等同于兴趣强度。"),
        group("explore_support", "孩子在兴趣对话中的卡点", "user", [
            tag("追问含义或表示听不懂", r"what does.{0,40}mean|don.t understand|do not understand|听不懂|什么意思|لا أفهم|모르겠|không hiểu"),
            tag("请求英语表达帮助", r"how (?:do|can) i say|how to say|in english|怎么说|英文"),
            tag("不知道答案或无法选择", r"don.t know|no idea|do not know|不知道|随便"),
            tag("请求重复刚才的话", r"say.{0,12}again|repeat (?:it|that)|再说一遍"),
            tag("纠正 Dino 的理解", r"no.{0,12}i (?:mean|said)|i said|not that|不是这个|我说的是|그게 아니라"),
        ], "按显式文字检索帮助信号；普通非英语表达独立展示，不自动计入求助。"),
    ]},
    {"entry": "POST_CLASS", "subtitle": "具体问答、表达内容与轮次中的变化", "color": "#87613b", "groups": [
        group("post_directions", "Dino：具体问题如何展开", "assistant", [
            tag("问食物或动物喜好", r"(?:do you like|which.{0,20}like|want).{0,35}(?:bread|juice|apple|cat|cow|horse)|喜欢.{0,12}(?:猫|牛|马|面包|苹果)"),
            tag("问能否跳、爬或飞", r"can you.{0,25}(?:jump|climb|fly)|do you.{0,15}(?:jump|climb)|会.{0,8}(?:跳|爬|飞)"),
            tag("问星期或月份顺序", r"(?:what|which).{0,45}(?:day|month|comes|before|after)|(?:day|month).{0,25}(?:before|after)|星期|几月"),
            tag("问科目、用品或使用场景", r"(?:what|which|do you|have you).{0,40}(?:class|music|art|math|pencil|crayon|book|bag)"),
            tag("问购买、价值或价格", r"(?:what|why|how|do you|would you|is).{0,45}(?:buy|worth|bargain|price|cost)"),
            tag("给出多个具体选项", r"\b(?:cat|cow|horse|bread|juice|apple|jump|climb|fly|music|art|math)\b.{0,35}\bor\b"),
            tag("安抚后接新问题", r"that.s okay|no problem|don.t worry|没关系"),
            tag("提醒尚未结束并继续问", r"our chat isn.t over yet|chat is not over|还没结束"),
            tag("简短回应后告别", r"\b(?:bye|goodbye)\b|再见"),
        ], "独立整理自 POST_CLASS 的真实问题；未读取课程目标、目标轮次或当前 Prompt，不判断课程迁移或完成。"),
        topic_group("post_dino_topics", "Dino 问到的具体内容", "assistant", POST_TOPICS),
        topic_group("post_child_topics", "孩子实际回答出的内容", "user", POST_TOPICS),
        group("post_child_actions", "孩子：具体回答的表达形式", "user", [
            tag("仅肯定或否定", r"^(?:yes|no|yeah|ok|okay|yes i do|no i don.t|yes i can|no i can.t|نعم|لا|是的|不是)[.! ,。]*$"),
            tag("说出食物或动物名称", r"\b(bread|juice|apple|cat|cats|cow|horse)\b|面包|果汁|苹果|小猫"),
            tag("表达自己能做什么", r"\bi can(?:.t|not)?\b|我会|我不会|我能"),
            tag("回答星期或先后关系", r"\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|comes after|comes before)\b|星期"),
            tag("表示已准备好", r"\bready\b|准备好了"),
            tag("回答中提出问题", r"(?:^|[.!?]\s*)(?:how|why|what|where|can you|do you)\b|为什么|怎么|什么"),
        ], "回答形式允许重叠；单词和 Yes/No 都是实际表达，不据此判断学习能力或有效性。"),
        group("post_preferences", "孩子明确表达的选择与补充", "user", [
            tag("明确说喜欢什么", r"\bi (?:like|love|prefer)\b|my favou?rite|我喜欢"),
            tag("明确说不喜欢或不想", r"\bi (?:don.t like|dislike|don.t want)\b|不喜欢|不想"),
            tag("补充自己的物品或经历", r"\bmy (?:cat|dog|house|mom|school|book)|\bi (?:have|went|played|saw)\b|我有|我家|我去了"),
            tag("说再见或请求停止", r"\b(bye|goodbye|stop|see you)\b|再见|不聊了|结束"),
            tag("请求游戏或其他活动", r"\b(?:play a game|let.s play|sing|tell a story)\b|玩游戏|唱歌"),
        ], "记录明确偏好和补充信息；不把用户回答的课程词汇当成兴趣画像。"),
        group("post_support", "孩子在具体问答中的帮助信号", "user", [
            tag("表示不理解当前内容", r"don.t understand|do not understand|what does.{0,30}mean|听不懂|什么意思|không hiểu|لا أفهم"),
            tag("明确说不知道", r"don.t know|do not know|no idea|不知道"),
            tag("明确说做不到某动作", r"\bi (?:can.t|cannot).{0,15}(?:jump|climb|fly)\b|不会跳|不能飞|不会爬"),
            tag("请求翻译或指定语言", r"translate|(?:speak|in).{0,12}(?:chinese|arabic|korean|vietnamese|thai)|说中文|翻译|한국어"),
            tag("请求重复", r"say.{0,10}again|repeat (?:it|that)|再说一遍"),
        ], "做不到动作与不会用英语表达分开记录；真实沉默与识别失败需录音状态字段，当前不能确认。"),
    ]},
]


def normalize(text):
    return text.replace("’", "'").replace("‘", "'").lower()


def redact(text):
    text = re.sub(r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}", "[email hidden]", text)
    return re.sub(r"(?<!\w)\+?\d[\d -]{7,}\d(?!\w)", "[number hidden]", text)


def classify_language(text):
    if not text.strip():
        return 3
    if lang(text):
        return 1  # Non-English signal, possibly mixed; never claim native language.
    if re.fullmatch(r"[\W\d_]+", text):
        return 3
    return 0 if re.search(r"[a-zA-Z]", text) else 2


def matches(t, text, previous_dino):
    if t["condition"] == "echo_example":
        if not re.search(r"you can say|try|say:", normalize(previous_dino)):
            return False
        quoted = re.findall(r'[“"]([^”"]+)[”"]', previous_dino)
        clean = lambda s: " ".join(re.findall(r"[a-z']+", normalize(s)))
        return any(len(clean(q).split()) >= 2 and clean(q) in clean(text) for q in quoted)
    return bool(t["regex"].search(normalize(text)))


def build(source, dashboard, output):
    raw = json.loads(source.read_text())
    data = json.loads((dashboard / "data.js").read_text().split("=", 1)[1].rstrip(";\n"))
    # Fail rather than silently merge another window or invalidate profile indexes.
    dedup = {str(m["message_id"]): m for m in raw}
    raw = list(dedup.values())
    assert len(raw) == data["meta"]["totalMessages"], "Source differs from dashboard; reconcile first"
    user_ids = sorted({str(m["user_id"]) for m in raw})
    session_key = lambda m: (m["entry_type"],str(m["user_id"]),str(m["session_id"]))
    session_ids = sorted({session_key(m) for m in raw})
    assert len(user_ids) == data["meta"]["users"]
    assert len(session_ids) == data["meta"]["sessions"]
    ui, si = {v:i for i,v in enumerate(user_ids)}, {v:i for i,v in enumerate(session_ids)}
    di = {d:i for i,d in enumerate(data["dimensions"]["dates"])}
    expected_sessions = {r[2]:(r[0],r[1],r[5]) for r in data["sessionRows"]}
    translations = json.loads((dashboard / "scripts/translations_en.json").read_text())
    extra = dashboard / "scripts/analysis_translations_en.json"
    if extra.exists():
        translations.update(json.loads(extra.read_text()))
    grouped = collections.defaultdict(list)
    for m in raw:
        grouped[session_key(m)].append(m)
    for config in CONFIGS:
        for g in config["groups"]:
            for t in g["tags"]:
                t["regex"] = re.compile(t["pattern"], re.I)
    records = [[], [], []]
    shards = collections.defaultdict(dict)
    role_counts = [collections.Counter() for _ in range(3)]
    # Records: date,user,session,round,messageIndex, groupMasks (6), language.
    for sid in session_ids:
        messages = sorted(grouped[sid], key=lambda m:(int(m["sequence_no"]), m["created_at"]))
        e = ENTRY_ORDER.index(messages[0]["entry_type"])
        uid, sid_i = ui[str(messages[0]["user_id"])], si[sid]
        assert len({(m["entry_type"],str(m["user_id"])) for m in messages}) == 1
        assert expected_sessions[sid_i][:2] == (e, uid)
        transcript = []
        rnd, previous_dino = 0, ""
        for idx, m in enumerate(messages):
            role, text = m["role"], m["content"].strip()
            if role == "user":
                rnd += 1
            if role not in ("user", "assistant"):
                continue
            masks = []
            for g in CONFIGS[e]["groups"]:
                masks.append(sum(1<<j for j,t in enumerate(g["tags"]) if g["role"] == role and matches(t,text,previous_dino)))
            language = classify_language(text)
            message_date = business_date(m["created_at"])
            message_datetime = business_datetime(m["created_at"])
            records[e].append([di[message_date],uid,sid_i,rnd,idx,*masks,language,0 if role=="assistant" else 1])
            role_counts[e][role] += 1
            # Exact full message retained, except contact-like values; no technical IDs.
            original = redact(text)
            translated = translations.get(text) if language == 1 else None
            transcript.append({"role":role,"text":original,"round":rnd,"date":message_date,
                               "timestamp":message_datetime.strftime("%Y-%m-%d %H:%M:%S") if message_datetime else "",
                               "translation":redact(translated) if translated else None,"language":language})
            if role == "assistant":
                previous_dino = text
        assert expected_sessions[sid_i][2] == rnd
        shards[sid_i//128][str(sid_i)] = {"entry":e,"user":uid,"messages":transcript}
    public_configs = []
    for config in CONFIGS:
        config = {**config,"groups":[{**g,"tags":[{k:v for k,v in t.items() if k!="regex"} for t in g["tags"]]} for g in config["groups"]]}
        public_configs.append(config)
    fingerprint = hashlib.sha256(source.read_bytes()+f"|{BUSINESS_TIMEZONE}|transcript-v{TRANSCRIPT_SCHEMA_VERSION}".encode()).hexdigest()[:16]
    payload = {"version":TRANSCRIPT_SCHEMA_VERSION,"sourceFingerprint":fingerprint,"meta":{
        "messages":len(raw),"sessions":len(session_ids),"users":len(user_ids),
        "dateStart":data["meta"]["dateStart"],"dateEnd":data["meta"]["dateEnd"],"timeBasis":"北京时间","timezone":BUSINESS_TIMEZONE,
        "method":"本入口原文归纳的独立词组规则，全量逐消息扫描；未进行全量 LLM 语义标注或人工准确率验证。",
        "languageLabels":["拉丁文本·未命中非英语线索（不等于已确认英语）","检测到非英语线索（可能混合）","其他文字·待确认","空白／纯符号数字"],
        "source":"与当前看板相同的去重消息全集；来源及合并数量见 data.js 的 sourceStats。",
        "recordSchema":["date","user","session","round","messageIndex","directionMask","dinoTopicMask","childTopicMask","childActionMask","preferenceMask","supportMask","language","role"],
        "roleCounts":role_counts},"entries":public_configs,"records":records}
    output.mkdir(parents=True,exist_ok=True)
    shard_dir = output / "transcripts"
    shard_dir.mkdir(exist_ok=True)
    for bucket, sessions in shards.items():
        (shard_dir / f"{bucket}.json").write_text(json.dumps(sessions,ensure_ascii=False,separators=(",",":")))
    (output / "entry-analysis.js").write_text("window.DINO_ENTRY_ANALYSIS="+json.dumps(payload,ensure_ascii=False,separators=(",",":"))+";\n")
    audit = {"sourceFingerprint":fingerprint,"sourceMessages":len(raw),"entries":[]}
    for e, config in enumerate(CONFIGS):
        item={"entry":config["entry"],"messages":len(records[e]),"sessions":len({r[2] for r in records[e]}),"groups":[]}
        for gi,g in enumerate(config["groups"]):
            rr=[r for r in records[e] if r[12] == (0 if g["role"]=="assistant" else 1)]
            counts=[{"label":t["label"],"messages":sum(bool(r[5+gi]&(1<<j)) for r in rr),"sessions":len({r[2] for r in rr if r[5+gi]&(1<<j)})} for j,t in enumerate(g["tags"])]
            item["groups"].append({"key":g["key"],"total":len(rr),"matched":sum(bool(r[5+gi]) for r in rr),"unclassified":sum(not r[5+gi] for r in rr),"counts":counts})
        audit["entries"].append(item)
    (output / "analysis-audit.json").write_text(json.dumps(audit,ensure_ascii=False,indent=2))
    print(json.dumps(audit,ensure_ascii=False,indent=2))


if __name__ == "__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--source",type=Path,required=True)
    p.add_argument("--dashboard",type=Path,default=Path(__file__).resolve().parents[1])
    args=p.parse_args()
    build(args.source,args.dashboard,args.dashboard/"analysis")
