import os
from openai import OpenAI

client = OpenAI()  # dùng env tự động

def evaluate_text(text, criteria):
    prompt = f"""
Bạn là chuyên gia đánh giá bài nghiên cứu.

Hãy đánh giá theo tiêu chí:
{criteria}

Bài viết:
{text[:5000]}

Trả về JSON hợp lệ dạng:

{{
 "score": 0-100,
 "details": [
   {{"name": "Tiêu chí", "score": x, "max": y, "comment": "..."}}
 ],
 "conclusion": "..."
}}

KHÔNG thêm bất kỳ chữ nào ngoài JSON.
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2
    )

    return response.choices[0].message.content
