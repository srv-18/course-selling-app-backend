import { Router } from "express"

export const courseRouter = Router();

courseRouter.post("/purchase", function (req, res) {
    res.json({
        message: "You are signup"
    })
});

courseRouter.post("/preview", function (req, res) {
    res.json({
        message: "You are signup"
    })
});
