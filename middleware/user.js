// Import the jwt module to handle json web tokens
const jwt = require("jsonwebtoken");

// Import the jwt userr password from the config file for verification
const {JWT_USER_PASSWORD} = require("../config");


// Define the userMiddleware function to verify the user token,
// middleware is used to handle incoming HTTP requests and also handles route handle
function userMiddleware(req, res, next){
    // Get the token from the request headers, which is expected to be sent in the token header
    const token = req.headers.token;

    // Use a try-catch block to handle any errors that may occur during token verification
    try{
        // Verify the token using the jwt user password to check its validity
        const decoded = jwt.verify(token,JWT_USER_PASSWORD);

        // Set the userId in the request object from the decoded token for later use
        req.userId = decoded.id;

        // Call the next middleware in the stack to proceed with the request
        next();
    }catch(e){
        // If the token is invalid or an error occurs during verification, send an error message to the client
        return res.status(403).json({
            message: "You are not signed in!",
        });
    }
}


// Export the userMiddleware function so that it can be used in other files
module.exports = {
    userMiddleware: userMiddleware
}


/*
1. import jsonwebtoken
2. import jwt user password from config
3. create func for userMiddleware with req, res, next
4. var token from req header token
5. try
6. var decoded to verify jwt with token and jwt user password
7. decoded.id to req userId
8. next
9. catch e
10. return res.status with json and print msg
11. export module
*/