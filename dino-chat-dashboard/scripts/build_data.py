#!/usr/bin/env python3
"""Build the compact analytical dataset used by the Dino current-state dashboard."""
from __future__ import annotations
import argparse, csv, json, re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

ENTRY_ORDER=["HOME","EXPLORE","POST_CLASS"]
ENTRY_LABELS=["HOME","EXPLORE","POST_CLASS"]
INTERACTIONS=["回答 Dino 提问","在回答中主动扩展","主动开启新话题","表达偏好/观点","问候与结束","跟读/表达练习","其他互动"]
DIFFICULTIES=["听不懂内容","不会用英语表达","明确请求母语或翻译帮助","不知道说什么或答不上来","沉默或无法识别","拒绝或不想继续"]
STRATEGIES=["解释含义","翻译或切换语言","简化或改写","提供示例表达","给选项或降低难度","要求重说或澄清","仅安抚但无具体帮助","换话题或继续提问","没有处理用户困难"]
OUTCOMES=["恢复：继续有效表达","重复困难","沉默或无法识别","没有下一轮"]
BAD_CASES=["困难时帮助不足","用户提问未被回答","连续要求重说","单轮多个问题","重复相同问题","视觉或操作假设","教学或纠错压力","回应过长风险"]
BUSINESS_TIMEZONE="Asia/Shanghai"
BUSINESS_TZ=ZoneInfo(BUSINESS_TIMEZONE)

