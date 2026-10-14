# Data directory

本目录只存数据资产说明和可审计快照清单。实际看板派生数据位于 `dino-chat-dashboard/`，原始查询数据不进入 Git。

- `manifests/`：每次正式数据刷新后的时间范围、数量、资产哈希和隐私等级。
- 原始 chat history、user profile、country、lesson task 等导出只保存在受控本地目录。
- 看板派生资产使用匿名整数索引，不包含原始用户或会话 ID。

完整规则见 [`docs/dashboard/data-catalog.md`](../docs/dashboard/data-catalog.md) 和 [`docs/dashboard/privacy-and-security.md`](../docs/dashboard/privacy-and-security.md)。
