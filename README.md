# 機票搜尋程式

網頁前端（React + Vite）+ 後端（Express）的機票搜尋工具，使用 [Duffel](https://duffel.com/) 的免費自助 Test Mode API 取得真實航班資料結構（測試環境資料來自 Duffel Airways 沙盒）。

功能：
- 單程 / 來回票搜尋
- 依價格、飛行時間、轉機次數排序與篩選（轉機數上限、價格區間、航空公司）
- 多城市 / 多日期比較，找出最划算的組合

## 1. 安裝 Node.js

到 [nodejs.org](https://nodejs.org/) 下載並安裝 LTS 版本，安裝完成後重新開啟終端機，確認：

```
node -v
npm -v
```

## 2. 安裝套件

```
cd flight-search
npm install
```

（`npm install` 會透過 npm workspaces 一併安裝 `server/` 與 `client/` 的相依套件。）

## 3. 申請 Duffel API Token（免費，不需信用卡）

1. 到 https://app.duffel.com/join 註冊帳號（約一分鐘）
2. 登入後確認左下角是 **Developer test mode**（預設就是）
3. 到 Dashboard 的 API tokens 頁面建立一組 token，開頭會是 `duffel_test_...`
4. Test mode 是免費沙盒，只會查到 Duffel Airways 的測試航班資料，不會產生任何費用或真實訂位

## 4. 設定環境變數

```
copy server\.env.example server\.env
```

編輯 `server/.env`，填入：

```
DUFFEL_API_TOKEN=duffel_test_你的token
```

## 5. 啟動

```
npm run dev
```

會同時啟動：
- 後端 API：http://localhost:4000
- 前端網頁：http://localhost:5173

開啟 http://localhost:5173，出發地/目的地可直接輸入城市名稱或 IATA 代碼（例如 `TPE`、`NRT`）。

## 注意事項

- Test mode 回傳的是 Duffel Airways 沙盒資料（非真實航班/票價），適合開發與個人使用；正式上線需改用 `duffel_live_...` token 並依 Duffel 的付費/驗證流程申請。
- 多城市/日期比較一次最多 5 組，避免過多平行請求。
- 若忘記設定 token，搜尋時會顯示明確的錯誤訊息提示。
