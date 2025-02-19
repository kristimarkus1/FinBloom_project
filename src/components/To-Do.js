import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc 
} from "firebase/firestore";
import "../styles/To-Do.css";

const ToDo = () => {

    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editingText, setEditingText] = useState("");

    useEffect(() => {
      const unsubscribeAuth = auth.onAuthStateChanged((user) => {
        if (user) {
          const userRef = doc(db, "users", user.uid);
          const todosRef = collection(userRef, "todos");

          const unsubscribeTodos = onSnapshot(todosRef, (snapshot) => {
            setTasks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
          });

          return () => {
            unsubscribeTodos();
          };
        } else {
          setTasks([]);
        }
      });

      return () => unsubscribeAuth();
    }, []);

    const addTask = async () => {
        if (!newTask.trim()) return;
        if (!auth.currentUser) return console.error("No user logged in");

        try {
          const userRef = doc(db, "users", auth.currentUser.uid);
          const todosRef = collection(userRef, "todos");

          await addDoc(todosRef, {
            text: newTask,
            completed: false,
            createdAt: new Date(),
          });

          setNewTask("");
        } catch (error) {
          console.error("Error adding task:", error);
        }
    };

    const deleteTask = async (id) => {
        if (!auth.currentUser) return console.error("No user logged in");

        try {
          const taskRef = doc(db, "users", auth.currentUser.uid, "todos", id);
          await deleteDoc(taskRef);
        } catch (error) {
          console.error("Error deleting task:", error);
        }
    };

    const toggleTask = async (id, completed) => {
        if (!auth.currentUser) return console.error("No user logged in");

        try {
          const taskRef = doc(db, "users", auth.currentUser.uid, "todos", id);
          await updateDoc(taskRef, { completed: !completed });
        } catch (error) {
          console.error("Error toggling task:", error);
        }
    };

    const startEditingTask = (id, text) => {
        setEditingId(id);
        setEditingText(text);
    };

    const saveEditingTask = async (id) => {
        if (!auth.currentUser) return console.error("No user logged in");

        try {
          const taskRef = doc(db, "users", auth.currentUser.uid, "todos", id);
          await updateDoc(taskRef, { text: editingText });
        } catch (error) {
          console.error("Error updating task:", error);
        }

        setEditingId(null);
    };

    return (
      <div className="todo-container">
        <h2>📌 To-Do List</h2>
        <div className="todo-input">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="new-task-input"
          />
          <button className="add-todo" onClick={addTask}>Add</button>
        </div>
        <ul className="todo-list">
          {tasks.map((task) => (
            <li key={task.id} className="todo-item">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id, task.completed)}
                className="todo-checkbox"
              />
              {editingId === task.id ? (
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="todo-edit-input"
                />
              ) : (
                <span>{task.text}</span>
              )}
              <div className="task-actions">
                {editingId === task.id ? (
                  <button onClick={() => saveEditingTask(task.id)}>Save</button>
                ) : (
                  <button onClick={() => startEditingTask(task.id, task.text)}>Edit</button>
                )}
                <button onClick={() => deleteTask(task.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
}

export default ToDo;