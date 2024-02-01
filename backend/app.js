const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const userRouter = require("./routes/userRoutes");
const voteRouter = require("./routes/voteRoutes");

const app = express();

// MIDDLEWARES
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ROUTES
app.use("", userRouter);
app.use("", voteRouter);
app.get("/", (request, response) => {
  console.log(request);
  return response.status(234).send("Backend main page");
});

module.exports = app;
