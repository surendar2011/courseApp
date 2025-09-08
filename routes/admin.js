// Import the Router object from the express module to create route handlers
const {Router} = require("express");
const path = require('path');

// Create a new instance of Router for defining admin-related routes
const adminRouter = Router();

// Import adminModel and courseModel from the database folder to interact with admin and course data
const {adminModel, courseModel} = require("../db");
const {adminMiddleware} = require("../middleware/admin");

// Import the required dependencies 
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const z = require("zod");

const {JWT_ADMIN_PASSWORD} = require("../config");

// Serve the admin signup page
adminRouter.get('/adminsignup', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/adminsignup.html'));
});

// Serve the admin signin page
adminRouter.get('/adminsignin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/adminsignin.html'));
});

// Serve the admin dashboard page - without middleware
adminRouter.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admindashboard.html'));
});

// Handle admin signup
adminRouter.post("/signup", async function(req, res){      
    try {
        console.log("Received signup request:", req.body);
        
        // Input validation using zod - FIXED: More permissive validation
        const requiredBody = z.object({
            email: z.string().email({ message: "Invalid email format" }).min(1),
            password: z.string().min(5, { message: "Password must be at least 5 characters" }),
            firstName: z.string().min(1, { message: "First name is required" }),
            lastName: z.string().min(1, { message: "Last name is required" }),
        });

        // Parse the request body using the requireBody.safeParse() method to validate the data format
        const parsedData = requiredBody.safeParse(req.body);         

        // If data is not correct then return error response
        if(!parsedData.success){                     
            console.log("Validation failed:", parsedData.error.format());
            return res.status(400).json({
                message: "Validation failed",
                error: parsedData.error.format()
            });
        }

        // Extract validated email, password, firstName, and lastName from the request body
        const {email, password, firstName, lastName} = req.body;

        // Hash the user's password using bcrypt with a salt rounds of 5
        const hashedPassword = await bcrypt.hash(password, 5);
        
        // Creating a new user in the database
        await adminModel.create({
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            firstName: firstName.trim(),
            lastName: lastName.trim(),   
        });

        // Send a success response back to client indicating successfully signup
        res.json({
            message: "Sign-up Successful"
        });
    } catch(e) {
        console.error("Signup error:", e);
        if (e.code === 11000) { // MongoDB duplicate key error
            return res.status(400).json({
                message: "Email already exists",
            });
        }
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

// POST route for admin signin
adminRouter.post("/signin", async function(req, res){
    try {
        // Validate the request body data using zod schema(email,password must be valid)
        const requireBody = z.object({
            email: z.string().email({ message: "Invalid email format" }),
            password: z.string().min(1, { message: "Password is required" }),
        });

        // Parse and validate the request body data
        const parsedData = requireBody.safeParse(req.body);
        
        // If the data format is incorrect, send an error message to the client
        if(!parsedData.success){
            return res.status(400).json({
                message: "Incorrect data format",
                error: parsedData.error.format(),
            });
        }

        // Get the email and password from the request body
        const {email,password} = req.body;
        
        // Find the admin with the given email
        const admin = await adminModel.findOne({ email: email.toLowerCase().trim() });

        // If the admin is not found, send an error message to the client
        if(!admin){
            return res.status(403).json({
                message: "Invalid credentials",
            });
        }

        // Compare the password with the hashed password using the bcrypt.compare() method
        const passwordMatched = await bcrypt.compare(password, admin.password);

        // If password matches, generate a jwt token and return it
        if(passwordMatched){
            // Create a jwt token with the admin's id and the secret key
            const token = jwt.sign({
                id: admin._id
            }, JWT_ADMIN_PASSWORD);

            // Send the token to the client
            res.status(200).json({
                token: token,
            });
        } else {
            // If the password does not match, send an error message to the client
            res.status(403).json({
                message: "Invalid credentials!"
            });
        }
    } catch(e) {
        console.error("Signin error:", e);
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

// API endpoint to get dashboard data - with middleware
adminRouter.get("/dashboard/data", adminMiddleware, async function(req, res) {
    try {
        // Get the adminId from the request object
        const adminId = req.adminId;
        
        // Find the admin details
        const admin = await adminModel.findById(adminId);
        
        // Find all courses created by this admin
        const courses = await courseModel.find({
            creatorId: adminId,
        });

        res.json({
            message: "Welcome to Admin Dashboard",
            admin: {
                firstName: admin.firstName,
                lastName: admin.lastName,
                email: admin.email
            },
            totalCourses: courses.length,
            courses: courses
        });
    } catch(e) {
        console.error("Dashboard error:", e);
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

// Define the admin routes for creating a course
adminRouter.post("/course", adminMiddleware, async function(req,res) {
    try {
        // Get the adminId from the request object
        const adminId = req.adminId;

        // Validate the request body data using zod schema
        const requireBody = z.object({
            title: z.string().min(1, { message: "Title is required" }),
            description: z.string().min(1, { message: "Description is required" }),
            imageUrl: z.string().url({ message: "Invalid URL format" }),
            price: z.number({ message: "Price must be a number" }).positive({ message: "Price must be positive" }),
        });
        
        // Parse and validate the request body data
        const parsedData = requireBody.safeParse(req.body);

        // If the data format is incorrect, send an error message to the client
        if(!parsedData.success){
            return res.status(400).json({
                message: "Incorrect data format",
                error: parsedData.error.format(),
            });
        }

        // Get title, description, imageURL, price from the request body
        const {title,description,imageUrl,price} = req.body;

        // Create a new course with the given title, description, imageURL, price, creatorId
        const course = await courseModel.create({
            title: title,
            description: description,
            imageUrl: imageUrl,
            price: price,
            creatorId: adminId,
        });

        // Respond with a success message if the course is created successfully
        res.status(201).json({
            message: "Course Created",
            courseId: course._id,
        });
    } catch(e) {
        console.error("Course creation error:", e);
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

adminRouter.put("/course", adminMiddleware, async function(req,res) {
    try {
        // Get the adminId from the request object, set by the admin middleware
        const adminId = req.adminId;

        // Define a schema using zod to validate the request body for updating a course
        const requireBody = z.object({
            courseId: z.string().min(1, { message: "Course ID is required" }),
            title: z.string().min(1, { message: "Title is required" }).optional(),
            description: z.string().min(1, { message: "Description is required" }).optional(),
            imageUrl: z.string().url({ message: "Invalid URL format" }).optional(),
            price: z.number({ message: "Price must be a number" }).positive({ message: "Price must be positive" }).optional(),
        });

        // Parse and validate the incoming request body against the schema
        const parsedData = requireBody.safeParse(req.body);

        // If validation fails, respond with an error message and the details of the error
        if(!parsedData.success){
            return res.status(400).json({
                message: "Incorrect data format",
                error: parsedData.error.format(),
            });
        }

        // Destructure the validated fields from the request body
        const {title,description,imageUrl,price,courseId} = req.body;

        // Attempt to find the course in the database using the provided courseId and adminId
        const course = await courseModel.findOne({
            _id: courseId, // Match the course by ID
            creatorId: adminId, // Ensure the admin is the creator
        });

        // If the course is not found, respond with an error message
        if(!course){
            return res.status(404).json({
                message: "Course not found!", // Inform the client that the specified course does not exist
            });
        }

        // Update the course details in the database using the updates object
        await courseModel.updateOne({
            _id: courseId, // Match the course by ID
            creatorId: adminId, // Ensure the admin is the creator
        },
        {
            // It uses the provided courseId and adminId to identify the course. For each field (title, description, imageUrl, price), if a new value is provided, it is used to update the course. If a field is not provided, the existing value from the database is kept.
            title: title || course.title,
            description: description || course.description,
            imageUrl: imageUrl || course.imageUrl,
            price: price || course.price,
        });

        // Respond with a success message upon successful course update
        res.status(200).json({
            message: "Course updated!", // Successfully course updated or not
        });
    } catch(e) {
        console.error("Course update error:", e);
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

// Define the admin route for deleting a course
adminRouter.delete("/course/:courseId", adminMiddleware, async function(req, res) {
    try {
        // Get the adminId from the request object
        const adminId = req.adminId;
        const courseId = req.params.courseId;

        // Delete the course only if it belongs to this admin
        const result = await courseModel.deleteOne({
            _id: courseId,
            creatorId: adminId
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "Course not found or you don't have permission to delete it!"
            });
        }

        res.json({
            message: "Course deleted successfully!"
        });
    } catch(e) {
        console.error("Course deletion error:", e);
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

// Define the admin routes for getting all courses
adminRouter.get("/courses", adminMiddleware, async function(req,res){
    try {
        // Get the adminId from the request object
        const adminId = req.adminId;

        // Find all the courses with given creatorId
        const courses = await courseModel.find({
            creatorId: adminId,
        });

        // Respond with the courses if they are found successfully
        res.json({
            courses: courses,
        });
    } catch(e) {
        console.error("Get courses error:", e);
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

module.exports = {
    adminRouter: adminRouter
}