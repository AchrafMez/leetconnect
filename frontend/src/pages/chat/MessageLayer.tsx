import Avatar from "@/components/ui/Avatar";
import { useState } from "react";
import { Trash2, Check, X } from "lucide-react";

export interface Message {
	id: 			number;
	content: 		string;
	sender_id: 		string;
	created_at: 	string;
	convers_id: 	number;
	sender: {
		username: 	string;
		avatar: 	string;
	}
}

interface MessageProp {
	message: 		Message;
	curr_user:		string;
	onDelete:		(msg_id: number) => void;
}

export default function MessageLayer({message, curr_user, onDelete}: MessageProp) {
	const is_mine = message.sender_id === curr_user;
	const [confirming, setConfirming] = useState(false);
	const created = new Date(message.created_at);
	const is_today = created.toDateString() === new Date().toDateString();
	const time_part = created.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit"
	});
	const date_part = created.toLocaleDateString([], {
		month: "short",
		day: "numeric"
	});
	const time = is_today ? time_part : `${date_part}, ${time_part}`;

	if (is_mine) {
		return (
			<div className="flex flex-col items-end mb-4 group">
				<div className="flex items-center max-w-[85%] sm:max-w-md">
					<div className="w-14 mr-2 flex items-center justify-end shrink-0">
						{confirming ? (
							<div className="flex items-center gap-1">
								<button
									onClick={() => { onDelete(message.id); setConfirming(false); }}
									className="p-1 rounded-md text-destructive hover:bg-red-500/10 transition-colors cursor-pointer"
									title="confirm delete"
								>
									<Check size={16} />
								</button>
								<button
									onClick={() => setConfirming(false)}
									className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
									title="cancel"
								>
									<X size={16} />
								</button>
							</div>
						) : (
							<button
								onClick={() => setConfirming(true)}
								className="p-1 rounded-md opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-secondary transition-all cursor-pointer"
								title="delete message"
							>
								<Trash2 size={16} />
							</button>
						)}
					</div>

					<div className={`min-w-0 max-w-full bg-primary/90 text-foreground rounded-2xl rounded-br-sm px-4 py-2.5 ${confirming ? 'ring-2 ring-destructive/50' : ''}`}>
						<p className="text-sm leading-relaxed wrap-break-word whitespace-pre-wrap">{message.content}</p>
					</div>
				</div>
				<p className="text-xs text-muted-foreground mt-1">{time}</p>
			</div>
		);
	}

	return (
		<div className="flex gap-3 mb-4">
			<Avatar name={message.sender?.username} image={message.sender?.avatar} size="sm" />
			<div className="max-w-[85%] sm:max-w-md min-w-0">
				<div className="min-w-0 max-w-full bg-secondary rounded-2xl rounded-bl-sm px-4 py-2.5">
					<p className="text-sm text-foreground leading-relaxed wrap-break-word whitespace-pre-wrap">
						{message.content}
					</p>
				</div>
				<p className="text-xs text-muted-foreground mt-1">{time}</p>
			</div>
		</div>
	);
}