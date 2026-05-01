import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from ai_engine import evaluate_text
from utils import read_file

app = Flask(__name__)
CORS(app)

os.makedirs("uploads", exist_ok=True)
os.makedirs("criteria", exist_ok=True)

# ================= UPLOAD TIÊU CHÍ =================
@app.route("/upload-criteria/<ctype>", methods=["POST"])
def upload_criteria(ctype):
    file = request.files["file"]

    data = read_file(file)

    with open(f"criteria/{ctype}.json", "w", encoding="utf-8") as f:
        json.dump({"criteria": data}, f, ensure_ascii=False)

    return jsonify({"msg": "Saved"})

# ================= EVALUATE =================
@app.route("/evaluate/<ctype>", methods=["POST"])
def evaluate(ctype):
    try:
        file = request.files["file"]
        path = os.path.join("uploads", file.filename)
        file.save(path)

        text = read_file(path)

        with open(f"criteria/{ctype}.json", encoding="utf-8") as f:
            criteria = json.load(f)["criteria"]

        result = evaluate_text(text, criteria, ctype)

        return jsonify({"result": result})

    except Exception as e:
        return jsonify({"error": str(e)})

# ================= ROOT =================
@app.route("/")
def home():
    return "AI Evaluator API Running"

if __name__ == "__main__":
    app.run()
