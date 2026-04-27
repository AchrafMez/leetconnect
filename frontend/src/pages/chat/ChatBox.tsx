import ChatHeader from "./ChatHeader";
import MessageBubble, { type Message } from "./MessageLayer";
import ChatInput from "./ChatInput";
import { useRef, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";

interface ChatBoxProp {
	convers_name: 		string;
	convers_avatar: 	string;
	convers_username?: 	string | undefined;
	messages: 			Message[];
	curr_user: 			string;
	has_more:			boolean;
	loading_more:		boolean;

	onSendMessage: 	(content: string) => void;
	onLoadMore:		() => void;
	onDeleteMessage: (msg_id: number) => void;
	onBack:			() => void;
}

export default function ChatBox({
	convers_name, convers_avatar, convers_username, messages, curr_user,
	onSendMessage, onLoadMore, has_more, loading_more, onDeleteMessage, onBack
}: ChatBoxProp) {
	const bottom_ref = useRef<HTMLDivElement>(null);
	const scroll_ref = useRef<HTMLDivElement>(null);
	const is_initial_load = useRef(true);

	useEffect(() => {
		if (is_initial_load.current) {
			bottom_ref.current?.scrollIntoView();
			is_initial_load.current = false;
			return;
		}
		const last = messages[messages.length - 1];
		const ref = scroll_ref.current;
		const near_bottom = ref
			? ref.scrollHeight - ref.scrollTop - ref.clientHeight < 150
			: false;
		if (last?.sender_id === curr_user || near_bottom) {
			bottom_ref.current?.scrollIntoView({ behavior: 'smooth' });
		}
	}, [messages, curr_user]);

	useEffect(() => {
		is_initial_load.current = true;
	}, [convers_name]);

	const handleScroll = useCallback(() => {
		const ref = scroll_ref.current;
		// console.log("ref:", ref?.scrollTop);
		if (!ref || !has_more || loading_more) return;
		if (ref.scrollTop < 20) {
			const prev_height = ref.scrollHeight;
			const restore = () => {
				ref.scrollTop = ref.scrollHeight - prev_height;
			};

			const observer = new MutationObserver(() => {
				restore();
				observer.disconnect();
			});
			observer.observe(ref, {childList: true});
			onLoadMore();
		}
	}, [has_more, loading_more, onLoadMore]);

	return (
		<div className="flex-1 flex flex-col min-w-0">
			<ChatHeader name={convers_name} avatar={convers_avatar} is_online={true} username={convers_username} onBack={onBack}/>
			<div ref={scroll_ref} onScroll={handleScroll} className="flex-1 overflow-y-auto px-6 py-4">
				{loading_more && (
					<div className="flex justify-center py-3">
						<Loader2 className="h-5 w-5 animate-spin text-muted-foreground"/>
					</div>
				)}
				{messages.map((msg) => (
					<MessageBubble
						key={msg.id}
						message={msg}
						curr_user={curr_user}
						onDelete={onDeleteMessage}
					/>
				))}
				<div ref={bottom_ref} />
			</div>
			<ChatInput onSend={onSendMessage}/>
		</div>
	);
}
