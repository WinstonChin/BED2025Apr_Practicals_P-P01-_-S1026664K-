const express = require("express");
const app = express();
const PORT = 4000;

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/", (req, res) => {
    res.send("Welcome to Homework API");
  });
  
  app.get("/intro", (req, res) => {
    res.send("I am studying in NP");
  });  
  
  app.get("/name", (req, res) => {
    res.send("Winston");
  });  
  
  app.get("/hobbies", (req, res) => {
    res.send("Sleep");
  });

  app.get("/food", (req, res) => {
    res.send("Chicken rice");
  });
  
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });