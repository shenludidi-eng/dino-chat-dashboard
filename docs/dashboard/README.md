# Dino Chat 数据看板项目总入口

本目录把“网站能看什么、数据从哪里来、指标如何计算、为什么这样判断、怎样安全发布、下一次怎样复盘”连接成一套可持续维护的项目记录。

## 快速入口

| 文档 | 回答的问题 |
|-|-|
| [数据资产目录](data-catalog.md) | 有哪些数据、哪些能进 Git、如何追溯快照 |
| [分析方法论](analysis-methodology.md) | 用户量、画像、轮次、完成率和抽样分析如何计算 |
| [网站架构](architecture.md) | 原始数据如何经过构建进入页面和线上托管 |
| [运维与发布](operations-runbook.md) | 如何本地启动、验证、同步、部署和回滚 |
| [隐私与安全](privacy-and-security.md) | 什么绝对不能上传，证据如何安全保留 |
| [Skills 与工具](skills-and-tooling.md) | 后续开发、测试、数据分析和安全审查可用什么工具 |

## 当前线上入口

<https://dino-chat-dashboard-secure.vercel.app/>

网站只供内部查询。用户名和密码不进入 Git；由负责人通过私密渠道提供，并在 Vercel 环境变量中维护。

## 单一事实来源

- 看板源代码：`dino-chat-dashboard/`
- 部署保护层：`dino-chat-dashboard-vercel/`
- 数据快照清单：`data/manifests/`
- Prompt 与产品方法论：`current/`、`docs/方法论总览.md`
- 历史证据：`history/`

每次改指标时，必须同时修改页面、构建逻辑、测试和本目录方法论文档；每次换数据时，必须更新快照清单和哈希。
