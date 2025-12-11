import { useState, useEffect, use } from 'react'
import './App.css'

const SCORE_KEY = 'x';

// 随机生成 1-100
function randomTarget() {
  return Math.floor(Math.random() * 100) + 1;
}

function Game5() {
  const [target, setTarget] = useState(() => randomTarget());
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('Please enter a number between 1 and 100.');
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [gameOver, setGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  // 确保第一次加载就有个目标数（其实上面 useState 已经有了，这里只是演示）
  useEffect(() => {
    // console.log('Target:', target); // 调试用，可以看到随机数
  }, [target]);

  // 赢了就把 win 计数 +1
  function addWin() {
    const prev = Number(localStorage.getItem(SCORE_KEY) || '0');
    localStorage.setItem(SCORE_KEY, String(prev + 1));
  }

  function handleChange(e) {
    setGuess(e.target.value);
  }

  function handleGuess() {
    if (gameOver) return;

    const num = Number(guess);

    if (!Number.isInteger(num) || num < 1 || num > 100) {
      setMessage('Please enter an integer between 1 and 100.');
      return;
    }

    // 用函数式更新，避免闭包拿到旧值
    setAttemptsLeft(prev => {
      const newLeft = prev - 1;

      if (num === target) {
        setMessage(`Correct! The number was ${target}.`);
        setHasWon(true);
        setGameOver(true);
        addWin();
      } else if (newLeft <= 0) {
        setMessage(`Game over! The number was ${target}.`);
        setGameOver(true);
      } else if (num < target) {
        setMessage('Too small!');
      } else if (num > target) {
        setMessage('Too big!');
      }

      return newLeft;
    });

    setGuess(''); // 每次提交后清空输入
  }

  function handleReset() {
    setTarget(randomTarget());
    setGuess('');
    setMessage('Please enter a number between 1 and 100.');
    setAttemptsLeft(5);
    setGameOver(false);
    setHasWon(false);
  }

  return (
    <div className='home'>
    <div className="dash">
      <div className="guess-box">
        <h2>Guess the Number</h2>

        <div className="guess-message">{message}</div>

        <div className="guess-input-row">
          <input
            type="number"
            min="1"
            max="100"
            value={guess}
            onChange={handleChange}
            disabled={gameOver}
          />
          <button type="button" onClick={handleGuess} disabled={gameOver}>
            Guess
          </button>
        </div>

        <div className="guess-status">
          Attempts left: {attemptsLeft}
          {hasWon && <span className="guess-win"> ✔ You win!</span>}
          {gameOver && !hasWon && <span className="guess-lose"> ✖ You lose</span>}
        </div>

        <button type="button" onClick={handleReset}>
          Reset Game
        </button>

        <p className="guess-hint">
          规则：系统随机生成 1–100 的整数，你有 5 次机会，输入数字并点击 Guess。
          提示会告诉你「Too small / Too big / Correct」。5 次之内猜中算胜利，并让 win 计数 +1。
        </p >
      </div>
    </div>
    </div>
  );
}

export default Game5
