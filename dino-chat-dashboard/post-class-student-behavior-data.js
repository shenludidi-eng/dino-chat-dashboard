window.DINO_POST_CLASS_STUDENT_BEHAVIOR={
 "meta": {
  "sampleSize": 96,
  "method": "POST_CLASS Session 按 Level 与国家分层固定抽样；Level 1–4 各 24 段。逐段阅读完整对话，以语义判断学生行为；同一 Session 可命中多种行为。",
  "reviewedAt": "2026-10-12",
  "evidencePolicy": "列表只展示已命中的对话证据；代表证据不等于全部命中。"
 },
 "countries": [
  "AE",
  "AU",
  "BN",
  "BR",
  "CN",
  "ID",
  "JP",
  "KR",
  "MM",
  "MY",
  "SA",
  "SG",
  "TH",
  "VN"
 ],
 "definitions": {
  "confusion": {
   "label": "表达听不懂／不知道／不会",
   "short": "语义判断",
   "definition": "学生明确表示不理解、不知道答案或不会完成当前表达。"
  },
  "localLanguage": {
   "label": "使用本地语言／要求翻译",
   "short": "所有非英语均计入",
   "definition": "学生说出任何非英语内容，或明确要求翻译、要求切换到本地语言。"
  },
  "earlyExit": {
   "label": "提前结束对话",
   "short": "再见／终止要求",
   "definition": "学生在 Dino 结束前主动说再见，或明确要求停止对话。"
  },
  "refusal": {
   "label": "拒绝当前内容／要求换题",
   "short": "样本新增行为",
   "definition": "学生拒绝当前问题、连续否定，或明确要求换到其他主题。"
  },
  "asksQuestion": {
   "label": "主动向 Dino 提问",
   "short": "样本新增行为",
   "definition": "学生不只回答，还主动提出问题；模仿课程目标问句也计入。"
  },
  "elaboration": {
   "label": "主动扩展表达",
   "short": "样本新增行为",
   "definition": "学生补充理由、细节、经历或更完整的描述，而非只给最短答案。"
  }
 },
 "sample": [
  {
   "id": "S001",
   "level": "L1",
   "country": "VN",
   "flags": {
    "confusion": false,
    "localLanguage": true,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": true,
    "elaboration": false
   },
   "week": "2026-10-05"
  },
  {
   "id": "S002",
   "level": "L1",
   "country": "VN",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-28"
  },
  {
   "id": "S003",
   "level": "L1",
   "country": "VN",
   "flags": {
    "confusion": false,
    "localLanguage": true,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": true,
    "elaboration": false
   },
   "week": "2026-10-05"
  },
  {
   "id": "S004",
   "level": "L1",
   "country": "VN",
   "flags": {
    "confusion": false,
    "localLanguage": true,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": true,
    "elaboration": false
   },
   "week": "2026-09-21"
  },
  {
   "id": "S005",
   "level": "L1",
   "country": "MY",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-21"
  },
  {
   "id": "S006",
   "level": "L1",
   "country": "MY",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-21"
  },
  {
   "id": "S007",
   "level": "L1",
   "country": "MY",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-21"
  },
  {
   "id": "S008",
   "level": "L1",
   "country": "MY",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": true,
    "asksQuestion": true,
    "elaboration": false
   },
   "week": "2026-10-05"
  },
  {
   "id": "S009",
   "level": "L1",
   "country": "SA",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-10-05"
  },
  {
   "id": "S010",
   "level": "L1",
   "country": "SA",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-21"
  },
  {
   "id": "S011",
   "level": "L1",
   "country": "SA",
   "flags": {
    "confusion": false,
    "localLanguage": true,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-10-05"
  },
  {
   "id": "S012",
   "level": "L1",
   "country": "SA",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": true,
    "elaboration": false
   },
   "week": "2026-09-28"
  },
  {
   "id": "S013",
   "level": "L1",
   "country": "KR",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-10-05"
  },
  {
   "id": "S014",
   "level": "L1",
   "country": "KR",
   "flags": {
    "confusion": false,
    "localLanguage": true,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-28"
  },
  {
   "id": "S015",
   "level": "L1",
   "country": "KR",
   "flags": {
    "confusion": false,
    "localLanguage": true,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": true,
    "elaboration": false
   },
   "week": "2026-09-21"
  },
  {
   "id": "S016",
   "level": "L1",
   "country": "KR",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-21"
  },
  {
   "id": "S017",
   "level": "L1",
   "country": "TH",
   "flags": {
    "confusion": false,
    "localLanguage": true,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-28"
  },
  {
   "id": "S018",
   "level": "L1",
   "country": "TH",
   "flags": {
    "confusion": true,
    "localLanguage": true,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-21"
  },
  {
   "id": "S019",
   "level": "L1",
   "country": "TH",
   "flags": {
    "confusion": false,
    "localLanguage": true,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-21"
  },
  {
   "id": "S020",
   "level": "L1",
   "country": "TH",
   "flags": {
    "confusion": true,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-10-05"
  },
  {
   "id": "S021",
   "level": "L1",
   "country": "BR",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": true,
    "asksQuestion": true,
    "elaboration": false
   },
   "week": "2026-10-05"
  },
  {
   "id": "S022",
   "level": "L1",
   "country": "ID",
   "flags": {
    "confusion": true,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-28"
  },
  {
   "id": "S023",
   "level": "L1",
   "country": "ID",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-28"
  },
  {
   "id": "S024",
   "level": "L1",
   "country": "CN",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-21"
  },
  {
   "id": "S025",
   "level": "L2",
   "country": "VN",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-10-05"
  },
  {
   "id": "S026",
   "level": "L2",
   "country": "VN",
   "flags": {
    "confusion": false,
    "localLanguage": true,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-10-05"
  },
  {
   "id": "S027",
   "level": "L2",
   "country": "VN",
   "flags": {
    "confusion": false,
    "localLanguage": true,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": true
   },
   "week": "2026-09-28"
  },
  {
   "id": "S028",
   "level": "L2",
   "country": "VN",
   "flags": {
    "confusion": false,
    "localLanguage": true,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-28"
  },
  {
   "id": "S029",
   "level": "L2",
   "country": "MY",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-28"
  },
  {
   "id": "S030",
   "level": "L2",
   "country": "MY",
   "flags": {
    "confusion": false,
    "localLanguage": true,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-28"
  },
  {
   "id": "S031",
   "level": "L2",
   "country": "MY",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-21"
  },
  {
   "id": "S032",
   "level": "L2",
   "country": "MY",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-21"
  },
  {
   "id": "S033",
   "level": "L2",
   "country": "SA",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-28"
  },
  {
   "id": "S034",
   "level": "L2",
   "country": "SA",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": true,
    "elaboration": false
   },
   "week": "2026-09-21"
  },
  {
   "id": "S035",
   "level": "L2",
   "country": "SA",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": true,
    "refusal": true,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-28"
  },
  {
   "id": "S036",
   "level": "L2",
   "country": "SA",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": true,
    "elaboration": false
   },
   "week": "2026-09-21"
  },
  {
   "id": "S037",
   "level": "L2",
   "country": "KR",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-10-05"
  },
  {
   "id": "S038",
   "level": "L2",
   "country": "KR",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": true,
    "elaboration": false
   },
   "week": "2026-10-05"
  },
  {
   "id": "S039",
   "level": "L2",
   "country": "KR",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-10-05"
  },
  {
   "id": "S040",
   "level": "L2",
   "country": "KR",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-28"
  },
  {
   "id": "S041",
   "level": "L2",
   "country": "TH",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": true,
    "elaboration": false
   },
   "week": "2026-09-21"
  },
  {
   "id": "S042",
   "level": "L2",
   "country": "TH",
   "flags": {
    "confusion": false,
    "localLanguage": true,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-10-05"
  },
  {
   "id": "S043",
   "level": "L2",
   "country": "TH",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": true,
    "elaboration": false
   },
   "week": "2026-09-21"
  },
  {
   "id": "S044",
   "level": "L2",
   "country": "TH",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-21"
  },
  {
   "id": "S045",
   "level": "L2",
   "country": "MM",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-28"
  },
  {
   "id": "S046",
   "level": "L2",
   "country": "SG",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": true,
    "elaboration": true
   },
   "week": "2026-09-21"
  },
  {
   "id": "S047",
   "level": "L2",
   "country": "AE",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": true
   },
   "week": "2026-10-05"
  },
  {
   "id": "S048",
   "level": "L2",
   "country": "BN",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": true,
    "elaboration": false
   },
   "week": "2026-09-28"
  },
  {
   "id": "S049",
   "level": "L3",
   "country": "VN",
   "flags": {
    "confusion": false,
    "localLanguage": true,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": true,
    "elaboration": false
   },
   "week": "2026-09-28"
  },
  {
   "id": "S050",
   "level": "L3",
   "country": "VN",
   "flags": {
    "confusion": false,
    "localLanguage": true,
    "earlyExit": true,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-28"
  },
  {
   "id": "S051",
   "level": "L3",
   "country": "VN",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-28"
  },
  {
   "id": "S052",
   "level": "L3",
   "country": "VN",
   "flags": {
    "confusion": false,
    "localLanguage": true,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-28"
  },
  {
   "id": "S053",
   "level": "L3",
   "country": "MY",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-21"
  },
  {
   "id": "S054",
   "level": "L3",
   "country": "MY",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-10-05"
  },
  {
   "id": "S055",
   "level": "L3",
   "country": "MY",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": true
   },
   "week": "2026-10-05"
  },
  {
   "id": "S056",
   "level": "L3",
   "country": "MY",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": true,
    "elaboration": false
   },
   "week": "2026-09-21"
  },
  {
   "id": "S057",
   "level": "L3",
   "country": "SA",
   "flags": {
    "confusion": false,
    "localLanguage": true,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": true,
    "elaboration": false
   },
   "week": "2026-09-28"
  },
  {
   "id": "S058",
   "level": "L3",
   "country": "SA",
   "flags": {
    "confusion": false,
    "localLanguage": true,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-10-05"
  },
  {
   "id": "S059",
   "level": "L3",
   "country": "SA",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-21"
  },
  {
   "id": "S060",
   "level": "L3",
   "country": "SA",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": true,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-28"
  },
  {
   "id": "S061",
   "level": "L3",
   "country": "KR",
   "flags": {
    "confusion": false,
    "localLanguage": true,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-21"
  },
  {
   "id": "S062",
   "level": "L3",
   "country": "KR",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-28"
  },
  {
   "id": "S063",
   "level": "L3",
   "country": "KR",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-28"
  },
  {
   "id": "S064",
   "level": "L3",
   "country": "KR",
   "flags": {
    "confusion": false,
    "localLanguage": true,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": true,
    "elaboration": false
   },
   "week": "2026-09-21"
  },
  {
   "id": "S065",
   "level": "L3",
   "country": "TH",
   "flags": {
    "confusion": false,
    "localLanguage": true,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-28"
  },
  {
   "id": "S066",
   "level": "L3",
   "country": "TH",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-21"
  },
  {
   "id": "S067",
   "level": "L3",
   "country": "TH",
   "flags": {
    "confusion": false,
    "localLanguage": true,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-21"
  },
  {
   "id": "S068",
   "level": "L3",
   "country": "TH",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-10-05"
  },
  {
   "id": "S069",
   "level": "L3",
   "country": "AE",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-10-05"
  },
  {
   "id": "S070",
   "level": "L3",
   "country": "MM",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": true,
    "elaboration": false
   },
   "week": "2026-09-28"
  },
  {
   "id": "S071",
   "level": "L3",
   "country": "JP",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-10-05"
  },
  {
   "id": "S072",
   "level": "L3",
   "country": "ID",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-21"
  },
  {
   "id": "S073",
   "level": "L4",
   "country": "VN",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-10-05"
  },
  {
   "id": "S074",
   "level": "L4",
   "country": "VN",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-10-05"
  },
  {
   "id": "S075",
   "level": "L4",
   "country": "VN",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": true,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-10-05"
  },
  {
   "id": "S076",
   "level": "L4",
   "country": "VN",
   "flags": {
    "confusion": false,
    "localLanguage": true,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": true,
    "elaboration": false
   },
   "week": "2026-10-05"
  },
  {
   "id": "S077",
   "level": "L4",
   "country": "MY",
   "flags": {
    "confusion": false,
    "localLanguage": true,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-28"
  },
  {
   "id": "S078",
   "level": "L4",
   "country": "MY",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": true
   },
   "week": "2026-10-05"
  },
  {
   "id": "S079",
   "level": "L4",
   "country": "MY",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": true,
    "elaboration": true
   },
   "week": "2026-09-28"
  },
  {
   "id": "S080",
   "level": "L4",
   "country": "MY",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": true
   },
   "week": "2026-09-28"
  },
  {
   "id": "S081",
   "level": "L4",
   "country": "SA",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": true,
    "elaboration": true
   },
   "week": "2026-09-28"
  },
  {
   "id": "S082",
   "level": "L4",
   "country": "SA",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": true
   },
   "week": "2026-09-28"
  },
  {
   "id": "S083",
   "level": "L4",
   "country": "SA",
   "flags": {
    "confusion": false,
    "localLanguage": true,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-28"
  },
  {
   "id": "S084",
   "level": "L4",
   "country": "SA",
   "flags": {
    "confusion": false,
    "localLanguage": true,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": true,
    "elaboration": false
   },
   "week": "2026-10-05"
  },
  {
   "id": "S085",
   "level": "L4",
   "country": "KR",
   "flags": {
    "confusion": false,
    "localLanguage": true,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-10-05"
  },
  {
   "id": "S086",
   "level": "L4",
   "country": "KR",
   "flags": {
    "confusion": false,
    "localLanguage": true,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": true,
    "elaboration": false
   },
   "week": "2026-09-28"
  },
  {
   "id": "S087",
   "level": "L4",
   "country": "KR",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-10-05"
  },
  {
   "id": "S088",
   "level": "L4",
   "country": "KR",
   "flags": {
    "confusion": true,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": true,
    "elaboration": true
   },
   "week": "2026-09-28"
  },
  {
   "id": "S089",
   "level": "L4",
   "country": "TH",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": true,
    "elaboration": false
   },
   "week": "2026-10-05"
  },
  {
   "id": "S090",
   "level": "L4",
   "country": "TH",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": true,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-28"
  },
  {
   "id": "S091",
   "level": "L4",
   "country": "TH",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": true,
    "elaboration": false
   },
   "week": "2026-10-05"
  },
  {
   "id": "S092",
   "level": "L4",
   "country": "TH",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": true,
    "elaboration": false
   },
   "week": "2026-10-05"
  },
  {
   "id": "S093",
   "level": "L4",
   "country": "CN",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-28"
  },
  {
   "id": "S094",
   "level": "L4",
   "country": "CN",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-09-21"
  },
  {
   "id": "S095",
   "level": "L4",
   "country": "AU",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": true,
    "elaboration": true
   },
   "week": "2026-09-21"
  },
  {
   "id": "S096",
   "level": "L4",
   "country": "AE",
   "flags": {
    "confusion": false,
    "localLanguage": false,
    "earlyExit": false,
    "refusal": false,
    "asksQuestion": false,
    "elaboration": false
   },
   "week": "2026-10-05"
  }
 ],
 "cases": [
  {
   "id": "S001",
   "level": "L1",
   "country": "VN",
   "lesson": "课程信息未记录",
   "conversation": [
    [
     "child",
     "OK.",
     false
    ],
    [
     "dino",
     "Hi! I’m Dino. Are you happy today?",
     false
    ],
    [
     "child",
     "Could you speak Vietnamese so I can understand?",
     true
    ],
    [
     "dino",
     "That's okay. Are you happy now?",
     true
    ],
    [
     "child",
     "I'm happy.",
     false
    ],
    [
     "dino",
     "I’m happy too. What makes you happy?",
     false
    ],
    [
     "child",
     "I'm happy, I'm happy.",
     false
    ],
    [
     "dino",
     "That makes me smile. Are you happy with a game or a song?",
     false
    ],
    [
     "child",
     "Uh, I'm happy.",
     false
    ],
    [
     "dino",
     "That’s nice. Are you happy with a song?",
     false
    ],
    [
     "child",
     "I'm happy.",
     false
    ],
    [
     "dino",
     "That’s nice. Are you happy with a game?",
     false
    ],
    [
     "child",
     "Are you happy?",
     false
    ],
    [
     "dino",
     "I’m happy too. Bye!",
     false
    ]
   ],
   "week": "2026-10-05"
  },
  {
   "id": "S003",
   "level": "L1",
   "country": "VN",
   "lesson": "Chef Boo Food",
   "conversation": [
    [
     "child",
     "How are you today?",
     true
    ],
    [
     "dino",
     "Hi! I’m Dino. Do you like apple, juice, or bread?",
     false
    ],
    [
     "child",
     "How are you today?",
     true
    ],
    [
     "dino",
     "I’m good, thank you. Do you like apple, juice, or bread?",
     false
    ],
    [
     "child",
     "What's today's date?",
     true
    ],
    [
     "dino",
     "I’m not sure, but I’m glad you’re here. Do you like apple, juice, or bread?",
     false
    ]
   ],
   "week": "2026-10-05"
  },
  {
   "id": "S008",
   "level": "L1",
   "country": "MY",
   "lesson": "Chef Boo Food",
   "conversation": [
    [
     "child",
     "How? Are you?",
     false
    ],
    [
     "dino",
     "Hi! I’m Dino. Do you like apple, juice, or bread?",
     false
    ],
    [
     "child",
     "I like red apple. Do you like apple juice or bread? I like Apple.",
     false
    ],
    [
     "dino",
     "Yum, red apples sound nice. I like bread too. What food do you like most?",
     false
    ],
    [
     "child",
     "I like grape.",
     false
    ],
    [
     "dino",
     "Grape is sweet and juicy. Do you like bread too?",
     false
    ],
    [
     "child",
     "I don't like.",
     false
    ],
    [
     "dino",
     "Okay, that is fine. Do you like bread?",
     false
    ],
    [
     "child",
     "I say I like.",
     false
    ],
    [
     "dino",
     "Yum, that is a nice start. Do you like juice?",
     false
    ],
    [
     "child",
     "You say what?",
     false
    ],
    [
     "dino",
     "I mean, tell me one food you like. Do you like apple, juice, or bread?",
     false
    ],
    [
     "child",
     "Play. So one game. Or not.",
     false
    ],
    [
     "dino",
     "Play sounds fun. Bye!",
     false
    ]
   ],
   "week": "2026-10-05"
  },
  {
   "id": "S011",
   "level": "L1",
   "country": "SA",
   "lesson": "Chef Boo Food",
   "conversation": [
    [
     "child",
     "Please.",
     true
    ],
    [
     "dino",
     "Hi! I’m Dino. Do you like apple, juice, or bread?",
     false
    ],
    [
     "child",
     "Hello?",
     true
    ],
    [
     "dino",
     "Hi! I’m Dino. Do you like apple, juice, or bread?",
     false
    ],
    [
     "child",
     "Peace be upon you. Teach me English. I know how to read.",
     true
    ],
    [
     "dino",
     "That's okay. Do you like apple, juice, or bread?",
     true
    ],
    [
     "child",
     "I have paper.",
     true
    ],
    [
     "dino",
     "Oh, you have paper. Do you use it for drawing or writing?",
     false
    ],
    [
     "child",
     "I want you to teach me English. I don't know how to read it in English.",
     true
    ],
    [
     "dino",
     "That's okay. Do you like apple, juice, or bread?",
     true
    ],
    [
     "child",
     "Choose.",
     false
    ],
    [
     "dino",
     "Okay, choose apple, juice, or bread. Which one do you like?",
     false
    ]
   ],
   "week": "2026-10-05"
  },
  {
   "id": "S012",
   "level": "L1",
   "country": "SA",
   "lesson": "Chef Boo Food",
   "conversation": [
    [
     "child",
     "12345678910.",
     false
    ],
    [
     "dino",
     "Hi! I’m Dino. Do you like apple, juice, or bread?",
     false
    ],
    [
     "child",
     "Yes, yes, yes.",
     false
    ],
    [
     "dino",
     "Yum, that sounds fun. Do you like apple, juice, or bread most?",
     false
    ],
    [
     "child",
     "They were like cute apple. Why?",
     false
    ],
    [
     "dino",
     "Yummy. I like apples too. Do you like juice or bread?",
     false
    ],
    [
     "child",
     "Yes.",
     false
    ],
    [
     "dino",
     "Nice! Do you like bread too?",
     false
    ],
    [
     "child",
     "Do I like bread? Yes. Do you like bread?",
     false
    ],
    [
     "dino",
     "Yes, I like bread too. Do you like apple or juice?",
     false
    ],
    [
     "child",
     "Do you like being Dynamo?",
     false
    ],
    [
     "dino",
     "I’m Dino, not Dynamo. Yes, I like bread. Do you like apple or juice?",
     false
    ],
    [
     "child",
     "that",
     false
    ],
    [
     "dino",
     "That’s okay. Bye!",
     false
    ]
   ],
   "week": "2026-09-28"
  },
  {
   "id": "S015",
   "level": "L1",
   "country": "KR",
   "lesson": "Chef Boo Food",
   "conversation": [
    [
     "child",
     "Yes.",
     false
    ],
    [
     "dino",
     "Hi! I’m Dino. Do you like apple, juice, or bread?",
     false
    ],
    [
     "child",
     "I like chocolate.",
     false
    ],
    [
     "dino",
     "Chocolate is yummy. Do you like bread too?",
     false
    ],
    [
     "child",
     "Yes.",
     false
    ],
    [
     "dino",
     "Yum! Do you like juice?",
     false
    ],
    [
     "child",
     "Now.",
     false
    ],
    [
     "dino",
     "Okay, now we can talk more. Do you like apple?",
     false
    ],
    [
     "child",
     "Yes.",
     false
    ],
    [
     "dino",
     "Yum, nice. Do you like bread too?",
     false
    ],
    [
     "child",
     "I don't know what we're doing.",
     true
    ],
    [
     "dino",
     "That's okay. Do you like apple, juice, or bread?",
     true
    ],
    [
     "child",
     "Apple.",
     false
    ],
    [
     "dino",
     "Nice choice. Bye!",
     false
    ]
   ],
   "week": "2026-09-21"
  },
  {
   "id": "S018",
   "level": "L1",
   "country": "TH",
   "lesson": "Chef Boo Food",
   "conversation": [
    [
     "child",
     "Ready.",
     true
    ],
    [
     "dino",
     "Hi! I’m Dino. Do you like apple, juice, or bread?",
     false
    ],
    [
     "child",
     "I don't know.",
     false
    ],
    [
     "dino",
     "That’s okay. Do you like apple juice?",
     false
    ],
    [
     "child",
     "Yes, I do.",
     false
    ],
    [
     "dino",
     "Yum! Do you like bread too?",
     false
    ]
   ],
   "week": "2026-09-21"
  },
  {
   "id": "S019",
   "level": "L1",
   "country": "TH",
   "lesson": "Chef Boo Food",
   "conversation": [
    [
     "child",
     "up so what do you have",
     false
    ],
    [
     "dino",
     "Hi! I’m Dino. Do you like apple, juice, or bread?",
     false
    ],
    [
     "child",
     "Can you speak Thai?",
     true
    ],
    [
     "dino",
     "That’s okay. Do you like apple, juice, or bread?",
     true
    ],
    [
     "child",
     "Phone.",
     false
    ],
    [
     "dino",
     "Oh, phone time! Do you like apple or bread?",
     false
    ]
   ],
   "week": "2026-09-21"
  },
  {
   "id": "S020",
   "level": "L1",
   "country": "TH",
   "lesson": "Chef Boo Food",
   "conversation": [
    [
     "child",
     "OK.",
     false
    ],
    [
     "dino",
     "Hi! I’m Dino. Do you like apple, juice, or bread?",
     false
    ],
    [
     "child",
     "I don't know Apple.",
     false
    ],
    [
     "dino",
     "That’s okay. Do you like juice or bread?",
     false
    ],
    [
     "child",
     "Highlight juice.",
     false
    ],
    [
     "dino",
     "Nice, juice is a drink. Do you like juice?",
     false
    ],
    [
     "child",
     "Yes, I like put him.",
     false
    ],
    [
     "dino",
     "Yum, juice is cool. Do you like bread too?",
     false
    ]
   ],
   "week": "2026-10-05"
  },
  {
   "id": "S021",
   "level": "L1",
   "country": "BR",
   "lesson": "Chef Boo Food",
   "conversation": [
    [
     "child",
     "I.",
     false
    ],
    [
     "dino",
     "Hi! I’m Dino. Do you like apple juice or bread?",
     false
    ],
    [
     "child",
     "Do you have any other topics?",
     false
    ],
    [
     "dino",
     "Yes, we can talk about animals too. What animal do you like?",
     false
    ],
    [
     "child",
     "I like you.",
     false
    ],
    [
     "dino",
     "That makes me smile. Do you like bread or juice?",
     false
    ],
    [
     "child",
     "Why do you keep talking about bread or juice?",
     false
    ],
    [
     "dino",
     "I talk about simple food words from our lesson. What food do you like?",
     false
    ],
    [
     "child",
     "I'd like risotto.",
     false
    ],
    [
     "dino",
     "Yum, risotto sounds nice. Do you like juice too?",
     false
    ],
    [
     "child",
     "I ******* hate juice. OK, stop talking about juice.",
     false
    ],
    [
     "dino",
     "Okay, let’s talk about bread or apple. Do you like bread?",
     false
    ],
    [
     "child",
     "Can we not talk about juice, bread or apple?",
     false
    ],
    [
     "dino",
     "Okay, we can talk about something else. Bye!",
     false
    ]
   ],
   "week": "2026-10-05"
  },
  {
   "id": "S022",
   "level": "L1",
   "country": "ID",
   "lesson": "Chef Boo Food",
   "conversation": [
    [
     "child",
     "Yeah.",
     false
    ],
    [
     "dino",
     "Hi! I’m Dino. Do you like apple, juice, or bread?",
     false
    ],
    [
     "child",
     "Bread. Apple bread.",
     false
    ],
    [
     "dino",
     "Yum, bread sounds good. Do you like juice too?",
     false
    ],
    [
     "child",
     "No, I don't know.",
     false
    ],
    [
     "dino",
     "That’s okay. Do you like bread or juice?",
     false
    ]
   ],
   "week": "2026-09-28"
  },
  {
   "id": "S028",
   "level": "L2",
   "country": "VN",
   "lesson": "Farm Animals",
   "conversation": [
    [
     "child",
     "Hi.",
     false
    ],
    [
     "dino",
     "Hi! I’m Dino. Do you like cats, cows, or horses?",
     false
    ],
    [
     "child",
     "No.",
     false
    ],
    [
     "dino",
     "Okay, maybe not animals. Do you like cats at home?",
     false
    ],
    [
     "child",
     "Vietnamese.",
     false
    ],
    [
     "dino",
     "That’s okay. Do you want English or Vietnamese?",
     true
    ],
    [
     "child",
     "[Unclear Vietnamese speech.]",
     true
    ],
    [
     "dino",
     "That’s okay. Is a cat at home?",
     false
    ],
    [
     "child",
     "Vietnam, Vietnamese.",
     true
    ],
    [
     "dino",
     "That's okay. Do you like cows?",
     true
    ],
    [
     "child",
     "I like the cow.",
     true
    ],
    [
     "dino",
     "Nice! Cows are big and calm. What color is your cow?",
     false
    ]
   ],
   "week": "2026-09-28"
  },
  {
   "id": "S030",
   "level": "L2",
   "country": "MY",
   "lesson": "Farm Animals",
   "conversation": [
    [
     "child",
     "Ready.",
     true
    ],
    [
     "dino",
     "Hi! I’m Dino. Do you like cow, cat, or horse?",
     false
    ],
    [
     "child",
     "I like horse.",
     false
    ],
    [
     "dino",
     "Horse is big and strong. Do you like cats too?",
     false
    ],
    [
     "child",
     "I like it.",
     true
    ],
    [
     "dino",
     "Horse is nice. What color is your horse?",
     false
    ],
    [
     "child",
     "I don't understand. Can you speak Chinese?",
     true
    ],
    [
     "dino",
     "That's okay. Do you like cows or cats?",
     true
    ],
    [
     "child",
     "Cat.",
     true
    ],
    [
     "dino",
     "Nice! Cats are small and cute. Do you have a cat?",
     false
    ],
    [
     "child",
     "What does that mean?",
     true
    ],
    [
     "dino",
     "That means “What does it mean?” It means I use simple English. Do you like cows or horses?",
     false
    ],
    [
     "child",
     "I don't understand.",
     true
    ],
    [
     "dino",
     "That's okay. Do you like cats?",
     true
    ],
    [
     "child",
     "How do I say “I like cats” in English?",
     true
    ],
    [
     "dino",
     "You can say, “I like cats.” Bye!",
     false
    ]
   ],
   "week": "2026-09-28"
  },
  {
   "id": "S035",
   "level": "L2",
   "country": "SA",
   "lesson": "Chef Boo Food",
   "conversation": [
    [
     "child",
     "Shut up is.",
     false
    ],
    [
     "dino",
     "Hi! I’m Dino. Do you like apple, juice, or bread?",
     false
    ],
    [
     "child",
     "No, no, no, no. I hate you so much. I ask you.",
     false
    ],
    [
     "dino",
     "I’m here. What food do you like best?",
     false
    ],
    [
     "child",
     "Electro dinosaurs.",
     false
    ],
    [
     "dino",
     "That sounds wild! Do you like dinosaurs?",
     false
    ],
    [
     "child",
     "Eat dinosaur.",
     false
    ],
    [
     "dino",
     "Wow, that is silly! Do you like bread?",
     false
    ],
    [
     "child",
     "Mostly are cute and cooler animals.",
     false
    ],
    [
     "dino",
     "That sounds nice. Do you like bread?",
     false
    ],
    [
     "child",
     "The unsolved.",
     false
    ],
    [
     "dino",
     "I’m not sure I got that. Do you like juice?",
     false
    ],
    [
     "child",
     "So, uh, **** ****.",
     false
    ],
    [
     "dino",
     "I did not catch that. Do you like apple or bread?",
     false
    ],
    [
     "child",
     "No, no, no, no, no, no, no, no, no, no, no, no, no, no, no, no. No, no, no.",
     false
    ],
    [
     "dino",
     "Okay. Bye!",
     false
    ]
   ],
   "week": "2026-09-28"
  },
  {
   "id": "S038",
   "level": "L2",
   "country": "KR",
   "lesson": "Farm Animals",
   "conversation": [
    [
     "child",
     "It's a cow. It's a cow. What's the weather?",
     false
    ],
    [
     "dino",
     "Hi! I’m Dino. Do you like cows or horses?",
     false
    ],
    [
     "child",
     "I my name is Rose.",
     false
    ],
    [
     "dino",
     "Nice to meet you, Rose. Do you like cats or horses?",
     false
    ],
    [
     "child",
     "It's a horse. It's a Miami cake.",
     false
    ],
    [
     "dino",
     "Nice horse! Do you like cats too?",
     false
    ],
    [
     "child",
     "Click 2K2X2K2X2K today.",
     false
    ],
    [
     "dino",
     "I did not catch that. Is it a cow or a horse?",
     false
    ],
    [
     "child",
     "It's a horse.",
     false
    ],
    [
     "dino",
     "Nice horse! Do you like cats too?",
     false
    ]
   ],
   "week": "2026-10-05"
  },
  {
   "id": "S042",
   "level": "L2",
   "country": "TH",
   "lesson": "Farm Animals",
   "conversation": [
    [
     "child",
     "Palm Cup.",
     false
    ],
    [
     "dino",
     "Hi! I’m Dino. Do you like farm animals?",
     false
    ],
    [
     "child",
     "love",
     false
    ],
    [
     "dino",
     "Yay, that is nice. Which farm animal do you like most?",
     false
    ],
    [
     "child",
     "Not.",
     false
    ],
    [
     "dino",
     "Okay, not that one. Do you like cats?",
     false
    ],
    [
     "child",
     "Let's speak Thai. Don't speak English or Japanese; use only Thai.",
     true
    ],
    [
     "dino",
     "That's okay. Which farm animal do you like best?",
     true
    ],
    [
     "child",
     "I already told you the first time. Didn't you hear what I said? Did you forget?",
     true
    ],
    [
     "dino",
     "Sorry. I will speak Thai with you. Do you like a cow, cat, or horse?",
     true
    ],
    [
     "child",
     "I don't want English. You spoke too much English just now. Speak louder so you can hear.",
     true
    ],
    [
     "dino",
     "That's okay. Which farm animal do you like most?",
     true
    ]
   ],
   "week": "2026-10-05"
  },
  {
   "id": "S047",
   "level": "L2",
   "country": "AE",
   "lesson": "Farm Animals",
   "conversation": [
    [
     "child",
     "Yes, I am ready to chat.",
     false
    ],
    [
     "dino",
     "Hi! I’m Dino. Do you like cows, horses, or cats?",
     false
    ],
    [
     "child",
     "I couldn't name cats.",
     false
    ],
    [
     "dino",
     "That’s okay. I can help with cat, cow, and horse. Which one do you like?",
     false
    ],
    [
     "child",
     "I like cows, cats, all of them.",
     false
    ],
    [
     "dino",
     "Me too! Cows and cats are fun. Which animal makes you smile most?",
     false
    ],
    [
     "child",
     "Horses.",
     false
    ],
    [
     "dino",
     "Cool, horses are big and strong. Do you like their long tails?",
     false
    ],
    [
     "child",
     "No, but I love the ears.",
     false
    ],
    [
     "dino",
     "Cute ears! Horses have big ears. Which animal has soft fur?",
     false
    ],
    [
     "child",
     "Yes, teeth have short fur.",
     false
    ],
    [
     "dino",
     "Hehe, teeth do not have fur. Horses have soft fur. Which animal has big ears?",
     false
    ],
    [
     "child",
     "A Buffalo.",
     false
    ],
    [
     "dino",
     "Oh, buffalo are big and strong. Which farm animal do you like best?",
     false
    ],
    [
     "child",
     "Rabbits.",
     false
    ],
    [
     "dino",
     "Rabbits are cute. Goodbye!",
     false
    ]
   ],
   "week": "2026-10-05"
  },
  {
   "id": "S050",
   "level": "L3",
   "country": "VN",
   "lesson": "Capitalization",
   "conversation": [
    [
     "child",
     "Okay, skip ahead and read those things.",
     true
    ],
    [
     "dino",
     "Hi! I’m Dino. Do you like months, holidays, or famous places?",
     false
    ],
    [
     "child",
     "Now.",
     false
    ],
    [
     "dino",
     "That’s okay. Which holiday do you like best?",
     false
    ],
    [
     "child",
     "Yes. I like bats.",
     false
    ],
    [
     "dino",
     "Bats are cool! What is your favorite holiday?",
     false
    ],
    [
     "child",
     "Skip ahead quickly.",
     true
    ],
    [
     "dino",
     "That’s okay. Which holiday do you like?",
     false
    ],
    [
     "child",
     "Yes, I do. I like. Cooking.",
     false
    ],
    [
     "dino",
     "That sounds fun! Do you cook at home?",
     false
    ],
    [
     "child",
     "No.",
     false
    ],
    [
     "dino",
     "That’s okay. Do you like holidays more than famous places?",
     false
    ],
    [
     "child",
     "OK, goodbye.",
     false
    ],
    [
     "dino",
     "Our chat isn’t over yet. Which month do you like best?",
     false
    ],
    [
     "child",
     "Yes, I like bats.",
     false
    ],
    [
     "dino",
     "That’s fun! Bats are cool and fly at night. Which month do you like best?",
     false
    ],
    [
     "child",
     "Please translate it for me; otherwise I do not understand it all.",
     true
    ],
    [
     "dino",
     "That’s okay. Goodbye!",
     false
    ]
   ],
   "week": "2026-09-28"
  },
  {
   "id": "S055",
   "level": "L3",
   "country": "MY",
   "lesson": "Unicorn Adventure",
   "conversation": [
    [
     "child",
     "Yes, I'm ready.",
     false
    ],
    [
     "dino",
     "Hi! I’m Dino. Can you jump?",
     false
    ],
    [
     "child",
     "Yeah, I can jump and fly.",
     false
    ],
    [
     "dino",
     "Wow, you can jump and fly! Can you climb too?",
     false
    ],
    [
     "child",
     "Yes.",
     false
    ],
    [
     "dino",
     "Nice! Can you climb?",
     false
    ],
    [
     "child",
     "Yes, I can. But I cannot climb the ladder.",
     false
    ],
    [
     "dino",
     "Oh, ladders can be tricky. Can you climb stairs?",
     false
    ],
    [
     "child",
     "Yeah, I can climb stairs.",
     false
    ],
    [
     "dino",
     "Nice! Can you jump high?",
     false
    ],
    [
     "child",
     "Yes, in the trampoline.",
     false
    ],
    [
     "dino",
     "Nice! Trampolines are fun. Can you jump high on a trampoline?",
     false
    ],
    [
     "child",
     "Yes, so high.",
     false
    ],
    [
     "dino",
     "Wow, so high! Can you jump on one foot?",
     false
    ],
    [
     "child",
     "Yeah, until the sky, until the ceiling.",
     false
    ],
    [
     "dino",
     "Whoa, that is super high! Can you jump on one foot?",
     false
    ],
    [
     "child",
     "Yes. One 145th. I can jump on one foot.",
     false
    ],
    [
     "dino",
     "That sounds super high! Bye!",
     false
    ]
   ],
   "week": "2026-10-05"
  },
  {
   "id": "S057",
   "level": "L3",
   "country": "SA",
   "lesson": "Unicorn Adventure",
   "conversation": [
    [
     "child",
     "I don't know for your head. Six to four and the boy is photo. Thank you. What's all your time? I love you so, Tom butter. I love you so dumb butter.",
     false
    ],
    [
     "dino",
     "Hi! I’m Dino. Can you jump or climb?",
     false
    ],
    [
     "child",
     "It is a beautiful Dino.",
     false
    ],
    [
     "dino",
     "Aww, thank you! Can you jump, climb, or fly?",
     false
    ],
    [
     "child",
     "1267.",
     false
    ],
    [
     "dino",
     "That looks like a number game! Can you jump, climb, or fly?",
     false
    ],
    [
     "child",
     "123456789101112131456607890 T.",
     false
    ],
    [
     "dino",
     "That looks like a long number song! Can you jump?",
     false
    ],
    [
     "child",
     "Can you speak Arabic? [Final words unclear.]",
     true
    ],
    [
     "dino",
     "That’s okay. Can you jump?",
     false
    ],
    [
     "child",
     "OK. Thank you.",
     false
    ],
    [
     "dino",
     "That’s okay. Can you jump?",
     false
    ],
    [
     "child",
     "I want to sing.",
     true
    ],
    [
     "dino",
     "That sounds fun! What song do you want to sing?",
     false
    ],
    [
     "child",
     "What's your name?",
     false
    ],
    [
     "dino",
     "Hi! I’m Dino. My name is Dino. Do you like to jump, climb, or fly?",
     false
    ],
    [
     "child",
     "Dino Dino at the beautiful diner. It is a beautiful for you. I love you Dino.",
     false
    ],
    [
     "dino",
     "That’s very sweet. Goodbye!",
     false
    ]
   ],
   "week": "2026-09-28"
  },
  {
   "id": "S060",
   "level": "L3",
   "country": "SA",
   "lesson": "Unicorn Adventure",
   "conversation": [
    [
     "child",
     "What's your name.",
     false
    ],
    [
     "dino",
     "Hi! I’m Dino. Can you jump?",
     false
    ],
    [
     "child",
     "Oriad and your guide me.",
     false
    ],
    [
     "dino",
     "That’s okay. Can you say one thing you can do: climb, jump, or fly?",
     false
    ],
    [
     "child",
     "Dino, Dino for your Dino, please. Dino, this Dino. Dino beautiful. Dino, beautiful Daniel. Good, beautiful Daniel. Daniel, I love you. Thank you, Dino and English. Thank you. Dino and English.",
     false
    ],
    [
     "dino",
     "That’s so kind. I’m Dino, and I can climb, jump, and fly in words. Can you jump?",
     false
    ],
    [
     "child",
     "Yes.",
     false
    ],
    [
     "dino",
     "Great! Can you jump high, or is it easy for you?",
     false
    ],
    [
     "child",
     "Goodbye.",
     false
    ],
    [
     "dino",
     "Our chat isn’t over yet. Can you jump?",
     false
    ],
    [
     "child",
     "Goodbye.",
     false
    ],
    [
     "dino",
     "Our chat isn’t over yet. Can you tell me one thing you can do, like jump or climb?",
     false
    ],
    [
     "child",
     "OK, Thank you. Goodbye.",
     false
    ],
    [
     "dino",
     "Our chat isn’t over yet. Do you like to jump or climb?",
     false
    ]
   ],
   "week": "2026-09-28"
  },
  {
   "id": "S064",
   "level": "L3",
   "country": "KR",
   "lesson": "Farm Animals",
   "conversation": [
    [
     "child",
     "Hello, hello, hello, hello.",
     false
    ],
    [
     "dino",
     "Hi! I’m Dino. Do you like cats, cows, or horses?",
     false
    ],
    [
     "child",
     "Cat.",
     false
    ],
    [
     "dino",
     "Nice! Cats are cute. Do you have a cat?",
     false
    ],
    [
     "child",
     "Where are you from?",
     false
    ],
    [
     "dino",
     "I’m from a happy dinosaur place. Do you have a favorite farm animal?",
     false
    ],
    [
     "child",
     "Nyah-nyah. [Playful teasing sound.]",
     true
    ],
    [
     "dino",
     "I did not catch that. Do you like cows, horses, or cats?",
     false
    ],
    [
     "child",
     "Where you can.",
     false
    ],
    [
     "dino",
     "I can go to a farm or a zoo. Do you like horses?",
     false
    ],
    [
     "child",
     "Where you can.",
     false
    ],
    [
     "dino",
     "I can go to a farm or a zoo. Do you like cows, horses, or cats?",
     false
    ],
    [
     "child",
     "Let's go.",
     false
    ],
    [
     "dino",
     "Great! Let’s imagine a farm. Which animal do you want to see first?",
     false
    ]
   ],
   "week": "2026-09-21"
  },
  {
   "id": "S070",
   "level": "L3",
   "country": "MM",
   "lesson": "Unicorn Adventure",
   "conversation": [
    [
     "child",
     "Hello.",
     false
    ],
    [
     "dino",
     "Hi! I’m Dino. Can you climb, jump, or fly?",
     false
    ],
    [
     "child",
     "OK, hi. I Yeah.",
     false
    ],
    [
     "dino",
     "That’s okay. Can you jump?",
     false
    ],
    [
     "child",
     "Yes.",
     false
    ],
    [
     "dino",
     "Nice! Can you climb?",
     false
    ],
    [
     "child",
     "Can you glide?",
     false
    ],
    [
     "dino",
     "That’s a cool word. I can jump and climb, but I can’t glide. Can you fly?",
     false
    ],
    [
     "child",
     "Yes. Can you fly? Yes. Can you fly?",
     false
    ],
    [
     "dino",
     "Yes, I can fly in a story! Can you jump or climb?",
     false
    ],
    [
     "child",
     "Yes. Can you sing? Clyde.",
     false
    ],
    [
     "dino",
     "That’s funny! I can sing in a story. Can you climb?",
     false
    ]
   ],
   "week": "2026-09-28"
  },
  {
   "id": "S075",
   "level": "L4",
   "country": "VN",
   "lesson": "Landforms on Earth",
   "conversation": [
    [
     "child",
     "Yes.",
     false
    ],
    [
     "dino",
     "Hi! I’m Dino. Do you like reading about mountains, islands, or valleys?",
     false
    ],
    [
     "child",
     "No, I don't.",
     false
    ],
    [
     "dino",
     "That’s okay. Do you like cliffs, or do you like valleys more?",
     false
    ],
    [
     "child",
     "No, I don't.",
     false
    ],
    [
     "dino",
     "That’s okay. Which one sounds most interesting to you: a mountain, an island, or a valley?",
     false
    ],
    [
     "child",
     "I don't like anymore.",
     false
    ],
    [
     "dino",
     "That’s okay. Do you like some other things, like animals, games, or stories?",
     false
    ],
    [
     "child",
     "I like them.",
     false
    ],
    [
     "dino",
     "That’s nice. Do you like mountains, or do you like islands more?",
     false
    ]
   ],
   "week": "2026-10-05"
  },
  {
   "id": "S076",
   "level": "L4",
   "country": "VN",
   "lesson": "Magic Shop",
   "conversation": [
    [
     "child",
     "Hello.",
     true
    ],
    [
     "dino",
     "Hi! I’m Dino. Do you like shopping for toys or snacks?",
     false
    ],
    [
     "child",
     "Can you speak Vietnamese?",
     true
    ],
    [
     "dino",
     "That’s okay. Do you like to ask “How much is it?” when you shop?",
     false
    ]
   ],
   "week": "2026-10-05"
  },
  {
   "id": "S078",
   "level": "L4",
   "country": "MY",
   "lesson": "Unicorn Adventure",
   "conversation": [
    [
     "child",
     "Yes, I'm ready.",
     false
    ],
    [
     "dino",
     "Hi! I’m Dino. Do you like jumping, climbing, or flying?",
     false
    ],
    [
     "child",
     "I like jumping.",
     false
    ],
    [
     "dino",
     "Jumping is fun! Can you jump high?",
     false
    ],
    [
     "child",
     "Yes, I can jump high.",
     false
    ],
    [
     "dino",
     "That’s great! Jumping high sounds like fun. Can you climb too?",
     false
    ],
    [
     "child",
     "I don't think I can climb.",
     false
    ],
    [
     "dino",
     "That’s okay. Can you jump?",
     false
    ],
    [
     "child",
     "Yes, I can.",
     false
    ],
    [
     "dino",
     "Nice! You can jump, and that sounds fun. Can you fly too?",
     false
    ],
    [
     "child",
     "No, I cannot fly.",
     false
    ],
    [
     "dino",
     "That’s okay. Flying is hard for people, but jumping is fun and easy for many kids. Can you jump?",
     false
    ],
    [
     "child",
     "Yes, I can.",
     false
    ],
    [
     "dino",
     "Nice! You can do a lot of things. Is jumping easy for you?",
     false
    ],
    [
     "child",
     "Yes, I think so.",
     false
    ],
    [
     "dino",
     "That sounds easy for you. Can you jump a little higher than before?",
     false
    ],
    [
     "child",
     "Yes.",
     false
    ],
    [
     "dino",
     "Great! Jumping can be so much fun. Is climbing easy for you too?",
     false
    ],
    [
     "child",
     "Umm, not really.",
     false
    ],
    [
     "dino",
     "Okay, climbing is not easy for you. Goodbye!",
     false
    ]
   ],
   "week": "2026-10-05"
  },
  {
   "id": "S079",
   "level": "L4",
   "country": "MY",
   "lesson": "Magic Shop",
   "conversation": [
    [
     "child",
     "Yeah, I'm ready. How are you today? I'm very fine.",
     false
    ],
    [
     "dino",
     "Hi! I’m Dino. Have you ever bought something that felt like a bargain or worth it?",
     false
    ],
    [
     "child",
     "For now, there's nothing to be bargain because today I feel so great and I'm about to go to school. In this morning.",
     false
    ],
    [
     "dino",
     "That sounds great, and I hope school feels fun this morning. What is one thing you like to do on the way to school?",
     false
    ],
    [
     "child",
     "I will break for a PJ breakfast. Before I go to school. And then I will go to. Uh, shop to buy some? Cut levies. So my studies.",
     false
    ],
    [
     "dino",
     "That sounds like a busy morning, and I hope your breakfast is yummy. What will you buy at the shop?",
     false
    ],
    [
     "child",
     "I would I would like to. Well, nasi lemak. Have you heard for nasi lemak?",
     false
    ],
    [
     "dino",
     "Yes, nasi lemak sounds tasty, and I know it is a popular food. What else would you like to buy at the shop?",
     false
    ],
    [
     "child",
     "Uh, a drinks. And drinks like Teh Tarik in the morning it quite warm and suits me.",
     false
    ],
    [
     "dino",
     "Teh Tarik sounds warm and nice in the morning. How much is it at your shop?",
     false
    ],
    [
     "child",
     "Sometimes they give us for free. It costs a dollar, I think.",
     false
    ],
    [
     "dino",
     "That sounds like a good deal if it is only a dollar. Would you say a one-dollar drink is worth it?",
     false
    ],
    [
     "child",
     "It's convenience because it's like this is the cheapest. For $1.00 get a drinks instead of you get nasi lemak because now nasi lemak is. Ringgit of $0.50.",
     false
    ],
    [
     "dino",
     "That sounds like a good deal if the drink is cheap and handy. Would you say the drink is worth it?",
     false
    ],
    [
     "child",
     "Yeah, totally worth it. I would like to buy 2 of the.",
     false
    ],
    [
     "dino",
     "Nice, two of them sounds like a good choice. What would you like to buy two of?",
     false
    ],
    [
     "child",
     "What do you want?",
     false
    ],
    [
     "dino",
     "I want something tasty and cheap, like a snack. What food would you like to buy?",
     false
    ],
    [
     "child",
     "I want to buy chicken.",
     false
    ],
    [
     "dino",
     "That sounds tasty. Goodbye!",
     false
    ]
   ],
   "week": "2026-09-28"
  },
  {
   "id": "S080",
   "level": "L4",
   "country": "MY",
   "lesson": "课程信息未记录",
   "conversation": [
    [
     "child",
     "Yes, I am ready.",
     false
    ],
    [
     "dino",
     "Hi! I’m Dino. Have you ever seen a mountain, island, cave, or cliff?",
     false
    ],
    [
     "child",
     "I never see a calf and Cliff, I only see the mountain and island.",
     false
    ],
    [
     "dino",
     "That’s okay. Which one do you like more, a mountain or an island?",
     false
    ],
    [
     "child",
     "I like and I learn.",
     false
    ],
    [
     "dino",
     "That’s great, you like them and you are learning them. Which landform do you want to talk about now: mountain, island, cave, or cliff?",
     false
    ],
    [
     "child",
     "I would like to talk about mountain.",
     false
    ],
    [
     "dino",
     "Great choice, mountains can be so big and tall. What do you see on a mountain, like trees, rocks, or snow?",
     false
    ],
    [
     "child",
     "I can see trees. Road and sunflower and fruit. On a mountain.",
     false
    ],
    [
     "dino",
     "Nice, you saw many things on a mountain. Which one do you like most: trees, a road, sunflowers, or fruit?",
     false
    ],
    [
     "child",
     "I like the trees most. Huh.",
     false
    ],
    [
     "dino",
     "Trees are nice on a mountain because they give shade and make it feel calm. What else do you see on the mountain?",
     false
    ],
    [
     "child",
     "I can see. Bird on the Mountain.",
     false
    ],
    [
     "dino",
     "Birds on a mountain can feel peaceful and free. What other thing do you see on the mountain?",
     false
    ],
    [
     "child",
     "CAVE.",
     false
    ],
    [
     "dino",
     "Nice, cave is a fun landform to talk about. What do you think is inside a cave?",
     false
    ],
    [
     "child",
     "Inside a cafe. It's dark and cold.",
     false
    ],
    [
     "dino",
     "That sounds cozy and a little spooky, like a cave. What do you think you might see in a cave, like rocks, water, or bats?",
     false
    ],
    [
     "child",
     "Uh, I think I can see a rock. Oh bets. In the CAF.",
     false
    ],
    [
     "dino",
     "That sounds like a rocky, dark cave. Bye!",
     false
    ]
   ],
   "week": "2026-09-28"
  },
  {
   "id": "S081",
   "level": "L4",
   "country": "SA",
   "lesson": "Magic Shop",
   "conversation": [
    [
     "child",
     "I am ready. I'm ready. I'm very ready.",
     false
    ],
    [
     "dino",
     "Hi! I’m Dino. Do you like shopping for little treats or toys?",
     false
    ],
    [
     "child",
     "Well, I wish I was shopping but we are very busy with my school.",
     false
    ],
    [
     "dino",
     "School can be very busy. If you could buy one small treat after school, what would you choose?",
     false
    ],
    [
     "child",
     "Tons and tons of chips.",
     false
    ],
    [
     "dino",
     "Chips sound tasty! If you saw a big bag of chips, would you say, “That’s a bargain,” or “That’s a rip-off”?",
     false
    ],
    [
     "child",
     "Now I will say that's worth it. That's very, very big. Chips.",
     false
    ],
    [
     "dino",
     "That sounds like a good choice, especially if it gives you lots of chips. Would a huge bag of chips feel worth it to you?",
     false
    ],
    [
     "child",
     "Yeah, it's very, very, very good. Especially lasers.",
     false
    ],
    [
     "dino",
     "Lasers do sound cool, and if a toy or game has lasers, it might feel worth it. What kind of thing with lasers do you like best?",
     false
    ],
    [
     "child",
     "No lays, lays.",
     false
    ],
    [
     "dino",
     "That sounds like you mean lots of chips. If a snack gives you a big bag, would you call it a bargain or a rip-off?",
     false
    ],
    [
     "child",
     "You know, lays, lays. It's a kind of chips.",
     false
    ],
    [
     "dino",
     "Oh, chips with Lay’s sound tasty, and a big bag could be worth it. If you saw a tiny bag and a huge bag, which one would you pick?",
     false
    ],
    [
     "child",
     "Huge.",
     false
    ],
    [
     "dino",
     "A huge bag can feel worth it if it gives you lots of chips. What would you do if the huge bag cost a little more than a small bag?",
     false
    ],
    [
     "child",
     "Like how much does it cost? How much is it? Just like I learned in. The lesson How much is it?",
     false
    ],
    [
     "dino",
     "Yes, that’s a useful question when you shop. If something costs a lot, would you still want to buy it, or would you look for a better price?",
     false
    ],
    [
     "child",
     "Can you tell me the? The price please. How much is it?",
     false
    ],
    [
     "dino",
     "Yes, that asks about the price. Goodbye!",
     false
    ]
   ],
   "week": "2026-09-28"
  },
  {
   "id": "S082",
   "level": "L4",
   "country": "SA",
   "lesson": "Magic Shop",
   "conversation": [
    [
     "child",
     "Hi, Daniel.",
     false
    ],
    [
     "dino",
     "Hi! I’m Dino. Do you like shopping for toys or snacks?",
     false
    ],
    [
     "child",
     "Yes, yes, I love snacks because it's very sweet.",
     false
    ],
    [
     "dino",
     "Yum, sweet snacks can be so tasty. What is your favorite snack?",
     false
    ],
    [
     "child",
     "My favorite snack is chocolate. Chocolate.",
     false
    ],
    [
     "dino",
     "Chocolate is a yummy treat. Do you think chocolate is worth it?",
     false
    ]
   ],
   "week": "2026-09-28"
  },
  {
   "id": "S083",
   "level": "L4",
   "country": "SA",
   "lesson": "Unicorn Adventure",
   "conversation": [
    [
     "child",
     "Hello.",
     true
    ],
    [
     "dino",
     "Hi! I’m Dino. Can you do a jump, a climb, or a fly?",
     false
    ],
    [
     "child",
     "Hi, I will come as Luna and Lulu. OK.",
     false
    ],
    [
     "dino",
     "That sounds fun, Luna and Lulu! Can you tell me one thing they can do: climb, jump, or fly?",
     false
    ],
    [
     "child",
     "How can I enter the lesson?",
     true
    ],
    [
     "dino",
     "That’s okay. Can you say one action word: climb, jump, or fly?",
     false
    ]
   ],
   "week": "2026-09-28"
  },
  {
   "id": "S088",
   "level": "L4",
   "country": "KR",
   "lesson": "Magic Shop",
   "conversation": [
    [
     "child",
     "Chatting.",
     false
    ],
    [
     "dino",
     "Hi! I’m Dino. Have you ever bought something that felt like a bargain or a rip-off?",
     false
    ],
    [
     "child",
     "No.",
     false
    ],
    [
     "dino",
     "Okay, maybe you have seen a bargain or a rip-off in a store before. Which one sounds better to you: a bargain or a rip-off?",
     false
    ],
    [
     "child",
     "I think. A rib off.",
     false
    ],
    [
     "dino",
     "Hmm, that sounds like “a rip-off,” which means something is too expensive for what you get. Have you ever seen something in a shop that was not worth it?",
     false
    ],
    [
     "child",
     "No.",
     false
    ],
    [
     "dino",
     "Okay, maybe buying something can still feel tricky. What is one thing you like to buy, like a snack or a toy?",
     false
    ],
    [
     "child",
     "I like to buy a spring suit.",
     false
    ],
    [
     "dino",
     "That sounds like a nice thing to buy. How much is a spring suit where you go shopping?",
     false
    ],
    [
     "child",
     "I don't know.",
     false
    ],
    [
     "dino",
     "That’s okay. If you see something in a store, do you want to ask, “How much is it?”",
     false
    ],
    [
     "child",
     "OK.",
     false
    ],
    [
     "dino",
     "Okay, that sounds like you are ready. If you see something you want to buy, can you ask, “How much is it?”",
     false
    ],
    [
     "child",
     "How much is it?",
     false
    ],
    [
     "dino",
     "Great question! You can ask that when you want to know the price. If something is too expensive, would you call it a bargain or a rip-off?",
     false
    ],
    [
     "child",
     "I, I, I spell, I call. RIP off.",
     false
    ],
    [
     "dino",
     "Okay, you mean “rip-off.” That’s when something costs too much for what you get. Would you call a toy that is too expensive a rip-off?",
     false
    ],
    [
     "child",
     "No.",
     false
    ],
    [
     "dino",
     "Okay, thanks for talking with me. Goodbye!",
     false
    ]
   ],
   "week": "2026-09-28"
  },
  {
   "id": "S090",
   "level": "L4",
   "country": "TH",
   "lesson": "Magic Shop",
   "conversation": [
    [
     "child",
     "No more.",
     false
    ],
    [
     "dino",
     "Hi! I’m Dino. Have you ever found something that was a bargain, or something that felt worth it?",
     false
    ]
   ],
   "week": "2026-09-28"
  },
  {
   "id": "S095",
   "level": "L4",
   "country": "AU",
   "lesson": "Magic Shop",
   "conversation": [
    [
     "child",
     "Hello, I'm Cherry.",
     false
    ],
    [
     "dino",
     "Hi! I’m Dino. Do you like shopping for toys, snacks, or clothes?",
     false
    ],
    [
     "child",
     "How's the weather today?",
     false
    ],
    [
     "dino",
     "It feels nice and sunny here. Do you like sunny days or rainy days?",
     false
    ],
    [
     "child",
     "I like sunny days.",
     false
    ],
    [
     "dino",
     "Sunny days feel warm and fun. When you go shopping, do you like to get a bargain?",
     false
    ],
    [
     "child",
     "Yes, of course I'd like to get a bargain.",
     false
    ],
    [
     "dino",
     "That sounds smart! A bargain means you get something nice for a lower price. Would you rather buy a toy bargain or a snack bargain?",
     false
    ],
    [
     "child",
     "Maybe a snack bargain because I love snacks.",
     false
    ],
    [
     "dino",
     "Snacks are yummy, so a snack bargain sounds great. If a snack costs too much, would you say it is worth it or a rip-off?",
     false
    ]
   ],
   "week": "2026-09-21"
  }
 ],
 "evidence": {
  "confusion": [
   {
    "caseId": "S018",
    "hit": "I don't know."
   },
   {
    "caseId": "S020",
    "hit": "I don't know ‘apple.’"
   },
   {
    "caseId": "S022",
    "hit": "No, I don't know."
   },
   {
    "caseId": "S088",
    "hit": "I don't know."
   }
  ],
  "localLanguage": [
   {
    "caseId": "S001",
    "hit": "Could you speak Vietnamese so I can understand?"
   },
   {
    "caseId": "S011",
    "hit": "Teach me English. I don't know how to read it in English."
   },
   {
    "caseId": "S015",
    "hit": "I don't know what we're doing."
   },
   {
    "caseId": "S019",
    "hit": "Can you speak Thai?"
   },
   {
    "caseId": "S028",
    "hit": "Vietnam, Vietnamese."
   },
   {
    "caseId": "S030",
    "hit": "I don't understand. Can you speak Chinese?"
   },
   {
    "caseId": "S042",
    "hit": "Let's speak Thai. Don't speak English or Japanese; use only Thai."
   },
   {
    "caseId": "S057",
    "hit": "Can you speak Arabic?"
   },
   {
    "caseId": "S076",
    "hit": "Can you speak Vietnamese?"
   },
   {
    "caseId": "S083",
    "hit": "How can I enter the lesson?"
   }
  ],
  "earlyExit": [
   {
    "caseId": "S035",
    "hit": "Shut up."
   },
   {
    "caseId": "S050",
    "hit": "OK, goodbye."
   },
   {
    "caseId": "S060",
    "hit": "Goodbye. (repeated three times)"
   }
  ],
  "refusal": [
   {
    "caseId": "S008",
    "hit": "Play. So, one game."
   },
   {
    "caseId": "S075",
    "hit": "No, I don't… I don't like it anymore."
   },
   {
    "caseId": "S090",
    "hit": "No more."
   },
   {
    "caseId": "S021",
    "hit": "Can we not talk about juice, bread, or apple?"
   },
   {
    "caseId": "S035",
    "hit": "No, no, no… I hate you so much."
   }
  ],
  "asksQuestion": [
   {
    "caseId": "S003",
    "hit": "What's today's date?"
   },
   {
    "caseId": "S012",
    "hit": "Do you like bread?"
   },
   {
    "caseId": "S038",
    "hit": "What's the weather?"
   },
   {
    "caseId": "S057",
    "hit": "What's your name?"
   },
   {
    "caseId": "S064",
    "hit": "Where are you from?"
   },
   {
    "caseId": "S070",
    "hit": "Can you glide? / Can you fly? / Can you sing?"
   },
   {
    "caseId": "S079",
    "hit": "Have you heard of nasi lemak?"
   },
   {
    "caseId": "S081",
    "hit": "How much does it cost?"
   },
   {
    "caseId": "S095",
    "hit": "How's the weather today?"
   }
  ],
  "elaboration": [
   {
    "caseId": "S047",
    "hit": "No, but I love the ears."
   },
   {
    "caseId": "S055",
    "hit": "Yes, I can, but I cannot climb the ladder."
   },
   {
    "caseId": "S078",
    "hit": "I don't think I can climb."
   },
   {
    "caseId": "S079",
    "hit": "Maybe a snack bargain because I love snacks."
   },
   {
    "caseId": "S080",
    "hit": "Inside a cave, it is dark and cold."
   },
   {
    "caseId": "S081",
    "hit": "Lay’s is a kind of chips."
   },
   {
    "caseId": "S082",
    "hit": "I love snacks because they are very sweet."
   },
   {
    "caseId": "S095",
    "hit": "Maybe a snack bargain because I love snacks."
   }
  ]
 },
 "weeks": [
  "2026-10-05",
  "2026-09-28",
  "2026-09-21"
 ]
};

