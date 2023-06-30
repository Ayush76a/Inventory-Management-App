
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyparser = require('body-parser');

const app=express();

//to include dotenv file
dotenv.config();

const PORT=process.env.PORT || 6000 ;

// Connecting to mongoDb and start server
mongoose
       .connect(process.env.MONGO_URI)
       .then( () => {
          app.listen( PORT, ()=>{
          console.log(`Server running on port ${PORT}`)
        })
       })
       .catch((err)=>
        console.log(err))
       