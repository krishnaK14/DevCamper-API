const path=require('path');
const express=require('express');
const dotenv=require('dotenv');
const morgan=require('morgan');
const colors=require('colors');
const fileupload=require('express-fileupload');
const cookieParser=require('cookie-parser');
const errorHandler=require('./middleware/error');
const connectDB=require('./config/db');

//Load environment variables
dotenv.config({path:'./config/config.env'});

//connect database
connectDB();

//Route files
const bootcamps=require('./routes/bootcamps');
const courses=require('./routes/courses');
const auth=require('./routes/auth');
const users=require('./routes/users');
const reviews=require('./routes/reviews');

const app=express();

//Body Parser
app.use(express.json());

//Cookie Parser
app.use(cookieParser());

//Dev logging middleware
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

//File Uploading
app.use(fileupload());

//set static folders
app.use(express.static(path.join(__dirname,'public')));
//Mount routers
app.use('/api/v1/bootcamps',bootcamps);
app.use('/api/v1/courses',courses);
app.use('/api/v1/auth',auth);
app.use('/api/v1/users',users);
app.use('/api/v1/reviews',reviews);
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