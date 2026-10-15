# Workflow Reference Policy

Charming 可以參考其他成熟專案的工程方法，但只能抽象化為通用流程。

可參考：
- Gate / checkpoint 設計
- Staging → Production 流程
- Health check / smoke test
- Branch / commit / PR discipline
- Immutable release / rollback
- Handoff 與驗收證據
- Source of Truth 與模組邊界

不得帶入：
- 其他專案程式碼
- 其他專案資料
- 帳號、Token、OAuth、API Key
- Apps Script ID / Deployment ID
- Google Sheet / Drive ID
- 使用者名單或權限資料

每次把外部經驗帶進 Charming 時，都必須重新命名、重新文件化、重新驗證，成為 Charming 自己的工作流。
