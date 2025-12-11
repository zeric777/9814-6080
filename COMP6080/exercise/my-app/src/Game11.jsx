// src/CarGame.jsx
import { useEffect, useState } from 'react';
import './App.css';

const ROWS = 8;        // 高度
const COLS = 3;        // 车道数
const SCORE_KEY = 'win';
const NEED_PASS = 10;  // 连续躲过多少个障碍算胜利
const TICK_MS = 650;   // 每一步间隔，稍微慢一点更好躲

function getEmptyObstacles() {
  return [];
}

function buildObstacleSet(obstacles) {
  const set = new Set();
  for (const o of obstacles) {
    set.add(`${o.row},${o.col}`);
  }
  return set;
}

function addWin() {
  const prev = Number(localStorage.getItem(SCORE_KEY) || '0');
  localStorage.setItem(SCORE_KEY, String(prev + 1));
}


function Game11() {
  const [carCol, setCarCol] = useState(1);          // 车在哪个车道（0/1/2）
  const [obstacles, setObstacles] = useState(getEmptyObstacles);
  const [passed, setPassed] = useState(0);          // 已躲过障碍数
  const [gameState, setGameState] = useState('idle'); // idle / running / win / lose
  const [gameId, setGameId] = useState(0);          // 用来重置定时器

  function startGame() {
    setCarCol(1);
    setObstacles([]);
    setPassed(0);
    setGameState('running');
    setGameId(id => id + 1);
  }

  function resetGame() {
    setCarCol(1);
    setObstacles([]);
    setPassed(0);
    setGameState('idle');
    setGameId(id => id + 1);
  }

  // 一步下落 + 生成新障碍 + 判定
  function tickDown() {
    setObstacles(prevObs => {
      if (gameState !== 'running') return prevObs;

      let crashed = false;
      let newPassed = 0;

      // 所有障碍往下移动一格
      let moved = prevObs.map(o => ({
        row: o.row + 1,
        col: o.col,
      }));

      // 处理撞车和离开底部
      moved = moved.filter(o => {
        // 撞到车：到底部这一行并且同车道
        if (o.row === ROWS - 1 && o.col === carCol) {
          crashed = true;
          return false;
        }
        // 掉出底部：算躲过 1 个
        if (o.row >= ROWS) {
          newPassed++;
          return false;
        }
        return true;
      });

      if (crashed) {
        setGameState('lose');
        alert('Failed!');
        return [];
      }

      if (newPassed > 0) {
        setPassed(prev => {
          const next = prev + newPassed;
          if (next >= NEED_PASS) {
            setGameState('win');
            addWin();
            alert('You win!');
          }
          return next;
        });
      }

      // ------------- 关键改动：更“公平”的生成逻辑 -------------

      // 限制场上障碍最大数量，避免太拥挤
      const MAX_OBS = 6;
      if (moved.length >= MAX_OBS) {
        return moved;
      }

      // 已经有在最顶行的，不再生成（避免两行挤一起）
      const hasTop = moved.some(o => o.row === 0);
      if (hasTop) {
        return moved;
      }

      // 计算“危险车道”：距离车 2 格内存在障碍的车道
      // 让这几个车道尽量不要再继续刷新的时候堵死你
      const dangerCols = new Set();
      for (const o of moved) {
        // 只看距离车 1~2 格以内的障碍
        if (o.row >= ROWS - 3 && o.row < ROWS) {
          dangerCols.add(o.col);
        }
      }

      // 如果三条车道在“车附近”都被占了，就不要再生成新的障碍
      if (dangerCols.size === COLS) {
        return moved;
      }

      // 随机概率决定是否生成新障碍（越小越简单）
      if (Math.random() < 0.4 && gameState === 'running') {
        // 尽量在“安全车道”生成（不在 dangerCols 中）
        const safeLanes = [];
        for (let c = 0; c < COLS; c++) {
          if (!dangerCols.has(c)) safeLanes.push(c);
        }

        let lane;
        if (safeLanes.length > 0) {
          lane = safeLanes[Math.floor(Math.random() * safeLanes.length)];
        } else {
          // 理论上不会走到这里；兜底用
          lane = Math.floor(Math.random() * COLS);
        }

        moved.push({ row: 0, col: lane });
      }

      return moved;
    });
  }

  // 定时下落
  useEffect(() => {
    if (gameState !== 'running') return;
    const id = setInterval(() => {
      tickDown();
    }, TICK_MS);
    return () => clearInterval(id);
  }, [gameState, carCol, gameId]);

  // 左右键移动
  useEffect(() => {
    const handleKey = (e) => {
      if (gameState !== 'running') return;

      if (e.key === 'ArrowLeft') {
        setCarCol(c => Math.max(0, c - 1));
      } else if (e.key === 'ArrowRight') {
        setCarCol(c => Math.min(COLS - 1, c + 1));
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState]);

  const obstacleSet = buildObstacleSet(obstacles);

  return (
    <div className="dash">
      <div className="car-wrapper">
        <h2>Car Dodge Game</h2>
        <p className="car-hint">
          点击道路开始游戏。游戏中使用左右方向键移动小车，连续躲过 {NEED_PASS} 个障碍物获胜。
        </p >

        <div
          className="car-board"
          onClick={() => {
            if (gameState === 'idle' || gameState === 'lose' || gameState === 'win') {
              startGame();
            }
          }}
        >
          {Array.from({ length: ROWS }).map((_, r) =>
            Array.from({ length: COLS }).map((_, c) => {
              const key = `${r}-${c}`;
              const isCar = r === ROWS - 1 && c === carCol;
              const isObs = obstacleSet.has(`${r},${c}`);

              return (
                <div className="car-cell" key={key}>
                  {isObs && <div className="car-obstacle" />}
                  {isCar && <div className="car-car" />}
                </div>
              );
            })
          )}
        </div>

        <div className="car-status">
          <span>Dodged: {passed} / {NEED_PASS}</span>
          <span> &nbsp; | &nbsp; State: {gameState}</span>
        </div>

        <div className="car-controls">
          <button type="button" onClick={resetGame}>Reset</button>
        </div>
      </div>
    </div>
  );
}

export default Game11;