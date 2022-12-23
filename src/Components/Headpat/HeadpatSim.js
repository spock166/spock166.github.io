import { useState } from "react";
import persyContent from "./PersyContent.png";
import persyHappy from "./PersyHappy.png";
import '../../App.css';

function HeadpatSim()
{
    const [headpats, setHeadpats] = useState(0);
    const [currentPersy, setPersy] = useState(persyContent);

    const patHead = () => {
        setHeadpats(headpats+1);
        setPersy(persyHappy);
        setTimeout(()=>{setPersy(persyContent);},250);   
    }

    return(
    <div>
        <div className="persy-container">
            <div className="hitbox-container" onClick={patHead}></div>
            <img alt="Pat da head" src={currentPersy}/>
        </div>
        <div>
            <button className="pat-btn" onClick={patHead}>Headpat</button>
            <p>Headpats: {headpats}</p>
        </div>
    </div>);
}

export default HeadpatSim;