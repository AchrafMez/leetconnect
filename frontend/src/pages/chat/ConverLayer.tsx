import Avatar from "@/components/ui/Avatar";
import { usePresence } from "@/context/PresenceProvider";

export interface ConvMember {
	user_id: 	string;
	user: {
		username:	string;
		firstname?:	string;
		lastname?:	string;
		avatar:		string;
		isOnline?:	boolean;
	};
}

export function displayName(user: {
	username: string;
	firstname?: string | undefined;
	lastname?: string | undefined
}) : string {
	const  fullName = [user.firstname, user.lastname].filter(Boolean).join(' ');
	return fullName || user.username;
}

export interface ConvLastMessage {
	content:	string;
	sender_id:	string;
	created_at:	string;
}

export interface Conversation {
	id: 		number;
	name: 		string;
	type: 		'Direct' | 'Group';
	created_at:	string;
	updated_at:	string;
	members:	ConvMember[];
	messages:	ConvLastMessage[];
}

interface ConversLayerProp {
	convers: 	Conversation;
	is_active: 	boolean;
	curr_user: 	string;
	onClick: 	() => void;
}

export default function ConversLayer({
	convers, is_active, curr_user, onClick
}: ConversLayerProp) {

	const otherMember = convers.type === 'Direct'
		? convers.members?.find((m) => m.user_id !== curr_user)
		: undefined;

	const liveOnline = usePresence(otherMember?.user_id ?? '');
	const restOnline = otherMember?.user.isOnline ?? false;
	const onlineNow  = liveOnline ?? restOnline;

	const display_name = convers.type === 'Direct'
		? (otherMember?.user ? displayName(otherMember.user) : 'Unknown')
		: convers.name ?? 'Unnamed Group';
	const display_avatar = convers.type === 'Direct'
		? convers.members?.find((m) => m.user_id !== curr_user)?.user?.avatar
		: undefined;

	const last_msg = convers.messages?.[0];
	const preview = last_msg?.content ?? '';

	const ts_iso = last_msg?.created_at ?? convers.updated_at;
	const created = new Date(ts_iso);
	const is_valid = !Number.isNaN(created.getTime());

	const time_part = is_valid
		? created.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
		: '';
	const date_part = is_valid
		? created.toLocaleDateString([], { month: "short", day: "numeric" })
		: '';
	const is_today = is_valid && created.toDateString() === new Date().toDateString();
	const timestamp = !is_valid ? '' : (is_today ? time_part : `${date_part}, ${time_part}`);
	return (
		<button
			onClick={onClick}
			className={`relative w-full flex items-center gap-3 px-4 py-3 text-left
						transition-colors hover:bg-secondary/50 cursor-pointer
						${is_active ? "bg-secondary" : ""}`}
		>
			{is_active && <span className="absolute left-0 w-1 h-full bg-primary"/>}

			<div className="relative">
				<Avatar name={display_name} image={display_avatar}/>
				{convers.type === 'Direct' && (
					<span
						className={`absolute bottom-0 right-0 w-4 h-4 rounded-full
							border-2 border-background
							${onlineNow ? 'bg-primary' : 'bg-muted-foreground/90'}`}
					/>
				)}
			</div>

			<div className="flex-1 min-w-0">
				<div className="flex items-center justify-between">
					<span className="text-sm font-medium text-foreground">
						{display_name}
					</span>
					<span className="text-xs text-muted-foreground ml-2 shrink-0">
						{timestamp}
					</span>
				</div>
				<p className="text-xs text-muted-foreground truncate mt-0.5">
					{preview}
				</p>
			</div>
		</button>
	);
}
