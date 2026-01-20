import asyncio
import edge_tts
import os

# Configuration
TEXT = "一流を、再定義する。Wealth Navigator"
VOICE = "ja-JP-NanamiNeural"  # Options: ja-JP-NanamiNeural (Female), ja-JP-KeitaNeural (Male)
OUTPUT_DIR = "public"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "audio.mp3")

async def main():
    # Ensure output directory exists
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print(f"Created directory: {OUTPUT_DIR}")

    print(f"Generating audio for: '{TEXT}'")
    print(f"Voice: {VOICE}")
    
    communicate = edge_tts.Communicate(TEXT, VOICE)
    await communicate.save(OUTPUT_FILE)
    
    print(f"Audio saved to: {OUTPUT_FILE}")

if __name__ == "__main__":
    asyncio.run(main())
