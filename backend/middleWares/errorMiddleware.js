const errorHandler = (err,req,res,next) =>{
    
    //can't directly use 400(client-side) as status code but we will detect it automatically
    
    const statusCode = res.statusCode ? res.statusCode : 500 
    res.status(statusCode)
    
    res.json({
        message: err.message, // to get the error message
        // stack refers to the location of the error from where it is coming
        // but we will display the stack only till development time not for production time
        // we will use NODE_ENV for this purpose in env file
        stack: process.env.NODE_ENV === "development" ? err.stack : null
    })
};

module.exports = errorHandler;

// we need to access this error handler in root server app
// go the ***body*** part below the post part in postman and select form-data to enter email and check 