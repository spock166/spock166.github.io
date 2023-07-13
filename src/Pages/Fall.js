import { useCallback } from "react";
import { useState } from "react";

function Fall() {  
      const [height, setHeight] = useState(0);
      const [fallTime, setFallTime] = useState(0);

      const handleChange = (event)=>{
            const g = 32;
            const newVal = event.target.value;
            setHeight(newVal);
            setFallTime(Math.sqrt((2*newVal/g)));
      };

      const calculateFallTime = useCallback(()=>{
            
      },[height]);

      const heightInput=(
            <>
            <form>
            <label >Height (in feet): </label>
            <input autoFocus type="number" id="height" name="height" value={height} onChange={handleChange}/>
            </form>
            </>
      );
            

      return (
      <div className='content-container'>
            {heightInput}
            <p>
                  It will take you {fallTime.toFixed(2)} seconds ({Math.ceil(fallTime/6.0)} turns) to hit the ground.  
            </p>
      </div>
  );
}

export default Fall;

