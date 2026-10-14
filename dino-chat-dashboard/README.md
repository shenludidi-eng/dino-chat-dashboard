# Dino Chat 当前现状分析看板

静态、内部使用的数据分析网站。它只分析当前 chat history，不包含 Prompt 对比、A/B Test、未来提示功能、跨会话记忆或用户 Persona。

## 信息架构

- 总览：三入口共同基线、趋势、版本迭代记录、Session 深度、共同信号与数据完整性。版本节点为人工维护的时间背景，不用于直接归因。
- 用户画像：业务年龄段、当前 Level、来自哪个地区的分布与全局筛选；所有指标和 transcript evidence 同步响应。`lang_code` 的业务含义未确认，不在看板中展示或用作筛选。
- HOME / EXPLORE / POST_CLASS：每个入口有“Dino 对话概览、孩子表达概览、Session / 回访、Round”四个 Tab；方向、主题、表达行为、明确选择和帮助信号由每个入口独立归纳，非通用标签换名称。
- Transcript Evidence：新图表可查询全部命中 Session，分页查看前后文并展开完整 Session；保留原文，遮盖邮箱/长号码，不展示技术标识。已有英文译文附在下方，其他非英文片段明确标记“译文待补”，不因缺译文丢弃证据。

## 2026-10-10：入口独立的描述性分析

当前数据窗口仍为 2026-09-14 至 2026-10-07：175,676 条消息、3,262 位用户。
发现两个原始 session_id 在 HOME 和 POST_CLASS 复用，分组键已修正为
`(entry_type, user_id, session_id)`，Session 数由 10,961 修正为 10,963。
消息数、原文内容和用户画像未因此新增。入口计数为 HOME 7,800、EXPLORE 1,914、POST_CLASS 1,249。

分析范围：HOME 的生活聊天/澄清/游戏/学习习惯，EXPLORE 的选题/表达示例/动物颜色/活动请求，
POST_CLASS 的具体喜好/动作能力/星期月份/科目用品等。分类定义和匹配规则在
`scripts/build_entry_analysis.py`，从各入口高频词组及实际片段人工归纳，未读取 Prompt 目标。

方法是**全量词组规则扫描**，并非全量 LLM 语义标注。对否定、隐含意义、多语言、ASR 和指代的覆盖有限；
因此提供规则命中率、未归类消息入口及原文，不把词频等同主题理解，不把参与等同偏好。
仅有结构校验与少量规则边界回归检查，尚无人工语义准确率估计。
语言统计为“非英语文字线索”，不强行给未识别的拉丁文本贴英语标签，也不猜母语。

每个入口、每个分类可切换 Session / 消息 / 用户：分母为当前日期及画像过滤下的对应角色消息及其去重 Session / 用户。
多标签占比可超过 100%。共现组合仅使用同 Session 紧邻的孩子消息和 Dino 回复，双方均须满足日期筛选。
画像仍是当前画像；Session 范围为筛选期间实际有消息的 Session，深度与时长使用其完整记录。
回访观察起点按筛选期间首次 Session 开始日期统计，消息行为图按各条消息日期统计。
原文侧栏可以查看跨出筛选日期的上下文，但命中数量仅统计筛选内消息。

重新生成独立分析（先保证 data.js 与同一 JSON 源已对账）：

```bash
python3 scripts/build_entry_analysis.py --source /path/to/history.json
python3 scripts/test_entry_analysis.py
```

生成的 `analysis/entry-analysis.js` 为紧凑统计记录；完整原文按 Session 分片存在
`analysis/transcripts/`，只在下钻时加载。`analysis/analysis-audit.json` 保存可对账计数。
这些原文仅限当前内部看板使用，不应发布到公共站点。

## 生成数据

```bash
python3 scripts/build_data.py \
  --csv /path/to/history.csv \
  --json /path/to/history.json \
  --profiles /path/to/user_profiles.xlsx \
  --countries /path/to/user_current_country.csv \
  --output data.js
```

