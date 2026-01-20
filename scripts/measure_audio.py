import sys
from mutagen.mp3 import MP3

def get_duration(file_path):
    try:
        audio = MP3(file_path)
        print(audio.info.length)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python measure_audio.py <mp3_path>", file=sys.stderr)
        sys.exit(1)
    
    get_duration(sys.argv[1])
