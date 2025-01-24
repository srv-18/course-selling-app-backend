import { Router } from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { userSigninSchema, userSignupSchema } from "../zodSchema"
import { courseModel, purchaseModel, userModel } from "../db";
import dotenv from "dotenv"
import { userMiddleware, AuthRequest } from "../middleware/user";

dotenv.config();

export const userRouter = Router();

userRouter.post("/signup", async function (req, res) {
    const signupData = userSignupSchema.safeParse(req.body);
    if(!signupData.success) {
        res.status(400).json({
            "error": "Invalid input"
        })
        return
    }
    try{
        const { email, password, firstName, lastName } = signupData.data
        const hashedPassword = await bcrypt.hash(password, 8);

        await userModel.create({
            email,
            password: hashedPassword,
            firstName,
            lastName
        });

        res.status(201).json({
            message: "You have successfully sign up"
        })

    } catch(e) {
        res.status(500).json({
            "error": "Something went wrong"
        })
    }
});

userRouter.post("/signin", async function (req, res) {
    const signinData = userSigninSchema.safeParse(req.body);
    if(!signinData.success) {
        res.status(400).json({
            "error": "Invalid input"
        })
        return
    }

    try {
        const { email, password } = signinData.data

        const user = await userModel.findOne({
            email: email
        });

        if(!user) {
            res.status(404).json({
                "error": "user not found"
            })
            return
        }

        const isMatch = await bcrypt.compare(password, user.password as string);
        if(!isMatch) {
            res.status(403).json({
                "error": "Incorrect credentials"
            })
            return
        }

        const token = jwt.sign({
            id: user._id
        }, process.env.JWT_USER_SECRET || "");

        res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: 15*24*3600000  //15 days
        }).status(200).json({
            "message": "successfully signin"
        });

    } catch(e) {
        res.status(409).json({
            "error": "user with this email already exits, try signing in"
        })
    }
});

userRouter.get("/purchases", userMiddleware, async function (req: AuthRequest, res) {
    const userId = req.userId;

    try {
        const purchases = await purchaseModel.find({
            userId
        });

        if(purchases.length == 0) {
            res.status(404).json({
                "error": "You have not purchase any course"
            })
            return
        }

        const coursesData = await courseModel.find({
            _id: { $in: purchases.map(x => x.courseId) }
        });

        res.json({
            purchases,
            coursesData
        })

    } catch(e) {
        res.status(500).json({
            "error": "Something went wrong"
        })
    }
});
