import { useState, useEffect, use } from 'react'
import { Routes, Route, Link, data } from 'react-router-dom'

function Game1() {
    const [state, setState] = useState([[0,2,1],[3,4,5],[6,7,8]]);
    const [Solved, setSolved] = useState(false);
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
  function  getImage(cell) {
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
        if (state[r][c] !== winstate[r][c]) {
          return false;
        }
      }
    }
    return true;
  } 
  function changeposition(rowIndex, cellIndex) {
    const newstate = state.map(row => row.slice());
    const zeroPos = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (newstate[r][c] === 0) {
          zeroPos.push([r, c]);
        }
      }
    }
    for (const [zr, zc] of zeroPos) {
      if ((Math.abs(zr - rowIndex) === 1 && zc === cellIndex) ||
          (Math.abs(zc - cellIndex) === 1 && zr === rowIndex)) {
        // swap
        [newstate[zr][zc], newstate[rowIndex][cellIndex]] =
          [newstate[rowIndex][cellIndex], newstate[zr][zc]];
        setState(newstate);
        return;
      }
    }
  }
  function keyboardHandler(event) {
    const dir = event.key;
    const newstate = state.map(row => row.slice());
    let zeroRow, zeroCol;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (newstate[r][c] === 0) {
          zeroRow = r;
          zeroCol = c;
        }
      }
    }
    if (dir === 'ArrowUp' && zeroRow < 2) {
      [newstate[zeroRow][zeroCol], newstate[zeroRow + 1][zeroCol]] =
        [newstate[zeroRow + 1][zeroCol], newstate[zeroRow][zeroCol]];
    } else if (dir === 'ArrowDown' && zeroRow > 0) {
      [newstate[zeroRow][zeroCol], newstate[zeroRow - 1][zeroCol]] =
        [newstate[zeroRow - 1][zeroCol], newstate[zeroRow][zeroCol]];
    }   else if (dir === 'ArrowLeft' && zeroCol < 2) {
      [newstate[zeroRow][zeroCol], newstate[zeroRow][zeroCol + 1]] =
        [newstate[zeroRow][zeroCol + 1], newstate[zeroRow][zeroCol]];
    }   else if (dir === 'ArrowRight' && zeroCol > 0) { 
        [newstate[zeroRow][zeroCol], newstate[zeroRow][zeroCol - 1]] =
        [newstate[zeroRow][zeroCol - 1], newstate[zeroRow][zeroCol]];
    } else {
      return; // invalid move
    }
    setState(newstate);
  }
  useEffect(() => {
    window.addEventListener('keydown', keyboardHandler);
    return () => {
      window.removeEventListener('keydown', keyboardHandler);
    };
  }, [state]);
  useEffect(() => {
    const shuffled = randomShuffle(state);
    setState(shuffled);
  }, []);

  useEffect(() => {
    if (isWin(state) && !Solved) {
      alert('You win!');
      const x = localStorage.getItem('x') || 0;
      const newScore = Number(x) + 1;
      localStorage.setItem('x', newScore);
    }
  }, [state]);
  return (<>
        <div className='home'>
        <div className='grid'>
          <button onClick={() => {setState([[1,2,3],[4,5,6],[7,8,0]]);setSolved(true)}}>Solve</button>
          <button className="reset" onClick={() => {setState([[1,2,3],[4,5,0],[7,8,6]]);setSolved(false)}}>Reset</button>
          {state.map((row, rowIndex) => (
            <div className="row" key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <div className="cell" key={cellIndex} onClick={() => {changeposition(rowIndex, cellIndex)}}>
                 { getImage(cell)?<img src={getImage(cell)} className="cell-img" />:cell===0?'':null}
                </div>
              ))}
            </div>
          ))}
        </div>
        </div>
      </>)
}


    export default Game1;