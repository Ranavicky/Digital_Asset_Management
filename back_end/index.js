import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';

import dotenv from "dotenv";

dotenv.config();

import route from './routes/route.js';

const app=express();

const url="mongodb+srv://"+process.env.MONGODB_USERNAME+":"+process.env.MONGODB_PASSWORD+"@cluster0.ydhjvpo.mongodb.net/";
// const url='mongodb://127.0.0.1:27017/dam'
mongoose.connect(url);

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/',route);

app.listen(process.env.PORT,()=>{
    console.log("Server started!!");
})