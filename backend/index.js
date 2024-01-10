require("dotenv").config();

const db = require("./database/database");
const app = require("./app");
const { PORT } = process.env;

db.connect();

app.listen(PORT, () => {
  console.log(`App is listening to port: ${PORT}`);
});
