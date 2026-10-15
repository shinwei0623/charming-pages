# Charming Engineering Workflow

本文件定義 Charming 專案自己的工程工作流。方法可參考過往大型專案累積的成熟做法，但 Charming 與任何其他專案的程式碼、資料、憑證、部署設定與雲端資源必須完全隔離。

## 1. 核心原則

1. One Source of Truth
   - 程式原始碼：GitHub repository
   - 公開網站：GitHub Pages
   - 內容資料：目前為 Google Sheets
   - 管理與資料發布：Google Apps Script
   - 不讓同一份資料在多個地方各自被人工修改

2. Evidence First
   - 每個重要變更都要有可驗證證據
   - 不以「看起來應該成功」作為完成條件
   - 部署完成後一定做實際 URL / API / UI smoke test

3. Gate Before Production
   - 未通過驗收 Gate，不切 Production
   - 驗證失敗時保留上一個可運作版本

4. Rollback First
   - 任何正式變更前，先知道如何退回上一版
   - 發布快照採不可變版本編號

5. Least Privilege
   - 公開前台只拿到公開唯讀資料
   - 管理、寫入、維護 action 不暴露給匿名前台
   - Secret 不進 Git，不硬編碼在公開程式

6. Small, Reusable Steps
   - 優先做可驗證的小階段
   - 穩定後再抽象成可重複使用模板

## 2. 標準工作流

### A. ENVIRONMENT
- 確認目前操作的是 Charming 專案
- 確認 Git branch / repo / Apps Script project / credential 都屬於 Charming
- Windows clasp 一律使用 `clasp.cmd --user charming ...`

### B. SOURCE_SYNC
- 先同步目前正式 source
- 確認工作目錄乾淨
- 不直接在 Production 上做不可追蹤修改

### C. CHANGE
- 功能改動優先建立 branch
- 小型緊急修正至少保留清楚 commit
- 前端與 GAS 後端保持部署邊界
- GitHub Pages 檔案放 `/docs`
- `.claspignore` 必須排除 `/docs`

### D. STATIC_VALIDATION
至少檢查：
- JS / HTML / CSS 基本語法
- 不存在 secret / token / credential
- Pages 不依賴 `google.script.run`
- 公開前端只能呼叫公開唯讀 API
- `.claspignore` 不會把 Pages 程式送進 Apps Script

### E. PREVIEW / STAGING
在重大改版中，優先先有 Preview / Staging：
- UI 桌機寬度驗收
- UI 手機寬度驗收
- 搜尋、篩選、複製優惠碼、導購連結實測
- 資料筆數與正式快照合理

### F. PRODUCTION GATE
正式切換前必須通過：
- Git working tree 狀態明確
- 公開資料 API HTTP 成功
- API 回傳 snapshotVersion / publishedAt
- products / coupons / offers 數量非異常歸零
- GitHub Pages 靜態資源可讀
- 管理 deployment 仍需要 Google 登入
- 匿名使用者不能觸發寫入或 admin action
- 已知 rollback 版本存在

### G. RELEASE
- 建立不可變 Apps Script version
- 只更新正確的 production deployment
- 不重建不必要的 deployment URL
- Git commit / push
- 重大版本可加 release tag

### H. POST-DEPLOY SMOKE TEST
發布後重新從外部驗證：
- GitHub Pages 首頁可開
- 公開資料可載入
- 首頁精選存在
- 區域篩選正常
- 搜尋正常
- 外部導購連結正常
- 手機版基本操作正常
- 管理端仍被隔離

### I. CHECKPOINT
每個階段狀態只允許以下概念：
- PASSED：驗收通過
- RETRYABLE：可重試，不影響上一個成功版本
- WAITING_USER：需要人工授權或 UI 操作
- NEEDS_REFINEMENT：架構或功能需修正

前一階段已成功的結果，不因後一階段失敗而被抹除。

## 3. Source of Truth

| 類型 | 目前 Source of Truth |
|---|---|
| 程式碼 | GitHub `shinwei0623/charming-blog` |
| 公開前端 | GitHub Pages `/docs` |
| 內容資料 | Google Sheets |
| 發布後公開資料 | Published Snapshot |
| 後台邏輯 | Google Apps Script |
| Secret | Apps Script Script Properties / 本機 credential store |

## 4. Charming 專案隔離規則

禁止：
- 共用其他專案的 `.clasprc.json`
- 把其他專案的資料、設定、部署 ID 複製進 Charming
- 把 Charming source 放進其他專案 repository
- 把管理 token、OAuth token、API key 提交至 GitHub

允許：
- 參考通用工作流
- 參考驗收 Gate 設計方式
- 參考 rollback / handoff / checkpoint 概念
- 參考測試分層與 deployment discipline

## 5. Pages + GAS 現階段架構

```text
Google Sheets
    ↓
GAS CMS / Admin
    ↓
Published Snapshot
    ↓
Public Read-only API
    ↓
GitHub Pages
```

Pages 是網站本體；GAS 是 CMS / backend，不再把 GAS Web App 當長期公開網站主機。

## 6. 關聯式資料庫升級 Gate

目前維持 Google Sheets。達到下列任一明顯條件時，重新評估 PostgreSQL / Supabase：
- 商品進入數千筆等級
- 多對多關係大量增加（商品×分類、商品×標籤、優惠×商品）
- 需要會員、收藏、個人化推薦
- 需要曝光、點擊、轉換與價格歷史
- 多人同時大量維護
- Sheet API / 鎖定 / 同步速度成為實際瓶頸
- Charming Agent 需要大量即時關聯查詢

升級原則：前端 API contract 儘量不變，只替換資料庫層。

## 7. 每次完成定義

一個任務只有在「程式完成 + 實際驗證 + Git 有紀錄 + 可回退」後才算完成。