WORD_RE=re.compile(r"[A-Za-z']+|[\u4e00-\u9fff]"); EN_TOKEN_RE=re.compile(r"[A-Za-z][A-Za-z']{2,}")
QUESTION_RE=re.compile(r"\?|\b(what|why|how|where|when|who|which|can you|do you|is it|are you|could you|would you)\b|为什么|怎么|什么|哪里",re.I)
ASSISTANT_QUESTION_RE=re.compile(r"\?|\b(tell me|what about you|how about you|do you|can you|would you|what|why|how|where|when|who|which)\b|你呢|告诉我",re.I)
NON_LATIN_RE=re.compile(r"[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af\u0600-\u06ff\u0e00-\u0e7f\u0400-\u04ff]"); LATIN_DIACRITIC_RE=re.compile(r"[à-öø-ÿā-žăâđêôơư]")
NON_ENGLISH_WORDS={"aku","kamu","yang","tidak","bisa","mau","apa","ini","itu","saya","mình","bạn","không","được","em","anh","chị","gì","nào","muốn","hola","gracias","quiero","como","porque","bonjour","merci","veux","hallo","danke","nicht","bitte"}
NOT_UNDERSTAND_RE=re.compile(r"don't understand|do not understand|what does .+ mean|too hard|听不懂|不明白|什么意思|没听懂",re.I)
LOCAL_HELP_RE=re.compile(r"in (chinese|vietnamese|thai|arabic|spanish|indonesian)|speak (chinese|vietnamese|thai|arabic|spanish|indonesian)|translate (it )?(to|into)|用中文|说中文|母语|翻译成",re.I)
EXPRESSION_RE=re.compile(r"how (do|can) i say|how to say|in english|can't say|cannot say|怎么说|不会说|英文怎么",re.I)
NOT_KNOW_RE=re.compile(r"don't know|do not know|no idea|can't answer|cannot answer|what can i say|不知道|不清楚|答不上|不知道说什么",re.I)
REFUSAL_RE=re.compile(r"don't want|do not want|stop (talking|asking)|not talk|leave me|不想|不要问|不聊|别说",re.I)
GREETING_RE=re.compile(r"\b(hi|hello|hey|good morning|good afternoon|good evening|nice to meet you)\b|你好|嗨|早上好",re.I); FAREWELL_RE=re.compile(r"\b(bye|goodbye|see you|good night)\b|再见|拜拜",re.I)
PREFERENCE_RE=re.compile(r"\b(i like|i love|i don't like|i dislike|my favorite|i want|i prefer|i think)\b|我喜欢|我爱|我想|我觉得|最喜欢",re.I)
PERSONAL_RE=re.compile(r"\b(i went|i played|i saw|i have|i had|i am|i'm|my |today i|yesterday i|we went|we played)\b|我今天|我昨天|我有|我的|我去了|我玩",re.I)
PRACTICE_RE=re.compile(r"\b(repeat|practice|read|spell|sentence|pronounce|again)\b|跟读|练习|朗读|拼写|再说一遍",re.I)
REPAIR_RE=re.compile(r"i missed|didn't catch|did not catch|not sure i heard|could you say (it )?again|repeat slowly|try a short word|再说一遍|没听清|听不清",re.I)
EXPLAIN_RE=re.compile(r"it means|means that|means the|meaning|的意思|意思是|就是",re.I); TRANSLATE_RE=re.compile(r"in chinese|in english|translate|中文|英文|越南语|泰语",re.I)
SIMPLIFY_RE=re.compile(r"simpler|easier|simple question|shorter|one word|简单|短一点|慢慢来",re.I); EXAMPLE_RE=re.compile(r"you can say|try saying|for example|let's say|可以说|比如|跟我说",re.I)
CHOICE_RE=re.compile(r"\b(or|choose|which one)\b|还是|选一个",re.I); REASSURE_RE=re.compile(r"that's okay|that is okay|no problem|don't worry|没关系|没事|别担心",re.I)
VISUAL_RE=re.compile(r"i can see you|i see you|show me|look at|point to|tap (it|the)|write (it|this)|read (it|this|the word)",re.I); DRILL_RE=re.compile(r"say (the )?full sentence|repeat after me|correct answer|say it exactly|you must|完整句子|跟我读|正确答案|必须说",re.I)
SENSITIVE_RE=re.compile(r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|https?://|\b\d{7,}\b",re.I)
STOPWORDS={"the","and","that","that's","thats","this","with","from","have","has","had","are","was","were","will","would","could","should","can","can't","cannot","your","you","you're","yours","i'm","ive","i've","it's","its","what's","whats","mine","our","they","them","his","her","she","him","for","but","not","yes","yeah","okay","hello","hey","bye","goodbye","good","like","love","want","know","don't","doesn't","didn't","what","why","how","where","when","who","which","dino","say","said","tell","english","thing","really","very","just","also","about","there","here","then","than","some","any","one","two","name","mean","means","please","thanks","thank","because","maybe","right","sure","well","let","lets","let's","today","now","see","look","play","playing","talk","talking","chat","make","going","went","come","get","got","think","favorite","favourite","much","many","more","most","little","big","small","old","new","first","last","same","sorry","too","speak","call","all"}

def read_csv(path):
    with path.open(encoding="utf-8-sig",newline="") as f: yield from csv.DictReader(f)
def read_json(path):
    with path.open(encoding="utf-8") as f: yield from json.load(f)
def lang(text):
    if NON_LATIN_RE.search(text) or len(LATIN_DIACRITIC_RE.findall(text.lower()))>=2: return 1
    ts=re.findall(r"[A-Za-z']+",text.lower()); hits=sum(t in NON_ENGLISH_WORDS for t in ts)
    return int(hits>=2 or (hits==1 and len(ts)<=5))
def diff(text):
    if LOCAL_HELP_RE.search(text): return 2
    if NOT_UNDERSTAND_RE.search(text): return 0
    if EXPRESSION_RE.search(text): return 1
    if NOT_KNOW_RE.search(text): return 3
    if REFUSAL_RE.search(text): return 5
    return -1
def interaction(text,previous_dino):
    if GREETING_RE.search(text) or FAREWELL_RE.search(text): return 4
    if PRACTICE_RE.search(text) or len(WORD_RE.findall(text))>=28: return 5
    if QUESTION_RE.search(text): return 2
    if PREFERENCE_RE.search(text): return 3
    if PERSONAL_RE.search(text) and len(WORD_RE.findall(text))>=8: return 1
    if ASSISTANT_QUESTION_RE.search(previous_dino): return 1 if len(WORD_RE.findall(text))>=14 else 0
    return 6
def strategy_mask(text,has_diff):
    mask=0
    for i,regex in enumerate([EXPLAIN_RE,TRANSLATE_RE,SIMPLIFY_RE,EXAMPLE_RE,CHOICE_RE,REPAIR_RE,REASSURE_RE,ASSISTANT_QUESTION_RE]):
        if regex.search(text): mask|=1<<i
    if has_diff and not mask&63: mask|=1<<8
    return mask
def content_tokens(text): return {t.lower().strip("'") for t in EN_TOKEN_RE.findall(text) if t.lower().strip("'") not in STOPWORDS and t.lower().strip("'") not in NON_ENGLISH_WORDS}
def similarity(a,b):
    x,y=content_tokens(a),content_tokens(b); return len(x&y)/len(x|y) if x and y else 0
def parse_dt(value):
    try:
        parsed=datetime.fromisoformat(value.replace("Z","+00:00"))
        return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
    except ValueError: return None
def business_datetime(value):
    parsed=parse_dt(value)
    return parsed.astimezone(BUSINESS_TZ) if parsed else None
def business_date(value):
    parsed=business_datetime(value)
    return parsed.date().isoformat() if parsed else ""
def business_hour(value):
    parsed=business_datetime(value)
    return parsed.hour if parsed else 0
def attach_translation(card,translations):
    missing=0
    for key in ("user","dino"):
        text=card.get(key,"")
        if text and lang(text):
            if text in translations: card[key+"_en"]=translations[text]
            else: missing+=1
    return missing

def read_profiles(path):
    """Read only the non-sensitive fields needed for aggregation and filtering."""
    if not path or not path.exists(): return {}, {"sourceRows":0,"matchedUsers":0}
    if path.suffix.lower()==".csv":
        rows=list(read_csv(path))
        return {str(r["user_id"]):{"age":str(r.get("age_range") or "未记录"),"level":str(r.get("current_level_no") or "未记录")} for r in rows},{"sourceRows":len(rows),"matchedUsers":0}
    try:
        from openpyxl import load_workbook
    except ImportError as exc:
        raise RuntimeError("Reading --profiles requires openpyxl") from exc
    wb=load_workbook(path,read_only=True,data_only=True)
    ws=wb["User profiles"] if "User profiles" in wb.sheetnames else wb[wb.sheetnames[0]]
    rows=ws.iter_rows(values_only=True); headers=[str(x or "").lstrip("\ufeff") for x in next(rows)]
    profiles={}; source_rows=0
    for values in rows:
        record=dict(zip(headers,values)); user_id=record.get("user_id")
        if user_id in (None,""): continue
        source_rows+=1
        profiles[str(user_id)]={
            "age":str(record.get("age_range") or "未记录"),
            "level":str(record.get("current_level_no") or "未记录"),
        }
    return profiles,{"sourceRows":source_rows,"matchedUsers":0}

def read_countries(path):
    """Read the latest-device country snapshot keyed by business user_id."""
    if not path or not path.exists(): return {}, {"countrySourceRows":0,"matchedCountryUsers":0}
    countries={}; source_rows=0
    for record in read_csv(path):
        user_id=str(record.get("user_id") or "").strip()
        if not user_id: continue
        source_rows+=1
        country=str(record.get("current_country") or "").strip().upper()
        countries[user_id]=country if country and country!="(NULL)" else "未记录"
    return countries,{"countrySourceRows":source_rows,"matchedCountryUsers":0}

def ordered_values(values,preferred=()):
    values=set(values); result=[x for x in preferred if x in values]
    result.extend(sorted(x for x in values if x not in result and x!="未记录"))
    if "未记录" in values: result.append("未记录")
    return result

def build(csv_path,json_path,profiles_path=None,countries_path=None):
    tp=Path(__file__).with_name("translations_en.json"); translations=json.loads(tp.read_text(encoding="utf-8")) if tp.exists() else {}
    seen=set(); raw=[]; source_stats={}
    sources=[]
    if csv_path and csv_path.exists(): sources.append(("2026-09 CSV",read_csv(csv_path)))
    sources.append(("2026-10 JSON",read_json(json_path)))
    for name,it in sources:
        n=u=d=0
        for x in it:
            n+=1; mid=str(x.get("message_id") or "")
            if not mid or mid in seen: d+=1; continue
            seen.add(mid); u+=1; entry=str(x.get("entry_type") or "HOME"); entry=entry if entry in ENTRY_ORDER else "HOME"; created=str(x.get("created_at") or "")
            try: seq=int(x.get("sequence_no") or 0)
            except (TypeError,ValueError): seq=0
            raw.append({"user":str(x.get("user_id") or "unknown"),"session":str(x.get("session_id") or "unknown"),"entry":entry,"role":str(x.get("role") or ""),"content":str(x.get("content") or "").strip(),"created":created,"date":business_date(created),"hour":business_hour(created),"seq":seq})
        source_stats[name]={"read":n,"unique":u,"duplicates":d}
    raw.sort(key=lambda r:(r["entry"],r["user"],r["session"],r["seq"],r["created"],r["role"]))
    users=sorted({r["user"] for r in raw}); sessions=sorted({(r["entry"],r["user"],r["session"]) for r in raw}); dates=sorted({r["date"] for r in raw if r["date"]})
    ui={v:i for i,v in enumerate(users)}; si={v:i for i,v in enumerate(sessions)}; di={v:i for i,v in enumerate(dates)}; groups=defaultdict(list)
    profiles,profile_meta=read_profiles(profiles_path); matched=sum(user in profiles for user in users); profile_meta.update({"matchedUsers":matched,"dashboardUsers":len(users),"coveragePct":round(matched/len(users)*100,1) if users else 0})
    countries,country_meta=read_countries(countries_path); matched_country=sum(user in countries and countries[user]!="未记录" for user in users); profile_meta.update(country_meta); profile_meta.update({"matchedCountryUsers":matched_country,"countryCoveragePct":round(matched_country/len(users)*100,1) if users else 0})
    age_values=ordered_values(((profiles.get(u) or {}).get("age","未记录") for u in users),preferred=("3-5","6-8","9-12","13-17","13+","18+"))
    level_values=ordered_values(((profiles.get(u) or {}).get("level","未记录") for u in users),preferred=("1","2","3","4","5","6"))
    country_values=ordered_values((countries.get(u) or "未记录") for u in users)
    age_i={v:i for i,v in enumerate(age_values)}; level_i={v:i for i,v in enumerate(level_values)}; country_i={v:i for i,v in enumerate(country_values)}
    user_profiles=[]
    for user in users:
        p=profiles.get(user,{"age":"未记录","level":"未记录"})
        country=countries.get(user,"未记录")
        user_profiles.append([age_i[p["age"]],level_i[p["level"]],country_i[country]])
    for r in raw: groups[(r["entry"],r["user"],r["session"])].append(r)
    user_rows=[]; ai_rows=[]; session_rows=[]; topic_sessions=defaultdict(Counter); topic_users=defaultdict(set); topic_messages=defaultdict(Counter); topic_evidence=defaultdict(lambda:defaultdict(list)); evidence=defaultdict(list); bad_evidence=defaultdict(list); missing=0
    for sid,messages in groups.items():
        entry=ENTRY_ORDER.index(messages[0]["entry"]); uid=ui[messages[0]["user"]]; start,end=parse_dt(messages[0]["created"]),parse_dt(messages[-1]["created"]); duration=round(max(0,(end-start).total_seconds()/60),1) if start and end else -1
        rnd=0; previous_dino=""; previous_user=None; previous_ai=None; inter_mask=language_flag=diff_mask=bad_mask=0; session_tokens=set(); session_user_rows=[]; session_ai=[]
        for m in messages:
            if m["role"]=="user":
                if previous_ai is not None and previous_ai["difficulty"]>=0 and previous_ai["outcome"]<0: previous_ai["outcome"]=1 if diff(m["content"])>=0 else 0
                rnd+=1; difficulty=diff(m["content"]); language=lang(m["content"]); inter=interaction(m["content"],previous_dino); wc=len(WORD_RE.findall(m["content"])); inter_mask|=1<<inter; language_flag|=language
                if difficulty>=0: diff_mask|=1<<difficulty
                row={**m,"entry_i":entry,"user_i":uid,"session_i":si[sid],"round":rnd,"difficulty":difficulty,"language":language,"interaction":inter,"word_count":wc,"dino":previous_dino}; user_rows.append(row); session_user_rows.append(row); previous_user=row
                tt=content_tokens(m["content"]); session_tokens|=tt
                if previous_dino and 2<=wc<=48 and len(m["content"])<=240 and len(previous_dino)<=320 and not SENSITIVE_RE.search(m["content"]+previous_dino):
                    card={"date":m["date"],"entry":entry,"round":rnd,"dino":previous_dino,"user":m["content"],"profileUser":uid}; evidence[("interaction",inter)].append(card)
                    if difficulty>=0: evidence[("difficulty",difficulty)].append(card)
                    if language: evidence[("language",1)].append(card)
                    for token in tt: topic_evidence[entry][token].append(card)
            elif m["role"]=="assistant":
                difficulty=previous_user["difficulty"] if previous_user else -1; smask=strategy_mask(m["content"],difficulty>=0); repair=int(bool(REPAIR_RE.search(m["content"]))); flags=[0]*len(BAD_CASES)
                flags[0]=int(difficulty>=0 and bool(smask&(1<<8))); flags[1]=int(previous_user is not None and bool(QUESTION_RE.search(previous_user["content"])) and repair); flags[2]=int(repair and previous_ai is not None and previous_ai.get("repair",0)); flags[3]=int(len(re.findall(r"[?？]",m["content"]))>1); flags[4]=int(previous_ai is not None and similarity(m["content"],previous_ai.get("text",""))>=.72); flags[5]=int(bool(VISUAL_RE.search(m["content"]))); flags[6]=int(bool(DRILL_RE.search(m["content"]))); flags[7]=int(len(WORD_RE.findall(m["content"]))>60)
                for i,v in enumerate(flags):
                    if v: bad_mask|=1<<i
                ai={"date":m["date"],"entry":entry,"session":si[sid],"round":rnd,"difficulty":difficulty,"strategy":smask,"outcome":-1,"repair":repair,"flags":flags,"text":m["content"]}; ai_rows.append(ai); session_ai.append(ai); previous_ai=ai; previous_dino=m["content"]
                if previous_user and not SENSITIVE_RE.search(previous_user["content"]+m["content"]):
                    for i,v in enumerate(flags):
                        if v and len(bad_evidence[i])<80: bad_evidence[i].append({"date":m["date"],"entry":entry,"round":rnd,"dino":m["content"],"user":previous_user["content"],"profileUser":uid})
        for ai in session_ai:
            if ai["difficulty"]>=0 and ai["outcome"]<0: ai["outcome"]=3
        for token in session_tokens: topic_sessions[entry][token]+=1; topic_users[(entry,token)].add(uid)
        for r in session_user_rows:
            for token in content_tokens(r["content"]): topic_messages[entry][token]+=1
        session_rows.append([entry,uid,si[sid],di[messages[0]["date"]],di[messages[-1]["date"]],rnd,duration,inter_mask,language_flag,diff_mask,bad_mask])
    compact_users=[[di[r["date"]],r["entry_i"],r["interaction"],r["user_i"],r["session_i"],r["word_count"],r["language"],r["hour"],r["difficulty"],r["round"]] for r in user_rows]
    compact_ai=[[di[r["date"]],r["entry"],r["session"],r["round"],r["difficulty"],r["strategy"],r["outcome"],r["repair"],int(any(r["flags"])),*r["flags"]] for r in ai_rows]
    discovered=[]
    for entry in range(3):
        items=[]
        for sess_count,msg_count,token in sorted([(c,topic_messages[entry][t],t) for t,c in topic_sessions[entry].items() if c>=3],reverse=True)[:60]:
            cards=[]; used=set()
            for item in topic_evidence[entry][token]:
                sig=item["user"].lower().strip()
                if sig in used: continue
                used.add(sig); card=dict(item); missing_now=attach_translation(card,translations); missing+=missing_now
                if missing_now: continue
                cards.append(card)
                if len(cards)==4: break
            items.append({"label":token,"sessions":sess_count,"users":len(topic_users[(entry,token)]),"messages":msg_count,"evidence":cards})
        discovered.append(items)
    topic_maps=[{item["label"]:i for i,item in enumerate(items)} for items in discovered]
    topic_rows=[]
    for r in user_rows:
        for token in content_tokens(r["content"]):
            topic_index=topic_maps[r["entry_i"]].get(token)
            if topic_index is not None: topic_rows.append([di[r["date"]],r["entry_i"],r["user_i"],r["session_i"],r["round"],topic_index])
    curated={}
    for kind,size in [("interaction",len(INTERACTIONS)),("difficulty",len(DIFFICULTIES)),("language",2)]:
        for idx in range(size):
            cards=[]; used=set()
            for item in evidence.get((kind,idx),[]):
                sig=item["user"].lower().strip()
                if sig in used: continue
                used.add(sig); card=dict(item); missing_now=attach_translation(card,translations); missing+=missing_now
                if missing_now: continue
                cards.append(card)
                if len(cards)==12: break
            curated[f"{kind}:{idx}"]=cards
    curated_bad={}
    for idx,label in enumerate(BAD_CASES):
        cards=[]
        for item in bad_evidence[idx]:
            card=dict(item); missing_now=attach_translation(card,translations); missing+=missing_now
            if missing_now: continue
            cards.append(card)
            if len(cards)==12: break
        curated_bad[label]=cards
    daily_map=defaultdict(lambda:{"messages":0,"userMessages":0,"sessions":set(),"users":set()})
    for r in raw:
        v=daily_map[(r["date"],ENTRY_ORDER.index(r["entry"]))]; v["messages"]+=1; v["userMessages"]+=int(r["role"]=="user"); v["sessions"].add(r["session"]); v["users"].add(r["user"])
    daily=[{"date":d,"entry":e,"messages":v["messages"],"userMessages":v["userMessages"],"sessions":len(v["sessions"]),"users":len(v["users"])} for (d,e),v in sorted(daily_map.items())]
    return {"meta":{"generatedAt":datetime.now().astimezone().isoformat(timespec="seconds"),"dateStart":dates[0],"dateEnd":dates[-1],"totalMessages":len(raw),"userMessages":len(user_rows),"users":len(users),"sessions":len(sessions),"sourceStats":source_stats,"profileStats":profile_meta,"missingEvidenceTranslations":missing,"analysisStatus":"规则探索性分析；LLM 复核与人工抽检尚未接入。"},"dimensions":{"dates":dates,"entries":ENTRY_LABELS,"entryKeys":ENTRY_ORDER,"interactions":INTERACTIONS,"difficulties":DIFFICULTIES,"strategies":STRATEGIES,"outcomes":OUTCOMES,"badCases":BAD_CASES,"ageBands":age_values,"levels":level_values,"countries":country_values},"schemas":{"rows":["date","entry","interaction","user","session","wordCount","nonEnglish","hour","difficulty","round"],"aiRows":["date","entry","session","round","difficulty","strategyMask","outcome","repair","anyBad",*BAD_CASES],"sessionRows":["entry","user","session","startDate","endDate","rounds","durationMinutes","interactionMask","nonEnglish","difficultyMask","badMask"],"topicRows":["date","entry","user","session","round","topic"],"userProfiles":["ageBand","level","country"]},"dailyEntry":daily,"rows":compact_users,"aiRows":compact_ai,"sessionRows":session_rows,"topicRows":topic_rows,"userProfiles":user_profiles,"discoveredTopics":discovered,"evidence":curated,"badEvidence":curated_bad,"definitions":{"session":"一次从进入到离开的完整对话；同一 Session 可同时包含多种行为。","round":"一轮 = Dino 发言 + 用户回答；当前导出缺少首条 Dino 开场，因此 Round 1 的上文不完整。","duration":"当前使用首末消息时间差，可能包含用户停顿。","return7d":"同入口 7 日内再次开启 Session；仅纳入拥有完整 7 日观察窗口的用户。","profile":"用户画像按业务 user_id 关联；网页仅保留匿名维度索引，不包含原始 user_id。","country":"来自哪个地区：按 user_id 取 last_seen_at 最新设备的 user_device_context.current_country；它只是当前地区画像，不是对话发生位置或用户国籍。"},"availability":{"level":bool(profiles_path),"ageBand":bool(profiles_path),"country":bool(countries_path),"gender":False,"timezone":False,"openingDino":False,"postClassTarget":False,"sessionEndReason":False,"inputStatus":False,"asr":False}}

def main():
    p=argparse.ArgumentParser(); p.add_argument("--csv",type=Path); p.add_argument("--json",type=Path,required=True); p.add_argument("--profiles",type=Path); p.add_argument("--countries",type=Path); p.add_argument("--output",type=Path,required=True); a=p.parse_args(); payload=build(a.csv,a.json,a.profiles,a.countries); a.output.parent.mkdir(parents=True,exist_ok=True); a.output.write_text("window.DINO_DATA="+json.dumps(payload,ensure_ascii=False,separators=(",",":"))+";\n",encoding="utf-8"); print(json.dumps(payload["meta"],ensure_ascii=False,indent=2))
if __name__=="__main__": main()
