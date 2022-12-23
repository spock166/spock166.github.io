export const Task = (props) => {
    return (
    <div className="task">
        <h2 style={{"text-decoration": props.completed?"line-through":""}}>{props.taskName} <button onClick={() => props.handleComplete(props.id)}>Complete Task</button> <button onClick={() => props.handleDelete(props.id)}>X</button></h2>
    </div>
    );
}