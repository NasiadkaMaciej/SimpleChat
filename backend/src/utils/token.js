import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
	const jwtSecret = process.env.JWT_SECRET;
	if (!jwtSecret) throw new Error('JWT_SECRET is not defined in environment variables');

	const token = jwt.sign({ userId }, jwtSecret, { expiresIn: '30d' });

	const cookieOptions = {
		httpOnly: true,
		secure: process.env.NODE_ENV !== 'development',
		sameSite: 'strict',
		maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
	};

	res.cookie('jwt', token, cookieOptions);
	return token;
};