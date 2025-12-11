import { useState, useEffect } from 'react'

function Game13() {
  const [state, setState] = useState([[0,2,1],[3,4,5],[6,7,8]]);
  const [selected, setSelected] = useState(null);
  const [Solved, setSolved] = useState(false);

  const worddict = ["apple","banana","orange"]

  function randomShuffle(state) {
    const newstate = [...state.flat()];
    for (let i = newstate.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newstate[i], newstate[j]] = [newstate[j], newstate[i]];
    }
    return [
      newstate.slice(0, 3),
      newstate.slice(3, 6),
      newstate.slice(6, 9),
    ];
  }

  function getImage(cell) {
    if (cell === 1) return './exam-sample-spec/assets/1.png'
    if (cell === 2) return './exam-sample-spec/assets/2.png'
    if (cell === 3) return './exam-sample-spec/assets/3.png'
    if (cell === 4) return './exam-sample-spec/assets/4.png'
    if (cell === 5) return './exam-sample-spec/assets/5.png'
    if (cell === 6) return './exam-sample-spec/assets/6.png'
    if (cell === 7) return './exam-sample-spec/assets/7.png'
    if (cell === 8) return './exam-sample-spec/assets/8.png'
    return 0;
  }

  function isWin(state) {
    const winstate = [[1,2,3],[4,5,6],[7,8,0]];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (state[r][c] !== winstate[r][c]) return false;
      }
    }
    return true;
  }
  function swapTile(rowIndex, cellIndex) {
    if (!selected) {
      setSelected([rowIndex, cellIndex]);
      return;
    }

    const newState = state.map(row => [...row]);
    const [r1, c1] = selected;
    const [r2, c2] = [rowIndex, cellIndex];

    // swap
    [newState[r1][c1], newState[r2][c2]] = [newState[r2][c2], newState[r1][c1]];
    
    setState(newState);
    setSelected(null);
  }

  useEffect(() => {
    setState(randomShuffle(state));
  }, []);

  useEffect(() => {
    if (isWin(state) && !Solved) {
      alert('You win!');
      const x = localStorage.getItem('x') || 0;
      const newScore = Number(x) + 1;
      localStorage.setItem('x', newScore);
      setSolved(true);
    }
  }, [state]);


  return (
    <>
      <div className='home'>
        <div className='grid'>
          <button onClick={() => {setState([[1,2,3],[4,5,6],[7,8,0]]); setSolved(true)}}>Solve</button>
          <button className='reset' onClick={() => {setState(randomShuffle(state)); setSolved(false)}}>Reset</button>

          {state.map((row, rowIndex) => (
            <div className="row" key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <div 
                  className={`cell ${selected && selected[0] === rowIndex && selected[1] === cellIndex ? "selected" : ""}`} 
                  key={cellIndex} 
                  onClick={() => swapTile(rowIndex, cellIndex)}
                >
                  { getImage(cell) ? 
                    <img src={getImage(cell)} className="cell-img" alt="" /> 
                    : cell===0 ? '' : null }
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default Game13;
