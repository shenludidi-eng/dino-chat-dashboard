# 运维与发布手册

## 本地查看

推荐运行：

```bash
python3 dino-chat-dashboard/scripts/serve_dashboard.py
```

打开 `http://127.0.0.1:8765/index.html`。不要直接打开文件夹 URL；那只会显示目录清单。

## 修改后的验证

```bash
bash scripts/validate-dashboard.sh
```

它执行 JavaScript 语法检查、Node 回归测试、Python 单元测试、Git 格式检查和常见凭证模式扫描。

## 同步部署目录

```bash
bash scripts/sync-dashboard-deploy.sh
```

该命令重建 `dino-chat-dashboard-vercel/public/`。`public/` 不入 Git，源代码仍以 `dino-chat-dashboard/` 为准。

## Vercel 配置

项目根目录选择 `dino-chat-dashboard-vercel/`，并在托管平台设置：

- `DASHBOARD_USERNAME`
- `DASHBOARD_PASSWORD`

不要把真实值写入 `.env.example`、文档、Issue 或 commit。线上入口为 <https://dino-chat-dashboard-secure.vercel.app/>。

## 发布检查表

1. 数据快照清单和哈希已更新。
2. 所有测试通过；本地抽查首页、三个入口、筛选器、全文弹窗和翻译。
3. `public/` 已从最新源码重建。
4. Vercel 预览部署通过，并确认未登录时返回 401。
5. 生产部署后检查深链接和静态资源加载。
6. 把发布日期、commit 和口径变化写入变更记录或 Pull Request。

## 回滚

优先在 Vercel 回滚到上一成功部署；同时在 Git 中用新的 revert commit 恢复代码，不重写共享分支历史。若错误来自数据快照，恢复上一份已校验的派生资产和 manifest，再重新发布。
