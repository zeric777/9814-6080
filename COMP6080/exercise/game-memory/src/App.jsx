import { useState , useEffect } from 'react'
import './App.css'

const COLORS = ["black", "white"];

function App() {
  const [count, setCount] = useState(0);
  // const [state,setstate] = useState([[1,0,0,0,0],[0,1,0,0,0],[0,0,1,0,0],[0,0,0,1,0],[0,0,0,0,1]])
  const [state, setstate] = useState(randomlight([[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]]));
  
  const [blackpos, setblackpos] = useState([])
  const [isGameOver, setIsGameOver] = useState(false);
  useEffect(() => {
    setTimeout(() => setstate([[2,2,2,2,2],[2,2,2,2,2],[2,2,2,2,2],[2,2,2,2,2],[2,2,2,2,2]]), 5000);
    setblackpos(blackposition(state));
    console.log(blackposition(state));
  }, [])

  function blackposition(board){
    const positions = [];
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] === 1) {
          positions.push([i, j]);
        }
      }
    }
    return positions;
  }
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
  const handleClick = (row, col) => {
    setCount(count + 1);
    const newBoard = [...state];
    if (isGameOver) return;
    if (blackpos.some(pos => pos[0] === row && pos[1] === col)) {
      newBoard[row][col] = 1; // Change black to black
      if (blackpos.length === count + 1) {
        setIsGameOver(true);
        alert(`You Win! Total clicks: ${count + 1}`);
        return;
      }
    } else {
      newBoard[row][col] = 3; // Change wrong click to red
      setIsGameOver(true);
      alert(`Game Over! Total clicks: ${count + 1}`);
      return;
    }
    setstate(newBoard);
  };


  return (
    <>
     <div className='grid'>
        count:{count} 
        <button className="reset" onClick={() => {setstate(board => randomlight(board));}}>Reset</button>
        {/* <button className="wintest" onClick={() => {setstate([[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]]); setcount(0);}}>wintest</button> */}
        {state.map((row, rowIndex) => (
          <div className="row" key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <div className={`cell ${cell === 0 ? 'white' : cell ===1? 'black':cell ===3?'red':'gray'}`} key={cellIndex} onClick={() => handleClick(rowIndex, cellIndex)}>
                {cell === 0 || cell===1 || cell===2 || cell===3? '' : cell}
                
              </div>
            ))}
          </div>
        ))}
        {isGameOver && <div className="gameover">Game Over!</div>} 
      </div>
    </>
  )
}

export default App
