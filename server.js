const express = require('express');
const session = require('express-session');

const mysql2 = require("mysql2");
const app = express();
const port = 4131

app.use(express.static("static"));
app.use(express.static("static/html"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'zhen0506',
  resave: false,
  saveUninitialized: false
}));

const bcrypt = require('bcrypt');
const saltRounds = 10;

const connection = mysql2.createConnection({
    host: "localhost",
    port: 3306,
    user: "C4131S25S02U87",
    password: "zhen0506",
    database: "C4131S25S02U87",
});

connection.connect(err => {
  if (err) {
    throw err;
  }
  console.log('Connected to MySQL database!');
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "index.html");
});

app.post("/log-in", (req, res) => { 
  const { username, password } = req.body;
  const sql = "SELECT * FROM users WHERE username = ?;";
  connection.query(sql, [username], (error, results) => {
    if (error) {
      res.status(500).send("Internal Server Error");
      return;
    }
    if (results.length === 0) {
      res.status(401).send("Invalid username or password");
      return;
    }
    const user = results[0];
    const match = bcrypt.compareSync(password, user.password);
    req.session.userId = user.id;
    if (!match) {
      res.status(401).send("Invalid username or password");
      return;
    }
    res.status(200).send("Login successful");
  });
});

app.post("/sign-up", (req, res) => {
  const { username, password } = req.body;
  const hash = bcrypt.hashSync(password, saltRounds)
  const sql = "INSERT INTO users (username, password) VALUES (?, ?);";
  connection.query(sql, [username, hash], (error, results) => {
    if (error) {
      res.status(500).send("Username already exists");
      return;
    }
    req.session.userId = results.insertId;
    res.redirect("/todos.html");
  });
});

app.post("/sign-out", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      res.status(500).send("Internal Server Error");
      return;
    }
    res.redirect("/index.html");
  });
});

app.delete("/delete-account", (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).send("Unauthorized");
    return;
  }
  const sql = "DELETE FROM users WHERE id = ?;";
  connection.query(sql, [userId], (error, results) => {
    if (error) {
      res.status(500).send("Internal Server Error");
      return;
    }
    req.session.destroy(err => {
      if (err) {
        res.status(500).send("Internal Server Error");
        return;
      }
      res.redirect("/index.html");
    });
  });
});

app.post("/add-todo", (req, res) => {
  const status = "In Progress";
  const { name, day, time } = req.body;
  const userId = req.session.userId;
  if (!name || !day || !time || !userId) {
    return res.status(400).send("Missing fields");
  }
  const sql = "INSERT INTO todos (name, day, time, status, userId) VALUES (?, ?, ?, ?, ?);";
  connection.query(sql, [name, day, time, status, userId], (error, results) => {
    if (error) {
      res.status(500).send("Internal Server Error");
      return;
    }
    res.redirect("/todos.html");
  });
});

app.post("/change-status/:id", (req, res) => {
  const id = req.params.id;
  const {status} = req.body;
  const sql = "UPDATE todos SET status = ? WHERE id = ?;";
  connection.query(sql, [status, id], (error, results) => {
    if (error) {
      res.status(500).send("Internal Server Error");
      return;
    }
    res.status(200).send("Status updated successfully");
  });
});

app.delete("/delete-todo/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM todos WHERE id = ?;";
  connection.query(sql, [id], (error, results) => {
    if (error) {
      res.status(500).send("Internal Server Error");
      return;
    }
    res.status(200).send("Todo deleted successfully");
  });
});

app.get("/todos", (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).send("Unauthorized");
    return;
  }
  const sql = "SELECT * FROM todos WHERE userId = ?;";
  connection.query(sql, [userId], (error, results) => {
    if (error) {
      res.status(500).send("Internal Server Error");
      return;
    }
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});