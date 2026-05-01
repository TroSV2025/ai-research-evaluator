import json
from openai import OpenAI

client = OpenAI()

def build_prompt(text, criteria, ctype):
    return f"""
Bạn là hội đồng chấm {ctype}.

Tiêu chí:
{criteria}

Bài:
{text[:4000]}

Trả JSON:

{{
 "score": 0-100,
 "details": [
   {{
     "name": "Tiêu chí",
     "score": x,
     "max": y,
     "comment": "..."
   }}
 ],
 "conclusion": "..."
}}

CHỈ JSON.
"""

def safe_parse(content):
    try:
        return json.dumps(json.loads(content), ensure_ascii=False)
    except:
        return json.dumps({
            "score": 0,
            "details": [],
            "conclusion": content
        }, ensure_ascii=False)

def evaluate_text(text, criteria, ctype):
    try:
        prompt = build_prompt(text, criteria, ctype)

        res = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )

        return safe_parse(res.choices[0].message.content)

    except Exception as e:
        return json.dumps({
            "score": 0,
            "details": [],
            "conclusion": f"Lỗi: {str(e)}"
        }, ensure_ascii=False)
