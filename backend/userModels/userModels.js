const mongoose = require('mongoose');

//import bcrypt since installed bcryptjs package
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
     name:{
        type:String,
        required:[true, "Please add a name"]
     },
     email:{
        type: String,
        required: [true,"Please add an email"],
        unique: true,
        trim: true,
        // we have to ****match**** the entered email for validation
        // type *****regex for email javascript***** on google and search on stackoverflow and copy the .match syntax
        match:[
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please enter a valid email"
        ]
     },
     password:{
        type : String,
        required: [true,"Please add Password"],
        minLength: [6,"Password must be at least of 6 characters"],
      //   maxLength: [23,"Password can't be more than of 23 characters"],
     },
     photo:{
        type : String,
        required: [true,"Please add Photo"],
        // what if user don't want to add a photo then we use default
        default: "../users_icon.webp"
     },
     phone:{
        type : String,
        default: "+91",
     },
     bio:{
        type:String,
        default:"bio",
        maxLength:[250, "Bio must not be more than 250 characters"],
     },
} , {
    timestamps: true,
});



//Encrypt Password before saving to DB
    // salts are the material fillings that help to encrpyt our password
    // creating salts

    // .pre will fire when any data(field) of user is modified(or saved) in database
    // 'next' passes control to the next matching route. 
   
    userSchema.pre("save",async function(next){
      
      // if fields other than password are modified the control will jump to next statement
      if(!this.isModified("password")) {
         return next();
      }
 

      //Hashed Password
      const salt = await bcrypt.genSalt(10);  // 10 => length of salt
      // hash the previous password and in creating user ****see just below comment**** set the password as : hashedPassword

      // since password was present in userController.js file as a variable but in this file its only a property ->  so using 'this' keyword
      // this tell file that we are reffering to the 'password' in ohter file
      const hashedPassword = await bcrypt.hash(this.password, salt)
      
      //modify the usercontroller 'password'
      this.password=hashedPassword;

      //call next fn 
      next();
   });


const User = mongoose.model("User", userSchema); 
module.exports = User; 