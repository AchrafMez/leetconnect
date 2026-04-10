import ChatHeader from "./ChatHeader";
import MessageBubble, { type Message } from "./MessageLayer";
import ChatInput from "./ChatInput";
import { useRef, useEffect } from "react";

interface ChatBoxProp {
	convers_name: 	string;
	convers_avatar: string;
	messages: 		Message[];
	curr_user: 		number;
	onSendMessage: 	(content: string) => void;
}

export default function ChatBox({
	convers_name, convers_avatar, messages, curr_user, onSendMessage}: ChatBoxProp) {
	const bottom_ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		bottom_ref.current?.scrollIntoView({behavior: "smooth"});
	}, [messages]);

	return (
		<div className="flex-1 flex flex-col min-w-0">
			<ChatHeader name={convers_name} avatar={convers_avatar} is_online={true}/>
			<div className="flex-1 overflow-y-auto px-6 py-4">
				{messages.map((msg) => (
					<MessageBubble key={msg.id} message={msg} curr_user={curr_user}/>
				))}
				<div ref={bottom_ref} />
			</div>
			<ChatInput onSend={onSendMessage}/>
		</div>
	);
}
