import { Router } from "express";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { adminModel } from "../db"
import { adminSigninSchema, adminSignupSchema } from "../zodSchema";
import { adminMiddleware } from "../middleware/admin";

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

adminRouter.post("/course", adminMiddleware, function (req, res) {
    res.json({
        message: "You are course endpoint of admin"
    })
});

adminRouter.put("/course", function (req, res) {
    res.json({
        message: "You are signup"
    })
});

adminRouter.get("/course/bulk", function (req, res) {
    res.json({
        message: "You are in course/bulk"
    })
});