const { mongoDBURL } = process.env;

const mongoose = require("mongoose");

exports.connect = () => {
    mongoose
    .connect(mongoDBURL)
    .then(() => {
        console.log('App connected to database');
    })
    .catch((error) => {
        console.log(error)
    });
}
