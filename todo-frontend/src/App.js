import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Signup from './components/signUp';
import './App.css'; 

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(null);
  const [todos, setTodos] = useState([]);
  const [isSignup, setIsSignup] = useState(false);
  const [newTodo, setNewTodo] = useState(''); 
  const [newStatus, setNewStatus] = useState('pending');
  const [editingTodoId, setEditingTodoId] = useState(null); 
  const [editTask, setEditTask] = useState(''); 
  const [editStatus, setEditStatus] = useState('pending'); 

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      fetchTodos(savedToken);
    }
  }, []);

  const handleLogin = () => {
    axios.post('http://localhost:3001/login', { email, password })
      .then(response => {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        fetchTodos(response.data.token);
      })
      .catch(error => {
        console.error('Login error:', error);
      });
  };

  const handleSignup = (token) => {
    if (token) {
      setToken(token);
      localStorage.setItem('token', token);
      fetchTodos(token);
    } else {
      setIsSignup(false); 
    }
  };

  const fetchTodos = (token) => {
    axios.get('http://localhost:3001/todos', {
      headers: {
        'Authorization': token
      }
    }).then(response => {
      setTodos(response.data);
    }).catch(error => {
      console.error('Fetch todos error:', error);
    });
  };

  const handleAddTodo = async () => {
    const token = localStorage.getItem('token');
    if (newTodo.trim() === '') return; 
    try {
      await axios.post('http://localhost:3001/todos', { task: newTodo, status: newStatus }, {
        headers: {
          'Authorization': token,
        }
      });
      setNewTodo(''); 
      setNewStatus('pending'); 
      fetchTodos(token); 
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setTodos([]);
  };

  const handleDeleteTodo = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:3001/todos/${id}`, {
        headers: {
          'Authorization': token,
        }
      });
      fetchTodos(token);
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const handleEditTodo = (todo) => {
    setEditingTodoId(todo.id); 
    setEditTask(todo.task); 
    setEditStatus(todo.status); 
  };

  const handleSaveEdit = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`http://localhost:3001/todos/${id}`, { task: editTask, status: editStatus }, {
        headers: {
          'Authorization': token,
        }
      });
      setEditingTodoId(null); 
      fetchTodos(token); 
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  return (
    <div className="card">
      <h1>Todo Application</h1>
      {!token ? (
        isSignup ? (
          <Signup onSignup={handleSignup} />
        ) : (
          <div className='background-image-section'>
            <h2>Login</h2>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
            <button onClick={handleLogin}>Login</button>
            <button onClick={() => setIsSignup(true)}>Go to Signup</button>
          </div>
        )
      ) : (
        <div className="add-todo-section">
          <h2>Your Todos</h2>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="New Todo"
              style={{ flex: 1 }} 
            />
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              style={{ marginLeft: '10px' }}
            >
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="done">Done</option>
            </select>
            <button onClick={handleAddTodo} style={{ marginLeft: '10px' }}>Add Todo</button>
          </div>
          <ul>
            {todos.map(todo => (
              <li key={todo.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '5px' }}>
                {editingTodoId === todo.id ? (
                  <div style={{ display: 'flex', flex: 1 }}>
                    <input
                      type="text"
                      value={editTask}
                      onChange={(e) => setEditTask(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="in progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="done">Done</option>
                    </select>
                    <button onClick={() => handleSaveEdit(todo.id)} style={{ marginLeft: '10px' }}>Save</button>
                  </div>
                ) : (
                  <>
                    <span style={{ flex: 1 }}>{todo.task} - {todo.status}</span>
                    <button onClick={() => handleEditTodo(todo)} style={{ marginLeft: '10px' }}>Edit</button>
                  </>
                )}
                <button className="delete-button" onClick={() => handleDeleteTodo(todo.id)}>Delete</button>

              </li>
            ))}
          </ul>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
}

export default App;
