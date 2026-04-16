import { useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import { Info } from "lucide-react";

interface ChatHeaderProp {
	name: 		string;
	avatar: 	string;
	is_online: 	boolean;
	username?:	string | undefined;
}

export default function ChatHeader({name, avatar, is_online = false, username}: ChatHeaderProp) {
	const navigate = useNavigate();

	return(
		<div className="flex items-center justify-between px-6 py-4 border-b border-border">
			<div className="flex items-center gap-3">
				<div
					className={username ? "cursor-pointer" : ""}
					onClick={() => username && navigate(`/profile/${username}`)}
				>
					<Avatar name={name} image={avatar}/>
				</div>
				<div>
					<h2 className="text-foreground font-semibold text-sm">{name}</h2>
					{is_online && (
						<p className="text-xs text-primary flex items-center gap-1">
							<span className="w-2.5 h-1.5 bg-primary rounded-full" />
							online
						</p>
					)}
				</div>
			</div>
			<div className="flex items-center gap-1">
				<button className="p-2 text-muted-foreground hover:text-foreground
									hover:bg-secondary rounded-lg transition-colors"
				>
					<Info size={18} />			
				</button>
			</div>
		</div>
	);
}
