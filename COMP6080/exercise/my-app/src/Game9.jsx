// src/Tetro.jsx
import { useEffect, useState } from 'react';
import './App.css';

const ROWS = 12;
const COLS = 10;
const SCORE_KEY = 'win';

// 三种方块形状：2x2 方块、2 高 1 宽竖条、1x1
const SHAPES = [
  [[0, 0], [0, 1], [1, 0], [1, 1]], // 2x2
  [[0, 0], [1, 0]],                 // 2x1 竖条
  [[0, 0]],                         // 1x1
];

function createEmptyBoard() {
  return Array.from({ length: ROWS }, () =>
    Array(COLS).fill(0)
  );
}

// 创建随机新方块，左上角起点 (0,0)
function createRandomPiece() {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  return {
    row: 0,
    col: 0,
    shape,
  };
}

// 把方块转换为棋盘上的坐标数组
function getPieceCells(piece) {
  if (!piece) return [];
  const { row, col, shape } = piece;
  return shape.map(([dr, dc]) => [row + dr, col + dc]);
}

// 判断一个方块是否可以放在当前棋盘上（不出界、不碰撞）
function canPlace(board, piece) {
  if (!piece) return false;
  for (const [r, c] of getPieceCells(piece)) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return false;
    if (board[r][c] !== 0) return false;
  }
  return true;
}

// 把当前方块“锁”进棋盘，返回新棋盘（锁成 1）
function mergePieceIntoBoard(board, piece) {
  const newBoard = board.map(row => [...row]);
  for (const [r, c] of getPieceCells(piece)) {
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
      newBoard[r][c] = 1;
    }
  }
  return newBoard;
}

// 行满就把整行变成绿色（值=2），并统计有多少全绿行
function applyFullRows(board) {
  const newBoard = board.map(row => [...row]);

  for (let r = 0; r < ROWS; r++) {
    const full = newBoard[r].every(cell => cell !== 0);
    if (full) {
      newBoard[r] = newBoard[r].map(() => 2); // 2 表示绿色
    }
  }

  let greenRows = 0;
  for (let r = 0; r < ROWS; r++) {
    if (newBoard[r].every(cell => cell === 2)) {
      greenRows++;
    }
  }

  return { board: newBoard, greenRows };
}

// 判断“失败”：锁块后有方块出现在上方区域（这里简单设为前 4 行）
function isFail(board) {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] !== 0) return true;
    }
  }
  return false;
}

// 赢了就把 win 计数 +1
function addWin() {
  const prev = Number(localStorage.getItem(SCORE_KEY) || '0');
  localStorage.setItem(SCORE_KEY, String(prev + 1));
}

function Game9() {
  const [board, setBoard] = useState(() => createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(null);
  const [isActive, setIsActive] = useState(false); // 棋盘是否“激活”（点击后）
  const [gameId, setGameId] = useState(0);         // 用于强制重置 effect

  // 点击棋盘：让游戏激活，如果没有方块就生成一个
  function handleBoardClick() {
    if (!isActive) {
      setIsActive(true);
      if (!currentPiece) {
        const p = createRandomPiece();
        // 如果一开始就放不下，直接失败后重开
        if (!canPlace(board, p)) {
          alert('Failed');
          resetGame();
        } else {
          setCurrentPiece(p);
        }
      }
    }
  }

  function resetGame() {
    setBoard(createEmptyBoard());
    setCurrentPiece(null);
    setIsActive(false);
    setGameId(id => id + 1); // 改变 gameId，方便依赖刷新
  }

  // 每 1 秒往下掉一格
  function tickDown() {
    if (!currentPiece) return;

    const downPiece = {
      ...currentPiece,
      row: currentPiece.row + 1,
    };

    // 能继续往下走：更新方块位置
    if (canPlace(board, downPiece)) {
      setCurrentPiece(downPiece);
      return;
    }

    // 不能往下走：把方块锁进棋盘
    let merged = mergePieceIntoBoard(board, currentPiece);
    const { board: withGreens, greenRows } = applyFullRows(merged);

    // 先更新棋盘
    setBoard(withGreens);
    setCurrentPiece(null);

    // 赢了：5 行变绿
    if (greenRows >= 5) {
      addWin();
      setIsActive(false);
      alert('Congrats!');
      resetGame();
      return;
    }

    // 失败：锁完后有方块太高
    if (isFail(withGreens)) {
      setIsActive(false);
      alert('Failed');
      resetGame();
      return;
    }

    // 否则生成下一个方块
    const nextPiece = createRandomPiece();
    if (!canPlace(withGreens, nextPiece)) {
      // 新方块一上来就放不下，也算失败
      setIsActive(false);
      alert('Failed');
      resetGame();
      return;
    }

    setCurrentPiece(nextPiece);
  }

  // 下落计时器
  useEffect(() => {
    if (!isActive || !currentPiece) return;

    const id = setInterval(() => {
      tickDown();
    }, 1000);

    return () => clearInterval(id);
    // board/currentPiece/gameId 变动时，重新设置 interval，保证闭包是最新的
  }, [isActive, currentPiece, board, gameId]);

  // 左右移动（只在棋盘激活 且 有方块 时响应）
  useEffect(() => {
    if (!isActive || !currentPiece) return;

    const handleKey = (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;

      e.preventDefault();
      setCurrentPiece(prev => {
        if (!prev) return prev;
        const delta = e.key === 'ArrowLeft' ? -1 : 1;
        const moved = { ...prev, col: prev.col + delta };
        if (canPlace(board, moved)) {
          return moved;
        }
        return prev;
      });
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isActive, currentPiece, board]);

  // 把当前活动方块的格子记录在一个 Set 里，方便渲染时上色
  const activeCells = new Set();
  for (const [r, c] of getPieceCells(currentPiece)) {
    activeCells.add(`${r},${c}`);
  }

  return (
    <div className="home">
      <div className="tetro-wrapper">
        <h2>Tetro</h2>
        <p className="tetro-hint">
          点击棋盘开始游戏；棋盘激活后使用键盘左右方向键移动方块。
        </p >

        <div className="tetro-board" onClick={handleBoardClick}>
          {Array.from({ length: ROWS }).map((_, r) =>
            Array.from({ length: COLS }).map((_, c) => {
              const val = board[r][c];
              const isActiveCell = activeCells.has(`${r},${c}`);
              let className = 'tetro-cell';

              if (val === 2) {
                className += ' tetro-cell-green';
              } else if (val === 1) {
                className += ' tetro-cell-filled';
              }

              if (isActiveCell) {
                className += ' tetro-cell-active';
              }

              return <div key={`${r}-${c}`} className={className} />;
            })
          )}
        </div>

        <div className="tetro-controls">
          <button type="button" onClick={resetGame}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

export default Game9;