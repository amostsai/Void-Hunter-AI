<!--
README for Void Hunter AI
This file contains both Traditional Chinese and English versions.
-->
# Void Hunter AI

## 🌟 專案介紹 (繁體中文)
Void Hunter AI 是一款使用 p5.js 製作的 2D 飛機射擊遊戲，具有多種敵機類型、強化道具，及漸進式難度設定。

### 遊戲玩法
- 操作：方向鍵移動，空白鍵開火，R 鍵重啟
- 敵機種類：
  - 第 1 關：普通灰色敵機
  - 第 2 關：新增黃色追蹤敵機
  - 第 3 關後：新增紅色追蹤敵機
- 強化道具：散射 (Spread)、追蹤 (Homing)、護盾 (Shield)
- 畫面顯示：Score（分數）與 Level（關卡）

### 快速開始
1. 複製專案：
   ```bash
   git clone git@github.com:amostsai/Void-Hunter-AI.git
   cd Void-Hunter-AI
   ```
2. 開啟網頁：
   - 直接以瀏覽器打開 `index.html`（需連線至 p5.js CDN）
   - 或使用本機伺服器：
     ```bash
     npx http-server .
     ```

### 相依套件
- p5.js v1.4.0 (透過 CDN 載入)

### 授權條款
本專案採用 MIT License。詳情請見 LICENSE 檔案。

---

## 🌟 Project Overview (English)
Void Hunter AI is a 2D airplane shooting game built with p5.js, featuring multiple enemy types, power-ups, and progressively challenging levels.

### Gameplay
- Controls: Arrow keys to move, Space to shoot, R to restart
- Enemy Types:
  - Level 1: Normal gray enemies
  - Level 2: Yellow tracking enemies
  - Level 3+: Red homing enemies
- Power-Ups: Spread shot, Homing missiles, Shield
- HUD: Displays Score and Level

### Quick Start
1. Clone the repository:
   ```bash
   git clone git@github.com:amostsai/Void-Hunter-AI.git
   cd Void-Hunter-AI
   ```
2. Open the game:
   - Open `index.html` in your browser (requires internet for p5.js CDN)
   - Or run a local server:
     ```bash
     npx http-server .
     ```

### Dependencies
- p5.js v1.4.0 (loaded via CDN)

### License
This project is open-source and available under the MIT License.
