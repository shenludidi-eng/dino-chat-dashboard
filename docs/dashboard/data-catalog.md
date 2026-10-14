# 数据资产目录

## 数据分级

| 级别 | 例子 | Git 策略 |
|-|-|-|
| Restricted raw | 完整聊天导出、手机号、邮箱、昵称、头像、精确生日、原始用户/会话 ID | 永不提交；仅限受控本地环境 |
| Internal derived | 匿名整数索引、聚合统计、固定抽样 transcript、规则命中证据 | 可进入当前私有仓库；不得公开发布 |
| Documentation | 指标定义、架构、脚本说明、审计摘要 | 可进入当前私有仓库 |
| Secret | 账号密码、API key、Cookie、数据库凭证、部署 token | 永不提交；只用环境变量/密码管理器 |

## 当前快照

- 北京时间窗口：2026-09-14 至 2026-10-11
- 消息：211,928 条，其中用户消息 105,964 条
- 去重用户：3,790
- Session：13,347
- 时区：Asia/Shanghai
- 抽样 transcript 分片：105 个
- 详细哈希：[dashboard-snapshot-2026-10-11.json](../../data/manifests/dashboard-snapshot-2026-10-11.json)

## 主要派生资产

| 资产 | 用途 |
|-|-|
| `data.js` | 全局计数、消息和匿名画像索引 |
| `analysis/entry-analysis.js` | 各入口主题、行为与证据索引 |
| `analysis/transcripts/` | 去技术标识的完整抽样会话，供“查看全文” |
| `post-class-completion-data.js` | POST_CLASS 环节完成率 |
| `post-class-lesson-alignment-data.js` | 对话是否围绕课堂所学的固定抽样 |
| `post-class-student-behavior-data.js` | 学生行为抽样、占比和证据 |
| `sampled-conversation-analysis-data.js` | 抽样对话分析 |
| `dialogue-translations-data.js` | 非英文原文对应的英文译文 |

## 关联和去标识化

原始业务 ID 只在构建阶段用于跨表关联。输出把用户和 Session 转为只对当前快照有意义的整数索引；页面不展示技术标识。正文中的邮箱和长号码由构建逻辑遮盖。非英文证据必须保留原文，并在下方单独显示英文翻译。

## 刷新纪律

1. 原始查询输出写入被 `.gitignore` 排除的受控目录。
2. 运行对应构建脚本，保存审计和对账结果。
3. 运行 `scripts/validate-dashboard.sh`。
4. 更新快照 JSON：日期、数量、文件哈希和方法版本。
5. 用 `scripts/stage-github-upload.sh` stage，确认没有 raw/secret 文件后提交。
