import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	UserPlus, UserCheck, UserMinus, X, Clock, Loader2,
	MessageCircle, Settings, Briefcase, MapPin, Calendar,
} from 'lucide-react';
import { chatApi, friendApi } from '../../lib/api';
import Avatar from '../chat/Avatar';
import { Card, CardContent } from '@/components/ui/card';

interface ProfileHeaderProps {
	profileUser:		any;
	isOwnProfile:		boolean;
	friendStatus:		'none' | 'pending_sent' | 'pending_received' | 'friends';
	friendRequestId?:	number | undefined;
	onFriendAction:		() => void;
}

export default function ProfileHeader({
	profileUser, isOwnProfile, friendStatus, friendRequestId, onFriendAction,
}: ProfileHeaderProps) {
	const [actionLoading, setActionLoading] = useState(false);
	const [messageLoading, setMessageLoading] = useState(false);
	const navigate = useNavigate();

	const {
		id: targetUserId,
		username, avatar, type, isOnline,
		firstname, lastname, title, location, createdAt,
	} = profileUser;

	const fullName = [firstname, lastname].filter(Boolean).join(' ') || username;
	const joinedDate = createdAt
		? new Date(createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
		: null;
	const typeLabel = type === 'FREELANCER' ? 'Freelancer' : type === 'CLIENT' ? 'Client' : null;

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
		try { await friendApi.sendRequest(targetUserId); onFriendAction(); }
		catch (err) { console.error('Failed to send friend request:', err); }
		finally { setActionLoading(false); }
	};

	const handleAccept = async () => {
		if (!friendRequestId) return;
		setActionLoading(true);
		try { await friendApi.acceptRequest(friendRequestId); onFriendAction(); }
		catch (err) { console.error('Failed to accept request:', err); }
		finally { setActionLoading(false); }
	};

	const handleReject = async () => {
		if (!friendRequestId) return;
		setActionLoading(true);
		try { await friendApi.rejectRequest(friendRequestId); onFriendAction(); }
		catch (err) { console.error('Failed to reject request:', err); }
		finally { setActionLoading(false); }
	};

	const handleUnfriend = async () => {
		setActionLoading(true);
		try { await friendApi.removeFriend(targetUserId); onFriendAction(); }
		catch (err) { console.error('Failed to remove friend:', err); }
		finally { setActionLoading(false); }
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
				<button
					onClick={() => navigate('/settings/profile')}
					className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground
						rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
				>
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
					<div className="px-4 py-2 bg-secondary text-muted-foreground
						rounded-lg text-sm font-medium flex items-center gap-2">
						<Clock size={14} />
						<span>Request Sent</span>
					</div>
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
						<span className="group-hover:hidden"> Connected</span>
						<span className="hidden group-hover:inline">Disconnect</span>
					</button>
				);
		}
	};

	return (
		<Card className="border-border/50 bg-background-elevated overflow-hidden">
			{/* gradient banner */}
			<div className="h-20 sm:h-24 bg-linear-to-r from-primary/30 via-primary/10 to-transparent" />

			<CardContent className="p-4 sm:p-6 -mt-12 sm:-mt-14">
				<div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
					{/* avatar */}
					<div className="shrink-0 mx-auto sm:mx-0">
						<div className="rounded-full ring-4 ring-background-elevated">
							<Avatar name={fullName} image={avatar} size="lg" />
						</div>
					</div>

					{/* identity + actions */}
					<div className="flex-1 min-w-0 sm:pt-12">
						<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
							<div className="min-w-0 text-center sm:text-left">
								<div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
									<h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
										{fullName}
									</h1>
								</div>
								<p className="text-sm text-muted-foreground">@{username}</p>
								{title && (
									<p className="mt-1 text-sm font-medium text-foreground/80">
										{title}
									</p>
								)}
							</div>

							<div className="flex items-center justify-center sm:justify-end gap-2 shrink-0 flex-wrap">
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

						<div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start
							gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
							{typeLabel && (
								<span className="flex items-center gap-1.5">
									<Briefcase size={14} className="text-primary/70" />
									{typeLabel}
								</span>
							)}
							{location && (
								<span className="flex items-center gap-1.5">
									<MapPin size={14} className="text-primary/70" />
									{location}
								</span>
							)}
							{joinedDate && (
								<span className="flex items-center gap-1.5">
									<Calendar size={14} className="text-primary/70" />
									Joined {joinedDate}
								</span>
							)}
							{!isOwnProfile && (
								<span className="flex items-center gap-1.5">
									<span className={`w-3 h-2 rounded-full ${isOnline ? 'bg-primary' : 'bg-muted-foreground'}`} />
									{isOnline ? 'Online' : 'Offline'}
								</span>
							)}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
