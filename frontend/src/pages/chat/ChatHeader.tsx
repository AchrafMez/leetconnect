import { useNavigate } from "react-router-dom";
import Avatar from "@/components/ui/Avatar";
import { ArrowLeft, Info, Users } from "lucide-react";
import { usePresence } from "@/context/PresenceProvider";

interface ChatHeaderProp {
	name: 				string;
	avatar: 			string;
	is_direct: 			boolean;
	receiver_id?:		string | undefined;
	recv_rest_online:	boolean;
	username?:			string | undefined;
	member_count?:		number | undefined;
	onBack:				() => void;
	onInfoClick:		() => void;
}

export default function ChatHeader({
	name, avatar, is_direct, receiver_id, recv_rest_online,
	username, member_count, onBack, onInfoClick,
}: ChatHeaderProp) {
	const navigate = useNavigate();

	const live = usePresence(receiver_id ?? '');
	const isOnline = is_direct ? (live ?? recv_rest_online) : false;

	return (
		<div className="flex items-center justify-between px-5 py-3 border-b border-border/50">
			<div className="flex items-center gap-3 min-w-0">
				<button
					onClick={onBack}
					className="sm:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground
							   hover:bg-secondary rounded-lg transition-colors cursor-pointer"
				>
					<ArrowLeft size={18} />
				</button>
				<div
					className={username ? "cursor-pointer shrink-0" : "shrink-0"}
					onClick={() => username && navigate(`/profile/${username}`)}
				>
					<Avatar name={name} image={avatar} shape="rounded" />
				</div>
				<div className="min-w-0">
					<h2 className="text-foreground font-semibold text-sm truncate">{name}</h2>
					{is_direct ? (isOnline ? (
						<p className="flex items-center text-xs text-primary gap-1.5">
							<span className="w-3 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(34,197,94,0.85)] animate-pulse" />
							Online
						</p>
					) : (
						<p className="text-xs text-muted-foreground flex items-center gap-1.5">
							<span className="w-3 h-2 bg-muted-foreground/80 rounded-full" />
							Offline
						</p>
					)) : (
						member_count !== undefined && (
							<p className="text-xs text-muted-foreground flex items-center gap-1.5">
								<Users size={11} />
								{member_count} member{member_count === 1 ? '' : 's'}
							</p>
						)
					)}
				</div>
			</div>
			<button
				onClick={onInfoClick}
				className="p-2 text-muted-foreground hover:text-foreground
					hover:bg-secondary rounded-lg transition-colors cursor-pointer shrink-0"
			>
				<Info size={18} />
			</button>
		</div>
	);
}
