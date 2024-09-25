
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('./database');


const userId = uuidv4();

const query = `INSERT INTO users (id, name, email, password) VALUES ('${userId}','${name}','${email}','${hashedPassword}')`;

db.run(query,(err) => {
  if (err) {
    console.error('Error creating user:', err);
  } else {
    console.log('User created successfully with email:', email);
  }
  db.close();
});
