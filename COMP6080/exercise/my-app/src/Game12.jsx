import { useState, useRef, useEffect } from "react";

function Game12() {
  const [time, setTime] = useState(0);     // 当前计时(秒)
  const [running, setRunning] = useState(false);
  const targetTime = 5; // 🎯 设置目标时间（秒）

  const startTimeRef = useRef(null);
  const timerRef = useRef(null);

  const startTimer = () => {
    setTime(0);
    setRunning(true);

    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTime(((Date.now() - startTimeRef.current) / 1000).toFixed(1));
    }, 10);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
    setRunning(false);

    if (parseFloat(time) === targetTime) {
      alert(`🎯 Perfect! Exactly ${targetTime}s`);
    } else {
      alert(`⏳ Not matched. You got ${time}s (Target: ${targetTime}s)`);
    }
  };

  return (
    <div className="home" >
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>⏱ Simple Reaction Timer</h2>
      <h1>{time}s</h1>

      <button disabled={running} onClick={startTimer}>Start</button>
      <button disabled={!running} onClick={stopTimer}>Stop</button>
    </div>
    </div>
  );
}

export default Game12;
