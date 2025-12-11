// src/Jigsaw.jsx
import { useState } from 'react';
import './App.css';

const ALL_PIECES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function Game14() {
  // board: 长度为 9 的数组，每个格子要么 null，要么是 1~9 的编号
  const [board, setBoard] = useState(Array(9).fill(null));
  // pieces: 下面还没放上去的拼图块（随机顺序）
  const [pieces, setPieces] = useState(() => shuffle(ALL_PIECES));
  // 当前选中的拼图编号
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [hasWon, setHasWon] = useState(false);

  function resetGame() {
    setBoard(Array(9).fill(null));
    setPieces(shuffle(ALL_PIECES));
    setSelectedPiece(null);
    setHasWon(false);
  }

  function handlePieceClick(id) {
    // 再点一下同一个就取消选中
    setSelectedPiece(prev => (prev === id ? null : id));
  }

  function handleCellClick(index) {
    // 没有选中拼图 或 格子已经有拼图，就不处理
    if (selectedPiece === null) return;
    if (board[index] !== null) return;

    const placed = selectedPiece;

    const newBoard = [...board];
    newBoard[index] = placed;

    const newPieces = pieces.filter(p => p !== placed);

    setBoard(newBoard);
    setPieces(newPieces);
    setSelectedPiece(null);

    // 检查是否完成：9 个格子都被填满，并且顺序 1~9
    const isFull = newBoard.every(cell => cell !== null);
    if (isFull) {
      const correct = newBoard.every((cell, idx) => cell === idx + 1);
      if (correct) {
        setHasWon(true);
        alert('拼图完成！🎉');
      }
    }
  }

  return (
    <div className="home">
      <h2>3×3 拼图游戏</h2>

      {/* 上面的 3×3 棋盘 */}
      <div className="jigsaw-board">
        {board.map((pieceId, idx) => (
          <div
            key={idx}
            className="jigsaw-cell"
            onClick={() => handleCellClick(idx)}
          >
            {/* 这里现在用数字代表拼图块，你可以替换成图片 */}
            {pieceId !== null && (
              <span className="jigsaw-piece-label">
                {pieceId}
              </span>
              // 如果你有图片，可以这样：
              // < img src={pieceImages[pieceId]} alt={`piece ${pieceId}`} />
            )}
          </div>
        ))}
      </div>

      {/* 下面的拼图按钮区 */}
      <div className="jigsaw-pieces">
        {pieces.map(id => (
          <button
            key={id}
            type="button"
            className={
              'jigsaw-piece-button' +
              (selectedPiece === id ? ' jigsaw-piece-button-selected' : '')
            }
            onClick={() => handlePieceClick(id)}
          >
            {/* 这里也可以换成图片 */}
            {id}
          </button>
        ))}
      </div>

      <div className="jigsaw-controls">
        <button type="button" onClick={resetGame}>
          Reset
        </button>
        {hasWon && <span className="jigsaw-success-text">✔ 已完成</span>}
      </div>
    </div>
  );
}

export default Game14;