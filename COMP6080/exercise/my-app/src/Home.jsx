import { useState, useEffect, use } from 'react'
import { Routes, Route, Link, data } from 'react-router-dom'


function Home() {
    const [count, setCount] = useState(0)
    function resetCount() {
      const x = localStorage.getItem('x');
      if (!x) {
        score();
      }else{
      setCount(0);
      localStorage.setItem('x',0);
      }
    }
    const score = async () => {
      try {
        const response = await fetch('https://cgi.cse.unsw.edu.au/~cs6080/raw/data/info.json');
        const data = await response.json();
        console.log(data.score)
        setCount(data.score);
        localStorage.setItem('x',data.score);

      }
      catch (error) {
        console.log(error);
      }
    }
    useEffect(() => {
      const x = localStorage.getItem('x');
      if (!x) {
        score();
      }else{
        setCount(x);
        console.log("Loaded from localStorage: ", x);
      }
    }, []);
    return (
    <div className='home'> 
      <h1>Welcome to the Home Page</h1>
      <h2>Please choose an option from the navbar.</h2>
      <div>Games won: {count}<button className='homereset' onClick={resetCount}>(reset)</button></div>
    </div>

    )
  }

  export default Home;