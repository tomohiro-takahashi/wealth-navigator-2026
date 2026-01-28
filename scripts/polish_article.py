import os
import sys
import argparse
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

def load_brand_context(site_id):
    bible_path = f"libs/brain/bibles/{site_id}_bible.md"
    editor_path = "libs/brain/article_editor.md"
    
    bible_content = ""
    if os.path.exists(bible_path):
        with open(bible_path, 'r', encoding='utf-8') as f:
            bible_content = f.read()
    else:
        print(f"⚠️ Warning: Bible for {site_id} not found at {bible_path}")

    editor_content = ""
    if os.path.exists(editor_path):
        with open(editor_path, 'r', encoding='utf-8') as f:
            editor_content = f.read()
            
    return bible_content, editor_content

def detect_site_id(file_path):
    # Try to find site_id in frontmatter
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            if content.startswith('---'):
                end = content.find('---', 3)
                if end != -1:
                    frontmatter = content[3:end]
                    for line in frontmatter.split('\n'):
                        if 'site_id:' in line:
                            return line.split('site_id:')[1].strip().strip('"').strip("'")
    except:
        pass
    return "wealth" # Default

def call_claude(prompt, model_id="claude-3-5-sonnet-20241022"):
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise Exception("ANTHROPIC_API_KEY not found.")
    
    url = "https://api.anthropic.com/v1/messages"
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
    data = {
        "model": model_id,
        "max_tokens": 4096,
        "messages": [{"role": "user", "content": prompt}]
    }
    
    import requests
    response = requests.post(url, headers=headers, json=data)
    if response.status_code != 200:
        raise Exception(f"Claude API error: {response.text}")
    
    return response.json()["content"][0]["text"]

def polish_content(input_file, site_id=None):
    if not os.path.exists(input_file):
        print(f"❌ Error: File {input_file} not found.")
        sys.exit(1)

    if not site_id:
        site_id = detect_site_id(input_file)
    
    print(f"🤖 Polishing article for brand: [{site_id}]")

    with open(input_file, 'r', encoding='utf-8') as f:
        raw_content = f.read()

    brand_bible, editor_guide = load_brand_context(site_id)

    # Prompt for formatting
    prompt = f"""
    You are an expert editor specializing in the following brand:
    
    --- BRAND BIBLE ---
    {brand_bible}
    
    --- WRITING STYLE GUIDE ---
    {editor_guide}
    
    --- TASK ---
    Take the provided RAW CONTENT and restructure it into high-quality HTML format exactly as defined in the WRITING STYLE GUIDE.
    
    【Rules】
    1. **Strict Tone**: Use the persona and tone defined in the BRAND BIBLE.
    2. **HTML Only**: Use standard HTML tags (h2, h3, p, ul, li, strong, table). 
    3. **Expert Box**: Extract the most critical insight/verdict and wrap it in: <div class="expert-box">【30年のプロの眼】...</div>
    4. **Image Placeholders**: Check the markers [IMAGE_1], [IMAGE_2], [IMAGE_3] in the content. Replace them with:
       - <div class="image-wrapper"><img src="IMAGE_ID_1" alt="[Scene Description]"></div> (after Lead)
       - <div class="image-wrapper"><img src="IMAGE_ID_2" alt="[Scene Description]"></div> (middle)
       - <div class="image-wrapper"><img src="IMAGE_ID_3" alt="[Scene Description]"></div> (before Conclusion)
    5. **Frontmatter**: Preserve the original YAML frontmatter if present.
    
    【RAW CONTENT】
    {raw_content}
    
    【OUTPUT】
    Output ONLY the polished content. 
    """

    # Model Fallback: Gemini -> Claude
    try:
        print("🧠 Attempting Gemini (2.0 Flash)...")
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)
        polished_text = response.text
    except Exception as e:
        print(f"⚠️ Gemini failed: {e}. Trying Claude...")
        try:
            polished_text = call_claude(prompt, "claude-3-5-sonnet-20241022")
        except Exception as e2:
            print(f"⚠️ Sonnet failed: {e2}. Trying Haiku...")
            try:
                polished_text = call_claude(prompt, "claude-3-haiku-20240307")
            except Exception as e3:
                print(f"❌ All models failed: {e3}")
                sys.exit(1)

    if polished_text:
        # Robust cleaning
        clean_text = polished_text.strip()
        
        # Remove common AI preambles
        if "Here is" in clean_text[:100] and "\n" in clean_text:
            clean_text = "\n".join(clean_text.split("\n")[1:]).strip()
            
        # Remove markdown code blocks
        clean_text = clean_text.replace("```html", "").replace("```", "").strip()
        
        # Ensure we don't double include frontmatter if AI added it
        if clean_text.startswith('---') and raw_content.startswith('---'):
            # Already has frontmatter, keep as is
            pass
        elif not clean_text.startswith('---') and raw_content.startswith('---'):
            # Prepend original frontmatter
            end = raw_content.find('---', 3)
            if end != -1:
                frontmatter = raw_content[:end+3]
                clean_text = frontmatter + "\n\n" + clean_text

        with open(input_file, 'w', encoding='utf-8') as f:
            f.write(clean_text)
        
        print(f"✅ Content polished and saved to: {input_file}")
    else:
        print("❌ Failed to polish content.")

def main():
    parser = argparse.ArgumentParser(description="Polish article content using AI.")
    parser.add_argument("file_path", help="Path to the article file")
    parser.add_argument("--site_id", help="Brand ID (wealth, subsidy, etc.)")
    
    args = parser.parse_args()
    polish_content(args.file_path, args.site_id)

if __name__ == "__main__":
    main()