// Restore the source-language utterance above the existing English rendering.
// A localized tuple is normalized to [speaker, original, English translation].
((data)=>{
 const originals={
  S001:{2:'Bạn có thể nói tiếng Việt Nam cho tôi nghe hiểu được không?',3:"That's okay. Are you happy now?\nKhông sao đâu. Bạn có đang vui bây giờ không?"},
  S003:{0:'Hôm nay bạn có khỏe không?',2:'Hôm nay bạn thế nào?',4:'Hôm nay là ngày mấy thế?'},
  S011:{0:'لو سمحتي.',2:'Hello؟',4:'السلام عليكم آرميك تعلميني إنجليزي. أنا عارفة أقرأ.',5:"That's okay. Do you like apple, juice, or bread?\nلا بأس. هل تحبين التفاح أو العصير أو الخبز؟",6:'أنا وري ورق.',8:'أبغى العلمين إنجليزي. أنا ما عارفة أقرأه إنجليزي.',9:"That's okay. Do you like apple, juice, or bread?\nلا بأس. هل تحبين التفاح أو العصير أو الخبز؟"},
  S015:{10:'뭘 하는지 모르겠어?',11:"That's okay. Do you like apple, juice, or bread?\n그거 괜찮아. 사과, 주스, 아니면 빵을 좋아해?"},
  S018:{0:'พร้อมแล้ว'},
  S019:{2:'ภาษาไทยได้ไหมครับ',3:'That’s okay. Do you like apple, juice, or bread?\nไม่เป็นไรนะ เธอชอบแอปเปิล น้ำผลไม้ หรือขนมปังไหม？'},
  S028:{5:'That’s okay. Do you want English or Vietnamese? Được thôi. Con muốn tiếng Anh hay tiếng Việt?',6:'Tìm nam is.',8:'Việt Nam, tiếng Việt.',9:"That's okay. Do you like cows? Được thôi. Con có thích con bò không?",10:'Con thích con bò.'},
  S030:{0:'好了.',4:'喜欢.',6:'我不明白可以讲华文吗？',7:"That's okay. Do you like cows or cats?\n没关系。你喜欢牛还是猫？",8:'猫.',10:'什么意思？',12:'不明白.',13:"That's okay. Do you like cats?\n没关系。你喜欢猫吗？",14:'我喜欢猫英文怎样讲？'},
  S042:{6:'เรามาคุยภาษาไทยกันเถอะ ห้ามคุยภาษาอังกฤษอีกล่ะ และญี่ปุ่นก็ห้ามห้ามทั้งภาษา เอาภาษาไทยอย่างเดียวนะ',7:"That's okay. Which farm animal do you like best? ไม่เป็นไรนะ แล้วเธอชอบสัตว์ในฟาร์มตัวไหนมากที่สุด?",8:'บอกไปแล้ว ครั้งแรกไง เธอไม่ได้ยินเสียงที่ฉันพูดครั้งแรกเลยเธอลืมไปแล้วรึไง',9:'ขอโทษนะ ฉันจะคุยภาษาไทยให้ ตอนนี้เธอชอบ cow, cat, หรือ horse ไหม?',10:'ไม่เอาหรอก ภาษาอังกฤษเนี่ย อืม เมื่อกี้เธอพูดภาษาอังกฤษเยอะมากไป Lent ให้ upball คุยมั่งดีกว่า อาบอคุยแรงแรง คุยแรงแรงเลยนะ แกจะได้ได้ยินเสียง',11:"That's okay.\nWhich farm animal do you like most?\nไม่เป็นไรนะ\nเธอชอบสัตว์ในฟาร์มตัวไหนมากที่สุด？"},
  S050:{0:'Ok cho qua ngành những cái bạn bạn đọc đi.',6:'Cho qua nhanh',16:'Dịch nghĩa ra dùm tớ đi zin không tớ không hiểu hết trơn.'},
  S057:{8:'هل تعرف أن تتكلم عربي دوت بورد؟',12:'أريد أن أغني.'},
  S064:{6:'메롱메롱, 매롱.'},
  S076:{0:'Chào bạn nhé.',2:'Bạn có thể nói tiếng Việt được không?'},
  S083:{0:'مرحبا.',4:'كيف يمكنني أدخل الدرس؟'}
 };
 for(const item of data.cases||[]){
  const source=originals[item.id];
  if(!source)continue;
  item.conversation=item.conversation.map((message,index)=>{
   if(!source[index]||message[2]!==true)return message;
   return[message[0],source[index],message[1]];
  });
 }
})(window.DINO_POST_CLASS_STUDENT_BEHAVIOR);
