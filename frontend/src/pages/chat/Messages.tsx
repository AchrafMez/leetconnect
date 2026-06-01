import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import ChatBox from "./ChatBox";
import ConversPanel from "./ConversPannel";
import { chatApi, friendApi } from "../../lib/api";
import { getPusher } from "../../lib/socket";
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
		} catch (err) {}
	}, [active_id]);

	// Subscribe to conversation channel for real-time messages
	useEffect(() => {
		if (!active_id) return;

		const pusher = getPusher();
		const channel = pusher.subscribe(`convers-${active_id}`);

		channel.bind('new_message', (msg: Message) => {
			if (msg.sender_id !== CURRENT_USER_ID) {
				setMessages((prev) => [...prev, msg]);
			}
		});

		channel.bind('delete_message', (data: { id: number; convers_id: number }) => {
			setMessages((prev) => prev.filter((m) => m.id !== data.id));
		});

		return () => {
			pusher.unsubscribe(`convers-${active_id}`);
		};
	}, [active_id, CURRENT_USER_ID]);

	// Subscribe to user channel for conversation events
	useEffect(() => {
		if (!CURRENT_USER_ID) return;

		const pusher = getPusher();
		const channel = pusher.subscribe(`user-${CURRENT_USER_ID}`);

		channel.bind('convers_bumped', (data: {
			convers_id: number;
			last_message: ConvLastMessage;
			updated_at: string;
		}) => {
			setConversations((prev) => {
				const target = prev.find((c) => c.id === data.convers_id);
				if (!target) return prev;
				const bumped: Conversation = {
					...target,
					messages: [data.last_message],
					updated_at: data.updated_at,
				};
				return [bumped, ...prev.filter((c) => c.id !== data.convers_id)];
			});
		});

		channel.bind('convers_created', (convers: Conversation) => {
			setConversations((prev) => {
				if (prev.some((c) => c.id === convers.id)) return prev;
				return [convers, ...prev];
			});
			const entries = convers.members
				.filter((m) => m.user.isOnline !== undefined)
				.map((m) => ({ id: m.user_id, isOnline: m.user.isOnline as boolean }));
			if (entries.length) seed(entries);
		});

		return () => {
			pusher.unsubscribe(`user-${CURRENT_USER_ID}`);
		};
	}, [CURRENT_USER_ID, seed]);

	// load friends
	useEffect(() => {
		if (!CURRENT_USER_ID) return;
		friendApi.listFriends().then(setFriends).catch(() => {});
	}, [CURRENT_USER_ID]);

	// load conversations
	useEffect(() => {
		if (!CURRENT_USER_ID) return;
		chatApi.listConversations()
			.then((convers) => {
				setConversations(convers);
				const entries = convers.flatMap((c) =>
					c.members
						.filter((m) => m.user.isOnline !== undefined)
						.map((m) => ({ id: m.user_id, isOnline: m.user.isOnline as boolean })),
				);
				seed(entries);
			}).catch(() => {});
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
			}).catch(() => {});
	}, [active_id, CURRENT_USER_ID]);

	const loadMore = useCallback(async () => {
		if (!active_id || !next_cursor || loading_more) return;
		setLoading_more(true);
		try {
			const data = await chatApi.listMessages(active_id, 20, next_cursor);
			setMessages((prev) => [...data.messages, ...prev]);
			setNext_cursor(data.next_cursor);
		} catch (err) {}
		finally { setLoading_more(false); }
	}, [active_id, next_cursor, loading_more]);

	const handleSend = useCallback(async (content: string) => {
		if (!active_id) return;
		const msg = await chatApi.sendMessage(active_id, content);
		setMessages((prev) => [...prev, msg]);
	}, [active_id]);

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