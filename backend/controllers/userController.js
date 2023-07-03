// Controllers are responsible for handling incoming requests 
//and returning responses to the client. 
//A controller's purpose is to receive specific requests for the application.

//import async handler since installed async-handler package
const asyncHandler = require("express-async-handler");

// importing user from database file userModel
const User = require ("D:/web_projects/InventoryManagementApp/backend/userModels/userModels");

// importing JWT
const jwt = require("jsonwebtoken");

// importing bcrypt
const bcrypt = require("bcryptjs");    // rememeber 'js'   ->    bcryptjs



// function for generation of tokens
const generateToken = (id) =>{
   return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn:"1d"});
}; // now generate token for user by calling above fn



// ****    READ    IT       ****

// // user need to add at least user email and password
    // // if not get an email then error
    // // the email is put  in the body part of request 
    
    // if(!req.body.email){
    //     res.status(400);
    //     throw new Error("please add an email"); // this throw err is express error handler
    // } // we will create a new middleware Error handler for handling error
    // res.send("Register User");
    
    // since the process of enteracting with batabase is asynchronous -> async function 
    // for this we will install another npm module -> express-async-handler
    // we will wrap our async fn by this asyncHandler package

    const registerUser = asyncHandler( async (req,res) => {
    const {name,email,password} = req.body;
    
    //Validation by backened
    
    if(!name || !email || !password)
    {
        res.status(400);
        throw new Error("Please fill in all required feilds")
    }
    if(password.length < 6){
        res.status(400);
        throw new Error("Password must at least 6 characters long")
    }// we also need to encrypt the password so that hacker can't easily do their work
     
    //check if user email already exist
    const userExists = await User.findOne({email})
    if(userExists){
        res.status(400);
        throw new Error("Email has Already been Registered !");
    }

    // we get 'User' by importing model

    // Create new User
    const user = await User.create({
        name,
        email,
        password,
    });
    


    // Generate Token 
    const token=generateToken(user._id)
    
    // send HTTP-only cookie
    res.cookie("token", token, {
       path:"/",
       httpOnly:true,
       expires: new Date(Date.now() + 1000*86400),
       sameSite: "none",
       secure: true,
    });



    // if user is created 
    if(user){
        // information we are getting back from database is in form of json
       
        const {_id,name, email, photo, phone, bio} = user;
        // data to be displayed on postman
        res.status(201).json({
            _id,
            name,
            email, 
            photo, 
            phone, 
            bio,
            token,
        });
    }
    else{
        res.staus(400)
        throw new Error("Invalid user data")
    }
});


  // LOGIN user
const loginUser = asyncHandler( async(req,res) => {
   
    const {email, password} = req.body

    // validation Request
    if(!email || !password){
       res.status(400);
       throw new Error("Please add email and password")
    }

    // check if user exists 
    const user = await User.findOne({email})
    // user contain all the information about user not only the email 
    // we are just finding the user using the email feild
    
    if(!user){
        res.status(400);
        throw new Error("User not found, please sign up")
     }

     //User exists, check if password is correct(foe this import bcrypt)
     // bcrypt also has the fucntionality to compare what is saved as raw password before encrypting -> .compare() fucntion
     // 'password' is defined above fetched from frontend and we have to compare it with password in user 
    const passwordIsCorrect = await bcrypt.compare(password, user.password)
    

    //generate a new token for this login and send it to frontend  ....   ->
    // Generate Token 
    const token=generateToken(user._id)
    
    // send HTTP-only cookie
    res.cookie("token", token, {
       path:"/",
       httpOnly:true,
       expires: new Date(Date.now() + 1000*86400),
       sameSite: "none",
       secure: true,
    });

    
    if(user && passwordIsCorrect){
        // destructing the information about the user
        const {_id,name, email, photo, phone, bio} = user;
        // data to be displayed on postman
        res.status(200).json({
            _id,
            name,
            email, 
            photo, 
            phone, 
            bio, 
            token,
        });
    }
    else{
        res.status(400);
        throw new Error("Invalid email or password");
    }

});




// LOGOUT User
const logout = asyncHandler( async (req,res) =>{
  
    // for second parameter -> since we are not create a cookie, we are just modifying it -> so put second parameter as empty string
    res.cookie("token", "", {
        path:"/",
        httpOnly:true,
        expires: new Date(0),   // expire the cookie in zero '0' seconds immediately as logout is fired
        sameSite: "none",
        secure: true,
     });
    return res.status(200).json({message: "Successfully Logged Out"});
});


// USER PROFILE 
const getUser = asyncHandler(async (req,res)=>{
    // protect middle ware gets the access to user which it assigns to the req.user
    const user =await User.findById(req.user._id)

    if(user){
        // destructing the information about the user
        const {_id,name, email, photo, phone, bio} = user;
        // data to be displayed on postman
        res.status(200).json({
            _id,
            name,
            email, 
            photo, 
            phone, 
            bio, 
        });
    }
    else{
        res.status(400);
        throw new Error("User not found");
    }
});




// get LOGIN STATUS
const loginStatus = asyncHandler( async (req,res)=>{
  
    const token = req.cookies.token ;
    if(!token){
        return res.json(false);
    }
    // if token exist firstly Verify it 
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if(verified){
        return res.json(true);
    }
    else{
        return res.json(false);
    }
});





// UPDATDE USER
const updateUser = asyncHandler(async(req,res)=>{
    const user = await User.findById(req.user._id);

    //user found
    if(user){
      // destructing the information about the user
      const {name, email, photo, phone, bio} = user;
      user.email = email;  // email can't be modified
      // set the name given in request or if no name is given( blanked ) then set it to previous name
      user.name=req.body.name || name; 
      user.photo=req.body.photo || photo;
      user.bio=req.body.bio || bio;
      user.phone=req.body.phone || phone;
      // for updating password we will create a special url end point 
      
      //response as updated user data
      const updatedUser = await user.save();
      res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email, 
        photo: updatedUser.photo, 
        phone: updatedUser.phone, 
        bio: updatedUser.bio, 
      })
    }

    //user not found 
    else{
        res.status(404);
        throw new Error("User not Found");
    }
});




// UPDATE USER PASSWORD
const changePassword = asyncHandler(async(req,res) => {
     
     // we need to firstly verify the old password if its right 
     // then only new password must be setted
     // Note =>  changePassword route is a protected route
     // we are ecpecting 3   info from frontend -> old Pass and new Pass and confirm Pass

     // get user using reqid
     const user = await User.findById(req.user._id);
     //get data from frontend

     const {oldPassword, password} = req.body
     //Validate
     
     if(!user)
     {
        res.status(400)
        throw new Error("User Not found, please sign up");
     }

     if(!oldPassword || ! password)   // the fields should not be empty
     {
        res.status(400)
        throw new Error("Please add old Password and new password");
     }
     
     // Check if old password matches with the database password
     const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

     // save new password
     if(user && passwordIsCorrect)
    {
        user.password = password
        await user.save();
        res.status(200).send("Password changed Successfully");
    }
    else{
        res.status(400)
        throw new Error("Old password is Invalid");
    }

});





module.exports = {
    registerUser,
    loginUser,
    logout,
    getUser,
    loginStatus,
    updateUser,
    changePassword,
};