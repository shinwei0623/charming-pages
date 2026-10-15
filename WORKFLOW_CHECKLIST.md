# Charming Release Checklist

## Before change
- [ ] 確認 repo / branch / Apps Script / credential 都是 Charming
- [ ] 確認上一個可運作版本與 rollback 路徑

## Before production
- [ ] 靜態語法檢查通過
- [ ] Secret 掃描無異常
- [ ] GitHub Pages 前端不依賴 google.script.run
- [ ] Public API 為唯讀
- [ ] 資料筆數合理
- [ ] 管理端仍受登入與白名單保護
- [ ] 手機 / 桌機 Preview 通過

## Release
- [ ] 建立不可變版本
- [ ] 更新正確 production deployment
- [ ] Commit / push 完成

## After release
- [ ] 首頁可開
- [ ] 公開資料載入成功
- [ ] 搜尋 / 區域篩選 / 優惠碼複製正常
- [ ] 外部導購連結正常
- [ ] 管理端未被公開
- [ ] 記錄本次版本與驗收結果
