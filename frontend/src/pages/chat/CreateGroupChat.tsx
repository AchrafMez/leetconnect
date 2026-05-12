import { useState } from "react";
import { Users, Check, Loader2 } from "lucide-react";
import { chatApi } from "../../lib/api";
import type { Friend } from "../../lib/api";
import type { Conversation } from "./ConverLayer";
import Avatar from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

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
		if (selected.size < 2) return setError('Select at least 2 friends');
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
		<Dialog open onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-md max-h-[85vh] overflow-y-auto duration-0! data-[state=open]:animate-none! data-[state=closed]:animate-none!">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
							<Users size={18} className="text-primary" />
						</div>
						<div className="min-w-0">
							<DialogTitle>Create Group Chat</DialogTitle>
							<DialogDescription>Start a network with your friends</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="space-y-5 pt-2">
					{/* group name */}
					<div className="space-y-2">
						<Label htmlFor="group-name">Group Name</Label>
						<Input
							id="group-name"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</div>

					{/* members */}
					<div className="space-y-2">
						<Label>Select Members ({selected.size} selected)</Label>
						{friends.length === 0 ? (
							<p className="text-sm text-muted-foreground text-center py-6">
								Add friends first to create a group.
							</p>
						) : (
							<div className="space-y-1 max-h-60 overflow-y-auto rounded-lg border border-border/50 p-1">
								{friends.map((friend) => {
									const isSelected = selected.has(friend.id);
									return (
										<button
											key={friend.id}
											type="button"
											onClick={() => toggle(friend.id)}
											className={`w-full flex items-center gap-3 px-3 py-2 rounded-md
												text-left transition-colors cursor-pointer
												${isSelected
													? 'bg-primary/10 text-foreground'
													: 'hover:bg-secondary/50'}`}
										>
											<Avatar name={friend.username} image={friend.avatar} size="sm" />
											<span className="text-sm flex-1 truncate">{friend.username}</span>
											{isSelected && <Check size={16} className="text-primary shrink-0" />}
										</button>
									);
								})}
							</div>
						)}
					</div>

					{error && (
						<p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md">
							{error}
						</p>
					)}

					{/* actions */}
					<div className="flex justify-end gap-2 pt-2">
						<Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
						<Button onClick={handleCreate} disabled={loading}>
							{loading ? <Loader2 size={14} className="animate-spin" /> : 'Create'}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
