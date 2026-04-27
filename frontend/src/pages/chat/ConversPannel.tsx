import { useState } from "react";
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
		<div className="w-full sm:w-80 h-full border-r border-border flex flex-col">
			<div className="px-4 py-5">
				<h2 className="text-foreground font-semibold text-center">Conversations</h2>
			</div>

			<div className="flex-1 overflow-y-auto">
				{conversations.map((convers) => (
					<ConversLayer
						key={convers.id}
						convers={convers}
						is_active={convers.id === active_id}
						curr_user={curr_user}
						onClick={() => onSelect(convers.id)}
					/>
				))}
			</div>

			<div className="p-4">
				<button
					onClick={() => setShowModal(true)}
					className="w-full h-12 py-3 px-4 rounded-md bg-primary text-primary-foreground
							   text-sm font-medium hover:bg-primary/90 transition-colors"
				>
					+ Create Group
				</button>
			</div>

			{show_modal && (
				<CreateGroupChat
					friends={friends}
					onClose={() => setShowModal(false)}
					onCreated={onGroupCreated}
				/>
			)}
		</div>
	);
}
