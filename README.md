# Dino Chat Analytics Dashboard

Dino Chat 内部数据分析看板的独立仓库。这里集中保存查询网站源码、去标识化数据快照、分析方法论、网站架构、测试和发布配置，方便后续持续迭代与复盘。

内部查询网站：<https://dino-chat-dashboard-secure.vercel.app/>。用户名和密码不进入 Git，由项目负责人通过私密渠道提供。

## 推荐阅读顺序

| 入口 | 内容 |
|-|-|
| [`docs/dashboard/README.md`](docs/dashboard/README.md) | 项目总入口 |
| [`docs/dashboard/data-catalog.md`](docs/dashboard/data-catalog.md) | 数据资产、快照与隐私分级 |
| [`docs/dashboard/analysis-methodology.md`](docs/dashboard/analysis-methodology.md) | 指标和抽样分析方法论 |
| [`docs/dashboard/architecture.md`](docs/dashboard/architecture.md) | 网站与数据架构 |
| [`docs/dashboard/operations-runbook.md`](docs/dashboard/operations-runbook.md) | 本地运行、验证、发布和回滚 |
| [`dino-chat-dashboard/README.md`](dino-chat-dashboard/README.md) | 看板功能和详细技术口径 |

## 仓库结构

| 路径 | 内容 |
|-|-|
| `dino-chat-dashboard/` | 静态看板源码、去标识化派生数据、构建脚本与测试 |
| `dino-chat-dashboard-vercel/` | Vercel Basic Auth 保护层与部署配置 |
| `data/` | 数据快照清单、数量与 SHA-256 |
| `docs/dashboard/` | 方法论、架构、隐私和运维文档 |
| `docs/requirements/` | 已沉淀的看板需求 |
| `scripts/` | 校验、部署同步和安全提交脚本 |
| `scripts/validate-dashboard.sh` | 本地与 CI 可复用的完整性检查入口 |

## 数据安全边界

- 仓库只保存去标识化派生数据、固定抽样证据和可复现构建逻辑。
- 手机号、邮箱、昵称、头像 URL、精确生日、原始 `user_id` / `session_id` 和完整生产导出不进入 Git。
- 网站凭证只保存在 Vercel 环境变量中；`.env.example` 只列变量名。
- 非英文证据保留原文，并在下方另附英文翻译。

## 本地验证

```bash
bash scripts/validate-dashboard.sh
python3 dino-chat-dashboard/scripts/serve_dashboard.py
```

本地入口：<http://127.0.0.1:8765/index.html>。

## 发布

```bash
bash scripts/sync-dashboard-deploy.sh
```

然后从 `dino-chat-dashboard-vercel/` 发布到 Vercel。详细步骤见运维手册。
