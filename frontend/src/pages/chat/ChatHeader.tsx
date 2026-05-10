import { useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import { ArrowLeft, Info } from "lucide-react";
import { usePresence } from "@/context/PresenceProvider";

interface ChatHeaderProp {
	name: 				string;
	avatar: 			string;
	is_direct: 			boolean;
	receiver_id?:		string | undefined;
	recv_rest_online:	boolean;
	username?:			string | undefined;
	onBack:				() => void;
	onInfoClick:		() => void;
}

export default function ChatHeader({
	name, avatar, is_direct, receiver_id, recv_rest_online,
	username, onBack, onInfoClick,
}: ChatHeaderProp) {
	const navigate = useNavigate();

	const live = usePresence(receiver_id ?? '');
	const isOnline = is_direct ? (live ?? recv_rest_online) : false;
	return(
		<div className="flex items-center justify-between px-6 py-4 border-b border-border">
			<div className="flex items-center gap-3">
				<button
					onClick={onBack}
					className="sm:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground
							   hover:bg-secondary rounded-lg transition-colors cursor-pointer"
				>
					<ArrowLeft size={18} />
				</button>
				<div
					className={username ? "cursor-pointer" : ""}
					onClick={() => username && navigate(`/profile/${username}`)}
				>
					<Avatar name={name} image={avatar}/>
				</div>
				<div>
					<h2 className="text-foreground font-semibold text-sm">{name}</h2>
					{is_direct && (isOnline ? (
						<p className="flex items-center text-xs text-primary gap-1">
							<span className="w-2.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(34,197,94,0.85)] animate-pulse" />
							online
						</p>
					) : (
						<p className="text-xs text-muted-foreground/90 flex items-center gap-1">
							<span className="w-2.5 h-1.5 bg-muted-foreground/90 rounded-full" />
							offline
						</p>
					))}
				</div>
			</div>
			<div className="flex items-center gap-1">
				<button
					onClick={onInfoClick}
					className="p-2 text-muted-foreground hover:text-foreground
						hover:bg-secondary rounded-lg transition-colors cursor-pointer"
				>
					<Info size={18} />
				</button>
			</div>
		</div>
	);
}
