import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/token.js";
import { validateEmail, validatePassword } from "../utils/validate.js";

export const signup = async (req, res) => {
	const { fullName, email, password } = req.body;

	if (!fullName || !email || !password)
		return res.status(400).json({ error: "All fields are required" });

	if (!validateEmail(email))
		return res.status(400).json({ error: "A valid email address is required" });

	if (!validatePassword(password))
		return res.status(400).json({ error: "Password must be at least 12 characters long, contain at least one letter, one number, and one special character." });

	try {
		const existingUser = await User.findOne({ email });
		if (existingUser) return res.status(400).json({ error: "Email already exists" });

		const hashedPassword = await bcrypt.hash(password, 10);

		const newUser = new User({ fullName, email, password: hashedPassword });
		await newUser.save();

		generateToken(newUser._id, res);

		res.status(201).json({
			_id: newUser._id,
			fullName: newUser.fullName,
			email: newUser.email
		});
	} catch (error) {
		console.error("Error while signing up:", error.message);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

export const login = async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password)
		return res.status(400).json({ error: "Email and password are required" });

	try {
		const user = await User.findOne({ email });
		if (!user) return res.status(400).json({ error: "Account not found" });

		const isPasswordCorrect = await bcrypt.compare(password, user.password);
		if (!isPasswordCorrect) return res.status(400).json({ error: "Invalid password" });

		generateToken(user._id, res);

		res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			email: user.email
		});
	} catch (error) {
		console.error("Error while logging in:", error.message);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

export const logout = (req, res) => {
	try {
		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ message: "Logged out" });
	} catch (error) {
		console.error("Error while logging out:", error.message);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

export const checkAuth = (req, res) => {
	try {
		res.status(200).json(req.user);
	} catch (error) {
		console.error("Error while checking authentication:", error.message);
		res.status(500).json({ message: "Internal Server Error" });
	}
};