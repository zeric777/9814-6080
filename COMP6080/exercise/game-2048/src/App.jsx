import { useState, useEffect } from 'react'
import './App.css'

function getEmptyCells(board) {
  const empty = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (board[i][j] === 0) empty.push([i, j]);
    }
  }
  return empty;
}

function addRandomTile(board) {
  const empty = getEmptyCells(board);
  if (empty.length === 0) return board;
  const [i, j] = empty[Math.floor(Math.random() * empty.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  const newBoard = board.map(row => [...row]);
  newBoard[i][j] = value;
  return newBoard;
}
function moveLeft(board) {
  return board.map(row => {
    let arr = row.filter(x => x !== 0);
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        arr[i + 1] = 0;
      }
    }
    arr = arr.filter(x => x !== 0);
    while (arr.length < 4) arr.push(0);
    return arr;
  });
}
function moveRight(board) {
  return board.map(row => {
    let arr = row.filter(x => x !== 0);
    for (let i = arr.length - 1; i > 0; i--) {
      if (arr[i] === arr[i - 1]) {
        arr[i] *= 2;
        arr[i - 1] = 0;
      }
    }
    arr = arr.filter(x => x !== 0);
    while (arr.length < 4) arr.unshift(0);
    return arr;
  }
  );
}
function moveUp(board) {
  let newBoard = Array.from({ length: 4 }, () => Array(4).fill(0));
  for (let j = 0; j < 4; j++) {
    let arr = [];
    for (let i = 0; i < 4; i++) {
      if (board[i][j] !== 0) arr.push(board[i][j]);
    }
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        arr[i + 1] = 0;
      }
    }
    arr = arr.filter(x => x !== 0);
    while (arr.length < 4) arr.push(0);
    for (let i = 0; i < 4; i++) {
      newBoard[i][j] = arr[i];
    }
  }
  return newBoard;
}
function moveDown(board) {
  let newBoard = Array.from({ length: 4 }, () => Array(4).fill(0));
  for (let j = 0; j < 4; j++) {
    let arr = [];
    for (let i = 0; i < 4; i++) {
      if (board[i][j] !== 0) arr.push(board[i][j]);
    }
    for (let i = arr.length - 1; i > 0; i--) {
      if (arr[i] === arr[i - 1]) {
        arr[i] *= 2;
        arr[i - 1] = 0;
      }
    }
    arr = arr.filter(x => x !== 0);
    while (arr.length < 4) arr.unshift(0);
    for (let i = 0; i < 4; i++) {
      newBoard[i][j] = arr[i];
    }
  }
  return newBoard;
}
function gameOver(board) {
  if (getEmptyCells(board).length > 0) return false;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (j < 3 && board[i][j] === board[i][j + 1]) return false;
      if (i < 3 && board[i][j] === board[i + 1][j]) return false;
    }
  }
  return true;
}
function Win(board) {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (board[i][j] === 2048) return true;
    }
  }
  return false;
}

function App() {
  const [state,setstate] = useState([[1024,1024,2,2],[0,0,0,0],[0,0,0,0],[0,0,0,0]])
  useEffect(() => {
    const handleKey = (e) => {
      let moved;
      if (e.key === 'ArrowUp') {
        console.log('Up pressed')
        setstate(prev => addRandomTile(moveUp(prev)));
        
      } else if (e.key === 'ArrowLeft') {
        console.log('Left pressed')
        setstate(prev => addRandomTile(moveLeft(prev)));
        
      }
      else if (e.key === 'ArrowDown') {
        console.log('Down pressed')
        setstate(prev => addRandomTile(moveDown(prev)));
       
      }
      else if (e.key === 'ArrowRight') {
        console.log('Right pressed')
        setstate(prev => addRandomTile(moveRight(prev)));
      }
      // if (gameOver(state)) {
      //   alert("Game Over!");  
      // }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])
  useEffect(() => {
    if (gameOver(state)) {
      alert("Game Over!");
    }
    if (Win(state)) {
      alert("You win!");
  }
  }, [state]);  
  return (
    <>
      <div className='grid'>
        <button className="reset" onClick={() => {setstate([[2,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]])}}>Reset</button>
        {state.map((row, rowIndex) => (
          <div className="row" key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <div className="cell" key={cellIndex}>
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>
    </>

  )
}
export default App