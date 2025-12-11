import { useState, useEffect, use } from 'react'
import { Routes, Route, Link, data } from 'react-router-dom'
import './App.css'
import Home from './Home.jsx'
import Game1 from './Game1.jsx'
import Game2 from './Game2.jsx'
import Game3 from './Game3.jsx'
import Hanoi from './Game4.jsx'
import Game5 from './Game5.jsx'
import Game6 from './Game6.jsx'
import Game7 from './Game7.jsx'
import Game8 from './Game8.jsx'
import Game9 from './Game9.jsx'
import Game10 from './Game10.jsx'
import Game11 from './Game11.jsx'
import Game12 from './Game12.jsx'
import Game13 from './Game13.jsx'
import Game14 from './Game14.jsx'
import Game15 from './Game15.jsx'
import Game16 from './Game16.jsx'






function App() {
  
  return (
    <>
      <div className="Document"> 
        <div className="header">
          <img src="./src/assets/react.svg" className="Logo" />
          <div className="nav-large">
            <Link to="/">Home</Link> ｜
            <Link to="/game1">Puzzle</Link> ｜
            <Link to="/game2">Tic tac toe</Link> ｜
            <Link to="/game3">Snake</Link> ｜
            <Link to="/game4">Hanoi</Link> ｜ 
            <Link to="/game5">Guess number</Link> ｜ 
            <Link to="/game6">High low</Link> ｜ 
            <Link to="/game7">扫雷Minesweeper</Link> ｜ 
            <Link to="/game8">Blanko</Link> ｜
            <Link to="/game9">Russia</Link> ｜
            <Link to="/game10">Math quiz</Link> ｜
            <Link to="/game11">Car block</Link> ｜
            <Link to="/game12">timer</Link> ｜
            <Link to="/game13">puzzle2</Link> ｜
            <Link to="/game14">puzzle3</Link> ｜
            <Link to="/game15">frog</Link> ｜
            <Link to="/game16">frog2</Link>
          </div>
          {/* <div className="nav-small">
            <Link to="/">H</Link> ｜
            <Link to="/game1">1</Link> ｜
            <Link to="/game2">2</Link> ｜
            <Link to="/game3">3</Link>
          </div> */}
        </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game1" element={<Game1 />} />
        <Route path="/game2" element={<Game2 />} />
        <Route path="/game3" element={<Game3 />} /> 
        <Route path="/game4" element={<Hanoi />} /> 
        <Route path="/game5" element={<Game5 />} /> 
        <Route path="/game6" element={<Game6 />} /> 
        <Route path="/game7" element={<Game7 />} /> 
        <Route path="/game8" element={<Game8 />} /> 
        <Route path="/game9" element={<Game9 />} />
        <Route path="/game10" element={<Game10 />} />
        <Route path="/game11" element={<Game11 />} />
        <Route path="/game12" element={<Game12 />} />
        <Route path="/game13" element={<Game13 />} />
        <Route path="/game14" element={<Game14 />} />
        <Route path="/game15" element={<Game15 />} />
        <Route path="/game16" element={<Game16 />} />

      </Routes>

      <div className='footer'></div>
    </div>
  </>
  )
}

export default App
