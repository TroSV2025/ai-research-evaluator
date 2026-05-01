import React, { useState } from "react";

const API = "https://ai-research-evaluator.onrender.com";

const MODULES = [
  { key: "research", name: "📘 Đề tài nghiên cứu khoa học" },
  { key: "initiative", name: "📗 Sáng kiến kinh nghiệm" },
  { key: "journal", name: "📄 Bài báo tạp chí" }
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

    alert("✅ Đã lưu tiêu chí");
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

    let raw = data.result || "";

    // 🔥 loại bỏ ```json
    raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { conclusion: raw };
    }

    update(tab, { result: parsed, loading: false });
  };

  const s = state[active] || {};

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial" }}>

      {/* SIDEBAR */}
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

      {/* MAIN */}
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
            {s.loading ? "⏳ Đang chấm..." : "🚀 Chấm bài"}
          </button>
        </div>

        {/* REPORT */}
        {s.result && (
          <div style={report}>

            {/* HEADER */}
            <div style={header}>
              <h2>TRƯỜNG ĐẠI HỌC</h2>
              <h3>PHIẾU ĐÁNH GIÁ</h3>
              <hr/>
            </div>

            {/* INFO */}
            <div style={section}>
              <p><b>Loại:</b> {MODULES.find(m => m.key === active).name}</p>
              <p><b>Ngày:</b> {new Date().toLocaleDateString()}</p>
            </div>

            {/* TABLE */}
            <div style={section}>
              <h3>I. Bảng chấm điểm</h3>
              <table style={table}>
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Tiêu chí</th>
                    <th>Max</th>
                    <th>Đạt</th>
                  </tr>
                </thead>
                <tbody>
                  {s.result.details?.map((d, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{d.name}</td>
                      <td>{d.max}</td>
                      <td>{d.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* COMMENTS */}
            <div style={section}>
              <h3>II. Nhận xét</h3>
              {s.result.details?.map((d, i) => (
                <div key={i} style={commentBox}>
                  <b>{i + 1}. {d.name}</b>
                  <p style={{ whiteSpace: "pre-wrap" }}>{d.comment}</p>
                </div>
              ))}
            </div>

            {/* CONCLUSION */}
            <div style={section}>
              <h3>III. Kết luận</h3>
              <div style={conclusion}>
                {s.result.conclusion}
              </div>
            </div>

            {/* SCORE */}
            <div style={totalScore}>
              Tổng điểm: {s.result.score}/100
            </div>

            {/* PRINT */}
            <button onClick={() => window.print()} style={printBtn}>
              📄 In / Xuất PDF
            </button>

          </div>
        )}
      </div>
    </div>
  );
}

// ================= STYLE =================

const sidebar = {
  width: 260,
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

const report = {
  background: "#fff",
  padding: 30,
  border: "1px solid #000"
};

const header = {
  textAlign: "center"
};

const section = {
  marginTop: 20
};

const table = {
  width: "100%",
  borderCollapse: "collapse"
};

const commentBox = {
  border: "1px solid #ccc",
  padding: 10,
  marginTop: 10,
  background: "#fafafa"
};

const conclusion = {
  border: "1px solid #007bff",
  padding: 15,
  background: "#eef6ff"
};

const totalScore = {
  marginTop: 30,
  fontSize: 24,
  fontWeight: "bold",
  textAlign: "right",
  color: "#d9534f"
};

const printBtn = {
  marginTop: 20,
  padding: 10,
  background: "#28a745",
  color: "#fff",
  border: "none",
  borderRadius: 5,
  cursor: "pointer"
};
