import { useState, useEffect } from "react";

function Game7() {
  const SIZE = 8;      // 8x8 扫雷
  const MINES = 10;    // 地雷数量

  const [board, setBoard] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [flags, setFlags] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);

  // 初始化棋盘
  function initBoard() {
    let grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));

    // 随机放雷
    let minesPlaced = 0;
    while (minesPlaced < MINES) {
      let r = Math.floor(Math.random() * SIZE);
      let c = Math.floor(Math.random() * SIZE);
      if (grid[r][c] !== "M") {
        grid[r][c] = "M";
        minesPlaced++;
      }
    }

    // 计算周围雷数
    const dirs = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], /*   */ [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (grid[r][c] === "M") continue;
        let count = 0;
        dirs.forEach(([dr, dc]) => {
          let nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
            if (grid[nr][nc] === "M") count++;
          }
        });
        grid[r][c] = count;
      }
    }

    return grid;
  }

  // 初始化游戏
  useEffect(() => {
    setBoard(initBoard());
    setRevealed(Array.from({ length: SIZE }, () => Array(SIZE).fill(false)));
    setFlags(0);
    setGameOver(false);
    setWin(false);
  }, []);

  // 点击展开格子
  function reveal(r, c) {
    if (gameOver || win || revealed[r][c]) return;

    const newRevealed = revealed.map(row => [...row]);
    newRevealed[r][c] = true;

    setRevealed(newRevealed);

    // 如果踩雷
    if (board[r][c] === "M") {
      setGameOver(true);
      return;
    }

    // 若为 0 自动展开
    if (board[r][c] === 0) autoExpand(newRevealed, r, c);

    // 检查胜利
    checkWin(newRevealed);
  }

  // 自动展开 BFS
  function autoExpand(rev, r, c) {
    const queue = [[r, c]];
    const dirs = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], /*   */ [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];

    while (queue.length) {
      const [cr, cc] = queue.shift();

      dirs.forEach(([dr, dc]) => {
        let nr = cr + dr, nc = cc + dc;
        if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) return;
        if (!rev[nr][nc]) {
          rev[nr][nc] = true;
          if (board[nr][nc] === 0) queue.push([nr, nc]);
        }
      });
    }

    setRevealed([...rev]);
  }

  // 右键标旗子
  function toggleFlag(e, r, c) {
    e.preventDefault();
    if (revealed[r][c] || gameOver || win) return;

    const newRev = revealed.map(row => [...row]);
    newRev[r][c] = newRev[r][c] === "F" ? false : "F";

    setRevealed(newRev);

    if (newRev[r][c] === "F") setFlags(f => f + 1);
    else setFlags(f => f - 1);

    checkWin(newRev);
  }

  // 检查是否胜利
  function checkWin(rev) {
    let safeRevealed = 0;

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (board[r][c] !== "M" && rev[r][c] === true) {
          safeRevealed++;
        }
      }
    }

    if (safeRevealed === SIZE * SIZE - MINES) {
      setWin(true);

      // 写入 localStorage
      const prev = Number(localStorage.getItem("x") || 0);
      localStorage.setItem("x", prev + 1);
    }
  }

  // 重置
  function resetGame() {
    setBoard(initBoard());
    setRevealed(Array.from({ length: SIZE }, () => Array(SIZE).fill(false)));
    setFlags(0);
    setGameOver(false);
    setWin(false);
  }

  return (
    <div className="home">
      <h2>Minesweeper</h2>
      <div className="mine-status">
        Flags: {flags}/{MINES}
        {win && <span className="mine-win">🎉 You Win!</span>}
        {gameOver && <span className="mine-lose">💥 Game Over</span>}
      </div>

      <div className="mine-board">
        {board.map((row, r) =>
          row.map((cell, c) => {
            const isRevealed = revealed[r][c] === true;
            const isFlag = revealed[r][c] === "F";

            return (
              <div
                key={`${r}-${c}`}
                className={
                  "mine-cell " +
                  (isRevealed ? "revealed" : "") +
                  (isFlag ? " flagged" : "")
                }
                onClick={() => reveal(r, c)}
                onContextMenu={(e) => toggleFlag(e, r, c)}
              >
                {isFlag ? "🚩" : isRevealed ? (cell === 0 ? "" : cell) : ""}
              </div>
            );
          })
        )}
      </div>

      <button className="mine-reset" onClick={resetGame}>
        Reset
      </button>
    </div>
  );
}

export default Game7;
