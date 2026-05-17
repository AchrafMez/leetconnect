import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	UserPlus, UserCheck, UserMinus, X, Clock, Loader2,
	MessageCircle, Settings, Briefcase, MapPin, Calendar,
} from 'lucide-react';
import { chatApi, friendApi } from '../../lib/api';
import { useRateLimit, RateLimitBanner } from '../../lib/RateLimit';
import Avatar from '@/components/ui/Avatar';
import { Card, CardContent } from '@/components/ui/card';
import { usePresence } from '@/context/PresenceProvider';

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
	const rl = useRateLimit();

	const {
		id: targetUserId,
		username, avatar, type, isOnline,
		firstname, lastname, title, location, createdAt,
	} = profileUser;

	const live 		= usePresence(targetUserId);
	const onlineNow = live ?? isOnline;

	const fullName = [firstname, lastname].filter(Boolean).join(' ') || username;
	const joinedDate = createdAt
		? new Date(createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
		: null;
	const typeLabel = type === 'FREELANCER' ? 'Freelancer' : type === 'CLIENT' ? 'Client' : null;

	const handleMessage = async () => {
		if (rl.isLimited) return;
		setMessageLoading(true);
		try {
			const convers = await chatApi.createConversation({
				type: 'Direct',
				member_ids: [targetUserId],
			});
			navigate(`/chat?conv=${convers.id}`);
		} catch (err) {
			rl.handle(err);
				// console.error('Failed to open conversation:', err instanceof Error ? err.message : err);
		} finally {
			setMessageLoading(false);
		}
	};

	const handleSendRequest = async () => {
		if (rl.isLimited) return;
		setActionLoading(true);
		try { await friendApi.sendRequest(targetUserId); onFriendAction(); }
		catch (err) {
			rl.handle(err);
				// console.error('Failed to send friend request:', err instanceof Error ? err.message : err);
		} finally { setActionLoading(false); }
	};

	const handleAccept = async () => {
		if (!friendRequestId || rl.isLimited) return;
		setActionLoading(true);
		try { await friendApi.acceptRequest(friendRequestId); onFriendAction(); }
		catch (err) {
			rl.handle(err);
				// console.error('Failed to accept request:', err instanceof Error ? err.message : err);
		} finally { setActionLoading(false); }
	};

	const handleReject = async () => {
		if (!friendRequestId || rl.isLimited) return;
		setActionLoading(true);
		try { await friendApi.rejectRequest(friendRequestId); onFriendAction(); }
		catch (err) {
			rl.handle(err);
				// console.error('Failed to reject request:', err instanceof Error ? err.message : err);
		} finally { setActionLoading(false); }
	};

	const handleUnfriend = async () => {
		if (rl.isLimited) return;
		setActionLoading(true);
		try { await friendApi.removeFriend(targetUserId); onFriendAction(); }
		catch (err) {
			rl.handle(err);
				// console.error('Failed to remove friend:', err instanceof Error ? err.message : err);
		} finally { setActionLoading(false); }
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
					onClick={() => navigate('/settings')}
					className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground cursor-pointer
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
						disabled={rl.isLimited}
						className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground
							rounded-lg text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer
							disabled:opacity-60 disabled:cursor-not-allowed"
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
							disabled={rl.isLimited}
							className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground
								rounded-lg text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer
								disabled:opacity-60 disabled:cursor-not-allowed"
						>
							<UserCheck size={14} />
							Accept
						</button>
						<button
							onClick={handleReject}
							disabled={rl.isLimited}
							className="px-4 py-2 bg-secondary hover:bg-destructive/90 text-foreground hover:text-destructive-foreground
								rounded-lg text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer
								disabled:opacity-60 disabled:cursor-not-allowed"
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
						disabled={rl.isLimited}
						className="group px-4 py-2 bg-primary/10 hover:bg-destructive/10 text-primary hover:text-destructive
							rounded-lg text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer
							disabled:opacity-60 disabled:cursor-not-allowed"
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
						<div className="rounded-xl ring-4 ring-background-elevated">
							<Avatar name={fullName} image={avatar} size="lg" shape="rounded" />
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

							<div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
								<div className="flex items-center justify-center sm:justify-end gap-2 flex-wrap">
									{!isOwnProfile && (
										<button
											onClick={handleMessage}
											disabled={messageLoading || rl.isLimited}
											className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground cursor-pointer
												rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
										>
											{messageLoading
												? <Loader2 size={14} className="animate-spin" />
												: <MessageCircle size={14} />}
											Message
										</button>
									)}
									{renderActionButton()}
								</div>
								<RateLimitBanner message={rl.message} secondsLeft={rl.secondsLeft} />
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
								<span className={`flex items-center gap-1.5 ${onlineNow ? 'text-primary' : 'text-muted-foreground'}`}>
									<span className={`w-3 h-2 rounded-full ${onlineNow ? 'bg-primary shadow-[0_0_10px_rgba(34,197,94,0.85)] animate-pulse' : 'bg-muted-foreground'}`} />
									{onlineNow ? 'Online' : 'Offline'}
								</span>
							)}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
