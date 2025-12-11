import { useState, useEffect } from "react";

function Game15() {
  const ROAD_LENGTH = 10;

  const [frog, setFrog] = useState(0); // frog position
  const [cars, setCars] = useState([
    { pos: 6, dir: -1, emoji: "🚗" },
    { pos: 3, dir: 1, emoji: "🚙" }
  ]);
  
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);

  // Reset game
  function resetGame() {
    setFrog(0);
    setCars([
      { pos: 6, dir: -1, emoji: "🚗" },
      { pos: 3, dir: 1, emoji: "🚙" },
    ]);
    setGameOver(false);
    setWin(false);
  }

  // Check collision
  function checkHit(newCars, frogPos) {
    if (newCars.some(car => car.pos === frogPos)) {
      setGameOver(true);
    }
  }

  // Handle keyboard
  useEffect(() => {
    function handleKey(e) {
      if (gameOver || win) return;

      if (e.key === "ArrowRight" && frog < ROAD_LENGTH - 1) {
        setFrog(f => f + 1);
      }
      if (e.key === "ArrowLeft" && frog > 0) {
        setFrog(f => f - 1);
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameOver, win]);

  // Move cars automatically
  useEffect(() => {
    if (gameOver || win) return;

    const interval = setInterval(() => {
      setCars(prev =>
        prev.map(car => {
          let newPos = car.pos + car.dir;

          if (newPos >= ROAD_LENGTH || newPos < 0) {
            car.dir *= -1;
            newPos = car.pos + car.dir;
          }

          return { ...car, pos: newPos };
        })
      );
    }, 500);

    return () => clearInterval(interval);
  }, [gameOver, win]);

  // Check collision and win condition whenever frog or cars update
  useEffect(() => {
    checkHit(cars, frog);

    if (frog === ROAD_LENGTH - 1 && !gameOver) {
      setWin(true);

      // update score
      const prev = Number(localStorage.getItem("x") || 0);
      localStorage.setItem("x", prev + 1);
    }
  }, [frog, cars]);

  return (
    <div className="home">
      <h2>🐸 Frog Road</h2>

      <div className="frog-status">
        Use ← → arrows to move
        {win && <span className="frog-win">🎉 You Win!</span>}
        {gameOver && <span className="frog-lose">💥 Crashed!</span>}
      </div>

      <div className="frog-road">
        {[...Array(ROAD_LENGTH)].map((_, i) => {
          const car = cars.find(c => c.pos === i);
          return (
            <div
              key={i}
              className={
                "frog-cell " +
                (i === frog ? "frog" : "") +
                (car ? " car" : "")
              }
            >
              {i === frog ? "🐸" : car ? car.emoji : ""}
            </div>
          );
        })}
      </div>

      <button className="frog-reset" onClick={resetGame}>
        Reset
      </button>
    </div>
  );
}

export default Game15;



