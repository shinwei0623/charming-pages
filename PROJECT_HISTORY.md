# Charming Project History

此檔用來累積 Charming 專案在實作過程中形成的工程經驗。

## 2026-10｜GitHub Pages 遷移

### 經驗 1：公開前台與管理端要分 deployment
原 GAS Web App 曾因 deployment 用途混淆，導致公開網址要求 Google 登入。後續固定將 public 與 admin identity 分開驗證。

### 經驗 2：匿名前台與管理權限不能共用執行模式
公開前台使用匿名可讀；管理 deployment 保持 Google 身分驗證與白名單。

### 經驗 3：前端部署邊界必須明確
GitHub Pages 前端放在 `/docs`，並透過 `.claspignore` 排除，避免 `clasp push` 把瀏覽器 JS 推入 Apps Script。

### 經驗 4：Secret 不進 Git
管理 token、OAuth credential、Script Properties 等不寫進 repository。

### 經驗 5：先建立可讀 API contract，再替換資料層
Pages 只依賴公開唯讀資料 contract。未來從 Google Sheets 遷移到關聯式資料庫時，優先維持前端 contract 不變。

### 經驗 6：完成的定義是 Evidence
只有程式完成不算完成；需有實際 HTTP/UI 驗證、Git 紀錄與 rollback 路徑。

此檔後續每次遇到新的部署事故、修復方式或更成熟流程時持續追加，逐步形成 Charming 自己的工作流知識庫。
