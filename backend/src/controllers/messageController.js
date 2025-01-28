import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import { sendError } from "../utils/errors.js";
import { io, getReceiverSocketId } from "../utils/socket.js";

export const getUsers = async (req, res) => {
	try {
		const currentUser = await User.findById(req.user._id);
		const users = await User.find({ _id: { $ne: req.user._id } })
			.select("-password -verified -verificationToken");

		const usersWithFriendStatus = users.map(user => ({
			...user.toObject(),
			isFriend: currentUser.friends.includes(user._id)
		}));

		res.set({
			'Cache-Control': 'no-cache, no-store, must-revalidate',
			'Pragma': 'no-cache',
			'Expires': '0'
		});
		res.status(200).json(usersWithFriendStatus);
	} catch (error) {
		sendError(res, error, "getUsers");
	}
};

export const getMessages = async (req, res) => {
	try {
		const { id: receiverId } = req.params;
		const senderId = req.user._id;

		// Mark messages as read and notify sender
		const unreadMessages = await Message.find({
			senderId: receiverId,
			receiverId: senderId,
			status: { $ne: 'read' }
		});

		if (unreadMessages.length > 0) {
			await Message.updateMany(
				{
					senderId: receiverId,
					receiverId: senderId,
					status: { $ne: 'read' }
				},
				{ status: 'read' }
			);

			const senderSocketId = getReceiverSocketId(receiverId);
			if (senderSocketId) {
				io.to(senderSocketId).emit("messageStatusUpdate", {
					senderId: receiverId,
					receiverId: senderId,
					status: 'read'
				});
			}
		}

		const messages = await Message.find({
			$or: [
				{ senderId, receiverId },
				{ senderId: receiverId, receiverId: senderId }
			]
		}).sort({ createdAt: 1 });

		res.status(200).json(messages);
	} catch (error) {
		sendError(res, error, "getMessages");
	}
};

export const sendMessage = async (req, res) => {
	try {
		const { text, image } = req.body;
		const { id: receiverId } = req.params;
		const senderId = req.user._id;

		const newMessage = new Message({
			senderId,
			receiverId,
			type: image ? 'image' : 'text',
			...(image ? { image } : { text }),
			status: 'sent'
		});

		await newMessage.save();

		// Emit to receiver and update status to 'delivered' when online
		const receiverSocketId = getReceiverSocketId(receiverId);
		if (receiverSocketId) {
			io.to(receiverSocketId).emit("newMessage", newMessage);
			newMessage.status = 'delivered';
			await newMessage.save();
			io.to(getReceiverSocketId(senderId)).emit("messageStatusUpdate", {
				messageId: newMessage._id,
				status: 'delivered'
			});
		}

		res.status(201).json(newMessage);
	} catch (error) {
		sendError(res, error, "sendMessage");
	}
};