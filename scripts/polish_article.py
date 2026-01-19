import os
import sys
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv(".env.local")

# Configure Gemini
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    load_dotenv()
    api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("❌ Error: GOOGLE_API_KEY not found.")
    sys.exit(1)

genai.configure(api_key=api_key)

def polish_content(input_file):
    if not os.path.exists(input_file):
        print(f"❌ Error: File {input_file} not found.")
        sys.exit(1)

    with open(input_file, 'r', encoding='utf-8') as f:
        raw_content = f.read()

    # Read Titan's Knowledge
    knowledge_path = "libs/brain/titans_knowledge.md"
    knowledge_base = ""
    if os.path.exists(knowledge_path):
        with open(knowledge_path, 'r', encoding='utf-8') as kf:
            knowledge_base = kf.read()
    else:
        print("⚠️ Warning: Titans Knowledge not found.")

    print(f"🤖 Polishing content logic for: {input_file}")

    # Prompt for formatting
    prompt = f"""
    You are an expert editor for "Wealth Navigator", a high-end real estate investment media.
    Your task is to take the provided RAW CONTENT and restructure it into the platform's strict HTML format.

    【Context: Titan's Knowledge】
    The following is the strategic core of our media. Your editing MUST reflect these principles (e.g. "Vintage over New", "Debt as a tool", "Time limit").
    {knowledge_base}

    【Rules】
    1. **Format**: Use STANDARD HTML tags (`h2`, `h3`, `p`, `ul`, `li`, `strong`, `table`). **NO Markdown**.
    2. **Structure**:
       - **Introduction**: Engaging opening.
       - **Expert Tip**: Extract a conclusion/verdict and wrap it in: `<div class="expert-box">【30年のプロの眼】...</div>`
       - **Body**: Organize into logical sections with `<h2>` and `<h3>`.
       - **Comparison**: If there are comparisons, formatting them as `<table>`.
       - **Conclusion**: Clear summary.
    3. **Images**: Insert exactly 3 image placeholders where appropriate:
       - `<div class="image-wrapper"><img src="IMAGE_ID_1" alt="[Scene Description]"></div>`
       - `<div class="image-wrapper"><img src="IMAGE_ID_2" alt="[Scene Description]"></div>`
       - `<div class="image-wrapper"><img src="IMAGE_ID_3" alt="[Scene Description]"></div>`
    4. **Tone**: "Cold, Strategic, High-Net-Worth". Maintain the original meaning but polish the phrasing to align with the "Titan's Knowledge".
    
    【RAW CONTENT】
    {raw_content}
    
    【OUTPUT】
    Output ONLY the HTML content. Do not include ```html blocks.
    """

    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content(prompt)
    
    if response.text:
        # Determine output path (overwrite or new?)
        # For finalize workflow, we usually want to save it as the official draft
        # input_file might be a temp file or the target file.
        # Let's save it back to the input_file to finalize it.
        
        # Strip ```html if present
        clean_text = response.text.replace("```html", "").replace("```", "").strip()
        
        with open(input_file, 'w', encoding='utf-8') as f:
            f.write(clean_text)
        
        print(f"✅ Content polished and saved to: {input_file}")
    else:
        print("❌ Failed to polish content.")

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 polish_article.py <file_path>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    polish_content(input_file)

if __name__ == "__main__":
    main()
