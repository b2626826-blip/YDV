# YDV ERP App

正式 ERP App 的起始骨架。現有 `/ERP` 保留為 prototype/demo，本資料夾不直接複製 demo 的 in-memory business flow。

## 結構

```text
ERP-APP/
├── frontend/                         # React + TypeScript + Vite PWA
│   └── src/
│       ├── app/                       # Provider、routing、AppShell
│       ├── platform/                  # API、auth 等跨模組技術能力
│       ├── features/production/       # 第一個垂直切片
│       │   ├── orders/                # 製令、批次、完工事件
│       │   └── products/              # 生產切片使用的產品主檔介面
│       └── shared/                    # 真正跨模組的 UI 與純工具
├── backend/                           # Java 21 + Spring Boot API
│   └── src/main/java/com/ydv/erp/
│       ├── platform/                  # health、security
│       └── modules/production/        # 生產領域模組
├── compose.yaml                       # 本機 PostgreSQL（host port 55432）
└── docs/                              # 專案計畫與決策
```

## 啟動

```bash
# Terminal 1
cd backend
./mvnw spring-boot:run

# Terminal 2
cd frontend
npm run dev
```

PostgreSQL 使用 Docker Compose 時執行 `docker compose up -d postgres`；Compose 的預設連線設定已與 backend 對齊。若本機 Docker daemon 尚未啟動，先開啟 Docker Desktop。需要覆寫時，再設定 `DB_URL`、`DB_USERNAME`、`DB_PASSWORD` 環境變數。

## 驗證

```bash
cd frontend
npm run check
npm run lint
npm run test
npm run build

cd ../backend
./mvnw test
```

`/api/health` 是目前唯一的公開 API；正式角色、製令與完工事件會在第一個 production slice 中逐步加入。
