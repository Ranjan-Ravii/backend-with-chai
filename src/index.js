import mongoose from 'mongoose';
import express from "express";

import dotenv from "dotenv"
import connectDB from './database/index.js';
import { app } from './app.js';

dotenv.config({
    path : './.env'
})

connectDB()
//once the database is connected it return the promises and we can handle it like. 
.then(() => {
    const port = process.env.PORT || 8000;
    app.listen(port, () => {// while listen the app.listen take two argunemnts port and a call back function
        console.log(`Server is running at port: ${port}`);
    });

    // here again there comes any chance of error so we can handle the error likewise.
    app.on("error", (err) => {
        console.error("Server error:", err);
    });
})
.catch((err) => {
    console.error("Failed to start server:", err);
});



/*

//this is another way to connect database.

const app = express();
;(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (err) => {
            console.log("Error: ", err);
            throw err;
        })

        app.listen(process.env.PORT, ()=>{
            console.log(`app is listening on port ${process.env.PORT}`);
        })
    }catch(error) {
        console.log("Error: ", error);
        throw error;
    }
})()

*/