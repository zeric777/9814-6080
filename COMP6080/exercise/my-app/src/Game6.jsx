// src/HigherLower.jsx
import { useState } from 'react';
import './App.css';

const SCORE_KEY = 'x';          // 和其它游戏共用
const WIN_STREAK = 5;             // 连续猜对 >= 5 次算赢一次

function randomNumber() {
  return Math.floor(Math.random() * 100) + 1; // 1~100
}

function Game6() {
  const [current, setCurrent] = useState(() => randomNumber());
  const [streak, setStreak] = useState(0);        // 当前连击
  const [maxStreak, setMaxStreak] = useState(0);  // 本局最高连击
  const [message, setMessage] = useState('Click Higher or Lower to start.');
  const [gameOver, setGameOver] = useState(false);
  const [hasWinThisGame, setHasWinThisGame] = useState(false);

  function addWin() {
    const prev = Number(localStorage.getItem(SCORE_KEY) || '0');
    localStorage.setItem(SCORE_KEY, String(prev + 1));
  }

  // 用户点击 Higher / Lower
  function handleGuess(direction) {
    if (gameOver) return;   // 已结束就不再处理

    const next = randomNumber();

    // 判断本次猜测是否正确
    let correct = false;
    if (next > current && direction === 'higher') correct = true;
    if (next < current && direction === 'lower') correct = true;

    if (next === current) {
      // 平局的情况：这里我们当成猜错（你也可以改成“不计轮次”）
      correct = false;
    }

    if (correct) {
      setCurrent(next);

      setStreak(prev => {
        const newStreak = prev + 1;

        setMaxStreak(oldMax => Math.max(oldMax, newStreak));

        // 如果本局第一次达到 WIN_STREAK，记一次 win
        if (!hasWinThisGame && newStreak >= WIN_STREAK) {
          addWin();
          setHasWinThisGame(true);
          setMessage(
            `Correct! New number is ${next}. Streak = ${newStreak}. You have won this round!`
          );
        } else {
          setMessage(`Correct! New number is ${next}. Streak = ${newStreak}.`);
        }

        return newStreak;
      });
    } else {
      // 猜错 -> 游戏结束
      setCurrent(next);
      setGameOver(true);
      setMessage(
        `Wrong! You guessed "${direction}". Next number was ${next}. Game Over.`
      );
      // 更新最高连击（如果当前 streak 更高）
      setMaxStreak(oldMax => Math.max(oldMax, streak));
    }
  }

  function handleReset() {
    setCurrent(randomNumber());
    setStreak(0);
    setMaxStreak(0);
    setMessage('Click Higher or Lower to start.');
    setGameOver(false);
    setHasWinThisGame(false);
  }

  return (
    <div className="home">
      <div className="hl-box">
        <h2>Higher or Lower</h2>

        <div className="hl-current">
          Current number: <span className="hl-current-num">{current}</span>
        </div>

        <div className="hl-message">{message}</div>

        <div className="hl-buttons">
          <button
            type="button"
            onClick={() => handleGuess('higher')}
            disabled={gameOver}
          >
            Higher
          </button>
          <button
            type="button"
            onClick={() => handleGuess('lower')}
            disabled={gameOver}
          >
            Lower
          </button>
        </div>

        <div className="hl-status">
          <div>Current streak: {streak}</div>
          <div>Max streak this round: {maxStreak}</div>
          <div>Win condition: streak ≥ {WIN_STREAK}</div>
          {gameOver && (
            <div className="hl-gameover">
              Game Over. Click Reset to start a new round.
            </div>
          )}
        </div>

        <button type="button" onClick={handleReset}>
          Reset Round
        </button>

        <p className="hl-hint">
          规则：系统给出一个当前数字（1–100）。你猜下一个数字是更大（Higher）还是更小
          （Lower）。猜对连击 +1，猜错本局结束。单局内连续猜中 {WIN_STREAK} 次及以上，
          视为赢一次，向 Dashboard 的 win 计数 +1。
        </p >
      </div>
    </div>
  );
}

export default Game6;