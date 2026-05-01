import React, { useState } from "react";

const API = "https://ai-research-evaluator.onrender.com";

export default function App() {
  const [criteriaFile, setCriteriaFile] = useState(null);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // ================= UPLOAD TIÊU CHÍ =================
  const uploadCriteria = async () => {
    if (!criteriaFile) {
      alert("Chọn file tiêu chí");
      return;
    }

    const fd = new FormData();
    fd.append("file", criteriaFile);

    try {
      const res = await fetch(`${API}/upload-criteria`, {
        method: "POST",
        body: fd
      });

      const data = await res.json();
      console.log("UPLOAD:", data);

      alert("✅ Upload tiêu chí thành công");
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi upload tiêu chí");
    }
  };

  // ================= ĐÁNH GIÁ =================
  const evaluate = async () => {
    if (!file) {
      alert("Chọn file cần đánh giá");
      return;
    }

    const fd = new FormData();
    fd.append("file", file);

    setLoading(true);
    setResult(null); // reset trước khi gọi

    try {
      const res = await fetch(`${API}/evaluate`, {
        method: "POST",
        body: fd
      });

      const data = await res.json();
      console.log("RESPONSE:", data);

      // 👉 nếu backend trả lỗi
      if (data.error) {
        setResult({
          score: 0,
          details: [],
          conclusion: data.error
        });
        setLoading(false);
        return;
      }

      let parsed;

      try {
        parsed = JSON.parse(data.result);
      } catch (e) {
        console.log("RAW RESULT:", data.result);
        parsed = {
          score: 0,
          details: [],
          conclusion: data.result
        };
      }

      setResult(parsed);

    } catch (err) {
      console.error(err);
      alert("❌ Lỗi gọi AI");
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 20 }}>
      <h1>🎓 AI Research Evaluator</h1>

      {/* ADMIN */}
      <div style={{ border: "1px solid #ccc", padding: 15, marginBottom: 20 }}>
        <h3>👨‍💼 Admin - Upload tiêu chí</h3>

        <input
          type="file"
          onChange={(e) => setCriteriaFile(e.target.files[0])}
        />

        <br /><br />

        <button onClick={uploadCriteria}>
          Upload tiêu chí
        </button>
      </div>

      {/* USER */}
      <div style={{ border: "1px solid #ccc", padding: 15 }}>
        <h3>👨‍🎓 Người dùng - Đánh giá tài liệu</h3>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <br /><br />

        <button onClick={evaluate}>
          {loading ? "⏳ Đang phân tích..." : "🚀 Đánh giá"}
        </button>
      </div>

      {/* RESULT */}
      {result && (
        <div style={{ marginTop: 30 }}>
          <h2>📊 Kết quả</h2>

          {/* FIX LỖI QUAN TRỌNG: dùng !== undefined */}
          {result.score !== undefined && (
            <h3>Điểm tổng: {result.score}/100</h3>
          )}

          {result.details && result.details.length > 0 && (
            <table border="1" cellPadding="8" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>Tiêu chí</th>
                  <th>Điểm</th>
                  <th>Nhận xét</th>
                </tr>
              </thead>
              <tbody>
                {result.details.map((item, i) => (
                  <tr key={i}>
                    <td>{item.name}</td>
                    <td>{item.score}/{item.max}</td>
                    <td>{item.comment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {result.conclusion && (
            <h3 style={{ marginTop: 20 }}>
              🔎 Kết luận: {result.conclusion}
            </h3>
          )}
        </div>
      )}
    </div>
  );
}
