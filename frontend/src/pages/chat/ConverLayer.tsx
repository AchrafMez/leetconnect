import Avatar from "./Avatar";

export interface ConvMember {
	user_id: 	string;
	user: {
		username:	string;
		avatar:	string;
	};
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
	onClick: () => void;
}

export default function ConversLayer({
	convers, is_active, curr_user, onClick
}: ConversLayerProp) {
	const display_name = convers.type === 'Direct'
		? convers.members?.find((m) => m.user_id !== curr_user)?.user?.username ?? 'Unknown'
		: convers.name ?? 'Unnamed Group';
	const display_avatar = convers.type === 'Direct'
		? convers.members?.find((m) => m.user_id !== curr_user)?.user?.avatar
		: undefined;

	const last_msg = convers.messages?.[0];
	const preview = last_msg?.content ?? '';

	const timestamp = new Date(convers.updated_at).toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit',
	});
	return (
		<button
			onClick={onClick}
			className={`relative w-full flex items-center gap-3 px-4 py-3 text-left
						transition-colors hover:bg-secondary/50
						${is_active ? "bg-secondary" : ""}`}
		>
			{is_active && (
				<span className="absolute left-0 w-1 h-full bg-primary"/>
			)}
			<Avatar name={display_name} image={display_avatar}/>
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
