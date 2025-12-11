import { useRef, useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'



function App() {
  const [count, setCount] = useState(0)
  const [word, setWord] = useState("good")
  const [worddict, setWorddict] = useState(["apple","banana","orange","grape","watermelon","pineapple","strawberry","blueberry","kiwi","mango","peach","pear","plum","cherry","apricot","coconut","fig","pomegranate","raspberry","blackberry","cranberry","date","dragonfruit","jackfruit","lychee","papaya","persimmon","quince","tangerine"])
  const [input, setInput] = useState("")

  const start = useRef(Date.now());
  function Click() {
    setCount(0);
    start.current = Date.now();
    //choose a random word from worddict
    const randomIndex = Math.floor(Math.random() * worddict.length);
    const random =  Math.floor(Math.random());
    console.log("random",random);
    setWord(worddict[randomIndex]);
    setInput("");

  }
  useEffect(() => {
    const timer = setInterval(() => {
      setCount((Date.now() - start.current) / 1000);
    }, 10); 
    console.log(input);
    if (input === word) {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [input]);

  return (
    <>
      <div className='blackbox'>
        <div>
          Please enter the following word as fast as possible
        </div>
        <div className='wordbox'>
          {word}
        </div>
        <input className='inputbox' type="text" value={input} onChange={e => setInput(e.target.value)}/>
        <button onClick={Click}>reset</button>
        <div className='time'>
          Elasped time: {count.toFixed(3)} seconds
        </div>
      </div>
    </>
  )
}

export default App
