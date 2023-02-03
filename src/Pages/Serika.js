import { useState } from "react";
import Interpreter from "../Components/Serika/Interpreter";
import Onoe from "../Components/Serika/Onoe_Serika.webp";

function Serika() {  
  const [inputText,setInputText] = useState("");

  const handleChange=({target})=>{
    setInputText(target.value)
  };

  return (
    <div>
      <div className='content-container'>
        <h1>Heya!</h1>
        <p>Serika is an interpreter for the <a href="https://github.com/alexacallmebaka/kobayashi">kobayashi markup language</a>.  Originally she was coded up in <a href="https://github.com/spock166/serika">Perl</a>, but now she can real boot kobayashi markup in real time (<a href="https://chaoschild2.fandom.com/wiki/Real-booting">Here be Chaos;Child spoilers</a>).</p>
        <p>As hinted Serika is named after a character in the Chaos;Child visual novel.</p>
        <div style={{justifySelf:"center", alignItems:"center"}}>
        <img src={Onoe} style={{width:"160px"}}></img>
        <p>"Let's code okay!"</p>
        </div>
        
      </div>
      <div className='content-container row-container'>
        <div className='column-container serika-column'>
            Input:
            <textarea autoFocus rows="28" cols="40" wrap="hard" value={inputText} onChange={handleChange}></textarea>
        </div>
        <div className="column-container serika-column">
            Output:
            <Interpreter input={inputText}/>
        </div>
      </div>
    </div>
  );
}

export default Serika;