`--csv`、`--profiles` 与 `--countries` 可省略。画像文件使用 `User profiles` 工作表中的 `user_id`、`age_range` 和 `current_level_no`；地区文件使用 `user_id` 与 `current_country`。构建过程以 `message_id` 去重，并把技术标识转换为仅供前端聚合使用的整数索引；生成的 `data.js` 与页面均不包含原始 user_id 或 session_id。

## 口径

### 总览：当前用户构成

「整体 / HOME / EXPLORE / POST_CLASS」切换分别展示年龄、当前 Level、当前国家／地区；移除原来的画像关联覆盖大卡片。页面不再展示「数据完整性」和底部「READING THE DATA」区块，各图表自己的口径提示保留。每个入口的分母为当前全部筛选内有用户消息的去重用户。同一用户可属于多个入口，整体跨入口去重，入口人数不能相加。未记录画像保留在分母，无用户时不计算百分比。条形图按统一 0–100% 刻度，国家长尾仍合并为「其他地区」。

验证：`node scripts/test_profile_composition.cjs`，覆盖消息去重、跨入口去重、缺失画像、空入口、构成对账及日期／级别／国家联合筛选。

### 总览：每周流量对比

保留每日折线图，并新增按周一至周日的三个入口分组柱状图及明细表。两张图同步切换 Session／用户／消息，也同步响应日期、Level、年龄及国家／地区筛选。

- Session 与原每日趋势一致：按导出中首条消息日期归周，跨周只计一次。这与轮次分布页“该周有消息即纳入”的口径不同。
- 用户：当周有用户消息的用户，入口内周去重；全入口合计再次跨入口去重，不能相加每日人数或三个入口人数。
- 消息：按各消息记录日期计数，包含孩子与 Dino 双方，不等于用户消息 KPI 或 Round。
- 日期以源数据为准，尚未换算为用户当地时间；不足七天的源数据窗口或日期筛选标记为不完整周，使用斜线柱并列出实际范围，不做误导性的整周环比。
- 完整周只代表日期范围覆盖七天，不表示导出已核验无缺失。

### POST_CLASS：环节完成率

POST_CLASS 页面在轮次分析之后展示用户级环节完成率。分母是当前筛选周期内打开过 POST_CLASS 的去重用户；分子是其中在生产表 `class_user_lesson_task` 中至少存在一条 `task_code = SPEAKING` 且 `status = COMPLETED` 记录的去重用户。同一用户打开多次只计一人，完成多个 lesson 也只计一人；只要在看板数据截止前完成过一次，即计为完成用户。

按周趋势时，先取当周打开过 POST_CLASS 的去重用户，再判断这批用户截至看板数据窗口结束前是否曾完成 SPEAKING。完成率板块分为两层：总览展示按周完成率趋势、打开用户和完成用户；明细支持按统计周、Level、国家／地区独立筛选。顶部日期与画像筛选仍影响整个页面，明细筛选只改变完成率板块，避免干扰其他分析。生产库的业务 ID 仅用于私有构建阶段关联；公开的 `post-class-completion-data.js` 只保存匿名整数索引。

刷新命令：

```bash
python3 scripts/build_post_class_completion.py \
  --messages /private/path/merged-messages.json \
  --data data.js \
  --query-helper /private/path/archery-prod-query/scripts/query.py \
  --output post-class-completion-data.js
```

需要已配置的 `ARCHERY_USER` 与 `ARCHERY_PASSWORD`，查询只读。验证：`node scripts/test_post_class_completion.cjs`。

### POST_CLASS：课堂所学关联抽样

POST_CLASS 的「Dino 对话概览」下方增加课程关联抽样板块。课程事实取生产会话创建时保存的 `post_class_chat_session.knowledge_points_json`，该字段是与 Prompt `selected_content` 同源的会话快照；不使用用户当前课程反推历史 Session。

当前数据窗口内 1,856 个 POST_CLASS Session 中，1,545 个有可用课程快照。从这些 Session 中按 Level、课型和统计周分层抽取 60 段，人工逐段对照完整对话，分为「明确围绕课程」「相关延展」「明显偏离」和「证据不足」。课程内容是对话素材，不是必须逐项覆盖的任务清单。这是固定样本审核，不随页面筛选变化，不作全量统计或学习效果推断。

