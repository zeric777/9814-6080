import { useState, useEffect, use } from 'react'
import { Routes, Route, Link, data } from 'react-router-dom'
import './App.css'


const key='win'
function Blanko(){
    const [score,setscore]=useState(null);
    const [all,setall]=useState([
        'the fat cats',
        'larger frogs',
        'banana cakes',
        'unsw vs usyd',
        'french toast',
        'hawaii pizza',
        'barack obama',
    ]);
    const [num,setnum]=useState(0);
    const [blankIdx, setBlankIdx] = useState([]);
    const [right,setright]=useState({});
    const [answers, setAnswers] = useState({});
    useEffect(() => {
        initn();
    }, []); 
    function initn(){
        const n=Number(localStorage.getItem(key));
        setscore(n);
        const nu=Math.floor(Math.random() * 7);
        setnum(nu);
        const str = all[nu]
        const positions = []
        for (let i = 0; i < str.length; i++) {
            if (str[i] !== ' ') {
                positions.push(i);
            }
        }
        positions.sort(() => Math.random() - 0.5)
        const three = positions.slice(0, 3)
        setBlankIdx(three)
        const mapping = {};
        for (const idx of three) {
            mapping[idx] = str[idx];   
        }
        setright(mapping);
    } 
    console.log(right);
    function add() {
        setscore(prev => {
            const next = prev + 1;
            localStorage.setItem(key, String(next));
            return next;
        });
    }

    function handleChange(index, raw) {
        // 只保留最后一个字符
        const val = raw.slice(-1);

        const newAnswers = {
        ...answers,
        [index]: val,
        };
        setAnswers(newAnswers);

        // 每次输入后检查一下是否全部填满且正确
        compare(newAnswers);
    }
    function compare(currentAnswers) {
        // 1. 检查 3 个空位是否都填了东西
        const allFilled = blankIdx.every(i => {
        const v = (currentAnswers[i] || '').trim();
        return v !== '';
        });
        if (!allFilled) {
        // 还没填完 3 个，就先不判
        return;
        }
        // 2. 检查是否全部正确（忽略大小写）
        const allCorrect = blankIdx.every(i => {
        const user = (currentAnswers[i] || '').toLowerCase();
        const correct = (right[i] || '').toLowerCase();
        return user === correct;
        });

        if (allCorrect) {
        alert('Correct!');
        add();   // 分数 +1
        initn(); // 开始下一题
        } else {
        alert('Try again!');
        // 可以选择不 reset，让他继续改；这里我不重置
        }
    }

    const phrase = all[num]
    return(
        <div className="dash">
            <div>Blanko</div>
            <div className="blanko_dis">
                {phrase.split('').map((item,index)=>{
                    if (item === ' ') {
                    return (
                    <div className="each" key={index}>{' '}</div>
                    )
                }
                if (blankIdx.includes(index)) {
                    return (
                      <div className="each" key={index}>
                        <input maxLength={1} value={answers[index] || ''}
                            onChange={e => handleChange(index, e.target.value)}/>
                      </div>
                    )
                }
                return (
                    <div className="each" key={index}>{item}</div>
                        )
                })}
            </div>
                <button onClick={initn}>reset</button>
            </div>
                )
            }


function Slido() {
  const [state, setState] = useState([[0,2,1],[3,4,5],[6,7,8]]);
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
    const winstate = [[0,1,2],[3,4,5],[6,7,8]];
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
  useEffect(() => {
    const shuffled = randomShuffle(state);
    setState(shuffled);
  }, []);
  useEffect(() => {
    if (isWin(state)) {
      alert('You win!');
      const x = localStorage.getItem('x') || 0;
      const newScore = Number(x) + 1;
      localStorage.setItem('x', newScore);
    }
  }, [state]);
  return (<>
        <div className='grid'>
          <button className="reset" onClick={() => {setState(randomShuffle(state))}}>Reset</button>
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
      </>)
}

function Tetro() {
  return <h2>Tetro Page</h2>
}



function App() {
  const x = localStorage.getItem('x') || 0;
  const [count, setCount] = useState(0)
  //home page
  function resetCount() {
    const x = localStorage.getItem('x');
    if (!x) {
      score();
    }else{
    setCount(0);
    localStorage.setItem('x',0);
    }
  }
  function Home() {
    return (
    <div className='home'> 
      <h2>Please choose an option from the navbar.</h2>
      <div>Games won: {count}<button className='homereset' onClick={resetCount}>(reset)</button></div>
      {/* <button onClick={() => {setCount(c => c + 1);localStorage.setItem('x',count)}}>Increment</button> */}
      
    </div>

    )
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
  // useEffect(() => {
  //   localStorage.setItem('x', count);
  // }, [count]);

  return (
    <>
    <div className="App">
      <div className="Document"> 
        <div className="header">
          <img src="./src/assets/react.svg" className="Logo" />
          <div className="nav-large">
            <Link to="/">Home</Link> ｜
            <Link to="/blanko">Blanko</Link> ｜
            <Link to="/slido">Slido</Link> ｜
            <Link to="/tetro">Tetro</Link>
          </div>
          <div className="nav-small">
            <Link to="/">H</Link> ｜
            <Link to="/blanko">B</Link> ｜
            <Link to="/slido">S</Link> ｜
            <Link to="/tetro">T</Link>
          </div>
        </div>
        <div className='footer'></div>
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blanko" element={<Blanko />} />
        <Route path="/slido" element={<Slido />} />
        <Route path="/tetro" element={<Tetro />} /> 
      </Routes>
    </div>
    </>
  )
}

export default App
