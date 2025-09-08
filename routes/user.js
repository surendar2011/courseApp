// Import the Router object from the express module to create route handlers
const {Router} = require("express");
const path = require('path');
const { userMiddleware } = require("../middleware/user")
const userRouter = Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const z = require("zod");
const { userModel, courseModel, purchaseModel } = require("../db");
const {JWT_USER_PASSWORD} = require("../config")

// Serve user signup page
userRouter.get('/usersignup', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/usersignup.html'));
});

// Serve user signin page
userRouter.get('/usersignin', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/usersignin.html'));
});

// Serve user dashboard page
userRouter.get('/userdashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/userdashboard.html'));
});

// Serve user my courses page
userRouter.get('/mycourses', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/mycourses.html'));
});

// Serve userdashboard.html directly
userRouter.get('/userdashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/userdashboard.html'));
});

// Serve mycourses.html directly
userRouter.get('/mycourses.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/mycourses.html'));
});

// POST route for user signup
userRouter.post("/signup", async function(req, res){      
    try {
        const requiredBody = z.object({
            email: z.string().email({ message: "Invalid email format" }).min(1),
            password: z.string().min(5, { message: "Password must be at least 5 characters" }),
            firstName: z.string().min(1, { message: "First name is required" }),
            lastName: z.string().min(1, { message: "Last name is required" }),
        });

        const parsedData = requiredBody.safeParse(req.body);         

        if(!parsedData.success){                     
            return res.status(400).json({
                message: "Validation failed",
                error: parsedData.error.format()
            });
        }

        const {email, password, firstName, lastName} = req.body;
        const hashedPassword = await bcrypt.hash(password, 5);
        
        await userModel.create({
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            firstName: firstName.trim(),
            lastName: lastName.trim(),   
        });

        res.json({
            message: "Sign-up Successful"
        });
    } catch(e) {
        console.error("Signup error:", e);
        if (e.code === 11000) {
            return res.status(400).json({
                message: "Email already exists",
            });
        }
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

// POST route for user signin
userRouter.post("/signin", async function(req, res){
    try {
        const requireBody = z.object({
            email: z.string().email({ message: "Invalid email format" }),
            password: z.string().min(1, { message: "Password is required" }),
        });

        const parsedData = requireBody.safeParse(req.body);
        
        if(!parsedData.success){
            return res.status(400).json({
                message: "Incorrect data format",
                error: parsedData.error.format(),
            });
        }

        const {email,password} = req.body;
        const user = await userModel.findOne({ email: email.toLowerCase().trim() });

        if(!user){
            return res.status(403).json({
                message: "Invalid credentials",
            });
        }

        const passwordMatched = await bcrypt.compare(password, user.password);

        if(passwordMatched){
            const token = jwt.sign({
                id: user._id
            }, JWT_USER_PASSWORD);

            res.status(200).json({
                token: token,
            });
        } else {
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

// GET user information
userRouter.get("/userinfo", userMiddleware, async function(req, res) {
    try {
        const userId = req.userId;
        
        // Find the user details
        const user = await userModel.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                message: "User not found!"
            });
        }

        res.json({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        });
    } catch(e) {
        console.error("User info error:", e);
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

// GET all courses for users
userRouter.get("/courses", userMiddleware, async function(req, res) {
    try {
        const courses = await courseModel.find({});
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

// POST purchase a course
userRouter.post("/purchase/:courseId", userMiddleware, async function(req, res) {
    try {
        const userId = req.userId;
        const courseId = req.params.courseId;

        // Check if course exists
        const course = await courseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({
                message: "Course not found!"
            });
        }

        // Check if already purchased
        const existingPurchase = await purchaseModel.findOne({
            userId: userId,
            courseId: courseId
        });

        if (existingPurchase) {
            return res.status(400).json({
                message: "Course already purchased!"
            });
        }

        // Create purchase
        await purchaseModel.create({
            userId: userId,
            courseId: courseId
        });

        res.json({
            message: "Course purchased successfully!"
        });
    } catch(e) {
        console.error("Purchase error:", e);
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

// GET user's purchased courses
userRouter.get("/purchases", userMiddleware, async function(req, res) {
    try {
        const userId = req.userId;
        
        const purchases = await purchaseModel.find({ userId: userId });
        const courseIds = purchases.map(purchase => purchase.courseId);
        
        const courses = await courseModel.find({
            _id: { $in: courseIds }
        });

        res.json({
            purchases: courses,
        });
    } catch(e) {
        console.error("Get purchases error:", e);
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

module.exports = {
    userRouter: userRouter
};