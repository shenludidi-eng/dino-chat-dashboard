# Skills 与工具建议

以下能力适合后续持续迭代。本次只完成调研和记录，不自动安装；安装前应由维护者确认来源、权限和使用范围。

| Skill / 工具 | 适用场景 | 建议 |
|-|-|-|
| OpenAI `security-best-practices` | 认证、环境变量、隐私数据和前端安全审查 | 每次发布架构或数据边界变化时使用 |
| OpenAI `security-threat-model` | 梳理原始数据、Git、Vercel、共享密码之间的威胁面 | 上线新数据源或对外开放前使用 |
| OpenAI `playwright` / `playwright-interactive` | 自动检查导航、筛选、弹窗、深链接和登录保护 | 建立浏览器端回归测试 |
| OpenAI `jupyter-notebook` | 数据抽样、分布探索、规则准确率和复盘 | 仅在受控环境读取 raw 数据，输出去标识化结果 |
| OpenAI `vercel-deploy` | 标准化预览部署、生产发布和验证 | 与当前 Vercel wrapper 配合使用 |
| OpenAI `gh-fix-ci` / `gh-address-comments` | 修复 CI、处理 PR review | 把迭代沉淀为可审查的 Pull Request |
| GitHub Large File Storage | 未来单个合规派生资产超过普通 Git 合理体积时 | 当前文件无需 LFS；需要时先重新评估是否应该存数据 |

## 使用原则

- 优先使用官方维护的 Skill；安装第三方 Skill 前先完整审阅 `SKILL.md`、脚本、网络访问和写权限。
- Skill 不能替代数据治理。即使自动化能上传文件，也必须遵守本仓库的允许清单和隐私边界。
- GitHub 集成适合后续检索代码、Issue、PR 与 CI；当前仓库写入仍以本地 Git、显式 staging 和人工检查为准。

## 官方参考

- <https://github.com/openai/skills/tree/main/skills/.curated>
- <https://docs.github.com/en/repositories/working-with-files/managing-large-files>
- <https://docs.github.com/en/repositories/working-with-files/managing-large-files/collaboration-with-git-large-file-storage>
