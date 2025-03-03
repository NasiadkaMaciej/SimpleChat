import { Menu, Search, Users } from 'lucide-react';
import Avatar from '../shared/Avatar';
import { useChatStore } from '../../store/useChatStore';
import StatusIndicator from '../shared/StatusIndicator';
import { formatLastSeen } from '../../utils/lastSeen';

export default function ChatHeader({ onSearchOpen }) {
	const { selectedUser, setProfileOpen, onlineUsers, setSelectedUser } = useChatStore();
	const isOnline = selectedUser && onlineUsers.includes(selectedUser._id);

	return (
		<div className="p-3 border-b border-base-300 md:z-40">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="relative">
						<Avatar color={selectedUser?.avatarColor} size="10" />
						<StatusIndicator isOnline={isOnline} />
					</div>
					<div>
						<h3 className="font-medium">{selectedUser?.username}</h3>
						<span className="text-xs text-base-content/60">
							{isOnline ? 'Online' : selectedUser?.lastSeen ? `Last seen ${formatLastSeen(selectedUser.lastSeen)}` : 'Offline'}
						</span>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<button
						onClick={() => setSelectedUser(null)}
						className="btn btn-ghost btn-sm btn-circle md:hidden"
					>
						<Users className="size-5" />
					</button>
					<button
						onClick={onSearchOpen}
						className="btn btn-ghost btn-sm btn-circle"
					>
						<Search className="size-5" />
					</button>
					<button
						onClick={() => setProfileOpen(true)}
						className="btn btn-ghost btn-sm btn-circle"
					>
						<Menu className="size-5" />
					</button>
				</div>
			</div>
		</div>
	);
}