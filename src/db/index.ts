import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    email: { type: String , unique: true },
    password: String,
    firstName: String,
    lastName: String
});

const adminSchema = new Schema({
    email: { type: String , unique: true },
    password: String,
    firstName: String,
    lastName: String
});

const courseSchema = new Schema({
    title: String,
    description: String,
    price: Number,
    imageUrl: String,
    creatorId: mongoose.Schema.ObjectId
});

const purchaseSchema = new Schema({
    courseId: mongoose.Schema.ObjectId,
    userId: mongoose.Schema.ObjectId
});

const userModel = mongoose.model("User", userSchema);
const adminModel = mongoose.model("admin", adminSchema);
const courseModel = mongoose.model("course", courseSchema);
const purchaseModel = mongoose.model("purchase", purchaseSchema);

export {
    userModel,
    adminModel,
    courseModel,
    purchaseModel
}