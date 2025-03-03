import jwt from "jsonwebtoken";

// Generate a JWT token and set it as a cookie
export const generateToken = (userId, res) => {
	const jwtSecretKey = process.env.JWT_SECRET;
	if (!jwtSecretKey) throw new Error('JWT_SECRET is not defined in environment variables');

	const token = jwt.sign({ userId }, jwtSecretKey, { expiresIn: '30d' });

	const cookieOptions = {
		secure: true, // The cookie will only be sent over HTTPS
		sameSite: 'strict', // The cookie will only be sent to the same site
		path: '/', // The cookie will be sent to all routes
		maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days before the cookie expires
	};

	res.cookie('jwt', token, cookieOptions);
	return token;
};