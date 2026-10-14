# GitHub 上传清单

## 允许上传

- `README.md`、`AGENTS.md`、`.gitignore`
- `docs/`、`data/`
- `dino-chat-dashboard/`，但不含 `outputs/`
- `dino-chat-dashboard-vercel/`，但不含 `public/`、`.vercel/`、`node_modules/` 和真实 `.env`
- `scripts/`

## 禁止上传

- 手机号、邮箱、昵称、头像、精确生日、原始用户/Session ID 等直接身份数据
- 完整生产导出、原始 chat history、原始 user profile 文件
- 账号密码、API key、Cookie、数据库凭证、部署 token
- `outputs/`、`output/`、`public/`、`.vercel/`、`node_modules/`

GitHub Actions 工作流需在 GitHub CLI 获得 `workflow` scope 后单独添加；当前仓库先使用 `scripts/validate-dashboard.sh` 做同等本地校验。

提交前运行：

```bash
bash scripts/validate-dashboard.sh
bash scripts/stage-github-upload.sh
git status --short
```
