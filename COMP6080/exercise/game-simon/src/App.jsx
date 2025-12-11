import { useState, useEffect } from 'react';
import './App.css';

const COLORS = ["red", "green", "blue", "yellow"];

function App() {
  const [sequence, setSequence] = useState([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeColor, setActiveColor] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);

  // 亮灯动画（单个颜色）
  const flashColor = (color) => {
    setActiveColor(color);
    setTimeout(() => setActiveColor(null), 500);
  };

  // 播放整个序列
  const playSequence = async (seq) => {
    setIsPlaying(true);
    for (let color of seq) {
      flashColor(color);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
    setIsPlaying(false);
  };

  // 开始游戏
  const startGame = () => {
    const first = COLORS[Math.floor(Math.random() * COLORS.length)];
    setSequence([first]);
    setPlayerIndex(0);
    setIsGameOver(false);
  };

  // 每当 sequence 改变，就播放序列
  useEffect(() => {
    if (sequence.length > 0) {
      playSequence(sequence);
      setPlayerIndex(0);
    }
  }, [sequence]);

  // 玩家点击颜色
  const handleClick = (color) => {
    if (isPlaying || isGameOver) return;

    flashColor(color);

    if (color === sequence[playerIndex]) {
      // 这一位点对了
      if (playerIndex === sequence.length - 1) {
        // 整轮都完成 → 下一轮
        const nextColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        setTimeout(() => {
          setSequence((prev) => [...prev, nextColor]);
        }, 800);
      } else {
        // 继续点下一位
        setPlayerIndex((prev) => prev + 1);
      }
    } else {
      // 点错了
      setIsGameOver(true);
    }
  };

  return (
    <div className="container">
      <h1>Simon Game</h1>

      {isGameOver && <div className="gameover">Game Over! Press Start</div>}

      <div className="board">
        {COLORS.map((color) => (
          <div
            key={color}
            className={`btn ${color} ${activeColor === color ? "active" : ""}`}
            onClick={() => handleClick(color)}
          />
        ))}
      </div>

      <button className="start" onClick={startGame}>Start</button>

      <div className="round">Round: {sequence.length}</div>
    </div>
  );
}

export default App;
