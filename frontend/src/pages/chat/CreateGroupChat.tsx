import { useState } from "react";
import { chatApi } from "../../lib/api";
import type { Friend } from "../../lib/api";
import type { Conversation } from "./ConverLayer";
import Avatar from "@/components/ui/Avatar";

interface CreateGroupChatProps {
	friends: Friend[];
	onClose: () => void;
	onCreated: (convers: Conversation) => void;
}

export default function CreateGroupChat({ friends, onClose, onCreated }: CreateGroupChatProps) {
	const [name, setName] = useState('');
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const toggle = (id: string) => {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const handleCreate = async () => {
		if (!name.trim()) return setError('Group name is required');
		if (selected.size < 2) return setError('Select at least 2 friend');
		setError('');
		setLoading(true);
		try {
			const convers = await chatApi.createConversation({
				type: 'Group',
				name: name.trim(),
				member_ids: Array.from(selected),
			});
			onCreated(convers);
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to create group');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
			 onClick={onClose}>
			<div className="bg-background border border-border rounded-lg w-96 max-h-[80vh]
							flex flex-col shadow-lg" onClick={(e) => e.stopPropagation()}>

				{/* header */}
				<div className="px-4 py-3 border-b border-border">
					<h3 className="text-foreground font-semibold">Create Group Chat</h3>
				</div>

				{/* body */}
				<div className="p-4 flex-1 overflow-y-auto space-y-4">
					{/* group name input */}
					<div>
						<label className="text-sm text-muted-foreground">Group Name</label>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="e.g. Study Group"
							className="mt-1 w-full px-3 py-2 rounded-md border border-border
									   bg-background text-foreground text-sm
									   focus:outline-none focus:ring-2 focus:ring-primary"
						/>
					</div>

					{/* friend checkboxes */}
					<div>
						<label className="text-sm text-muted-foreground">
							Select Members ({selected.size} selected)
						</label>
						<div className="mt-2 space-y-1 max-h-60 overflow-y-auto">
							{friends.map((friend) => (
								<button
									key={friend.id}
									onClick={() => toggle(friend.id)}
									className={`w-full flex items-center gap-3 px-3 py-2
										rounded-md transition-colors text-left
										${selected.has(friend.id)
											? 'bg-primary/10 border border-primary/30'
											: 'hover:bg-secondary/50'}`}
								>
									<Avatar name={friend.username} image={friend.avatar} size="sm" />
									<span className="text-sm text-foreground">{friend.username}</span>
									{selected.has(friend.id) && (
										<span className="ml-auto text-primary text-sm"></span>
									)}
								</button>
							))}
						</div>
					</div>

					{error && <p className="text-sm text-destructive">{error}</p>}
				</div>

				{/* create / cancel */}
				<div className="px-4 py-3 border-t border-border flex justify-end gap-2">
					<button
						onClick={onClose}
						className="px-4 py-2 text-sm rounded-md text-muted-foreground
								   hover:bg-secondary transition-colors"
					>
						Cancel
					</button>
					<button
						onClick={handleCreate}
						disabled={loading}
						className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground
								   font-medium hover:bg-primary/90 transition-colors
								   disabled:opacity-50"
					>
						{loading ? 'Creating...' : 'Create'}
					</button>
				</div>
			</div>
		</div>
	);
}