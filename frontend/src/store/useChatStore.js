// Manages chat messages, users, and real-time message subscriptions

import toast from "react-hot-toast";
import { create } from "zustand";
import { api } from "../services/api";
import { useAuthStore } from "./useAuthStore";

const displayError = (error) => {
	const message = error.response?.data?.error || error.message;
	toast.error(message);
	console.error("Error: ", message, error);
};

export const useChatStore = create((set, get) => ({
	users: [],
	selectedUser: null,
	selectedUserRef: { current: null },
	messages: [],
	isUsersLoading: false,
	isMessagesLoading: false,
	isProfileOpen: false,
	onlineUsers: [],
	showFriends: true,
	currentGroup: 'all', // 'all', 'friends', 'work', 'family'
	inChatPage: false,

	setOnlineUsers: (users) => { set({ onlineUsers: users }) },
	setProfileOpen: (isOpen) => { set({ isProfileOpen: isOpen }) },
	toggleShowFriends: () => set(state => ({ showFriends: !state.showFriends })),
	setInChatPage: (value) => set({ inChatPage: value }),

	getUsers: async () => {
		set({ isUsersLoading: true });
		try {
			const response = await api.users.get();
			const users = response.data;
			set({ users });
		} catch (error) {
			displayError(error);
			set({ users: [] });
		} finally {
			set({ isUsersLoading: false });
		}
	},

	setSelectedUser: (user) => {
		set({ selectedUser: user });
		get().selectedUserRef.current = user;
	},

	// ToDo: Cache messages to not load when switching
	getMessages: async (userId) => {
		set({ isMessagesLoading: true });
		try {
			const res = await api.messages.get(userId);
			set({ messages: res.data });
		} catch (error) {
			displayError(error);
			set({ messages: [] });
		} finally {
			set({ isMessagesLoading: false });
		}
	},
	sendMessage: async (text, image) => {
		const { selectedUser, messages } = get();
		try {
			const messageData = image ? { image } : { text };
			const res = await api.messages.send(selectedUser._id, messageData);
			set({ messages: [...messages, res.data] });
		} catch (error) {
			displayError(error);
		}
	},

	appendMessage: (message) => {
		set((state) => {
			const updatedMessages = [...state.messages];
			updatedMessages.push(message);
			return { messages: updatedMessages };
		});
	},

	toggleGroupMembership: async (userId, group) => {
		try {
			const user = get().users.find(u => u._id === userId);
			if (!user) throw new Error('User not found');

			const isInGroup = user[`is${group.charAt(0).toUpperCase() + group.slice(1)}`];
			const action = isInGroup ? 'remove' : 'add';

			const response = await api.auth.group(userId, { group, action });

			// Update local state
			set(state => ({
				users: state.users.map(u =>
					u._id === userId
						? {
							...u,
							[`is${group.charAt(0).toUpperCase() + group.slice(1)}`]: !isInGroup,
							groups: response.data.groups
						}
						: u
				),
				selectedUser: state.selectedUser?._id === userId
					? {
						...state.selectedUser,
						[`is${group.charAt(0).toUpperCase() + group.slice(1)}`]: !isInGroup,
						groups: response.data.groups
					}
					: state.selectedUser
			}));

			toast.success(response.data.message);
		} catch (error) {
			displayError(error);
		}
	},

	toggleGroup: () => {
		set(state => {
			const groups = ['all', 'friends', 'work', 'family'];
			const currentIndex = groups.indexOf(state.currentGroup);
			const nextGroup = groups[(currentIndex + 1) % groups.length];
			return { currentGroup: nextGroup };
		});
	},

	updateMessageStatus: (data) => {
		set(state => ({
			messages: state.messages.map(msg =>
				(msg.senderId === data.senderId && msg.receiverId === data.receiverId)
					? { ...msg, isRead: data.isRead }
					: msg
			)
		}));
	},
	toggleBlockUser: async (userId) => {
		try {
			const response = await api.auth.block(userId);
			const isBlocked = response.data.blockedUsers.includes(userId);

			set(state => ({
				users: state.users.map(u =>
					u._id === userId ? { ...u, isBlocked } : u
				),
				selectedUser: state.selectedUser?._id === userId
					? { ...state.selectedUser, isBlocked }
					: state.selectedUser
			}));

			if (!isBlocked && get().selectedUser?._id === userId)
				await get().getMessages(userId);

			toast.success(response.data.message);
		} catch (error) {
			displayError(error);
		}
	},
	toggleUserMute: async (userId) => {
		try {
			const response = await api.auth.notifications.mute(userId);
			set(state => ({
				users: state.users.map(u =>
					u._id === userId ? { ...u, isMuted: !u.isMuted } : u
				),
				selectedUser: state.selectedUser?._id === userId
					? { ...state.selectedUser, isMuted: !state.selectedUser.isMuted }
					: state.selectedUser
			}));
			toast.success(response.data.message);
		} catch (error) {
			displayError(error);
		}
	},

	handleNewMessage: (message) => {
		const state = get();
		const authUser = useAuthStore.getState().authUser;
		const user = state.users.find(u => u._id === message.senderId);
		const correctedSenderName = message.senderName || user?.username || 'Unknown User';

		// Check if message belongs to current chat
		const isCurrentChat = (
			state.selectedUser?._id === message.senderId ||
			state.selectedUser?._id === message.receiverId
		);

		// If chat is open and message belongs to current conversation
		if (isCurrentChat && state.inChatPage) {
			// Mark as read immediately if we're the receiver
			if (message.receiverId === authUser._id) {
				window.io().emit("messageRead", {
					senderId: message.senderId,
					receiverId: authUser._id
				});
			}

			set(state => ({
				messages: [...state.messages, { ...message, isRead: message.receiverId === authUser._id }]
			}));
		} else if (message.receiverId === authUser._id) {
			// Show notification only if we're the receiver and chat isn't open
			toast(`New message from ${correctedSenderName}`);
		}
	}
}));