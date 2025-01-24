import express from "express";
import dotenv from 'dotenv';
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./utils/mongodb.js";
import authRoutes from "./routes/authRoute.js";
import messageRoutes from "./routes/messageRoute.js";

dotenv.config();
connectDB();

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cors({
	origin: ['http://127.0.0.1:3008', 'front.nasiadka.pl'],
	credentials: true,
}));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);


app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});