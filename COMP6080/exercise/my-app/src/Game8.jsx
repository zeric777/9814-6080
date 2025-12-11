import { useState,useEffect } from 'react'
import "./App.css"
const key='x'
function Game8(){
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
        <div className="home">
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
export default Game8