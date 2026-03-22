from skills.tts.scripts.tts_client import TTSClient
import os

def quick_demo():
    # 建立正式的 TTS Client (假設服務器在預設的 5000 端口)
    client = TTSClient("http://localhost:5000")
    
    text_to_say = "這是一個在其他專案中整合 TTS Skill 的測試範例。"
    output_file = "demo_result.mp3"
    
    print(f"正在執行 Demo...")
    try:
        # 1. 執行合成
        result = client.synthesize(text_to_say, voice_name="cmn-TW-Wavenet-A")
        
        # 2. 儲存結果
        if "audioContent" in result:
            client.save_audio(result["audioContent"], output_file)
            print("Demo 執行成功！")
        else:
            print("Demo 失敗：未取得音訊內容。")
            
    except Exception as e:
        print(f"Demo 執行時發生異常: {e}")
        print("請確認 Flask 服務 (app.py) 是否已啟動。")

if __name__ == "__main__":
    quick_demo()
