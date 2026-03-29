# Wordplay Quiz Master (單字冒險王) 🎮

![Logo](https://img.shields.io/badge/Status-Beta-orange?style=for-the-badge) ![Tech-React-blue?style=for-the-badge](https://img.shields.io/badge/Tech-React-blue?style=for-the-badge) ![Tech-TypeScript-blue?style=for-the-badge](https://img.shields.io/badge/Tech-TypeScript-blue?style=for-the-badge) ![Style-Tailwind-cyan?style=for-the-badge](https://img.shields.io/badge/Style-Tailwind-cyan?style=for-the-badge)

**Wordplay Quiz Master** 是一款結合 8-bit 復古遊戲風格與英文單字學習的測驗工具。無論你是為了檢定考試還是日常學習，都能在充滿冒險氣息的介面中愉快地累積字彙量。

---

## ✨ 核心功能

### 1. 多玩家管理 👤
- 支援建立多個獨立的使用者帳號。
- 每個玩家擁有各自的進度追蹤、單字庫以及歷史紀錄。
- 資料本地化儲存（`localStorage`），無需連網即可保存進度。

### 2. 復古冒險風格 UI 🏰
- 採用 **Pixel Art** (像素風) 字體設計。
- 具備動態進度條、復古按鈕以及沈浸式背景。
- 提供如「卷軸上傳」、「冒險紀錄」等充滿 RPG 元素的專用語彙。

### 3. 智慧評測機制 (動態難度) 🧠
系統會根據你的表現動態調整複習頻率：
- **新單字**：初始分數為 -1，只需答對 1 次即可通過。
- **通過標準**：累積得分達到 **0 分**以上即視為掌握該單字，系統會自動在下次測驗中移除。
- **答錯懲罰**：答錯時分數減 1，最高扣至 **-3 分**。
  - *意義*：這代表最難的單字需要連續答對 3 次才能「擊敗(通過)」。

### 4. 卷軸上傳 (單字匯入) 📜
- 支援 `.csv` 或 `.txt` 檔案格式。
- 單字秘笈格式：`中文意義, 英文單字` (每行一組，逗號分隔)。
- 簡單拖放即可完成匯入。

### 5. 冒險紀錄 (History) 📊
- 詳細記錄每次挑戰的日期、正確率與使用的單字庫。
- 提供數據視覺化圖表，讓你一眼看出自己的進步趨勢。

---

## 🛠 技術棧

- **核心框架**：[React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **語言**：[TypeScript](https://www.typescriptlang.org/)
- **UI 組件**：[Shadcn UI](https://ui.shadcn.com/) (基於 Radix UI)
- **樣式控制**：[Tailwind CSS](https://tailwindcss.com/)
- **圖表與視覺化**：[Recharts](https://recharts.org/)
- **圖示**：[Lucide React](https://lucide.dev/)
- **狀態管理**：React Hooks (`useState`, `useEffect`)

---

## 🚀 快速開始

### 環境要求
- 已安裝 Node.js (建議 v18 以上)

### 安裝步驟

1. **複製專案**
   ```bash
   git clone <project-url>
   cd wordplay-quiz-master
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **啟動開發伺服器**
   ```bash
   npm run dev
   ```

4. **開啟瀏覽器**
   訪問 `http://localhost:5173` 即可開始你的英語冒險！

---

## 📂 專案結構簡述

- `src/components`: 核心 UI 組件（上傳器、測驗題、歷史紀錄等）。
- `src/pages`: 主要是 `Index.tsx` 入口頁面。
- `src/utils`: 單字解析與評分邏輯。
- `src/types`: TypeScript 型別定義。
- `src/skills`: AI 工具擴充功能。

---

## 📜 授權

此專案採用 MIT 授權。

© 2025 Wordplay Quiz Master - 助你在字彙冒險中脫穎而出！
