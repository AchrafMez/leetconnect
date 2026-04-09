import Avatar from "./Avatar";

export interface Message {
	id: 			number;
	content: 		string;
	sender_id: 		number;
	sender_name: 	string;
	sender_avatar?:	string;
	created_at: 	string;
	is_mine: 		boolean;
}

interface MessageProp {
	message: Message;
}

export default function MessageLayer({message}: MessageProp) {
	const time = new Date(message.created_at).toLocaleDateString([], {
		hour: "2-digit",
		minute: "2-digit"
	});

	if (message.is_mine) {
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
			<Avatar name={message.sender_name} image={message.sender_avatar} size="sm" />
			<div className="max-w-mb">
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