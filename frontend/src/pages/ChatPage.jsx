import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/chat/Sidebar";
import ChatContainer from "../components/chat/ChatContainer";
import WelcomeChat from "../components/chat/WelcomeChat";

const ChatPage = () => {
	const { selectedUser, appendMessage, setOnlineUsers, updateMessageStatus, handleNewMessage } = useChatStore();
	const { authUser } = useAuthStore();

	useEffect(() => {
		// Socket connection for both messages and online status
		const socket = window.io({
			path: '/socket.io/',
			query: { userId: authUser._id }
		});

		// Handle new messages
		socket.on("newMessage", (message) => {
			handleNewMessage(message);
			if (selectedUser?._id === message.senderId) {
				// Mark message as read immediately if chat is open
				socket.emit("messageRead", {
					senderId: message.senderId,
					receiverId: authUser._id
				});
				appendMessage({ ...message, status: 'read' });
			}
		});

		// Handle online users updates
		socket.on("getOnlineUsers", (users) => {
			setOnlineUsers(users);
		});

		socket.on("messageStatusUpdate", (data) => {
			updateMessageStatus(data);
		});

		return () => socket.disconnect();
	}, [authUser._id, selectedUser, appendMessage, setOnlineUsers, updateMessageStatus]);


	return (
		<div className="h-screen bg-base-200">
			<div className="flex items-center justify-center pt-20 px-4">
				<div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
					<div className="flex h-full rounded-lg overflow-hidden">
						<Sidebar />
						{selectedUser ? <ChatContainer /> : <WelcomeChat />}
					</div>
				</div>
			</div>
		</div>
	);
};
export default ChatPage;