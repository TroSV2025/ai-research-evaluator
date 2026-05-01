from flask import Flask, request, jsonify
from flask_cors import CORS
import os, json
from file_parser import read_file
from ai_engine import evaluate_text

app = Flask(__name__)
CORS(app)

UPLOAD = "uploads"
os.makedirs(UPLOAD, exist_ok=True)

CRITERIA_FILE = "criteria.json"

@app.route("/upload-criteria", methods=["POST"])
def upload_criteria():
    f = request.files["file"]
    path = os.path.join(UPLOAD, f.filename)
    f.save(path)

    text = read_file(path)
    with open(CRITERIA_FILE, "w", encoding="utf-8") as fp:
        json.dump({"criteria": text}, fp, ensure_ascii=False)

    return jsonify({"msg": "ok"})

@app.route("/evaluate", methods=["POST"])
def evaluate():
    f = request.files["file"]
    path = os.path.join(UPLOAD, f.filename)
    f.save(path)

    text = read_file(path)

    with open(CRITERIA_FILE, encoding="utf-8") as fp:
        criteria = json.load(fp)["criteria"]

    result = evaluate_text(text, criteria)
    return jsonify({"result": result})

if __name__ == "__main__":
    app.run()
