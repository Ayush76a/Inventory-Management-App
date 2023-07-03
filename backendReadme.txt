************ INVENTORY MANAGEMENT APP *************


**** BACKEND ****    -----------    ....readme.....


1. To log user in immediately after signing up -> Use JWT npm package (json web tokens) =>
The logic is that -> these tokens will help us to verify that the user has signed up 
and wee will thus directly logged the users with tokens using _id
install it as a module using -> npm i jsonwebtoken
There is one more thing we need to create a token i.e. token secret -> it will be in out .env file as JWT_SECRET
The user will be logged in only for one day(24 hrs) , after it the user needs to login again
// now make a function to generate token and // generate token after defining user


2. Using token for making user loggedin -> it means we need to sending that token to the frontend(to client browser) 
the browser will tell that the user has been perfectly registered and he/she can access our backend
we will use 'http only cookie' for this functionality since its today the best availble that defends the attack of hackers(k/a crooseSiteScripting)
To use it -> install ***cookie-parser*** npm package                                
since it acts as helping agent b/w frontend and backend it acts as a Middleware -> type .use(cookie-parser) in middlewares
# def cookie -> A cookie is a piece of data from a website that is stored within a web browser that the website can retrieve at a later time.
the place where token is generated -> After it -> now send the cookie using 'res.cookie()'


3. Create LoginUser function for controllers and export it from userControllers file
Now in userRoutes file create a new routes with "/login" as path for login with loginUser as its controller which is do be imported in this file using require 
Fetch the email and password entered at frontend using dereferencing and req.body
DO validations ->
if user not exist -( fire error
user exists -) check if password is correct using bcrypt module 
// now we have the access to the data of user if password enetered by him is correct
# LET user Login ->
we will generate a token for this login and we will send a cookie with that token to frontend 
simply just copy and paste the code from above (check if token is saved as cookie or not in the response)


4. Create Logout user route and its controller
# Logout is a 'get' request bcoz we are not sending any data to this route
make route for "/logout" and its controller function also

Ways to perform logout->
a) just delete the cookie from the frontend
b) expire the cookie form frontend

we will use the second way to expire the cookie as :-
 // for second parameter -> since we are not create a cookie, we are just modifying it -> so put second parameter as empty string
    res.cookie("token", "",{})
 //expires: new Date(0),   // expire the cookie in zero '0' seconds immediately as logout is fired


5. Create User profile route and its controller
//user Profile route is a get route since we are fetching information from the database
 
Protecting the getUserProfile functionality for the exception of being already logged out
this means we will protect this 'user Profile' api endpoint so that only logged in user can view the profile
# Create PROTECT MIDDLEWARE
in middlewares folder -> create authMidlleware.js - this will protect those api endpoints from unauthorized access

Protection by middlewre but how ? ->
create a check on the token if it has expired then it means user has to be not shown profile info
and user has to taken out from the logged in state stating that its "unauthorized access"


if it exist then get the info of user and display it as profile info 
VERIFY USER AND GET ITS DATA ->
verify user using the token and secret stored in env file and store the info in 'user' variable(except password)
using await and findById and 'verified.id'
USE " req.user = user " as final step for the auth middleware -> export protect function from the middleware

// CONTROLLER FUNCTION
find user data user using find user by id -> " req.user._id " and display it at status.json({data}) 


6. Login status -> Special route for user logged in status
This is to check(monitor) if the user is logged in or not 
create the LOGIN ROUTE as "/loginstatus" and its Controller 
now modify the controller function 

functionality for checking if user is logged in or not -> For this check the cookies(token) if it exist this means that user is logged in otherwise not 
fetch the token using "req.cookies.token" 
// if token exist firstly Verify it 
if verified then -> return "true" otherwise "false"


7. UpdateUser ->  Route and its Controller to updateProfile via profile section and edit button on frontend
create the route for "/updateuser" and its controller fucntion as "updateUser" 
# remember that it updating also needs protection since logged out users can't perform updation
# for Protecting update url -> simply just add the protect function from the authMiddleware.js file to do so
now create UserUpdate control functionality->
const {_id,name, email, photo, phone, bio} = user;
user.email = email;  // email can't be modified
// set the name given in request or if no name is given( blanked ) then set it to previous name
user.name=req.body.name || name; 
