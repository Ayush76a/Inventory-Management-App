const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logout, getUser, loginStatus, updateUser, changePassword, forgotPassword, resetPassword} = require('../controllers/userController');
const protect = require('../controllers/authMiddleware');


// use *** ctrl + space *** against the name of the variable to require it from other 
router.post("/register",registerUser);
router.post("/login",loginUser);

//Logout is a 'get' request since it does not send any data 
router.get("/logout",logout);

//user Profile route is a get route since we are fetching information from the database
router.get("/getuser", protect, getUser);

//route for LOGIN STATUS
router.get("/loginstatus",loginStatus);

//Update User
router.patch("/updateuser",protect,updateUser);
//Update User Password
router.patch("/changepassword",protect,changePassword);

//ForgetPassword -> a post request(since on clicking forget password -> we need to send the users email)
router.post("/forgotpassword", forgotPassword);

//Reset Password -> it will have the Token in its Url
router.put("/resetpassword/:resetToken", resetPassword)


module.exports = router;

