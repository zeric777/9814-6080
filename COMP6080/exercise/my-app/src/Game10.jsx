import { useEffect, useState } from 'react';
import './App.css';
import { use } from 'react';


function randomnumber(num){
    return Math.floor(Math.random() * 100) + 1;
}
function randomsymbol(symbols){
    const randomIndex = Math.floor(Math.random() * symbols.length);
    return symbols[randomIndex];
}

function Game10() {
    const w =2;
    const [win, setwin] = useState(0);
    const [symbol,setsymbol] = useState(['+','-','*','/']);
    const [num1,setnum1] = useState(0);
    const [num2,setnum2] = useState(0);
    const [symbolcurrent,setsymbolcurrent] = useState('');
    const [input, setInput] = useState("")
    function checkAnswer(num1,num2,input){
        if (symbolcurrent === '+'){
            if (num1 + num2 == Number(input)){
             
                setnum1(randomnumber(num1));
                setnum2(randomnumber(num2));
                setwin(win + 1);
                setInput("");
                const newScore = Number(localStorage.getItem("x") || 0) + 1;
                localStorage.setItem("x", newScore);
            }else{
                alert(`Wrong! You have win${win} times. Try again.`);
                setInput("");
            }
        }else if (symbolcurrent === '-'){
            if (num1 - num2 == Number(input)){

                setnum1(randomnumber(num1));
                setnum2(randomnumber(num2));
                setInput("");
                setwin(win + 1);
                const newScore = Number(localStorage.getItem("x") || 0) + 1;
                localStorage.setItem("x", newScore);
            }else{
                alert(`Wrong! You have win${win} times. Try again.`);
                setInput("");
            }
        }else if (symbolcurrent === '*'){
            if (num1 * num2 == Number(input)){
        
                setnum1(randomnumber(num1));
                setnum2(randomnumber(num2));
                setwin(win + 1);
                setInput("");
                const newScore = Number(localStorage.getItem("x") || 0) + 1;
                localStorage.setItem("x", newScore);
            }else{
                alert(`Wrong! You have win${win} times. Try again.`);
                setInput("");
            }
        }else if (symbolcurrent === '/'){
            if (Math.round(num1 / num2) == Number(input)){
               
                setnum1(randomnumber(num1));
                setnum2(randomnumber(num2));
                setwin(win + 1);
                setInput("");
                const newScore = Number(localStorage.getItem("x") || 0) + 1;
                localStorage.setItem("x", newScore);
            }else{
                console.log(Math.round(num1 / num2));
                alert(`Wrong! You have win${win} times. Try again.`);
                setInput("");
            }
        }   
        // if (num1 + num2 == Number(input)){
        //     alert("Correct!");
        //     setnum1(randomnumber(num1));
        //     setnum2(randomnumber(num2));
        //     setInput("");
        //     const newScore = Number(localStorage.getItem("mathquizscore") || 0) + 1;
        //     localStorage.setItem("x", newScore);
        // }else{
        //     alert("Wrong! Try again.");
        //     setInput("");
        // }
    }
    useEffect(() => {
        setnum1(randomnumber(num1));
        setnum2(randomnumber(num2));
        setsymbolcurrent(randomsymbol(symbol));

    }, []);
    return (<div className="home">
        <h2>Math Quiz</h2>
        <div>{num1} {symbolcurrent} {num2} = <input className='inputbox' type="number" value={input} onChange={e => setInput(e.target.value)}/>
        <button onClick={() => checkAnswer(num1,num2,input)}>Submit</button>
        </div>

    </div>);
}

export default Game10;

