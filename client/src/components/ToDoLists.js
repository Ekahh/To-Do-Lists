import React, { useState, useEffect } from "react";
import axios from "axios";

const ToDoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    // Get todos from API
    axios
      .get("http://localhost:5000/todos", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setTodos(res.data));
  }, []);

  const handleSubmit = () => {
    axios
      .post(
        "http://localhost:5000/todos",
        { title: newTodo },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      )
      .then((res) => {
        setTodos([...todos, { title: newTodo }]);
        setNewTodo("");
      });
  };

  return (
    <div>
      <h2>To-Do List</h2>
      <input
        type="text"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
      />
      <button onClick={handleSubmit}>Add To-Do</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default ToDoList;
