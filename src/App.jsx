import React, { useState } from "react";
import "./App.css";

import Generate from "./Generate";
import Pattern from "./Pattern";
import Checker from "./Checker";
import Analyzer from "./Analyzer";
import Gallery from "./Gallery";
import Checker25 from "./Checker25";
import Checker30 from "./Checker30";
import Checker35 from "./Checker35";
import Checker44 from "./Checker44";
import Checker48 from "./Checker48";

const letters = ["B","I","N","G","O"];

const balls = Array.from({ length: 75 }, (_, i) => {
  const number = i + 1;
  const letter = letters[Math.floor(i / 15)];
  return { letter, number };
});

function App() {

  const [page, setPage] = useState("menu");

  if(page === "generate") return <Generate goBack={()=>setPage("menu")} />;
  if(page === "pattern") return <Pattern goBack={()=>setPage("menu")} />;
  if(page === "checker") return <Checker goBack={()=>setPage("menu")} />;
  if(page === "analyzer") return <Analyzer goBack={()=>setPage("menu")} />;
  if(page === "gallery") return <Gallery goBack={()=>setPage("menu")} />;
  if(page === "checker25") return <Checker25 goBack={()=>setPage("menu")} />;
  if(page === "checker30") return <Checker30 goBack={()=>setPage("menu")} />;
  if(page === "checker35") return <Checker35 goBack={()=>setPage("menu")} />;
  if(page === "checker44") return <Checker44 goBack={()=>setPage("menu")} />;
if(page === "checker48") return <Checker48 goBack={()=>setPage("menu")} />;

  return (
    <div className="container">

      {/* Floating Balls */}
      {balls.map((ball, index) => (
        <div
          key={index}
          className={`ball ${ball.letter}`}
          style={{
            top: Math.random() * 90 + "%",
            left: Math.random() * 90 + "%"
          }}
        >
          <span>{ball.letter}</span>
          <strong>{ball.number}</strong>
        </div>
      ))}

      {/* Center Menu */}
      <div className="menu">
        <div className="menu-logo">
          <span className="menu-logo-clover">🍀</span>
        </div>
        <h1>BINGO FORTUNE</h1>

        <div className="menu-grid">
          <button onClick={()=>setPage("generate")}>GENERATE</button>
          <button onClick={()=>setPage("pattern")}>PATTERN</button>
          <button onClick={()=>setPage("checker")}>CHECKER</button>
          <button onClick={()=>setPage("analyzer")}>ANALYZER</button>
          <button onClick={()=>setPage("gallery")}>GALLERY</button>
          <button onClick={()=>setPage("checker25")}>CHECKER 25</button>
          <button onClick={()=>setPage("checker30")}>CHECKER 30</button>
          <button onClick={()=>setPage("checker35")}>CHECKER 35</button>
          <button onClick={()=>setPage("checker44")}>CHECKER 44</button>
          <button onClick={()=>setPage("checker48")}>CHECKER 48</button>
        </div>
      </div>

    </div>
  );
}

export default App;
