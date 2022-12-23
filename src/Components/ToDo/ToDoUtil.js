import React, {useState} from 'react';
import {Task} from './Task';
import '../../App.css';


function ToDoUtil() {
  const [todoList, setTodoList] = useState([]);
  const [newTask, setNewTask] = useState("");

  const handleChange = (event) => {
    setNewTask(event.target.value);
  };

  const addTask = () => {
    const task={
      id: todoList.length === 0 ? 1 : todoList[todoList.length - 1].id + 1,
      taskName: newTask,
      completed: false,
    };

    setTodoList([...todoList, task]);
  };

  const completeTask = (id) => {
    setTodoList(
        todoList.map((task)=>{
            if(task.id===id){
                return {...task, completed:true};
            }else{
                return task;
            }
        })
    )
  };

  const deleteTask = (id) => {
    setTodoList(todoList.filter((task)=>task.id !== id));
  };
  

  return (
    <div>
        <div className = "addTask">
          <input onChange={handleChange}/>
          <button onClick={addTask}>Add Task</button>
        </div>
        <div className = "list">
          {todoList.map((task)=>{
            return <Task taskName={task.taskName} id={task.id} completed={task.completed} handleComplete = {completeTask} handleDelete={deleteTask}/>;
          })}
        </div>
    </div>
  );
}

export default ToDoUtil;
