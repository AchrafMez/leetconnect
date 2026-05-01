// // @adbouras
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import ChatBox from "./ChatBox";
import ConversPanel from "./ConversPannel";
import { chatApi, friendApi } from "../../lib/api";
import { getSocket } from "../../lib/socket";
import type { Message } from "./MessageLayer";
import type { Conversation, ConvLastMessage, ConvMember } from "./ConverLayer";
import type { Friend } from "../../lib/api";
import { useAuth } from '../../context/userContext';

export default function Messages() {

	const { user } = useAuth();
	const CURRENT_USER_ID = user?.id ?? '';
	const [searchParams, setSearchParams] = useSearchParams();

	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [messages, setMessages] = useState<Message[]>([]);
	const [active_id, setActiveId] = useState<number | null>(null);
	const [next_cursor, setNext_cursor] = useState<number | null>(null);
	const [loading_more, setLoading_more] = useState(false);
	const [friends, setFriends] = useState<Friend[]>([]);

	const handleDelete = useCallback(async (msg_id: number) => {
		if (!active_id) return;
		try {
			await chatApi.deleteMessage(active_id, msg_id);
			setMessages((prev) => prev.filter((m) => m.id !== msg_id));
		} catch (err) {
			console.error('Delete failed:', err instanceof Error ? err.message : err);
		}
	}, [active_id]);

	useEffect(() => {
		if (!active_id) return;

		const socket = getSocket();
		socket.emit('join_convers', active_id);

		const handleNew = (msg: Message) => {
			if (msg.convers_id === active_id && msg.sender_id !== CURRENT_USER_ID) {
				setMessages((prev) => [...prev, msg]);
			}
		};

		const handleDeleted = (data: { id: number; convers_id: number }) => {
			if (data.convers_id === active_id) {
				setMessages((prev) => prev.filter((m) => m.id !== data.id));
			}
		};

		socket.on('new_message', handleNew);
		socket.on('delete_message', handleDeleted);

		return () => {
			socket.emit('leave_covers', active_id);
			socket.off('new_message', handleNew);
			socket.off('delete_message', handleDeleted);
		};
	}, [active_id, CURRENT_USER_ID]);

	// load friends
	useEffect(() => {
		if (!CURRENT_USER_ID) return;
		friendApi.listFriends()
			.then(setFriends)
			.catch(console.error);
	}, [CURRENT_USER_ID]);

	// tell server were on /chat to suppress message notifs
	useEffect(() => {
		const socket = getSocket();
		socket.emit('chat_active', true);
		return () => { socket.emit('chat_active', false); };
	}, []);

	// bump freshest conversation to the top
	useEffect(() => {
		const socket = getSocket();

		const handleBumped = (data: {
			convers_id:   number;
			last_message: ConvLastMessage;
			updated_at:   string;
		}) => {
			setConversations((prev) => {
				const target = prev.find((c) => c.id === data.convers_id);
				if (!target) return prev;
				const bumped: Conversation = {
					...target,
					messages:   [data.last_message],
					updated_at: data.updated_at,
				};
				const rest = prev.filter((c) => c.id !== data.convers_id);
				return [bumped, ...rest];
			});
		};

		socket.on('convers_bumped', handleBumped);
		return () => { socket.off('convers_bumped', handleBumped); };
	}, []);

	// when a group is created
	const handleGroupCreated = useCallback((convers: Conversation) => {
		setConversations((prev) => [convers, ...prev]);
		setActiveId(convers.id);
	}, []);

	const handleLeaveConversation = useCallback((convers_id: number) => {
		setConversations((prev) => prev.filter((c) => c.id !== convers_id));
		setActiveId((prev) => (prev === convers_id ? null : prev));
	}, []);

	const handleMemberAdded = useCallback((convers_id: number, member: ConvMember) => {
		setConversations((prev) =>
			prev.map((c) =>
				c.id === convers_id ? { ...c, members: [...c.members, member] } : c,
			),
		);
	}, []);

	// load conversations
	useEffect(() => {
		if (!CURRENT_USER_ID) return;
		chatApi.listConversations()
			.then(setConversations)
			.catch(console.error);
	}, [CURRENT_USER_ID]);

	// auto select conversation from ?conv=<id>
	useEffect(() => {
		const conv = searchParams.get('conv');
		if (!conv || conversations.length === 0) return;
		const id = parseInt(conv, 10);
		if (Number.isNaN(id)) return;
		if (conversations.some((c) => c.id === id)) {
			setActiveId(id);
			searchParams.delete('conv');
			setSearchParams(searchParams, { replace: true });
		}
	}, [searchParams, conversations, setSearchParams]);

	// load messages when active conversation changes
	useEffect(() => {
		if (!active_id || !CURRENT_USER_ID) { setMessages([]); setNext_cursor(null); return; }

		chatApi.listMessages(active_id)
			.then((data) => {
				setMessages(data.messages);
				setNext_cursor(data.next_cursor);
			})
			.catch(console.error);
	}, [active_id, CURRENT_USER_ID]);

	const loadMore = useCallback(async () => {
		if (!active_id || !next_cursor || loading_more) return;
		setLoading_more(true);
		try {
			const data = await chatApi.listMessages(active_id, 20, next_cursor);
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
			const msg = await chatApi.sendMessage(active_id, content);
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
			<div className={`${active_id ? 'hidden sm:flex' : 'flex'} w-full sm:w-auto flex-col`}>
				<ConversPanel
					conversations={conversations}
					active_id={active_id}
					curr_user={CURRENT_USER_ID}
					friends={friends}
					onSelect={setActiveId}
					onGroupCreated={handleGroupCreated}
				/>
			</div>

			{active_convers ? (
				<ChatBox
					convers={active_convers}
					convers_name={convers_name}
					convers_avatar={convers_avatar}
					convers_username={convers_username}
					is_direct={active_convers.type === 'Direct'}
					messages={messages}
					curr_user={CURRENT_USER_ID}
					friends={friends}
					onSendMessage={handleSend}
					onLoadMore={loadMore}
					has_more={next_cursor !== null}
					loading_more={loading_more}
					onDeleteMessage={handleDelete}
					onBack={() => setActiveId(null)}
					onLeaveConversation={handleLeaveConversation}
					onMemberAdded={handleMemberAdded}
				/>
			) : (
				<div className="hidden sm:flex flex-1 items-center justify-center text-muted-foreground">
					<div className="text-center">
						<MessageCircle size={48} className="mx-auto mb-3 opacity-30" />
						<p className="text-lg font-medium">select a conversation</p>
					</div>
				</div>
			)}
		</div>
	);
}
