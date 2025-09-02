// Import the dotenv module to load environment variables from the .env file
require("dotenv").config();

// Import express for building the web server and mongoose for MongoDb interaction
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import the route handlers for user, course, admin from the routes folder
const {userRouter} = require("./routes/user");
const {courseRouter} = require("./routes/course");
const {adminRouter} = require("./routes/admin");

// Initialize express application
const app = express();
app.use(cors());

// Retrieve the PORT from the .env file, default to 3000 if its not provided
const PORT = process.env.PORT || 3001;

// Middleware to automatically parse incoming JSON requests and make it available in req.body
app.use(express.json());

// Serve all static files from the "frontend" directory
app.use(express.static("frontend"));

// Retrieve the MongoDB connection string (MONGO_URL) from the .env file
const MONGO_URL = process.env.MONGO_URL;
console.log(MONGO_URL);


// Mounts the user, course, and admin routers to their respective base paths using Express's modular route handling(approach) for each resource
app.use("/user", userRouter);
app.use("/course", courseRouter);
app.use("/admin", adminRouter);

// Create a main function to connect to the database and start the server
// MongoDB connection string (replace with your actual URL)
async function main() {
  try {
      // Connect to the MongoDB database using the MONGODB_URL
      await mongoose.connect(MONGO_URL);

      // Log a success message to the console if the database connection is established
      console.log("Connected to the database");

      // Start the server and listen for incoming requests on the specifies PORT
      app.listen(PORT, () => {
        // Log a message to indicate that the server is running and listening for requests
        console.log(`Server is running on port ${PORT}`);
      });
} catch(e){
    // Log an error message if the connection to the database fails
    console.error("Failed to connect to the database", e);
    }
}

// Call the main function to initialize the server and database connection
main();

/*
1. import dotenv module
2. import express and mongoose
3. import route handlers for ./routes/user
4. initialize express application or app
5. retrive the port from .env file
6. use middleware to automatically parse incoming json; app.use() is called middleware
7. retrive mongodb connection
8. routes can be accessed using app.use /user /course

9. create a main function to connect to the database
10. how do you connect to db; using url and .connect finally print msg
11. how do you listen to port; app.listen then print msg
12. error block print msg
*/