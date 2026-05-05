import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/userContext';
import { chatApi, friendApi } from '../../lib/api';
import ProfileHeader from './ProfileHeader';
import ProfileBio from './ProfileBio';
import { usePresenceSeed } from '@/context/PresenceProvider';

export default function ProfilePage() {
	const { username } = useParams<{ username: string }>();
	const { user: currentUser, loading: authLoading } = useAuth();

	const [profileUser, setProfileUser] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	const [friendStatus, setFriendStatus] = useState<
		'none' | 'pending_sent' | 'pending_received' | 'friends'
	>('none');
	const [friendRequestId, setFriendRequestId] = useState<number | undefined>();

	const [refreshTrigger, setRefreshTrigger] = useState(0);

	const isOwnProfile = !username || username === currentUser?.username;

	const seed = usePresenceSeed();

	// fetch profile data
	useEffect(() => {
		const fetchProfile = async () => {
			setLoading(true);
			try {
				if (isOwnProfile) {
					setProfileUser(currentUser);
				} else {
					const data = await chatApi.getUser(username!);
					setProfileUser(data);
					seed([{ id: data.id, isOnline: data.isOnline }]);
				}
			} catch (err) {
				console.error('Failed to fetch profile:', err);
			} finally {
				setLoading(false);
			}
		};

		if (!authLoading) fetchProfile();
	}, [username, currentUser, authLoading, isOwnProfile, seed]);

	// check friend status
	useEffect(() => {
		const checkFriendStatus = async () => {
			if (isOwnProfile || !profileUser?.id) return;

			try {
				const [incoming, outgoing, friends] = await Promise.all([
					friendApi.listIncoming(),
					friendApi.listOutgoing(),
					friendApi.listFriends(),
				]);

				const targetId = profileUser.id;

				const isFriend = friends.some((f: any) => f.id === targetId);
				if (isFriend) { setFriendStatus('friends'); return; }

				const inReq = incoming.find((r: any) => r.sender_id === targetId);
				if (inReq) { setFriendStatus('pending_received'); setFriendRequestId(inReq.id); return; }

				const outReq = outgoing.find((r: any) => r.receiver_id === targetId);
				if (outReq) { setFriendStatus('pending_sent'); setFriendRequestId(outReq.id); return; }

				setFriendStatus('none');
			} catch (err) {
				console.error('Failed to check friend status:', err);
			}
		};

		checkFriendStatus();
	}, [profileUser, isOwnProfile, refreshTrigger]);

	// refresh callback for child components
	const handleFriendAction = () => {
		setRefreshTrigger((prev) => prev + 1);
	};

	// loading state
	if (authLoading || loading) {
		return (
			<div className="flex justify-center items-center min-h-[50vh]">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (!profileUser) {
		return (
			<div className="flex justify-center items-center min-h-[50vh]">
				<p className="text-muted-foreground">User not found.</p>
			</div>
		);
	}

	return (
		<div className="max-w-3xl mx-auto py-6 px-4 sm:py-8 pb-20 space-y-6 sm:space-y-8">
			<ProfileHeader
				profileUser={profileUser}
				isOwnProfile={isOwnProfile}
				friendStatus={friendStatus}
				friendRequestId={friendRequestId}
				onFriendAction={handleFriendAction}
			/>
			<ProfileBio
				profileUser={profileUser}
				isOwnProfile={isOwnProfile}
			/>
		</div>
	);
}
