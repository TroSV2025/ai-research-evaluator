import os
import json
from openai import OpenAI

# Khởi tạo client (tự lấy API key từ ENV)
client = OpenAI()


def build_prompt(text, criteria):
    return f"""
Bạn là chuyên gia đánh giá bài nghiên cứu khoa học.

Hãy đánh giá bài viết theo các tiêu chí dưới đây:

================ TIÊU CHÍ ================
{criteria}

================ BÀI VIẾT ================
{text[:4000]}

================ YÊU CẦU ================
Trả về JSON hợp lệ duy nhất theo format sau:

{{
  "score": 0-100,
  "details": [
    {{
      "name": "Tên tiêu chí",
      "score": số,
      "max": số,
      "comment": "nhận xét ngắn gọn"
    }}
  ],
  "conclusion": "kết luận tổng thể"
}}

QUY TẮC:
- CHỈ trả về JSON
- KHÔNG thêm bất kỳ chữ nào ngoài JSON
- KHÔNG markdown
- KHÔNG giải thích
"""


def safe_json_parse(content):
    """
    Đảm bảo luôn trả về JSON hợp lệ cho frontend
    """
    try:
        return json.dumps(json.loads(content), ensure_ascii=False)
    except:
        return json.dumps({
            "score": 0,
            "details": [],
            "conclusion": content.strip()
        }, ensure_ascii=False)


def evaluate_text(text, criteria):
    try:
        prompt = build_prompt(text, criteria)

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Bạn là chuyên gia chấm bài nghiên cứu."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )

        content = response.choices[0].message.content.strip()

        return safe_json_parse(content)

    except Exception as e:
        # Trả lỗi về frontend dưới dạng JSON
        return json.dumps({
            "score": 0,
            "details": [],
            "conclusion": f"Lỗi hệ thống: {str(e)}"
        }, ensure_ascii=False)
