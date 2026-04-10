// // @adbouras
import { useState, useEffect, useCallback } from "react";
import { MessageCircle } from "lucide-react";
import ChatBox from "./ChatBox";
import ConversPanel from "./ConversPannel";
import { chatApi } from "../../lib/api";
import { getSocket } from "../../lib/socket";
import type { Message } from "./MessageLayer";
import type { Conversation } from "./ConverLayer";

const CURRENT_USER_ID = Number(new URLSearchParams(window.location.search).get('user_id')) || 1;; // TODO: replace with auth user

export default function Messages() {
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [messages, setMessages] = useState<Message[]>([]);
	const [active_id, setActiveId] = useState<number | null>(null);

	// load conversations
	useEffect(() => {
		chatApi.listConversations(CURRENT_USER_ID)
			.then(setConversations)
			.catch(console.error);
	}, []);

	// load messages when active conversation changes
	useEffect(() => {
		if (!active_id) { setMessages([]); return; }

		chatApi.listMessages(active_id, CURRENT_USER_ID)
			.then((data) => setMessages(data.messages.reverse()))
			.catch(console.error);
	}, [active_id]);

	// join room and listen for new messages
	useEffect(() => {
		if (!active_id) return;

		const socket = getSocket();
		socket.emit('join_convers', active_id);

		const handler = (msg: Message) => {
			if (msg.convers_id === active_id && msg.sender_id !== CURRENT_USER_ID) {
				setMessages((prev) => [...prev, msg]);
			}
		};
		socket.on('new_message', handler);

		return () => {
			socket.emit('leave_covers', active_id);
			socket.off('new_message', handler);
		};
	}, [active_id]);

	const handleSend = useCallback(async (content: string) => {
		if (!active_id) return;
		try {
			const msg = await chatApi.sendMessage(active_id, CURRENT_USER_ID, content);
			setMessages((prev) => [...prev, msg]);
		} catch (err) {
			console.error('Send failed:', err instanceof Error ? err.message : err);
		}
	}, [active_id]);

	const active_convers = conversations.find((c) => c.id === active_id);

	// name/avatar for the ChatBox header
	const convers_name = active_convers
		? active_convers.type === 'Direct'
			? active_convers.members.find((m) => m.user_id !== CURRENT_USER_ID)?.user.username ?? 'Unknown'
			: active_convers.name ?? 'Unnamed Group'
		: '';

	const convers_avatar = active_convers?.type === 'Direct'
		? active_convers.members.find((m) => m.user_id !== CURRENT_USER_ID)?.user.avatar ?? ''
		: '';

	return (
		<div className="flex fixed inset-0 top-16">
			<ConversPanel
				conversations={conversations}
				active_id={active_id}
				curr_user={CURRENT_USER_ID}
				onSelect={setActiveId}
			/>

			{active_convers ? (
				<ChatBox
					convers_name={convers_name}
					convers_avatar={convers_avatar}
					messages={messages}
					curr_user={CURRENT_USER_ID}
					onSendMessage={handleSend}
				/>
			) : (
				<div className="flex-1 flex items-center justify-center text-muted-foreground">
					<div className="text-center">
						<MessageCircle size={48} className="mx-auto mb-3 opacity-30" />
						<p className="text-lg font-medium">select a conversation</p>
					</div>
				</div>
			)}
		</div>
	);
}
