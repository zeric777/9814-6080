// src/Snake.jsx
import { useState, useEffect, useRef } from 'react';
import './App.css';

const ROWS = 15;
const COLS = 15;
const INITIAL_SNAKE = [{ row: 7, col: 7 }];

function makeFood(snake) {
  // 生成一个不在蛇身上的随机食物
  while (true) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    const onSnake = snake.some(seg => seg.row === r && seg.col === c);
    if (!onSnake) return { row: r, col: c };
  }
}

function Game3() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState({ row: 0, col: 1 }); // 一开始向右
  const [food, setFood] = useState(() => makeFood(INITIAL_SNAKE));
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [eaten, setEaten] = useState(0);

  // 用 ref 保证定时器里拿到的是最新方向 / 状态
  const dirRef = useRef(direction);
  const snakeRef = useRef(snake);
  const runningRef = useRef(running);
  const overRef = useRef(gameOver);

  dirRef.current = direction;
  snakeRef.current = snake;
  runningRef.current = running;
  overRef.current = gameOver;

  // 键盘监听：方向键 + 回车重开
  useEffect(() => {
    function handleKey(e) {
      if (overRef.current) {
        if (e.key === 'Enter') resetGame();
        return;
      }

      if (
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight'
      ) {
        // 第一次按方向键自动开始
        if (!runningRef.current) setRunning(true);

        const cur = dirRef.current;
        if (e.key === 'ArrowUp' && cur.row !== 1) {
          setDirection({ row: -1, col: 0 });
        } else if (e.key === 'ArrowDown' && cur.row !== -1) {
          setDirection({ row: 1, col: 0 });
        } else if (e.key === 'ArrowLeft' && cur.col !== 1) {
          setDirection({ row: 0, col: -1 });
        } else if (e.key === 'ArrowRight' && cur.col !== -1) {
          setDirection({ row: 0, col: 1 });
        }
      }
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // 游戏主循环：每 200ms 走一步
  useEffect(() => {
    if (!running || gameOver) return;

    const id = setInterval(() => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const dir = dirRef.current;
        const next = { row: head.row + dir.row, col: head.col + dir.col };

        // 撞墙
        if (
          next.row < 0 ||
          next.row >= ROWS ||
          next.col < 0 ||
          next.col >= COLS
        ) {
          setGameOver(true);
          setRunning(false);
          alert('Game Over');
          return prevSnake;
        }

        // 撞到自己
        if (
          prevSnake.some(seg => seg.row === next.row && seg.col === next.col)
        ) {
          setGameOver(true);
          setRunning(false);
          alert('Game Over');
          return prevSnake;
        }

        const ateFood = next.row === food.row && next.col === food.col;
        const newSnake = [next, ...prevSnake];

        if (!ateFood) {
          // 没吃到食物 => 去掉尾巴，长度不变
          newSnake.pop();
        } else {
          // 吃到食物 => 不 pop，长度 +1
          const newFood = makeFood(newSnake);
          setFood(newFood);
          setEaten(x => x + 1);
        }

        return newSnake;
      });
    }, 200);

    return () => clearInterval(id);
  }, [running, gameOver, food]);

  function resetGame() {
    const start = INITIAL_SNAKE;
    setSnake(start);
    setDirection({ row: 0, col: 1 });
    setFood(makeFood(start));
    setRunning(false);
    setGameOver(false);
    setEaten(0);
  }

  return (
    <div className="home">
    <div className="dash">
      <div className="snake-wrapper">
        <h2>Snake</h2>
        <div className="snake-board">
          {Array.from({ length: ROWS }).map((_, r) => (
            <div className="snake-row" key={r}>
              {Array.from({ length: COLS }).map((_, c) => {
                const isHead =
                  snake[0].row === r && snake[0].col === c;
                const isBody =
                  !isHead &&
                  snake.some(seg => seg.row === r && seg.col === c);
                const isFood = food.row === r && food.col === c;

                let cls = 'snake-cell';
                if (isBody) cls += ' snake-body';
                if (isHead) cls += ' snake-head';
                if (isFood) cls += ' snake-food';

                return <div key={c} className={cls} />;
              })}
            </div>
          ))}
        </div>

        <div className="snake-info">
          <span>Length: {snake.length}</span>
          <span>Food eaten: {eaten}</span>
          {gameOver && (
            <span className="snake-over">
              Game Over（按 Enter 或点击 Reset 重开）
            </span>
          )}
          <button type="button" onClick={resetGame}>
            Reset
          </button>
        </div>

        <p className="snake-hint">
          用键盘方向键控制蛇移动，吃到红色食物会变长，撞墙或撞到自己就 Game Over。
        </p >
      </div>
    </div>
    </div>
  );
}

export default Game3;