const mongoose = require("mongoose");

const { MONGO_URI } = process.env;

exports.connect = () => {
  // Connecting to the database

  mongoose
    .connect("mongodb+srv://tungtorres23:root@cluster0.a7pdjye.mongodb.net/?retryWrites=true&w=majority" 
    )
    .then(() => {
      console.log("Successfully connected to database");
    })
    .catch((error) => {
      console.log("database connection failed. exiting now...");
      console.error(error);
      process.exit(1);
    });
};