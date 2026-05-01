import React, { useState } from "react";

const API = "https://ai-research-evaluator.onrender.com/";

export default function App() {
  const [file, setFile] = useState(null);

  const upload = async () => {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch(API + "/evaluate", {
      method: "POST",
      body: fd
    });

    const data = await res.json();
    alert(data.result);
  };

  return (
    <div style={{padding:20}}>
      <h2>AI Evaluator</h2>
      <input type="file" onChange={e=>setFile(e.target.files[0])}/>
      <button onClick={upload}>Evaluate</button>
    </div>
  );
}
