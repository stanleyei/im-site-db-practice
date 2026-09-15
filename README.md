# im-site-db-practice

「看畫面設計資料庫」課堂練習：一個虛構的資管系網站，學生只看畫面反推資料表與欄位，在 drawSQL 畫 ERD、在 HeidiSQL（MariaDB）建表輸入資料，再用不含任何表名欄名的查詢題驗證自己的設計。

- 練習網站：<https://stanleyei.github.io/im-site-db-practice/>
- 學生手冊：[`docs/學生版-練習手冊.md`](docs/學生版-練習手冊.md)
- 講師版（解答、檢核點、參考 schema、種子資料）：`docs/private/`，**不進版控**，只存在講師本機

以 [template-prod-html](https://github.com/DigiPack-Production/template-prod-html) 為模板，Tailwind CSS v4、純靜態、無框架。

## 快速開始

```bash
npm install
npm run build        # 產生 index.html 與 css/style.css
npx serve . -l 3000  # 預覽 http://localhost:3000
```

## 內容怎麼改

網站畫面、參考解答、種子資料共用**同一份資料來源** `docs/private/site-data.js`。修改資料後：

```bash
npm run build        # = npm run site（產生 index.html、docs/private/seed.sql）+ Tailwind
```

`index.html` 是產物但**有進版控**，因為 GitHub Actions 沒有 `docs/private/` 可以重新產生它。改完資料請一併 commit 新的 `index.html`。

改了 `src/tailwind.css` 或 `js/` 時，發布前把 `scripts/build-site.js` 內的 `ASSET_VERSION` 更新為當日日期與流水號（`YYYYMMDD-NN`），再重新 build。

講師版文件 `docs/private/講師版-解答與檢核.md` 的預期結果是手寫的，改資料後需手動核對。

## npm scripts

| 指令 | 說明 |
| --- | --- |
| `npm run site` | 由 `docs/private/site-data.js` 產生 `index.html` 與 `docs/private/seed.sql` |
| `npm run build:css` | 只建置 Tailwind |
| `npm run build` | `site` + `build:css`，本機完整建置 |
| `npm run dev` | Tailwind watch（不會啟動伺服器） |
| `npm run img` | 圖片入庫工具，見模板 README |

## 部署

push 到 `main` 後由 `.github/workflows/pages.yml` 建置 CSS 並部署到 GitHub Pages。部署內容為 `index.html`、`css/`、`js/`、`images/`、`docs/`（排除 `docs/private/`）。

## 目錄結構

```
.
├── index.html                 # 由 build-site.js 產生，有進版控
├── scripts/build-site.js      # 畫面與 seed.sql 的產生器
├── docs/
│   ├── 學生版-練習手冊.md       # 公開
│   └── private/               # 不進版控：site-data.js、seed.sql、講師版
├── src/tailwind.css
├── js/main.js                 # 分頁切換、分類篩選、回到頂部
├── images/photo/              # codex image gen 產生的示意照片（webp）
└── .github/workflows/pages.yml
```

## 圖片

`images/photo/` 的照片以 Codex 內建 image generation 產生，皆為虛構場景，經 `npm run img -- photo` 轉為 WebP。網站中所有人物、單位、聯絡方式皆為虛構。
