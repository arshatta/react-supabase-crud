import { useEffect, useState } from "react";
import './App.css';
import supabase from './supabase-client';

function App() {
  const [todoList, setTodoList] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from("TodoList")
      .select("*");
    if (error) {
      console.error("Error fetching todos:", error);
    } else {
      setTodoList(data);
    }
  };

  const addTodo = async () => {
    const todoItem = {
      name: newTodo.trim(),
      isCompleted: false,
    };
    setNewTodo('');
    if (!todoItem.name) return;

    const { data, error } = await supabase
      .from("TodoList")
      .insert([todoItem])
      fetchTodos()
      .single();

    if (error) {
      console.error("Error adding todo:", error);
    } else {
      setTodoList(prev => [...prev, data]);
      setNewTodo("");
    }
  };

  const completeTask = async (id, isCompleted) => {
    // Здесь мы не захватываем data, потому что обновляем локальный стейт вручную
    const { error } = await supabase
      .from("TodoList")
      .update({ isCompleted: !isCompleted })
      .eq("id", id);

    if (error) {
      console.error("Error toggling task:", error);
      return;
    }
    setTodoList(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, isCompleted: !isCompleted } : todo
      )
    );
  };

  const deleteTask = async (id) => {
    // Точно так же: оставляем только error
    const { error } = await supabase
      .from("TodoList")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting task:", error);
      return;
    }
    setTodoList(prev => prev.filter(todo => todo.id !== id));
  };

  return (
    <div className="App">
      <h1>Todo List</h1>

      <div className="todo-input">
        <input
          type="text"
          placeholder="New Todo..."
          value={newTodo}
          onChange={e => setNewTodo(e.target.value)}
        />
        <button onClick={addTodo} disabled={!newTodo.trim()}>
          Add Todo
        </button>
      </div>

      <ul className="todo-list">
        {todoList.map(todo => (
          <li key={todo.id} className={todo.isCompleted ? "completed" : ""}>
            <span>{todo.name}</span>
            <button onClick={() => completeTask(todo.id, todo.isCompleted)}>
              {todo.isCompleted ? "Undo" : "Complete"}
            </button>
            <button onClick={() => deleteTask(todo.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
