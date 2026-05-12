import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, UserPlus, Users, ExternalLink, Loader2, Check } from 'lucide-react';
import Avatar from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import type { Conversation, ConvMember } from './ConverLayer';
import { displayName } from './ConverLayer';
import type { Friend } from '../../lib/api';
import { chatApi } from '../../lib/api';

interface ChatInfoPanelProps {
	convers:		Conversation;
	curr_user:		string;
	friends:		Friend[];
	onClose:		() => void;
	onLeft:			(convers_id: number) => void;
	onMemberAdded:	(convers_id: number, member: ConvMember) => void;
}

export default function ChatInfoPanel({
	convers, curr_user, friends, onClose, onLeft, onMemberAdded,
}: ChatInfoPanelProps) {
	const navigate = useNavigate();
	const [showInvite, setShowInvite] = useState(false);
	const [adding, setAdding] = useState<string | null>(null);
	const [leaving, setLeaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const isDirect = convers.type === 'Direct';
	const otherMember = isDirect
		? convers.members.find((m) => m.user_id !== curr_user)
		: undefined;

	const memberIds = useMemo(
		() => new Set(convers.members.map((m) => m.user_id)),
		[convers.members],
	);
	const inviteable = useMemo(
		() => friends.filter((f) => !memberIds.has(f.id)),
		[friends, memberIds],
	);

	const handleLeave = async () => {
		if (!confirm('Leave this group?')) return;
		setLeaving(true);
		setError(null);
		try {
			await chatApi.leaveConversation(convers.id, curr_user);
			onLeft(convers.id);
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to leave');
			setLeaving(false);
		}
	};

	const handleInvite = async (friend: Friend) => {
		setAdding(friend.id);
		setError(null);
		try {
			const member = await chatApi.addMember(convers.id, friend.id);
			onMemberAdded(convers.id, member);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to add member');
		} finally {
			setAdding(null);
		}
	};

	return (
		<Dialog open onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-md max-h-[85vh] overflow-y-auto duration-0! data-[state=open]:animate-none! data-[state=closed]:animate-none!">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
							<Users size={18} className="text-primary" />
						</div>
						<div className="min-w-0">
							<DialogTitle>{isDirect ? 'Profile' : 'Network Info'}</DialogTitle>
							<DialogDescription>
								{isDirect ? 'View this contact' : `${convers.members.length} member${convers.members.length === 1 ? '' : 's'}`}
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="space-y-5 pt-2">
					{error && (
						<p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md">
							{error}
						</p>
					)}

					{isDirect ? (
						<DirectPanel member={otherMember} onViewProfile={(username) => navigate(`/profile/${username}`)} />
					) : (
						<>
							<GroupHeader convers={convers} />

							<MembersSection
								members={convers.members}
								curr_user={curr_user}
								onClickMember={(username) => navigate(`/profile/${username}`)}
							/>

							{showInvite ? (
								<InviteSection
									inviteable={inviteable}
									adding={adding}
									onAdd={handleInvite}
									onClose={() => setShowInvite(false)}
								/>
							) : (
								<Button
									variant="secondary"
									className="w-full"
									onClick={() => setShowInvite(true)}
								>
									<UserPlus size={16} className="mr-2" />
									Invite friends
								</Button>
							)}

							<Button
								variant="destructive"
								className="w-full"
								onClick={handleLeave}
								disabled={leaving}
							>
								{leaving ? <Loader2 size={16} className="animate-spin mr-2" /> : <LogOut size={16} className="mr-2" />}
								Leave group
							</Button>
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

function DirectPanel({
	member, onViewProfile,
}: {
	member: ConvMember | undefined;
	onViewProfile: (username: string) => void;
}) {
	if (!member) {
		return <p className="text-sm text-muted-foreground text-center py-8">User not available.</p>;
	}
	const { user } = member;
	const fullName = displayName(user);

	return (
		<div className="flex flex-col items-center text-center space-y-3 py-2">
			<Avatar name={fullName} image={user.avatar} size="lg" shape="rounded" />
			<div>
				<p className="text-foreground font-semibold text-lg">{fullName}</p>
				<p className="text-sm text-muted-foreground">@{user.username}</p>
			</div>
			<Button onClick={() => onViewProfile(user.username)}>
				<ExternalLink size={14} className="mr-2" />
				View full profile
			</Button>
		</div>
	);
}

function GroupHeader({ convers }: { convers: Conversation }) {
	return (
		<div className="flex flex-col items-center text-center space-y-2 py-2">
			<div className="w-16 h-16 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
				<Users size={28} />
			</div>
			<p className="text-foreground font-semibold text-lg">{convers.name ?? 'Unnamed Group'}</p>
		</div>
	);
}

function MembersSection({
	members, curr_user, onClickMember,
}: {
	members: ConvMember[];
	curr_user: string;
	onClickMember: (username: string) => void;
}) {
	return (
		<div>
			<h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
				Members ({members.length})
			</h4>
			<div className="space-y-1 max-h-48 overflow-y-auto rounded-lg border border-border/50 p-1">
				{members.map((m) => (
					<MemberRow
						key={m.user_id}
						member={m}
						is_self={m.user_id === curr_user}
						onClick={() => onClickMember(m.user.username)}
					/>
				))}
			</div>
		</div>
	);
}

function MemberRow({ member, is_self, onClick }: {
	member: ConvMember;
	is_self: boolean;
	onClick: () => void;
}) {
	return (
		<button
			onClick={onClick}
			className="w-full flex items-center gap-3 px-3 py-2 rounded-md
				hover:bg-secondary/50 transition-colors text-left cursor-pointer"
		>
			<Avatar name={member.user.username} image={member.user.avatar} size="sm" />
			<span className="text-sm text-foreground flex-1 truncate">
				{displayName(member.user)}
				{is_self && <span className="text-muted-foreground ml-1">(you)</span>}
			</span>
		</button>
	);
}

function InviteSection({ inviteable, adding, onAdd, onClose }: {
	inviteable: Friend[];
	adding:		string | null;
	onAdd:		(f: Friend) => void;
	onClose:	() => void;
}) {
	return (
		<div className="rounded-lg border border-border/50 p-3 space-y-2">
			<div className="flex items-center justify-between">
				<h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					Add friends
				</h4>
				<button
					onClick={onClose}
					className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
				>
					Cancel
				</button>
			</div>
			{inviteable.length === 0 ? (
				<p className="text-sm text-muted-foreground py-3 text-center">
					All your friends are in this network.
				</p>
			) : (
				<div className="space-y-1 max-h-48 overflow-y-auto">
					{inviteable.map((f) => (
						<button
							key={f.id}
							onClick={() => onAdd(f)}
							disabled={adding === f.id}
							className="w-full flex items-center gap-3 px-2 py-2 rounded-md
								hover:bg-secondary/50 transition-colors text-left disabled:opacity-60 cursor-pointer"
						>
							<Avatar name={f.username} image={f.avatar} size="sm" />
							<span className="text-sm text-foreground flex-1 truncate">{f.username}</span>
							{adding === f.id
								? <Loader2 size={14} className="animate-spin text-muted-foreground" />
								: <Check size={14} className="text-primary opacity-0" />}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
