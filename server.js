
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyparser = require('body-parser');

//importing routes
const userRoutes = require ("D:/web_projects/InventoryManagementApp/backend/routes/userRoutes.js");
//importing errorhandler middleware
const errorHandler= require("D:/web_projects/InventoryManagementApp/backend/middleWares/errorMiddleware.js");
//importing cookieParser
const cookieParser = require("cookie-parser");





// to create express app
const app=express();

//to include dotenv file
dotenv.config();
 



// Middlewares
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(bodyparser.json());
app.use(cookieParser());
app.use(cors());
//Rotes Middlewares
app.use("/api/users", userRoutes);




// Routes
app.get("/",(req,res)=>{
   res.send("Home page");
});


const PORT=process.env.PORT || 6000 ;


// call errorHandler middleware just before connecting database
app.use(errorHandler)

// Connecting to mongoDb and start server
mongoose
       .connect(process.env.MONGO_URI,)
       .then( () => {
          app.listen( PORT, ()=>{
          console.log(`Server running on port ${PORT}`)
        })
       })
       .catch((err)=>
        console.log(err))
         