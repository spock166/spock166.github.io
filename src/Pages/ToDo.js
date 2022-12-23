import '../App.css';
import ToDoUtil from '../Components/ToDo/ToDoUtil';


function ToDo() {
  return (
    <div>
      <div className="content-container">
        <h1>What needs to be done?</h1>
        <ToDoUtil/>
      </div>
    </div>
  );
}

export default ToDo;
