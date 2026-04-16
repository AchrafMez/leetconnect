// // @adbouras
import { useState, useEffect, useCallback } from "react";
import { MessageCircle } from "lucide-react";
import ChatBox from "./ChatBox";
import ConversPanel from "./ConversPannel";
import { chatApi } from "../../lib/api";
import { getSocket } from "../../lib/socket";
import type { Message } from "./MessageLayer";
import type { Conversation } from "./ConverLayer";

function getUserIdFromToken(): string {
	const token = localStorage.getItem('token');
	// console.log('>>>>>>> token:', token);
	if (!token) return '';
	try {
		const parts = token.split('.');
		// console.log('>>>>>>> parts:', parts);
		if (!parts[1]) return '';
		// console.log('>>>>>>> parts[1]:', parts[1]);
		const payload = JSON.parse(atob(parts[1]));
		// console.log('>>>>>>> payload:', payload);
		// console.log('>>>>>>> payload.userId:', payload.userId);
		return payload.userId ?? '';
	} catch {
		return '';
	}
}

const CURRENT_USER_ID = getUserIdFromToken();

export default function Messages() {

	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [messages, setMessages] = useState<Message[]>([]);
	const [active_id, setActiveId] = useState<number | null>(null);
	const [next_cursor, setNext_cursor] = useState<number | null>(null);
	const [loading_more, setLoading_more] = useState(false);

	// load conversations
	useEffect(() => {
		if (!CURRENT_USER_ID) return;
		chatApi.listConversations(CURRENT_USER_ID)
			.then(setConversations)
			.catch(console.error);
	}, [CURRENT_USER_ID]);

	// load messages when active conversation changes
	useEffect(() => {
		if (!active_id || !CURRENT_USER_ID) { setMessages([]); setNext_cursor(null); return; }

		chatApi.listMessages(active_id, CURRENT_USER_ID)
			.then((data) => {
				setMessages(data.messages);
				setNext_cursor(data.next_cursor);
			})
			.catch(console.error);
	}, [active_id, CURRENT_USER_ID]);

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
	}, [active_id, CURRENT_USER_ID]);

	const loadMore = useCallback(async () => {
		if (!active_id || !next_cursor || loading_more) return;
		setLoading_more(true);
		try {
			const data = await chatApi.listMessages(active_id, CURRENT_USER_ID, 20, next_cursor);
			setMessages((prev) => [...data.messages, ...prev]);
			setNext_cursor(data.next_cursor);
		} catch (err) {
			console.error('Failed to load older messages:', err);
		} finally {
			setLoading_more(false);
		}
	}, [active_id, CURRENT_USER_ID, next_cursor, loading_more]);

	const handleSend = useCallback(async (content: string) => {
		if (!active_id) return;
		try {
			const msg = await chatApi.sendMessage(active_id, CURRENT_USER_ID, content);
			setMessages((prev) => [...prev, msg]);
		} catch (err) {
			console.error('Send failed:', err instanceof Error ? err.message : err);
		}
	}, [active_id, CURRENT_USER_ID]);

	const active_convers = conversations.find((c) => c.id === active_id);

	const convers_name = active_convers
		? active_convers.type === 'Direct'
			? active_convers.members.find((m) => m.user_id !== CURRENT_USER_ID)?.user.username ?? 'Unknown'
			: active_convers.name ?? 'Unnamed Group'
		: '';

	const convers_avatar = active_convers?.type === 'Direct'
		? active_convers.members.find((m) => m.user_id !== CURRENT_USER_ID)?.user.avatar ?? ''
		: '';

	const convers_username = active_convers?.type === 'Direct'
		? active_convers.members.find((m) => m.user_id !== CURRENT_USER_ID)?.user.username
		: undefined;

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
					convers_username={convers_username}
					messages={messages}
					curr_user={CURRENT_USER_ID}
					onSendMessage={handleSend}
					onLoadMore={loadMore}
					has_more={next_cursor !== null}
					loading_more={loading_more}
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
