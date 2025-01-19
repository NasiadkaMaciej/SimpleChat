import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) return res.status(401).json({ message: "Unauthorized - No token provided" });

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) throw new Error('JWT_SECRET is not defined in environment variables');

        const decoded = jwt.verify(token, jwtSecret);
        if (!decoded) return res.status(401).json({ message: "Unauthorized - Invalid token" });

        const user = await User.findById(decoded.userId).select("-password");
        if (!user) return res.status(404).json({ message: 'User not found' });

        req.user = user;
        next();
    } catch (error) {
        console.error("Error in protectRoute:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};