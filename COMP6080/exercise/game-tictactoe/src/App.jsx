import { useState, useEffect } from 'react'
import './App.css'




function App() {
  const [state,setstate] = useState([["","",""],["","",""],["","",""]])
  const [turn,setturn] = useState("x")
  const [winnerCells, setWinnerCells] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  // const [winner,setwinner] = useState(false)
  
  function cellclicked(board, row, col) {
    const newBoard = board.map(r => [...r]);
    // newBoard[row][col] = newBoard[row][col] === "" ? "X" : "";
    if (newBoard[row][col]== "" ){
      if (turn == "x") {
        newBoard[row][col] = "x";
        setturn("o");
      } else if (turn == "o") {
        newBoard[row][col] = "o";
        setturn("x");
      }
    }
    return newBoard;
  }
  function checkWin(board) {
    // Check rows
    for (let i = 0; i < 3; i++) {
      if (board[i][0] !== "" && board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
        return {cell: [[i,0],[i,1],[i,2]]};
      }
    }
    // Check columns
    for (let j = 0; j < 3; j++) {
      if (board[0][j] !== "" && board[0][j] === board[1][j] && board[1][j] === board[2][j]) {
        return {cell: [[0,j],[1,j],[2,j]]};
      }
    }
    // Check diagonals
    if (board[0][0] !== "" && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
      return {cell: [[0,0],[1,1],[2,2]]};
    }
    if (board[0][2] !== "" && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
      return {cell: [[0,2],[1,1],[2,0]]};
    }
    return null;
  }
  useEffect(() => {
    console.log("state changed")
    if (checkWin(state)) {
       setIsGameOver(true);  
      setWinnerCells(checkWin(state).cell);
      if (turn == "x") {
        setturn("o");
      } else {
        setturn("x");
      }
    }
  }, [state])

  return (
    <>
     <div className='grid'>
        <button className="reset" onClick={() => {setstate([["","",""],["","",""],["","",""]]);setWinnerCells(null);setIsGameOver(false)}}>Reset</button>
        {state.map((row, rowIndex) => (
          <div className="row" key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <div className="cell" key={cellIndex} onClick={() => {if (!isGameOver){setstate(board => cellclicked(board, rowIndex,  cellIndex))}}} 
              style={{
                  backgroundColor: winnerCells?.some(([r, c]) => r === rowIndex && c === cellIndex)
                    ? "lightgreen"
                    : "white"
                }} >
                {cell}
              </div>
              
            ))}
          </div>
        ))}
        {checkWin(state) && <div>Winner:{turn}</div>}
      </div>
    </>
  )
}

export default App
