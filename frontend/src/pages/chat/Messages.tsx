// // @adbouras
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import ChatBox from "./ChatBox";
import ConversPanel from "./ConversPannel";
import { chatApi, friendApi } from "../../lib/api";
import { getSocket } from "../../lib/socket";
import type { Message } from "./MessageLayer";
import type { Conversation, ConvLastMessage, ConvMember } from "./ConverLayer";
import { displayName } from "./ConverLayer";
import type { Friend } from "../../lib/api";
import { useAuth } from '../../context/userContext';
import { usePresenceSeed } from '@/context/PresenceProvider';

export default function Messages() {

	const { user } = useAuth();
	const seed = usePresenceSeed();
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
			// console.error('Delete failed:', err instanceof Error ? err.message : err);
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
			socket.emit('leave_convers', active_id);
			socket.off('new_message', handleNew);
			socket.off('delete_message', handleDeleted);
		};
	}, [active_id, CURRENT_USER_ID]);

	// load friends
	useEffect(() => {
		if (!CURRENT_USER_ID) return;
		friendApi.listFriends()
			.then(setFriends)
			// .catch((err) => console.error(err instanceof Error ? err.message : err));
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

	// new conversation pushed by the server
	useEffect(() => {
		const socket = getSocket();

		const handleCreated = (convers: Conversation) => {
			setConversations((prev) => {
				if (prev.some((c) => c.id === convers.id)) return prev;
				return [convers, ...prev];
			});

			const entries = convers.members
				.filter((m) => m.user.isOnline !== undefined)
				.map((m) => ({
					id:		  m.user_id,
					isOnline: m.user.isOnline as boolean,
				}));
			if (entries.length) seed(entries);
		};

		socket.on('convers_created', handleCreated);
		return () => { socket.off('convers_created', handleCreated); };
	}, [seed]);

	const handleGroupCreated = useCallback((convers: Conversation) => {
		setConversations((prev) => {
			if (prev.some((c) => c.id === convers.id)) return prev;
			return [convers, ...prev];
		});
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
			.then((convers) => {
				setConversations(convers);

				const entries = convers.flatMap((c) =>
					c.members
						.filter((m) => m.user.isOnline !== undefined)
						.map((m) => ({
							id:		  m.user_id,
							isOnline: m.user.isOnline as boolean,
						})),
				);
				seed(entries);
			})
			// .catch((err) => console.error(err instanceof Error ? err.message : err));
	}, [CURRENT_USER_ID, seed]);

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
			// .catch((err) => console.error(err instanceof Error ? err.message : err));
	}, [active_id, CURRENT_USER_ID]);

	const loadMore = useCallback(async () => {
		if (!active_id || !next_cursor || loading_more) return;
		setLoading_more(true);
		try {
			const data = await chatApi.listMessages(active_id, 20, next_cursor);
			setMessages((prev) => [...data.messages, ...prev]);
			setNext_cursor(data.next_cursor);
		} catch (err) {
			// console.error('Failed to load older messages:', err instanceof Error ? err.message : err);
		} finally {
			setLoading_more(false);
		}
	}, [active_id, CURRENT_USER_ID, next_cursor, loading_more]);

	const handleSend = useCallback(async (content: string) => {
		if (!active_id) return;
		const msg = await chatApi.sendMessage(active_id, content);
		setMessages((prev) => [...prev, msg]);
	}, [active_id, CURRENT_USER_ID]);

	const active_convers = conversations.find((c) => c.id === active_id);

	const other_member = active_convers?.type === 'Direct'
		? active_convers.members.find((m) => m.user_id !== CURRENT_USER_ID)
		: undefined;

	const convers_name = active_convers
		? active_convers.type === 'Direct'
			? (other_member?.user ? displayName(other_member.user) : 'Unknown')
			: active_convers.name ?? 'Unnamed Group'
		: '';

	const convers_avatar = active_convers?.type === 'Direct'
		? active_convers.members.find((m) => m.user_id !== CURRENT_USER_ID)?.user.avatar ?? ''
		: '';

	const convers_username = active_convers?.type === 'Direct'
		? active_convers.members.find((m) => m.user_id !== CURRENT_USER_ID)?.user.username
		: undefined;

	const receiver_id = active_convers?.type === 'Direct'
		? active_convers.members.find((m) => m.user_id !== CURRENT_USER_ID)?.user_id
		: undefined;

	const recv_rest_online = active_convers?.type === 'Direct'
		? active_convers.members.find((m) => m.user_id !== CURRENT_USER_ID)?.user.isOnline ?? false
		: false;

	return (
		<div className="fixed inset-0 top-16 p-4 flex gap-4">
			<div className={`${active_id ? 'hidden sm:flex' : 'flex'} w-full sm:w-80 shrink-0`}>
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
					receiver_id={receiver_id}
					recv_rest_online={recv_rest_online}
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
				<Card className="hidden sm:flex flex-1 items-center justify-center border-border/50 bg-background-elevated">
					<CardContent className="p-6 pt-6 text-center">
						<div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
							<MessageCircle size={22} className="text-primary" />
						</div>
						<p className="text-base font-semibold text-foreground">Select a conversation</p>
						<p className="text-xs text-muted-foreground mt-1">
							Pick a chat from the left to start messaging.
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
