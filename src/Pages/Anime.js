import { useState } from "react";

function Anime() {  
  
  const [dispWarning,setDispWarning]=useState(true);

  const toggleWarning= () => {setDispWarning(!dispWarning)};

  return (
    <div>
      <div className='content-container'>
        <h1>Why is anime the best garbage medium?</h1>
      </div>
      <div className={dispWarning?"warning-container":"warning-container-close"} >Beware spoilers ahead.  Proceed at your own risk.  <button className="close-btn" onClick={toggleWarning}>Spoil me senpai</button></div>
      <div className='content-container'>
        <p>Cat Planet Cuties</p>
      </div>
    </div>
  );
}

export default Anime;
