//import async handler since installed async-handler package
const asyncHandler = require("express-async-handler");
// importing user from database file userModel
const User = require ("D:/web_projects/InventoryManagementApp/backend/userModels/userModels");
// importing JWT
const jwt = require("jsonwebtoken");


const protect = asyncHandler(async(req,res,next) =>{
    // we will check if there is cookie(token) or not 
    // since we used the name 'token' for our cookies we will use 'cookies.token'
     try{
      const token = req.cookies.token
      if(!token){
        res.status(401)
        throw new Error("Not authorized, please login");
      }

      // Verify token(comparing it with out JWT_secret to check if its our token or someone has created it)
      // using JWT to verify
      const verified = jwt.verify(token, process.env.JWT_SECRET);

      // if the user has been verified using jwt, we can also get the information of the user
      // using the user _id(since we used _id and jwt_secret to create the token)
      
      // Get user id from token using 'verified' variable
      // we want all the information except the user password -> use .select("-password") ,to be stored in user variable
      const user = await User.findById(verified.id).select("-password");
      
      //user not found
      if(!user){
        res.status(400);
        throw new Error("User not Found");
      }
      // user found -> then add this data to the req
      req.user = user

      next(); // after till above req.user is assigned as user then the below lines after next() will run
    }
    catch(err){
        res.status(401);
        throw new Error ("Not authorized, please login");
    }
});


module.exports = protect ;