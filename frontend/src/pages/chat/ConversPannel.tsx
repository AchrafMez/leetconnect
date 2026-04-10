import type { Conversation } from "./ConverLayer";
import ConversLayer from "./ConverLayer";

interface ConversPanelProps {
	conversations: Conversation[];
	active_id: number | null;
	curr_user: number;
	onSelect: (id: number) => void;
}

export default function ConversPanel({conversations, active_id, curr_user, onSelect}: ConversPanelProps) {
	return (
		<div className="w-80 border-r border-border flex flex-col">
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
		</div>
	);
}
