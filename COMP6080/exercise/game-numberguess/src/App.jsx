import { useState, useEffect, use } from 'react'
import './App.css'
function App() {
  const [count, setCount] = useState(0)
  const [number, setNumber] = useState(Math.floor(Math.random() * 100) + 1)
  const [input, setInput] = useState("")
  const [state, setState] = useState("")
  function largeorsmall(number, input,count) {
    if (input === "") {
      return "";
    }
    if (input < number) {
      return "Small!";
    } else if (input > number) {
      return "Large!";
    } else {
      return `Correct!${count}`;
    }
  } 
  useEffect(() => {
    setState(largeorsmall(number, input, count));
  }, [input]);
  return (
    <>
      <div className='numberbox'>
        {number}
      </div>
      <div>
          Please enter the number
        </div>
      <input className='inputbox' type="number" value={input} onChange={e => {setInput(e.target.value);setCount(count+1)}}/>
      <div className='result'>
        {state}
      </div>
      <button onClick={() => {
        setNumber(Math.floor(Math.random() * 100) + 1);
        setInput("");
        setCount(0);
      }}>reset</button>
    </>
  )
}
export default App
