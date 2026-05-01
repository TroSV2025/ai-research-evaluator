import React, { useState } from "react";

const API = "https://ai-research-evaluator.onrender.com";

const TYPES = [
  { key: "research", name: "📘 Đề tài nghiên cứu" },
  { key: "initiative", name: "📗 Sáng kiến" },
  { key: "journal", name: "📄 Bài báo" }
];

export default function App() {
  const [type, setType] = useState("research");
  const [criteriaFile, setCriteriaFile] = useState(null);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const uploadCriteria = async () => {
    const fd = new FormData();
    fd.append("file", criteriaFile);

    await fetch(`${API}/upload-criteria/${type}`, {
      method: "POST",
      body: fd
    });

    alert("Đã lưu tiêu chí");
  };

  const evaluate = async () => {
    const fd = new FormData();
    fd.append("file", file);

    setLoading(true);

    const res = await fetch(`${API}/evaluate/${type}`, {
      method: "POST",
      body: fd
    });

    const data = await res.json();

    let parsed;
    try {
      parsed = JSON.parse(data.result);
    } catch {
      parsed = { conclusion: data.result };
    }

    setResult(parsed);
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 1000, margin: "auto", padding: 20 }}>
      <h1>🎓 AI Evaluator PRO</h1>

      <div style={{ display: "flex", gap: 10 }}>
        {TYPES.map(t => (
          <button key={t.key} onClick={() => setType(t.key)}>
            {t.name}
          </button>
        ))}
      </div>

      <h3>Upload tiêu chí</h3>
      <input type="file" onChange={e => setCriteriaFile(e.target.files[0])}/>
      <button onClick={uploadCriteria}>Lưu</button>

      <h3>Upload bài</h3>
      <input type="file" onChange={e => setFile(e.target.files[0])}/>
      <button onClick={evaluate}>
        {loading ? "Đang chấm..." : "Chấm bài"}
      </button>

      {result && (
        <div>
          <h2>Điểm: {result.score}</h2>

          {result.details?.map((d, i) => (
            <div key={i}>
              <b>{d.name}</b>: {d.score}/{d.max}
              <p>{d.comment}</p>
            </div>
          ))}

          <h3>{result.conclusion}</h3>
        </div>
      )}
    </div>
  );
}
