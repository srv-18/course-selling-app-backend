import { Router } from "express";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { adminModel, courseModel, purchaseModel } from "../db"
import { adminSigninSchema, adminSignupSchema, courseSchema } from "../zodSchema";
import { adminMiddleware, AuthRequest } from "../middleware/admin";

dotenv.config();

export const adminRouter = Router();

adminRouter.post("/signup", async function (req, res) {
    const signupData = adminSignupSchema.safeParse(req.body);
    if(!signupData.success) {
        res.status(400).json({
            "error": "Invalid input"
        })
        return
    }
    try{
        const { email, password, firstName, lastName } = signupData.data
        const hashedPassword = await bcrypt.hash(password, 8);

        await adminModel.create({
            email,
            password: hashedPassword,
            firstName,
            lastName
        });

        res.status(200).json({
            message: "You have successfully sign up"
        })

    } catch(e) {
        res.status(409).json({
            "error": "admin with this email already exits, try signing in"
        })
    }
});

adminRouter.post("/signin", async function (req, res) {
    const signinData = adminSigninSchema.safeParse(req.body);
    if(!signinData.success) {
        res.status(400).json({
            "error": "Invalid input"
        })
        return
    }

    try {
        const { email, password } = signinData.data

        const admin = await adminModel.findOne({
            email: email
        });

        if(!admin) {
            res.status(404).json({
                "error": "admin not found"
            })
            return
        }

        const isMatch = await bcrypt.compare(password, admin.password as string);
        if(!isMatch) {
            res.status(403).json({
                "error": "Incorrect credentials"
            })
            return
        }

        const token = jwt.sign({
            id: admin._id
        }, process.env.JWT_ADMIN_SECRET || "");

        res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: 15*24*3600000  //15 days
        }).status(200).json({
            "message": "successfully signin"
        });

    } catch(e) {
        res.status(500).json({
            "error": "something went wrong"
        })
    }
});

adminRouter.post("/course", adminMiddleware, async function (req: AuthRequest, res) {
    const adminId = req.userId;
    const courseData = courseSchema.safeParse(req.body);
    if(!courseData.success) {
        res.status(400).json({
            "error": "Invalid input"
        })
        return
    }

    try {
        const { title, description, imageUrl, price } = courseData.data;

        const course = await courseModel.create({
            title,
            description,
            imageUrl,
            price,
            creatorId: adminId
        });

        res.json({
            message: "course created",
            courseId: course._id.toString()
        })
    } catch(e) {
        res.status(500).json({
            "error": "something went wrong"
        })
    }
});

adminRouter.put("/course", adminMiddleware, async function (req: AuthRequest, res) {
    const adminId = req.userId;
    const courseData = courseSchema.safeParse(req.body);
    if(!courseData.success) {
        res.status(400).json({
            "error": "Invalid input"
        })
        return
    }

    try {
        const { title, description, imageUrl, price, courseId } = courseData.data;
        
        const course = await courseModel.updateOne({
            _id: courseId,
            creatorId: adminId
        }, {
            title,
            description,
            imageUrl,
            price,
        })

        if(!course) {
            res.status(404).json({
                "message": "Please provide your courseId"
            })
            return
        }

        res.json({
            message: "Course updated"
        })
    } catch(e) {
        res.status(500).json({
            "error": "Something went wrong"
        })
    }
});

adminRouter.get("/course/bulk", adminMiddleware, async function (req: AuthRequest, res) {
    const adminId = req.userId;

    try {
        const courses = courseModel.find({
            creatorId: adminId
        });

        res.status(200).json({
            message: "successful",
            courses
        })
    } catch(e) {
        res.status(500).json({
            "error": "Something went wrong"
        })
    }
});