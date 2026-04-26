import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, UserCheck, UserMinus, UserX, X, Clock, Loader2, MessageCircle, Settings } from 'lucide-react';
import { chatApi, friendApi } from '../../lib/api';
import Avatar from '../chat/Avatar';

interface ProfileHeaderProps {
	username: 			string;
	avatar:				string;
	type:				string;
	isOnline: 			boolean;
	isOwnProfile:		boolean;
	friendStatus:		'none' | 'pending_sent' | 'pending_received' | 'friends';
	friendRequestId?: 	number | undefined;
	targetUserId: 		string;
	onFriendAction:	() => void;
}

export default function ProfileHeader({
	username, avatar, type, isOnline, isOwnProfile,
	friendStatus, friendRequestId, targetUserId, onFriendAction,
}: ProfileHeaderProps) {
	const [actionLoading, setActionLoading] = useState(false);
	const [messageLoading, setMessageLoading] = useState(false);
	const navigate = useNavigate();

	const handleMessage = async () => {
		setMessageLoading(true);
		try {
			const convers = await chatApi.createConversation({
				type: 'Direct',
				member_ids: [targetUserId],
			});
			navigate(`/chat?conv=${convers.id}`);
		} catch (err) {
			console.error('Failed to open conversation:', err);
		} finally {
			setMessageLoading(false);
		}
	};

	const handleSendRequest = async () => {
		setActionLoading(true);
		try {
			await friendApi.sendRequest(targetUserId);
			onFriendAction();
		} catch (err) {
			console.error('Failed to send friend request:', err);
		} finally {
			setActionLoading(false);
		}
	};

	const handleAccept = async () => {
		if (!friendRequestId) return;
		setActionLoading(true);
		try {
			await friendApi.acceptRequest(friendRequestId);
			onFriendAction();
		} catch (err) {
			console.error('Failed to accept request:', err);
		} finally {
			setActionLoading(false);
		}
	};

	const handleReject = async () => {
		if (!friendRequestId) return;
		setActionLoading(true);
		try {
			await friendApi.rejectRequest(friendRequestId);
			onFriendAction();
		} catch (err) {
			console.error('Failed to reject request:', err);
		} finally {
			setActionLoading(false);
		}
	};

	const handleCancel = async () => {
		if (!friendRequestId) return;
		setActionLoading(true);
		try {
			await friendApi.cancelRequest(friendRequestId);
			onFriendAction();
		} catch (err) {
			console.error('Failed to cancel request:', err);
		} finally {
			setActionLoading(false);
		}
	};

	const handleUnfriend = async () => {
		setActionLoading(true);
		try {
			await friendApi.removeFriend(targetUserId);
			onFriendAction();
		} catch (err) {
			console.error('Failed to remove friend:', err);
		} finally {
			setActionLoading(false);
		}
	};

	const renderActionButton = () => {
		if (actionLoading) {
			return (
				<button disabled className="px-4 py-2 bg-secondary text-muted-foreground
					rounded-lg text-sm font-medium flex items-center gap-2">
					<Loader2 size={14} className="animate-spin" />
				</button>
			);
		}

		if (isOwnProfile) {
			return (
				<button className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground
					rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
					<Settings size={14} />
					Edit Profile
				</button>
			);
		}

		switch (friendStatus) {
			case 'none':
				return (
					<button
						onClick={handleSendRequest}
						className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground
							rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
					>
						<UserPlus size={14} />
						Connect
					</button>
				);

			case 'pending_sent':
				return (
					<button
						onClick={handleCancel}
						className="group px-4 py-2 bg-secondary hover:bg-destructive/10 text-muted-foreground hover:text-destructive
							rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
					>
						<Clock size={14} className="group-hover:hidden" />
						<UserX size={14} className="hidden group-hover:inline" />
						<span className="group-hover:hidden">Request Sent</span>
						<span className="hidden group-hover:inline">Cancel Request</span>
					</button>
				);

			case 'pending_received':
				return (
					<div className="flex gap-2">
						<button
							onClick={handleAccept}
							className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground
								rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
						>
							<UserCheck size={14} />
							Accept
						</button>
						<button
							onClick={handleReject}
							className="px-4 py-2 bg-secondary hover:bg-destructive/90 text-foreground hover:text-destructive-foreground
								rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
						>
							<X size={14} />
							Reject
						</button>
					</div>
				);

			case 'friends':
				return (
					<button
						onClick={handleUnfriend}
						className="group px-4 py-2 bg-primary/10 hover:bg-destructive/10 text-primary hover:text-destructive
							rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
					>
						<UserCheck size={14} className="group-hover:hidden" />
						<UserMinus size={14} className="hidden group-hover:inline" />
						<span className="group-hover:hidden">Friends</span>
						<span className="hidden group-hover:inline">Unfriend</span>
					</button>
				);
		}
	};
	return (
		<div className="bg-secondary/50 rounded-xl p-6 border border-border">
			<div className="flex items-center gap-5">
				{/* Avatar with online indicator */}
				<div className="relative shrink-0">
					<Avatar name={username} image={avatar} />
					{!isOwnProfile && (

						<span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-secondary ${
							isOnline ? 'bg-primary' : 'bg-muted-foreground'}`}
						/>
					)}
				</div>

				{/* user info */}
				<div className="flex-1 min-w-0">
					<h1 className="text-xl font-bold text-foreground">{username}</h1>
					<p className="text-muted-foreground text-sm capitalize">
						{type?.toLowerCase() ?? 'user'}
					</p>
				</div>

				{/* action buttons */}
				<div className="flex items-center gap-2 shrink-0">
					{!isOwnProfile && (
						<button
							onClick={handleMessage}
							disabled={messageLoading}
							className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground
								rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-60"
						>
							{messageLoading
								? <Loader2 size={14} className="animate-spin" />
								: <MessageCircle size={14} />}
							Message
						</button>
					)}
					{renderActionButton()}
				</div>
			</div>
		</div>
	);
}
