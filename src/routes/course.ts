import { Router } from "express"
import { userMiddleware, AuthRequest } from "../middleware/user";
import { courseModel, purchaseModel } from "../db";

export const courseRouter = Router();

courseRouter.post("/purchase", userMiddleware, async function (req: AuthRequest, res) {
    const userId = req.userId;
    const courseId = req.body.courseId;

    //logic for payment
    //check weather the user do not buy the same course twice

    try {
        await purchaseModel.create({
            userId,
            courseId
        });

        res.status(200).json({
            message: "You have bought the course"
        })
    } catch(e) {
        res.status(500).json({
            "message": "Something went wrong"
        })
    }
});

courseRouter.post("/preview", async function (req, res) {
    const courses = await courseModel.find({});
    
    res.json({
        courses
    })
});
