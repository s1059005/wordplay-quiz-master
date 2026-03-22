import requests
import base64
import os
import argparse

class TTSClient:
    def __init__(self, base_url="http://localhost:5000"):
        self.base_url = base_url

    def get_voices(self):
        """獲取所有可用的語音選項"""
        response = requests.get(f"{self.base_url}/api/v2/voices")
        response.raise_for_status()
        return response.json()

    def synthesize(self, text, language_code="zh-TW", voice_name="cmn-TW-Standard-A", speed=1.0, pitch=0):
        """將文字轉換為語音並輸出 Base64 音訊數據"""
        payload = {
            "text": text,
            "language_code": language_code,
            "voice_name": voice_name,
            "speed": speed,
            "pitch": pitch
        }
        response = requests.post(f"{self.base_url}/api/v2/tts", json=payload)
        response.raise_for_status()
        return response.json()

    def save_audio(self, audio_content_base64, output_path):
        """將 Base64 音訊數據儲存為檔案"""
        audio_data = base64.b64decode(audio_content_base64)
        with open(output_path, "wb") as f:
            f.write(audio_data)
        print(f"音訊已儲存至: {output_path}")

def main():
    parser = argparse.ArgumentParser(description="TTS Client Tool")
    parser.add_argument("text", help="要轉換的文字")
    parser.add_argument("--output", default="output.mp3", help="輸出檔案路徑")
    parser.add_argument("--lang", default="zh-TW", help="語言代碼")
    parser.add_argument("--voice", default="cmn-TW-Wavenet-A", help="語音名稱")
    parser.add_argument("--speed", type=float, default=1.0, help="語速 (0.25 - 4.0)")
    parser.add_argument("--pitch", type=float, default=0, help="音調 (-20.0 - 20.0)")
    parser.add_argument("--url", default="http://localhost:5000", help="Flask 服務位址")

    args = parser.parse_args()

    client = TTSClient(args.url)
    try:
        print(f"正在合成文字: '{args.text}'...")
        result = client.synthesize(args.text, args.lang, args.voice, args.speed, args.pitch)
        if "audioContent" in result:
            client.save_audio(result["audioContent"], args.output)
        else:
            print("錯誤: 回應中沒有音訊內容")
    except Exception as e:
        print(f"發生錯誤: {e}")

if __name__ == "__main__":
    main()
