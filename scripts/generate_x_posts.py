import os
import sys
import json
import glob
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv(".env.local")

# Configure AI
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

def get_latest_article(brand):
    """Find the latest article for a specific brand."""
    files = glob.glob(f"content/articles/*.md")
    brand_files = []
    for f in files:
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
            # Simple site_id check in frontmatter
            if f'site_id: "{brand}"' in content or f'site_id: {brand}' in content or f'site_id: "{brand}"' in content:
                brand_files.append(f)
    
    if not brand_files:
        return None
    
    # Sort by filename (which starts with YYYY-MM-DD usually) or mtime
    brand_files.sort(key=os.path.getmtime, reverse=True)
    return brand_files[0]

def generate_x_posts(brand, slug=None):
    # 1. Load Bible
    bible_path = f"libs/brain/bibles/{brand}_bible.md"
    if not os.path.exists(bible_path):
        # Fallback to general titan knowledge if specific bible missing
        bible_path = "libs/brain/titans_knowledge.md"
    
    with open(bible_path, 'r', encoding='utf-8') as f:
        bible_content = f.read()

    # 2. Get Article
    if not slug:
        article_file = get_latest_article(brand)
    else:
        article_file = f"content/articles/{slug}.md"
        if not os.path.exists(article_file):
            matches = glob.glob(f"content/articles/*{slug}*.md")
            article_file = matches[0] if matches else None

    if not article_file:
        print(f"⚠️ Warning: No article found for {brand}. Generating only Mindset posts.")
        article_content = "N/A"
        article_url = "#"
    else:
        with open(article_file, 'r', encoding='utf-8') as f:
            article_content = f.read()
        slug_actual = os.path.basename(article_file).replace(".md", "")
        # Construct URL based on brand
        base_url = os.getenv("NEXT_PUBLIC_BASE_URL", "https://wealth-navigator.com")
        article_url = f"{base_url}/articles/{slug_actual}"

    # 3. Prompt Construction
    prompt = f"""
    あなたはプロのSNSマーケターであり、ブランド「{brand}」の公式X（Twitter）担当者です。
    以下の「バイブル（思想・知識）」と「最新記事」を元に、本日投稿する5つのポスト案を作成してください。

    ---
    ### 【ブランドバイブル】
    {bible_content[:5000]}

    ---
    ### 【最新記事】
    {article_content[:5000]}
    記事URL: {article_url}

    ---
    ### 【出力要件】
    1. **Mindset x 3個**: バイブルの思想に基づいた、投資家やターゲットに刺さる言葉。記事の宣伝ではなく、アカウントの信頼性を高める教育的・啓蒙的・あるいは時事的な考察。
    2. **Promotion x 2個**: 最新記事を読むメリットを強調した、クリックを誘発する宣伝文。必ずURLを含めること。

    ### 【文体・トーン】
    - ターゲット: 投資家、富裕層、ビジネスパーソン。
    - トーン: 知知的でシャープ、かつ信頼感のある言葉選び。
    - 文字数: 各ポスト140文字以内。
    - 絵文字: 最小限（1投稿に1つ程度）、高級感を損なわないもの。

    ### 【出力形式】
    JSON出力のみを行ってください。形式は以下：
    {{
      "brand": "{brand}",
      "posts": [
        {{ "type": "mindset", "content": "..." }},
        {{ "type": "mindset", "content": "..." }},
        {{ "type": "mindset", "content": "..." }},
        {{ "type": "promotion", "content": "..." }},
        {{ "type": "promotion", "content": "..." }}
      ]
    }}
    """

    # 4. Generation
    print(f"🤖 Generating 5 X posts for {brand}...")
    model = genai.GenerativeModel('gemini-2.0-flash')
    
    try:
        response = model.generate_content(prompt)
        text = response.text.replace('```json', '').replace('```', '').strip()
        data = json.loads(text)
        
        # Save locally
        save_dir = "content/social"
        os.makedirs(save_dir, exist_ok=True)
        filename = f"{brand}_x_posts_latest.json"
        if slug:
            filename = f"{slug}_x_posts.json"
        
        with open(os.path.join(save_dir, filename), 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        print(f"✅ Generated posts saved to {save_dir}/{filename}")
        return data

    except Exception as e:
        print(f"❌ Generation Error: {str(e)}")
        # Fallback logic would go here if needed
        raise e

if __name__ == "__main__":
    b = sys.argv[1] if len(sys.argv) > 1 else "wealth"
    s = sys.argv[2] if len(sys.argv) > 2 else None
    generate_x_posts(b, s)
