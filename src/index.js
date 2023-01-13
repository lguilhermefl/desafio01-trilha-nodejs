const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).send({ error: "User not found" });
  }

  request.user = user;

  return next();
}

function checksExistsTodo(request, response, next) {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).send({ error: "Todo not found!" });
  }

  request.todo = todo;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const usernameAlreadyExists = users.some(
    (user) => user.username === username
  );

  if (usernameAlreadyExists) {
    return response.status(400).send({ error: "Username already exists!" });
  }

  const id = uuidv4();
  const user = { id, name, username, todos: [] };
  users.push(user);

  response.status(201).send(user);
});

app.use(checksExistsUserAccount);

app.get("/todos", (request, response) => {
  const { user } = request;

  response.status(200).send(user.todos);
});

app.post("/todos", (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  response.status(201).send(todo);
});

app.put("/todos/:id", checksExistsTodo, (request, response) => {
  const { title, deadline } = request.body;
  const { todo } = request;

  todo.title = title;
  todo.deadline = new Date(deadline);

  response.sendStatus(201);
});

app.patch("/todos/:id/done", checksExistsTodo, (request, response) => {
  const { todo } = request;

  todo.done = true;

  response.sendStatus(201);
});

app.delete("/todos/:id", checksExistsTodo, (request, response) => {
  const { user, todo } = request;

  user.todos.splice(todo, 1);

  response.sendStatus(204);
});

module.exports = app;
