import Avatar from "./Avatar";

export interface Message {
	id: 			number;
	content: 		string;
	sender_id: 		number;
	created_at: 	string;
	convers_id: 	number;
	sender: {
		username: 	string;
		avatar: 	string;
	}
}

interface MessageProp {
	message: 		Message;
	curr_user:		number;
}

export default function MessageLayer({message, curr_user}: MessageProp) {
	const is_mine = message.sender_id === curr_user;
	const time = new Date(message.created_at).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit"
	});

	if (is_mine) {
		return (
			<div className="flex justify-end mb-4">
				<div className="max-w-md">
					<div className="bg-primary/90 text-foreground rounded-2xl rounded-br-sm px-4 py-2.5">
						<p className="text-sm leading-relaxed">{message.content}</p>
					</div>
					<p className="text-xs text-muted-foreground mt-1 text-right">
						{time}
					</p>
				</div>
			</div>
		);
	}
	return (
		<div className="flex gap-3 mb-4">
			<Avatar name={message.sender.username} image={message.sender.avatar} size="sm" />
			<div className="max-w-md">
				<div className="bg-secondary rounded-2xl rounded-bl-sm px-4 py-2.5">
					<p className="text-sm text-foreground leading-relaxed">
						{message.content}
					</p>
				</div>
				<p className="text-xs text-muted-foreground mt-1">{time}</p>
			</div>
		</div>
	);
}