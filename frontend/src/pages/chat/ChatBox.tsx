import ChatHeader from "./ChatHeader";
import MessageBubble, { type Message } from "./MessageLayer";
import ChatInput from "./ChatInput";
import ChatInfoPanel from "./ChatInfoPanel";
import { useRef, useEffect, useCallback, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Conversation, ConvMember } from "./ConverLayer";
import type { Friend } from "../../lib/api";

interface ChatBoxProp {
	convers:			Conversation;
	convers_name: 		string;
	convers_avatar: 	string;
	convers_username?: 	string | undefined;
	is_direct:			boolean;
	messages: 			Message[];
	curr_user: 			string;
	has_more:			boolean;
	loading_more:		boolean;
	friends:			Friend[];
	receiver_id?: 		string | undefined;
	recv_rest_online:   boolean;

	onSendMessage: 	(content: string) => Promise<void>;
	onLoadMore:		() => void;
	onDeleteMessage: (msg_id: number) => void;
	onBack:			() => void;
	onLeaveConversation: (convers_id: number) => void;
	onMemberAdded:		(convers_id: number, member: ConvMember) => void;
}

export default function ChatBox({
	convers, convers_name, convers_avatar, convers_username, is_direct,
	receiver_id, recv_rest_online, messages, curr_user,
	friends, onSendMessage, onLoadMore, has_more, loading_more,
	onDeleteMessage, onBack, onLeaveConversation, onMemberAdded,
}: ChatBoxProp) {
	const [show_info, setShowInfo] = useState(false);
	const bottom_ref = useRef<HTMLDivElement>(null);
	const scroll_ref = useRef<HTMLDivElement>(null);
	const is_initial_load = useRef(true);
	const last_id_ref = useRef<number | null>(null);

	useEffect(() => {
		const last = messages[messages.length - 1];
		if (is_initial_load.current) {
			bottom_ref.current?.scrollIntoView();
			is_initial_load.current = false;
			last_id_ref.current = last?.id ?? null;
			return;
		}
		const is_new_tail = last && last.id !== last_id_ref.current;
		last_id_ref.current = last?.id ?? null;
		if (!is_new_tail) return;

		const ref = scroll_ref.current;
		const near_bottom = ref
			? ref.scrollHeight - ref.scrollTop - ref.clientHeight < 150
			: false;
		if (last.sender_id === curr_user || near_bottom) {
			bottom_ref.current?.scrollIntoView({ behavior: 'smooth' });
		}
	}, [messages, curr_user]);

	useEffect(() => {
		is_initial_load.current = true;
	}, [convers_name]);

	const handleScroll = useCallback(() => {
		const ref = scroll_ref.current;
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
		<Card className="flex-1 flex flex-col min-w-0 overflow-hidden border-border/50 bg-background-elevated">
			<ChatHeader
				name={convers_name}
				avatar={convers_avatar}
				is_direct={is_direct}
				receiver_id={receiver_id}
				recv_rest_online={recv_rest_online}
				username={convers_username}
				member_count={is_direct ? undefined : convers.members.length}
				onBack={onBack}
				onInfoClick={() => setShowInfo(true)}
			/>
			<div ref={scroll_ref} onScroll={handleScroll} className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4">
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

			{show_info && (
				<ChatInfoPanel
					convers={convers}
					curr_user={curr_user}
					friends={friends}
					onClose={() => setShowInfo(false)}
					onLeft={onLeaveConversation}
					onMemberAdded={onMemberAdded}
				/>
			)}
		</Card>
	);
}
