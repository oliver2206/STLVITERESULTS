import { useState, useEffect, useRef } from "react";

const MAX_OPTIONS = [25, 30, 35, 40, 44, 48];

const LETTER_COLORS = {
  B: { bg: "#e8f8f0", color: "#1D9E75", range: "1–15" },
  I: { bg: "#e6f4fb", color: "#185FA5", range: "16–30" },
  N: { bg: "#eeecfd", color: "#534AB7", range: "31–45" },
  G: { bg: "#faeeda", color: "#BA7517", range: "46–60" },
  O: { bg: "#fcebeb", color: "#A32D2D", range: "61–75" },
};

function getBingoLetter(n) {
  if (n <= 15) return "B";
  if (n <= 30) return "I";
  if (n <= 45) return "N";
  if (n <= 60) return "G";
  return "O";
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@700;900&display=swap');

  .navbar {
    position: fixed; top: 0; left: 0; right: 0; height: 64px;
    background: rgba(20, 20, 35, 0.75);
    backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
    border-bottom: 1px solid rgba(255,255,255,0.1);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 24px; z-index: 100; box-shadow: 0 2px 16px rgba(0,0,0,0.3);
  }
  .nav-logo {
    display: flex; align-items: center; gap: 12px; cursor: pointer;
    user-select: none; text-decoration: none; transition: opacity 0.15s ease;
  }
  .nav-logo:hover { opacity: 0.8; }
  .logo-circle {
    width: 42px; height: 42px; border-radius: 50%; background: #111;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; box-shadow: 0 2px 8px rgba(0,0,0,0.4); flex-shrink: 0;
  }
  .logo-title {
    color: #fff; font-size: 18px; font-weight: 900; letter-spacing: 2px;
    font-family: 'Bebas Neue', 'Arial Black', Arial, sans-serif;
    text-shadow: 1px 1px 4px rgba(0,0,0,0.4); white-space: nowrap;
  }
  @media (max-width: 360px) { .logo-title { display: none; } }

  .page-wrapper {
    position: absolute; top: 64px; left: 0; right: 0; bottom: 0;
    overflow-y: auto; color: #fff;
    font-family: 'Montserrat', 'Arial Black', Arial, sans-serif;
    padding: 24px 16px; box-sizing: border-box;
  }

  .cn-card {
    background: rgba(255,255,255,0.95); border-radius: 16px;
    padding: 20px; margin-bottom: 16px; color: #222;
  }

  .cn-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
  .cn-title { margin: 0; font-size: 20px; font-weight: 900; color: #222; letter-spacing: 1px; }
  .cn-round-badge {
    font-size: 12px; padding: 4px 14px; border-radius: 99px;
    border: 1px solid #ccc; color: #666; background: white;
  }

  .cn-label-bar {
    background: #f0eeff; border-radius: 10px; padding: 10px 14px;
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 14px;
  }
  .cn-label-text { font-size: 12px; color: #7c6fd8; font-style: italic; }
  .cn-add-label-btn {
    font-size: 12px; padding: 5px 12px; border-radius: 8px;
    border: 1px solid #b0a8f0; background: white; color: #534AB7; cursor: pointer;
  }

  .cn-max-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; }
  .cn-max-label { font-size: 12px; color: #666; }
  .cn-max-btn {
    padding: 5px 14px; border-radius: 99px; border: 1px solid #bbb;
    background: white; color: #333; cursor: pointer; font-size: 12px;
    font-family: inherit; transition: all 0.15s;
  }
  .cn-max-btn.active { background: #534AB7; color: white; border-color: #534AB7; }

  .cn-progress-bar-track {
    height: 6px; background: #eee; border-radius: 3px; overflow: hidden; margin-bottom: 4px;
  }
  .cn-progress-bar-fill { height: 100%; background: #534AB7; border-radius: 3px; transition: width 0.3s; }
  .cn-progress-label { text-align: right; font-size: 11px; color: #888; margin-bottom: 12px; }

  .cn-legend { display: flex; gap: 18px; flex-wrap: wrap; margin-bottom: 14px; }
  .cn-legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #666; }
  .cn-legend-dot { width: 14px; height: 14px; border-radius: 3px; flex-shrink: 0; }

  .cn-input-row { display: flex; gap: 8px; }
  .cn-input {
    flex: 1; padding: 10px 14px; border-radius: 10px;
    border: 1px solid #ccc; font-size: 13px; outline: none;
    font-family: inherit;
  }
  .cn-highlight-btn {
    padding: 10px 20px; border-radius: 10px; background: #534AB7;
    color: white; border: none; font-size: 13px; font-weight: 700;
    cursor: pointer; font-family: inherit; white-space: nowrap;
  }

  .cn-letter-headers {
    display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin-bottom: 10px;
  }
  .cn-letter-cell {
    text-align: center; padding: 8px 4px; border-radius: 10px;
    font-weight: 900; font-size: 15px; line-height: 1.1;
  }
  .cn-letter-sub { font-size: 10px; font-weight: 400; margin-top: 2px; }

  .cn-ball-grid {
    display: grid; grid-template-columns: repeat(15, 1fr); gap: 4px;
  }
  .cn-ball {
    aspect-ratio: 1; border-radius: 50%; display: flex; align-items: center;
    justify-content: center; font-size: 10px; cursor: pointer;
    transition: all 0.2s; border: 1px solid #ddd; background: white; color: #aaa;
    font-weight: 600;
  }
  .cn-ball.called { background: #3a3080; color: white; border-color: #3a3080; }
  .cn-ball.prev { background: #d4d0f5; color: #534AB7; border-color: #a09ae0; }

  .cn-actions { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 16px; }
  .cn-action-btn {
    padding: 12px; border-radius: 12px; font-size: 13px; font-weight: 700;
    cursor: pointer; font-family: inherit; background: white; transition: opacity 0.15s;
  }
  .cn-action-btn:hover { opacity: 0.8; }
  .cn-action-btn.draw { border: 2px solid #1D9E75; color: #1D9E75; }
  .cn-action-btn.new  { border: 2px solid #BA7517; color: #BA7517; }
  .cn-action-btn.rst  { border: 2px solid #A32D2D; color: #A32D2D; }

  .cn-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  .cn-stat-card {
    background: #f5f5f5; border-radius: 12px; padding: 14px 8px; text-align: center;
  }
  .cn-stat-num { font-size: 24px; font-weight: 900; color: #222; }
  .cn-stat-label { font-size: 11px; color: #888; margin-top: 4px; }

  .cn-modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.4);
    display: flex; align-items: center; justify-content: center; z-index: 999;
  }
  .cn-modal {
    background: white; border-radius: 16px; padding: 24px; width: 300px; color: #222;
  }
  .cn-modal h3 { margin: 0 0 12px; font-size: 16px; }
  .cn-modal input {
    width: 100%; box-sizing: border-box; padding: 10px; border-radius: 8px;
    border: 1px solid #ccc; font-size: 13px; margin-bottom: 12px; font-family: inherit;
  }
  .cn-modal-btns { display: flex; gap: 8px; justify-content: flex-end; }
  .cn-modal-cancel {
    padding: 8px 16px; border-radius: 8px; border: 1px solid #ccc;
    background: white; cursor: pointer; font-family: inherit;
  }
  .cn-modal-save {
    padding: 8px 16px; border-radius: 8px; background: #534AB7;
    color: white; border: none; cursor: pointer; font-family: inherit;
  }
`;

export default function Generate({ onBack }) {
  const [maxBalls, setMaxBalls] = useState(48);
  const [calledThisRound, setCalledThisRound] = useState(new Set());
  const [calledPrev, setCalledPrev] = useState(new Set());
  const [roundsDone, setRoundsDone] = useState(0);
  const [roundNum, setRoundNum] = useState(1);
  const [inputVal, setInputVal] = useState("");
  const [label, setLabel] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [labelDraft, setLabelDraft] = useState("");

  const totalDrawn = calledThisRound.size + calledPrev.size;
  const remaining = 75 - totalDrawn;
  const progressPct = Math.min(100, (calledThisRound.size / maxBalls) * 100);

  function getBallState(n) {
    if (calledThisRound.has(n)) return "called";
    if (calledPrev.has(n)) return "prev";
    return "";
  }

  function toggleBall(n) {
    if (calledPrev.has(n)) return;
    setCalledThisRound((prev) => {
      const next = new Set(prev);
      next.has(n) ? next.delete(n) : next.add(n);
      return next;
    });
  }

  function highlightNumber() {
    const v = parseInt(inputVal);
    if (isNaN(v) || v < 1 || v > 75) return;
    if (!calledThisRound.has(v) && !calledPrev.has(v)) {
      setCalledThisRound((prev) => new Set([...prev, v]));
    }
    setInputVal("");
  }

  function drawRandom() {
    if (calledThisRound.size >= maxBalls) return;
    const pool = [];
    for (let i = 1; i <= 75; i++)
      if (!calledThisRound.has(i) && !calledPrev.has(i)) pool.push(i);
    if (!pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setCalledThisRound((prev) => new Set([...prev, pick]));
  }

  function newRound() {
    setCalledPrev((prev) => new Set([...prev, ...calledThisRound]));
    setCalledThisRound(new Set());
    setRoundsDone((r) => r + 1);
    setRoundNum((r) => r + 1);
  }

  function resetAll() {
    setCalledThisRound(new Set());
    setCalledPrev(new Set());
    setRoundsDone(0);
    setRoundNum(1);
  }

  function saveLabel() {
    setLabel(labelDraft);
    setShowModal(false);
  }

  return (
    <>
      <style>{styles}</style>
      <div
        style={{
          position: "fixed", inset: 0, width: "100vw", height: "100vh",
          background: "linear-gradient(135deg, #3a6fd8 0%, #6a4fd8 50%, #4a8fd8 100%)",
          overflow: "hidden",
        }}
      >
        {/* NAVBAR */}
        <nav className="navbar">
          <div className="nav-logo" onClick={onBack} title="Back to Main Menu">
            <div className="logo-circle">🍀</div>
            <span className="logo-title">BINGO FORTUNE</span>
          </div>
        </nav>

        {/* PAGE CONTENT */}
        <div className="page-wrapper">

          {/* TOP CARD */}
          <div className="cn-card">
            <div className="cn-header">
              <h2 className="cn-title">Called numbers</h2>
              <span className="cn-round-badge">Round {roundNum}</span>
            </div>

            <div className="cn-label-bar">
              <span className="cn-label-text">
                {label || "No label set — add a game name, event, or date"}
              </span>
              <button className="cn-add-label-btn" onClick={() => { setLabelDraft(label); setShowModal(true); }}>
                + Add label
              </button>
            </div>

            <div className="cn-max-row">
              <span className="cn-max-label">Max balls / round</span>
              {MAX_OPTIONS.map((n) => (
                <button
                  key={n}
                  className={`cn-max-btn${maxBalls === n ? " active" : ""}`}
                  onClick={() => setMaxBalls(n)}
                >
                  {n}
                </button>
              ))}
            </div>

            <div className="cn-progress-bar-track">
              <div className="cn-progress-bar-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="cn-progress-label">{calledThisRound.size} / {maxBalls}</div>

            <div className="cn-legend">
              <div className="cn-legend-item">
                <div className="cn-legend-dot" style={{ background: "#3a3080" }} />
                Called this round
              </div>
              <div className="cn-legend-item">
                <div className="cn-legend-dot" style={{ background: "#d4d0f5", border: "1px solid #a09ae0" }} />
                Previous rounds
              </div>
              <div className="cn-legend-item">
                <div className="cn-legend-dot" style={{ background: "white", border: "1px solid #ccc" }} />
                Not called
              </div>
            </div>

            <div className="cn-input-row">
              <input
                className="cn-input"
                type="number"
                min={1}
                max={75}
                placeholder="Enter 1-75 and press Enter"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && highlightNumber()}
              />
              <button className="cn-highlight-btn" onClick={highlightNumber}>
                Highlight
              </button>
            </div>
          </div>

          {/* BOARD CARD */}
          <div className="cn-card">
            <div className="cn-letter-headers">
              {Object.entries(LETTER_COLORS).map(([letter, info]) => (
                <div
                  key={letter}
                  className="cn-letter-cell"
                  style={{ background: info.bg, color: info.color }}
                >
                  {letter}
                  <div className="cn-letter-sub">{info.range}</div>
                </div>
              ))}
            </div>

            <div className="cn-ball-grid">
              {Array.from({ length: 75 }, (_, i) => i + 1).map((n) => (
                <div
                  key={n}
                  className={`cn-ball${getBallState(n) ? " " + getBallState(n) : ""}`}
                  onClick={() => toggleBall(n)}
                  title={`${getBingoLetter(n)}-${n}`}
                >
                  {n}
                </div>
              ))}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="cn-actions">
            <button className="cn-action-btn draw" onClick={drawRandom}>Draw random</button>
            <button className="cn-action-btn new" onClick={newRound}>New round</button>
            <button className="cn-action-btn rst" onClick={resetAll}>Reset</button>
          </div>

          {/* STATS */}
          <div className="cn-stats">
            <div className="cn-stat-card">
              <div className="cn-stat-num">{totalDrawn}</div>
              <div className="cn-stat-label">Drawn</div>
            </div>
            <div className="cn-stat-card">
              <div className="cn-stat-num">{remaining}</div>
              <div className="cn-stat-label">Remaining</div>
            </div>
            <div className="cn-stat-card">
              <div className="cn-stat-num">{roundsDone}</div>
              <div className="cn-stat-label">Rounds done</div>
            </div>
            <div className="cn-stat-card">
              <div className="cn-stat-num">{maxBalls}</div>
              <div className="cn-stat-label">Max / round</div>
            </div>
          </div>
        </div>
      </div>

      {/* LABEL MODAL */}
      {showModal && (
        <div className="cn-modal-overlay">
          <div className="cn-modal">
            <h3>Add label</h3>
            <input
              placeholder="Game name, event, or date"
              value={labelDraft}
              onChange={(e) => setLabelDraft(e.target.value)}
            />
            <div className="cn-modal-btns">
              <button className="cn-modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="cn-modal-save" onClick={saveLabel}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
