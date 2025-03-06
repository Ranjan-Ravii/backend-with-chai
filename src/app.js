import express from "express";
import cors from "cors"; // cors is a middleware that enables cross origin resource sharing. which allows requests from different origins.
import cookieParser from "cookie-parse" // A middleware to parse cookies from incoming HTTP requests.

// Creating an Express app.
const app = express();

// enabling cors 
app.use(cors({
    origin : process.env.cors_origin,
    credentials: true,
}))

// Middleware for Parsing Request Data -> meaning that the data coming from browser or any api, it will be converted into specified formate.
app.use(express.json({ // thir configration change the incoming data into the json file.
    limit : '16kb'
}))

app.use(express.urlencoded({ // this configration is for the parsing the url  that may come from an api or other sources.
    extended : true,
    limit : '16kb'
}))

app.use(express.static("public")) // this configration is for static files like images of pdfs that you may want to store as public

// configration for the cookie parsing 
app.use(cookieParser());

export {app}