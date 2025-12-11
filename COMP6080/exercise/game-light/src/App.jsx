import { useState, useEffect, use } from 'react'
import './App.css'


function randomlight(board){
  const newBoard = board.map(row => [...row]);
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      const value = Math.random() < 0.5 ? 0 : 1;
        newBoard[i][j]=value;
      }
    }
    return newBoard;
}

function toggleLight(board, row, col) {
  const newBoard = board.map(r => [...r]);
  const directions = [
    [0, 0], // current light
    [1, 0], // down
    [-1, 0], // up
    [0, 1], // right
    [0, -1] // left
  ];

  directions.forEach(([dx, dy]) => {
    const newRow = row + dx;
    const newCol = col + dy;
    if (newRow >= 0 && newRow < newBoard.length && newCol >= 0 && newCol < newBoard[0].length) {
      newBoard[newRow][newCol] = newBoard[newRow][newCol] === 0 ? 1 : 0;
    }
  });

  return newBoard;
}

function checkWin(board) {
  let yellow=0;
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (board[i][j] === 1) {
        yellow+=1;
      }
    }
  }
  if (yellow === 25){
    return true;
  } else {
    return false;
  }
}

function App() {
  const [count,setcount] = useState(0);
  const [state,setstate] = useState([[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]])
  useEffect(() => {
    setstate(board => randomlight(board));
  }, [])
  useEffect(() => {
    if (checkWin(state)) {
      alert(`You win in ${count} moves!`);
      setcount(0);
    }
  }, [setcount, state])
  return (
    <>
      <div className='grid'>
        count:{count} 
        <button className="reset" onClick={() => {setstate(board => randomlight(board));setcount(0)}}>Reset</button>
        {/* <button className="wintest" onClick={() => {setstate([[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]]); setcount(0);}}>wintest</button> */}
        {state.map((row, rowIndex) => (
          <div className="row" key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <div className={`cell ${cell === 0 ? 'white' : 'yellow'}`} key={cellIndex} onClick={() => {setcount(count + 1);setstate(board => toggleLight(board, rowIndex,  cellIndex))}}>
                {cell === 0 || cell===1 ? '' : cell}
                
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  )
}

export default App
