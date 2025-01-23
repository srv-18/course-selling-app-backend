import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config();

interface AuthRequest extends Request {
    userId?: JwtPayload
}

function adminMiddleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const token = req.cookies.jwt;
        const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET || "") as JwtPayload;

        if(!decoded) {
            res.status(403).json({
                "message": "You are not signed in"
            })
        }

        req.userId = decoded.id;
        next();
    } catch(e) {
        res.status(401).json({
            "error": "Invalid token"
        })
    }
}

export {
    adminMiddleware
}