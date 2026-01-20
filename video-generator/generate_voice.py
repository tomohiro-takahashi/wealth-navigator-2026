import asyncio
import edge_tts
import os
import argparse

async def main():
    parser = argparse.ArgumentParser(description="Generate voice audio.")
    parser.add_argument("--text", type=str, required=True, help="Text to speak")
    parser.add_argument("--output", type=str, default=None, help="Output file path")
    parser.add_argument("--voice", type=str, default="ja-JP-KeitaNeural", help="Voice model")
    
    args = parser.parse_args()

    # Default output path relative to this script: ../video-generator/public/audio.mp3
    # But simpler: just default to "public/audio.mp3" relative to current dir, OR explicit path.
    # Let's determine robust default.
    if args.output:
        output_file = args.output
    else:
        # Assume script is in video-generator/ or called such that we want it in video-generator/public/
        # Let's resolve relative to the script file to be safe.
        script_dir = os.path.dirname(os.path.abspath(__file__))
        output_dir = os.path.join(script_dir, "public")
        output_file = os.path.join(output_dir, "audio.mp3")

    # Ensure directory exists
    os.makedirs(os.path.dirname(output_file), exist_ok=True)

    print(f"Generating audio for: '{args.text}'")
    print(f"Voice: {args.voice}")
    print(f"Output: {output_file}")
    
    communicate = edge_tts.Communicate(args.text, args.voice)
    await communicate.save(output_file)
    
    print(f"Audio saved successfully.")

if __name__ == "__main__":
    asyncio.run(main())
