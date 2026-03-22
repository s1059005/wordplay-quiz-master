---
name: tts
description: 提供文字轉語音 (TTS) 與音訊合併功能，基於 Flask 本地服務。
---

# TTS Skill

此技能讓 AI 代理人能夠使用本地運行的 `tts_service` 進行語音合成。

## 前置要求
- 確保 `tts_service` 的 Flask 伺服器正在執行中（預設 `http://localhost:5000`）。
- 安裝必要相依：`pip install requests`

## 功能說明
### 1. 文字轉語音 (TTS)
- **Endpoint**: `/api/v2/tts`
- **輸入**: 文字、語言代碼、語音名稱、速度、音調。
- **輸出**: Base64 編碼的音訊數據。

### 2. 取得語音清單
- **Endpoint**: `/api/v2/voices`
- **用途**: 查看支援的語言與發音人。

### 3. 合併音訊
- **Endpoint**: `/api/v2/merge-audio`
- **用途**: 將多個 TTS 片段或罐頭音效合併。

## 使用範例 (供 Agent 參考)

### 合成語音並儲存
可以直接呼叫 `scripts/tts_client.py` 來執行任務。
```bash
python scripts/tts_client.py "哈囉，你好嗎？" --output hello.mp3
```

## 腳本說明
### [tts_client.py](file:///d:/develperSoftware/tts_service/skills/tts/scripts/tts_client.py)
這是主要的工具類別，封裝了所有的 API 請求。Agent 應優先使用此腳本。
