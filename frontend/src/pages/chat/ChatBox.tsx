import ChatHeader from "./ChatHeader";
import MessageBubble, { type Message } from "./MessageLayer";
import ChatInput from "./ChatInput";

interface ChatBoxProp {
	convers_name: 	string;
	convers_avatar: string;
	messages: 		Message[];
	onSendMessage: 	(content: string) => void;
}

export default function ChatBox({
	convers_name, convers_avatar, messages, onSendMessage}: ChatBoxProp) {
	return (
		<div className="flex-1 flex flex-col min-w-0">
			<ChatHeader name={convers_name} avatar={convers_avatar} is_online={true}/>
			<div className="flex-1 overflow-y-auto px-6 py-4">
				{messages.map((msg) => (
					<MessageBubble key={msg.id} message={msg}/>
				))}
			</div>
			<ChatInput onSend={onSendMessage}/>
		</div>
	);
}
