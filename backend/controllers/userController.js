// Controllers are responsible for handling incoming requests 
//and returning responses to the client. 
//A controller's purpose is to receive specific requests for the application.

//import async handler since installed async-handler package
const asyncHandler = require("express-async-handler");

// importing user Model
const User = require ("D:/web_projects/InventoryManagementApp/backend/userModels/userModels");
// importing JWT
const jwt = require("jsonwebtoken");
// importing bcrypt
const bcrypt = require("bcryptjs");    // rememeber 'js'   ->    bcryptjs
// importing token model
const Token = require("../userModels/tokenModel");

// crypto for token of forgot password controller
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");



// function for generation of tokens
// NOTE : "jwt.sign( )"  is used to create jsonWebTokens
const generateToken = (id) =>{
   return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn:"1d"});
}; // now generate token for user by calling above fn



// ****    READ    IT       ****

// // user need to add at least user email and password
    // // if not get an email then error
    // // the email is put  in the body part of request 
    
    // if(!req.body.email){
    //     res.status(400);
    //     throw new Error("please add an email");       NOTE: // this throw err is express's error handler
    // }
         // we will create a new middleware Error handler for handling error
         // This will help us to locate the error easily while developing !!
    // res.send("Register User");
    
    // since the process of enteracting with batabase is asynchronous -> async function 
    // for async we need to use the TRY-Catch Blocks but if we want not to use them then 
    // use Async-Handler package
    // for this we will install another npm module -> express-async-handler
    // we will wrap our async fn by this asyncHandler package
 

    //Register User
    const registerUser = asyncHandler( async (req,res) => {
    const {name,email,password} = req.body;
    
    //Validations by backened :-

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
    }// we get 'User' by importing model
    
    // NOTE : encryption with bcrypt has been done while creating model from schema 
    // in userModels.js file since for ForgetPassword we needed to encrypt the password again

    // Create new User -> model.create({properties}) are used to create a new model object 
    const user = await User.create({
        name,
        email,
        password,
    });
    
    // Generate Token 
    const token=generateToken(user._id)
    
    // send HTTP-only cookie to frontend
    res.cookie("token", token, {
       path:"/",
       httpOnly:true,
       expires: new Date(Date.now() + 1000*86400),   // 1 Day
       sameSite: "none",
       secure: true,
    });

    // if user is created 
    if(user){
        // information we are getting back from database is in form of json
        const {_id,name, email, photo, phone, bio} = user;
        // data to be displayed on postman(not includes Password)
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
    // if exist then Using its email search for the user in database and
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

    if(passwordIsCorrect){
    // Send Cookie Only if the Password is Correct
    // send HTTP-only cookie 
    res.cookie("token", token, {
       path:"/",
       httpOnly:true,
       expires: new Date(Date.now() + 1000*86400),
       sameSite: "none",
       secure: true,
    });
    }

    
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
// For logging user Out -> Change the Token(send as cookie)
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



// USER PROFILE (get req)
// Only logged in user can see their profile => Protect with middleWare
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





// UPDATDE USER (A patch Request)
// Only Logged In user can Update their profile => Protect with Middleware
const updateUser = asyncHandler(async(req,res)=>{
    // MiddleWare will be giving us the "req.user" by confirming its login
    const user = await User.findById(req.user._id);

    //user found
    if(user){
      // destructing the information about the user
      const {name, email, photo, phone, bio} = user;
      user.email = email;  // email can't be modified
      // set the name given in request or if no name is given( blanked ) then set it to previous name
      // if no data is present in body for corresponding field then OR part will be assigned
      user.name=req.body.name || name; 
      user.photo=req.body.photo || photo;
      user.bio=req.body.bio || bio;
      user.phone=req.body.phone || phone;
      // for updating password we will create a special url end point 
      
      // response as updated user data
      // **NOTE**  : Model.save() is used to update the Data
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
// Only Logged In user can Update their Password => Protect with Middleware
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



// Forget Password
// steps to do make the forgetPassword controller 
// 1. user Interface -> user clicks on forget password and enter his email and click on get reset email
// 2. a email is send to user at his email form the backend
// 3. email contains the reset link which is nothing but the URL of our email following a Long Token string
// 4. we will save this token in our database (this token is for user validifaction and timeout the change pass req)
// 5. when user clicks the link then the reset link(containing token in Url as Params) is send :-> we will compare the token in our database with the reset string we got as params
// 6. if they match change the password

// now if the verification is Done -> now a page of reset password opens up
// Reset password
// 1. user will Not Enter his Old Password !!(since we are verifying his email)
// 2. user will have to just enter "New Password" and "Confirm New Password"


// Forget Password Steps
// 1. Create forgot Password route
// 2. create token Model
// 3. Create Email Sender fucntion( Using ayush760a@outlook.com and Pass: PlumX457)
//    a. Install nodemailer
//    b. make an outlook email
//    c. set emailHost, 
// 4. Create Contorller fucntion


// Forgot Pass controller
const forgotPassword= asyncHandler(async(req, res) => { 
    // take the email of user 
    const {email} = req.body;

    const user= await User.findOne({email});
    if(!user){
        res.status(404);
        throw new Error("User do not exist");
    }
    
    // if user click the link multiple times then many token will be formed
    // so if a token in present corresponding to a user already then delete it
    // delete token if it exist in the database
    let token = await Token.findOne({userId: user._id});
    if(token){
        await token.deleteOne();
    }
     
    // if user exist we will create a token for the reset mail link 
    // create Reset Token(Using Crypto module inside availbe inside express -> similar to bcrypt)
    // token will contain a string and the user Id
    let resetToken = crypto.randomBytes(32).toString("hex") + user._id
    console.log(resetToken);
    
    // Hash the token before saving to Db
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    // console.log(hashedToken); 
    
    // now we save the Hashed form of Token to database in Token model
    // instead of using Token.create({properties}) can use the below way:-

    await new Token({
        userId: user._id,
        token: hashedToken,
        createdAt: Date.now(), 
        expiresAt: Date.now() + 30 *(60 * 1000)       // token expires in 30 minutes
    }).save();



    // Construct Reset Url
    // reset url = frontened Url + token
    // frontend Url in .env file
    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
    console.log(process.env.FRONTEND_URL);

    // ResetEmail
    const message= `
       <h2>Hello ${user.name}</h2>
       <p>Please use the link below to reset your password</p>
       <p>This reset link is valid for 30 minutes.</p>

       <a href=${resetUrl} clicktracking=off> ${resetUrl} </a>

       <p>Regards...</p>
       <p>Pinvent App</p>
    `;

     const subject = "Password Reset Request"
     const send_to = user.email
     const sent_from = process.env.EMAIL_USER
     
     try{
        await sendEmail(subject, message, send_to, sent_from)
        res.status(200).json({suceess:true, message:"Reset Email Sent"})
     }
     catch(err){
        console.log(err); 
        res.status(500);
        throw new Error("Email not Sent, Please try again")
     }
});


// Reset Password Controller
    const resetPassword = asyncHandler(async(req,res) => {
        // we will get params from the url
        // and the password from the body 

        const {NewPassword, confirmPassword} = req.body
        const {resetToken} = req.params
        
        if(confirmPassword !== NewPassword){
            res.send("ConfirmPassword not Matches with NewPassword !!!");
        }
        else{
        //NOTE : we stored the hashed form of Token But we sended to mail only the normal string token
        // so we need to hash the token we got from the url params 
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        
        // now both the tokens in database in url are in their hashed form => Now just find 
        // find token in the databse
        // if found the token then we will extract the user id From Token Model 
        // checking if the token is greater than the current time
        const userToken = await Token.findOne({
           token: hashedToken,
           expiresAt: {$gt : Date.now()}
        })

        if(!userToken){
            res.status(404);
            throw new Error("Invalid or Expired Token");
        }
        // Find the user if the token is founded in database from the token's userId 
        const user = await User.findOne({_id: userToken.userId})
        // update the password
        user.password = NewPassword
        // then in order to updates go to the database => Use .save()
        await user.save();
        res.status(200).send("Password reset Successful, Please Login");
      }
    })



module.exports = {
    registerUser,
    loginUser,
    logout,
    getUser,
    loginStatus,
    updateUser,
    changePassword,
    forgotPassword,
    resetPassword
};