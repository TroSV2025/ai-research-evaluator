import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def evaluate_text(text, criteria):
    prompt = f"""
Đánh giá bài viết theo tiêu chí:
{criteria}

Bài viết:
{text[:8000]}

Trả về JSON gồm score, details, conclusion
"""

    res = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2
    )
    return res.choices[0].message.content
