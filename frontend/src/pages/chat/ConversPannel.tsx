import { useState } from "react";
import { MessageCircle, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Conversation } from "./ConverLayer";
import ConversLayer from "./ConverLayer";
import type { Friend } from "../../lib/api";
import CreateGroupChat from "./CreateGroupChat";

interface ConversPanelProps {
	conversations: Conversation[];
	active_id: number | null;
	curr_user: string;
	friends: Friend[];
	onSelect: (id: number) => void;
	onGroupCreated: (convers: Conversation) => void;
}

export default function ConversPanel({
	conversations, active_id, curr_user, friends,
	onSelect, onGroupCreated
}: ConversPanelProps) {
	const [show_modal, setShowModal] = useState(false);

	return (
		<Card className="flex flex-col w-full overflow-hidden border-border/50 bg-background-elevated">
			<CardHeader className="p-4 pb-3">
				<CardTitle className="flex items-center gap-2 text-base">
					<MessageCircle size={16} className="text-primary" />
					Conversations
				</CardTitle>
			</CardHeader>

			<CardContent className="p-0 flex-1 overflow-y-auto border-t border-border/50">
				{conversations.length === 0 ? (
					<p className="text-xs text-muted-foreground text-center py-8 px-4">
						No conversations yet.
					</p>
				) : (
					conversations.map((convers) => (
						<ConversLayer
							key={convers.id}
							convers={convers}
							is_active={convers.id === active_id}
							curr_user={curr_user}
							onClick={() => onSelect(convers.id)}
						/>
					))
				)}
			</CardContent>

			<div className="p-4 border-t border-border/50">
				<button
					onClick={() => setShowModal(true)}
					className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
						bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium
						transition-colors cursor-pointer"
				>
					<Plus size={16} />
					Create Network
				</button>
			</div>

			{show_modal && (
				<CreateGroupChat
					friends={friends}
					onClose={() => setShowModal(false)}
					onCreated={onGroupCreated}
				/>
			)}
		</Card>
	);
}
