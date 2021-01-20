const express=require('express');
const dotenv=require('dotenv');

//Load environment variables
dotenv.config({path:'./config/config.env'});

const app=express();

const Port=5000 || process.env.PORT;

app.listen(Port,()=> console.log(`The server is running in ${process.env.NODE_ENV} mode on port: ${Port}`));