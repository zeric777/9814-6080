// src/Hanoi.jsx
import { useState } from 'react';
import './App.css';

// 和 Dashboard / Blanko 共用的计分 key
const SCORE_KEY = 'win';
// 盘子的数量（你想简单一点可以改成 3 或 4）
const DISK_COUNT = 6;

// 初始三根柱子：
// 第 0 根柱子： [1,2,3,...] 其中 1 是最小盘，在“最上面”
function createInitialColumns() {
  const firstCol = Array.from({ length: DISK_COUNT }, (_, i) => i + 1);
  return [firstCol, [], []];
}

function Hanoi() {
  // columns: 比如 [[1,2,3,4,5,6], [], []]
  const [columns, setColumns] = useState(() => createInitialColumns());
  const [selectedCol, setSelectedCol] = useState(null); // 当前选中的“起点柱子”
  const [moves, setMoves] = useState(0);               // 步数
  const [won, setWon] = useState(false);               // 是否已经完成

  // 计分：向 localStorage 的 win +1
  function addWin() {
    const prev = Number(localStorage.getItem(SCORE_KEY) || '0');
    localStorage.setItem(SCORE_KEY, String(prev + 1));
  }

  // 重置游戏
  function resetGame() {
    setColumns(createInitialColumns());
    setSelectedCol(null);
    setMoves(0);
    setWon(false);
  }

  // 点击柱子：第一次选择 from，第二次选择 to
  function handleColumnClick(colIndex) {
    // 已经赢了就不再操作
    if (won) return;

    // 第一次点击：选择起点柱子
    if (selectedCol === null) {
      // 没盘子的柱子忽略
      if (columns[colIndex].length === 0) return;
      setSelectedCol(colIndex);
      return;
    }

    // 第二次点击：选择目标柱子
    const from = selectedCol;
    const to = colIndex;

    // 再点同一根柱子 => 取消选择
    if (from === to) {
      setSelectedCol(null);
      return;
    }

    // 深拷贝一份列数组
    const newCols = columns.map(col => [...col]);
    const fromCol = newCols[from];
    const toCol = newCols[to];

    // 起点柱子空了（理论上不会，因为第一次点击已经过滤了）
    if (fromCol.length === 0) {
      setSelectedCol(null);
      return;
    }

    // 顶部盘：约定数组 index 0 是“最上面的盘”
    const fromTop = fromCol[0];
    const toTop = toCol[0]; // 目标柱顶部盘，可能不存在

    // 规则：小盘只能放在更大的盘上，或者放在空柱上
    const canMove =
      toCol.length === 0 || fromTop < toTop;

    if (!canMove) {
      // 非法移动，直接取消选择
      setSelectedCol(null);
      return;
    }

    // 合法移动：把 from 顶部盘移到 to 顶部
    fromCol.shift();        // 去掉 from 的第一个元素
    toCol.unshift(fromTop); // 插入到 to 的第一个位置

    setColumns(newCols);
    setSelectedCol(null);
    setMoves(m => m + 1);

    // 检查是否胜利：所有盘都在第三根柱子上
    if (newCols[2].length === DISK_COUNT) {
      setWon(true);
      addWin();
      alert('You Win!');
    }
  }

  const colNames = ['A', 'B', 'C'];

  return (
    <div className="home">
    <div className="dash">
      <div className="hanoi-wrapper">
        <h2>Hanoi Towers</h2>

        <div className="hanoi-board">
          {columns.map((col, colIndex) => (
            <div
              key={colIndex}
              className={
                'hanoi-column' +
                (selectedCol === colIndex ? ' hanoi-column-selected' : '')
              }
              onClick={() => handleColumnClick(colIndex)}
            >
              {/* 中间的木杆 */}
              <div className="hanoi-pole" />

              {/* 盘子区域 */}
              <div className="hanoi-disks">
                {col.map((size, idx) => (
                  <div
                    key={`${size}-${idx}`}
                    className="hanoi-disk"
                    style={{
                      // 数字越大盘越宽
                      width: `${30 + size * 8}%`,
                    }}
                  />
                ))}
              </div>

              {/* 柱子底部标签 */}
              <div className="hanoi-col-label">
                Column {colNames[colIndex]}
              </div>
            </div>
          ))}
        </div>

        {/* 控制区 */}
        <div className="hanoi-controls">
          <span>Moves: {moves}</span>
          {won && <span className="hanoi-win-text">✔ Completed!</span>}
          <button type="button" onClick={resetGame}>
            Reset
          </button>
        </div>

        <p className="hanoi-hint">
          点击一次选择“起点柱子”，再点击一次选择“目标柱子”。小盘只能放在大盘上。
        </p >
      </div>
    </div>
    </div>
  );
}

export default Hanoi;