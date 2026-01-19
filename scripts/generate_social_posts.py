import os
import sys
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv(".env.local")

# Configure Gemini
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    # Try loading from .env if not in .env.local (though .env.local is primary)
    load_dotenv()
    api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("❌ Error: GOOGLE_API_KEY not found.")
    sys.exit(1)

genai.configure(api_key=api_key)

# Base URL
base_url = os.getenv("NEXT_PUBLIC_BASE_URL")
if not base_url:
    print("⚠️ Warning: NEXT_PUBLIC_BASE_URL not found. Using placeholder.")
    base_url = "https://wealth-navigator.com"

def generate_posts(slug):
    # Try exact match first
    article_path = f"content/articles/{slug}.md"
    
    # If not found, try finding by suffix (e.g. date-slug.md)
    if not os.path.exists(article_path):
        import glob
        matches = glob.glob(f"content/articles/*{slug}.md")
        if matches:
            article_path = matches[0]
            print(f"📄 Found article: {article_path}")
        else:
            print(f"❌ Error: Article not found at {article_path} or via glob search.")
            return

    output_path = f"content/social/{slug}_posts.md"

    # Read Article content
    with open(article_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Link
    article_url = f"{base_url}/articles/{slug}"

    # Prompt
    prompt = f"""
    あなたはプロのSNSマーケターです。
    以下の記事コンテンツを元に、X（Twitter）用の投稿文を3パターン作成してください。
    ターゲットは「富裕層・不動産投資家」です。知性を感じさせる、落ち着いたトーンで書いてください。

    【必須条件】
    1. 各投稿の最後に、必ず以下のURLを含めること: {article_url}
    2. ハッシュタグを3個程度、文脈に合わせて付けること（例: #不動産投資 #資産防衛 #ワンルーム など）。
    3. 絵文字は控えめに、高級感を演出すること。

    【パターン】
    1. **【要約型】**: 記事の核心・メリットを端的に伝える（140文字以内）。
    2. **【問いかけ型】**: 読者の潜在的な悩みや常識への疑義を投げかける（140文字以内）。
    3. **【インパクト型】**: 少し強い言葉（逆説や警告）で興味を惹きつける（140文字以内）。

    【記事コンテンツ】
    {content[:8000]} 
    (以下略)
    
    【出力形式】
    Markdown形式で出力してください。
    """

    print(f"🤖 Generating social posts for {slug}...")

    # Generation
    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content(prompt)
    
    if response.text:
        # Ensure directory exists
        os.makedirs("content/social", exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(f"# Social Media Posts for: {slug}\n\n")
            f.write(f"Generated at: {os.getenv('CurrentTime', '')}\n")
            f.write(f"Article URL: {article_url}\n\n")
            f.write("---\n\n")
            f.write(response.text)
        
        print(f"✅ Generated social posts: {output_path}")
    else:
        print("❌ Failed to generate content.")

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 generate_social_posts.py <slug>")
        sys.exit(1)
    
    slug = sys.argv[1]
    generate_posts(slug)

if __name__ == "__main__":
    main()