公开数据仅保留汇总结果和去标识化代表证据，不包含业务 user_id 或 session_id。验证：`node scripts/test_post_class_lesson_alignment.cjs`。

验证：`node scripts/test_weekly_traffic.cjs`。覆盖周内去重、跨入口去重、跨周 Session、消息日期、画像筛选、部分周、空数据和全量对账。

### 轮次分布页面

轮次分布已合并至总览的每日趋势与每周流量之后，保留入口摘要、分档堆叠图、明细、统计周与画像筛选。独立导航 Tab 已移除；旧链接 `?page=distribution` 兼容打开总览。组件固定在总览中，较长的阅读说明默认折叠。

总览内的「轮次分布」使用互斥档位：≤2、3–5、6–10、11–20、21+ 轮。
百分比堆叠图与明细表的分母均为当前筛选下各入口各自的 Session 数，支持级别、国家、年龄和日期联合筛选。
「统计周」按周一至周日划分，选周同步全局日期；手动修改日期时显示匹配周或「自定义日期范围」。只列出数据窗口中有日期的周，首尾不足整周的选项标注「不完整周」。跨周有消息的 Session 可出现在多周，各周 Session 数不可直接相加。
日期选择期间至少有一条消息的 Session，轮次取本次导出中该 Session 的全部用户回答数，不在日期边界截短。
这不是目标轮次完成率，也不保证记录覆盖实际最终结束。无样本显示「—」，零轮纳入 ≤2，未知轮次单列且保留在分母。
本页是消息计数，不依赖话题关键词命中；缺少用户画像的记录默认保留为「未记录」。

验证：`node scripts/test_round_distribution.cjs`。覆盖分档边界、全量对账、用户回答数、组合筛选、日期边界、零轮与空样本。

- Session：一次进入到离开的完整对话，同一 Session 可同时命中多种行为。
- Round：`Dino 发言 + 用户回答`；用户完成回答即完成一轮。当前导出缺少第一条 Dino 开场，页面会明确提示。
- Session 时长：当前使用首末消息时间差，可能包含停顿。
- 同入口 7 日回访：仅纳入拥有完整 7 日观察窗口的用户。
- 话题：从每个入口真实文本中的高频语义词簇自下而上发现，当前属于探索性指标。
- 用户困难：六分类；普通非英语内容与明确母语 / 翻译求助分开。
- Dino 回应：描述“用户困难 → 实际策略 → 下一轮结果”，不在缺少入口 / Level 配置时判断策略对错。
- Bad case：当前只展示规则候选；隐私敏感提问按约定隐藏并排除总量。
- 国家/地区：按 `user_id` 取 `last_seen_at` 最新设备的 `user_device_context.current_country`，仅代表当前设备国家画像，不代表对话发生时的位置。

## 当前数据缺口

用户时区、第一条 Dino 开场、POST_CLASS 目标轮次、结束原因、ASR / input_status 尚未接入。画像表中的 `gender` 只有未定义的 `0` / 空值，因此暂不解释、不提供筛选。看板不会根据正文猜测缺失字段。

## 本地预览

双击本目录的 `打开Dino Chat看板.command`。它只在 `127.0.0.1` 启动本地服务，并打开固定首页：

`http://127.0.0.1:8765/index.html`

如果 8765 已被其他本地程序占用，启动器会自动选择下一个可用端口并打开正确首页，不会因端口冲突退回目录页。

不要把 `dino-chat-dashboard` 文件夹本身拖入浏览器；浏览器对 `file://...文件夹/` 只会显示目录清单，那不是看板页面。

服务端已禁止目录清单，访问根地址或 `/dino-chat-dashboard/` 都会强制跳转到 `index.html`。页面支持深链接，例如：

`http://127.0.0.1:8765/index.html?page=entry&entry=2&tab=rounds`
