// Import the jwt module to handle json web tokens
const jwt = require("jsonwebtoken");

// Import the jwt admin password from the config file for verification
const {JWT_ADMIN_PASSWORD} = require("../config");

// Define the adminMiddleware function to verify the admin token
function adminMiddleware(req, res, next){
    // Get the token from the Authorization header with Bearer prefix
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({
            message: "You are not signed in!",
        });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Use a try-catch block to handle any errors that may occur during token verification
    try{
        // Verify the token using the jwt admin password to check its validity
        const decoded = jwt.verify(token, JWT_ADMIN_PASSWORD);

        // Set the adminId in the request object from the decoded token for later use
        req.adminId = decoded.id;

        // Call the next middleware in the stack to proceed with the request
        next();
    }catch(e){
        // If the token is invalid or an error occurs during verification, send an error message to the client
        return res.status(403).json({
            message: "You are not signed in!",
        });
    }
}

// Export the adminMiddleware function so that it can be used in other files
module.exports = {
    adminMiddleware: adminMiddleware
}