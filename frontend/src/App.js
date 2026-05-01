import React, { useState } from "react";

const API = "https://ai-research-evaluator.onrender.com";

const MODULES = [
  { key: "research", name: "Đề tài nghiên cứu" },
  { key: "initiative", name: "Sáng kiến kinh nghiệm" },
  { key: "journal", name: "Bài báo tạp chí" }
];

export default function App() {
  const [active, setActive] = useState("research");

  const [state, setState] = useState({
    research: {},
    initiative: {},
    journal: {}
  });

  const update = (tab, data) => {
    setState(prev => ({
      ...prev,
      [tab]: { ...prev[tab], ...data }
    }));
  };

  // ================= API =================
  const uploadCriteria = async (tab) => {
    const s = state[tab];
    if (!s.criteriaFile) return alert("Chọn file tiêu chí");

    const fd = new FormData();
    fd.append("file", s.criteriaFile);

    await fetch(`${API}/upload-criteria/${tab}`, {
      method: "POST",
      body: fd
    });

    alert("Đã lưu tiêu chí");
  };

  const evaluate = async (tab) => {
    const s = state[tab];
    if (!s.file) return alert("Chọn file bài");

    const fd = new FormData();
    fd.append("file", s.file);

    update(tab, { loading: true, result: null });

    const res = await fetch(`${API}/evaluate/${tab}`, {
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

    update(tab, { result: parsed, loading: false });
  };

  const s = state[active] || {};

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial" }}>
      
      {/* ================= SIDEBAR ================= */}
      <div style={sidebar}>
        <h2>🎓 AI Evaluator</h2>

        {MODULES.map(m => (
          <div
            key={m.key}
            onClick={() => setActive(m.key)}
            style={{
              ...menuItem,
              background: active === m.key ? "#007bff" : "transparent",
              color: active === m.key ? "#fff" : "#000"
            }}
          >
            {m.name}
          </div>
        ))}
      </div>

      {/* ================= MAIN ================= */}
      <div style={main}>
        
        <h1>{MODULES.find(m => m.key === active).name}</h1>

        {/* Upload tiêu chí */}
        <div style={card}>
          <h3>📥 Tiêu chí đánh giá</h3>
          <input type="file" onChange={(e) => update(active, { criteriaFile: e.target.files[0] })}/>
          <button style={btn} onClick={() => uploadCriteria(active)}>💾 Lưu tiêu chí</button>
        </div>

        {/* Upload bài */}
        <div style={card}>
          <h3>📄 Tài liệu cần đánh giá</h3>
          <input type="file" onChange={(e) => update(active, { file: e.target.files[0] })}/>
          <button style={btnPrimary} onClick={() => evaluate(active)}>
            {s.loading ? "⏳ Đang xử lý..." : "🚀 Chấm bài"}
          </button>
        </div>

        {/* RESULT */}
        {s.result && (
          <div style={resultCard}>
            <h2>📊 Kết quả đánh giá</h2>

            <div style={scoreBox}>
              {s.result.score !== undefined ? s.result.score : "--"}
            </div>

            {s.result.details?.length > 0 && (
              <table style={table}>
                <thead>
                  <tr>
                    <th>Tiêu chí</th>
                    <th>Điểm</th>
                    <th>Nhận xét</th>
                  </tr>
                </thead>
                <tbody>
                  {s.result.details.map((d, i) => (
                    <tr key={i}>
                      <td>{d.name}</td>
                      <td>{d.score}/{d.max}</td>
                      <td>{d.comment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div style={conclusion}>
              {s.result.conclusion}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ================= STYLE =================

const sidebar = {
  width: 250,
  background: "#f4f6f9",
  padding: 20,
  borderRight: "1px solid #ddd"
};

const menuItem = {
  padding: 12,
  marginTop: 10,
  cursor: "pointer",
  borderRadius: 6
};

const main = {
  flex: 1,
  padding: 30,
  overflow: "auto"
};

const card = {
  background: "#fff",
  padding: 20,
  marginBottom: 20,
  borderRadius: 10,
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
};

const resultCard = {
  background: "#ffffff",
  padding: 25,
  borderRadius: 10,
  boxShadow: "0 2px 10px rgba(0,0,0,0.15)"
};

const btn = {
  marginTop: 10,
  padding: "8px 15px"
};

const btnPrimary = {
  marginTop: 10,
  padding: "10px 18px",
  background: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: 5,
  cursor: "pointer"
};

const scoreBox = {
  fontSize: 40,
  fontWeight: "bold",
  color: "#007bff",
  marginBottom: 20
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  marginBottom: 20
};

const conclusion = {
  background: "#eef6ff",
  padding: 15,
  borderRadius: 6
};
