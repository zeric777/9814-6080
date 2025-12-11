import { useEffect, useState } from 'react';
import './App.css';

const ROWS = 5;   // 行数
const COLS = 7;   // 列数

// 车道配置：第几行有车、移动方向（1 向右，-1 向左）
const LANES = [
  { row: 1, dir: 1 },
  { row: 2, dir: -1 },
  { row: 3, dir: 1 },
];

function Game16() {
  // 青蛙位置：行、列
  const [frogPos, setFrogPos] = useState({ row: ROWS - 1, col: Math.floor(COLS / 2) });
  // 每条车道上车的列位置（与 LANES 对应）
  const [carCols, setCarCols] = useState([0, 3, 5]);
  // 是否游戏进行中（点击棋盘后变 true）
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState('点击棋盘开始，方向键移动青蛙');

  // 重置游戏状态
  function resetGame() {
    setFrogPos({ row: ROWS - 1, col: Math.floor(COLS / 2) });
    setCarCols([0, 3, 5]);
    setRunning(false);
    setMessage('点击棋盘开始，方向键移动青蛙');
  }

  // 检查碰撞
  function checkCollision(nextFrog, nextCarCols) {
    for (let i = 0; i < LANES.length; i++) {
      const lane = LANES[i];
      if (nextFrog.row === lane.row && nextFrog.col === nextCarCols[i]) {
        return true;
      }
    }
    return false;
  }

  // 点击棋盘 → 激活游戏
  function handleBoardClick() {
    if (!running) {
      setRunning(true);
      setMessage('游戏中：用方向键躲车，走到最上面一行！');
    }
  }

  // 键盘控制青蛙移动
  useEffect(() => {
    function handleKeyDown(e) {
      if (!running) return;

      setFrogPos(prev => {
        let { row, col } = prev;

        if (e.key === 'ArrowUp') {
          row = Math.max(0, row - 1);
        } else if (e.key === 'ArrowDown') {
          row = Math.min(ROWS - 1, row + 1);
        } else if (e.key === 'ArrowLeft') {
          col = Math.max(0, col - 1);
        } else if (e.key === 'ArrowRight') {
          col = Math.min(COLS - 1, col + 1);
        } else {
          return prev;
        }

        const nextFrog = { row, col };

        // 先检查是否到达终点
        if (nextFrog.row === 0) {
          setRunning(false);
          setMessage('你成功过马路了！再次点击棋盘重新开始');
          alert('过关！🐸');
          // 也可以这里更新 dashboard 的 win 计数
          return nextFrog;
        }

        // 再检查碰撞（用当前 carCols）
        setCarCols(currentCarCols => {
          if (checkCollision(nextFrog, currentCarCols)) {
            alert('撞车了！💥');
            resetGame();
            return currentCarCols;
          }
          return currentCarCols;
        });

        return nextFrog;
      });
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [running]);

  // 车移动的定时器
  useEffect(() => {
    if (!running) return;

    const timer = setInterval(() => {
      setCarCols(prevCols => {
        const newCols = prevCols.map((col, idx) => {
          const dir = LANES[idx].dir;
          // 循环移动
          return (col + dir + COLS) % COLS;
        });

        // 移动之后检查是否撞到青蛙
        setFrogPos(prevFrog => {
          if (checkCollision(prevFrog, newCols)) {
            alert('撞车了！💥');
            resetGame();
          }
          return prevFrog;
        });

        return newCols;
      });
    }, 600); // 每 0.6 秒车动一格

    return () => clearInterval(timer);
  }, [running]);

  // 渲染棋盘
  const rows = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const isFrog = frogPos.row === r && frogPos.col === c;

      let isCar = false;
      for (let i = 0; i < LANES.length; i++) {
        if (LANES[i].row === r && carCols[i] === c) {
          isCar = true;
          break;
        }
      }

      let extraClass = '';
      if (r === 0) {
        extraClass += ' frog-goal';
      } else if (r === ROWS - 1) {
        extraClass += ' frog-start';
      } else {
        extraClass += ' frog-road';
      }

      if (isCar) extraClass += ' frog-car';
      if (isFrog) extraClass += ' frog-frog';

      rows.push(
        <div
          key={`${r}-${c}`}
          className={`frog-cell${extraClass}`}
          onClick={handleBoardClick}
        />
      );
    }
  }

  return (
    <div className="dash">
      <h2>青蛙过马路小游戏</h2>
      <p>{message}</p >
      <div className="frog-board" onClick={handleBoardClick}>
        {rows}
      </div>
      <button type="button" onClick={resetGame} style={{ marginTop: '12px' }}>
        Reset
      </button>
    </div>
  );
}

export default Game16;

