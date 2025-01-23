import { string, z } from "zod"

export const userSignupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string(),
    lastName: z.string()
});

export const userSigninSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

export const adminSignupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string(),
    lastName: z.string()
});

export const adminSigninSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});