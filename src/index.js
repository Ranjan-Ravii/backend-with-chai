import mongoose from 'mongoose';
import express from "express";

import dotenv from "dotenv"
import connectDB from './database/index.js';

dotenv.config({
    path : './env'
})

connectDB();


/*
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