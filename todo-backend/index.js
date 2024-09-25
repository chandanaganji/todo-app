
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('./database');
const cors = require('cors');


const app = express();
app.use(cors());
const PORT = 3001;
const SECRET = 'your_jwt_secret';

app.use(express.json());


function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Signup Route
app.get('/signup', cors(), (req, res) => {
  console.log('entered signup router')
  const { name, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);
  const userId = uuidv4();

  const query = `INSERT INTO users (id, name, email, password) VALUES ('${userId}','${name}','${email}','${hashedPassword}')`;
  db.run(query, (err) => {
    if (err) return res.status(400).send({ message: 'User already exists or error occurred' });

    const token = jwt.sign({ userId }, SECRET, { expiresIn: '1h' });
    res.status(201).send({ token });
  });
});

app.post('/', cors(), (req, res) => {
    res.send('Express server is up and running!');
    console.log('entered into welcome')
  });

// Login Route
app.post('/login', cors(), (req, res) => {
    console.log(`entered into login ${req.body}`)
  const { email, password } = req.body;
  const query = `SELECT * FROM users WHERE email = '${email}'`;
  db.get(query,(err, user) => {
    if (err || !user) return res.status(404).send({ message: 'User not found' });

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) return res.status(401).send({ message: 'Invalid password' });

    const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '1h' });
    res.send({ token });
  });
});

// Create Todo
app.post('/todos', cors(), authenticateToken, (req, res) => {
  const { task } = req.body;
  const taskId = uuidv4();
  const query = `INSERT INTO todos (id, user_id, task) VALUES ('${taskId}','${req.user.userId}','${task}')`;

  db.run(query, (err) => {
    if (err) return res.status(400).send({ message: 'Error creating task' });
    res.status(201).send({ message: 'Task created' });
  });
});

// Get Todos
app.get('/todos', cors(), authenticateToken, (req, res) => {
  const query = `SELECT * FROM todos WHERE user_id = '${req.user.userId}'`;
  db.all(query, (err, rows) => {
    if (err) return res.status(400).send({ message: 'Error fetching tasks' });
    res.send(rows);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.post('/signup', cors(), (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);
    const userId = uuidv4();
  
    const query = `INSERT INTO users (id, name, email, password) VALUES ('${userId}','${name}','${email}','${hashedPassword}')`;
    db.run(query, (err) => {
      if (err) {
        console.error('Error during signup:', err);
        return res.status(400).send({ message: 'User already exists or error occurred' });
      }
  
      const token = jwt.sign({ userId }, SECRET, { expiresIn: '1h' });
      res.status(201).send({ token });
    });
  });

  // Delete Todo
app.delete('/todos/:id', authenticateToken, (req, res) => {
    const query = `DELETE FROM todos WHERE id = '${req.params.id}' AND user_id = '${req.user.userId}';`;
    console.log(query)
    db.run(query, (err) => {
      if (err) return res.status(400).send({ message: 'Error deleting task' });
      res.send({ message: 'Task deleted' });
    });
  });
  
  // Update Todo Status
  app.put('/todos/:id', authenticateToken, (req, res) => {
    const { status } = req.body; 
    const query = `UPDATE todos SET status = '${status}' WHERE id = '${req.params.id}' AND user_id = '${req.user.userId}'`;
  
    db.run(query, (err) => {
      if (err) return res.status(400).send({ message: 'Error updating task status' });
      res.send({ message: 'Task status updated' });
    });
  });
  