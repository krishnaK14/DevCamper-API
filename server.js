const express=require('express');
const dotenv=require('dotenv');
const morgan=require('morgan');
const colors=require('colors');
const errorHandler=require('./middleware/error');
const connectDB=require('./config/db');

//Load environment variables
dotenv.config({path:'./config/config.env'});

//connect database
connectDB();

//Route files
const bootcamps=require('./routes/bootcamps');

const app=express();

//Body Parser
app.use(express.json());

//Dev logging middleware
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

//Mount routers
app.use('/api/v1/bootcamps',bootcamps);
//error handler
app.use(errorHandler);

const Port=5000 || process.env.PORT;


const server=app.listen(Port,()=> console.log(`The server is running in ${process.env.NODE_ENV} mode on port: ${Port}`.yellow.bold));

//Handle unhandled promise rejections.
process.on('unhandledRejection',(err,promise)=>{
    console.log(`error: ${err.message}`.red);
    //close server and exit process
    server.close(()=>process.exit(1));
});