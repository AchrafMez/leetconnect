import { useState, useRef, useEffect } from "react";
import { SendHorizonal, Smile } from "lucide-react";

interface ChatInputProp {
	onSend: (content: string) => void;
}

export default function ChatInput({onSend}: ChatInputProp) {
	const [text, setText] = useState("");
	const textarea_ref = useRef<HTMLTextAreaElement>(null);

	function handleSend() {
		const trimmed = text.trim();
		if (!trimmed) return;

		onSend(trimmed);
		setText("");
	}

	useEffect(() => {
		const el = textarea_ref.current;
		if (!el) return;
		el.style.height = "auto";
		el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
	}, [text]);

	return (
		<div className="p-3 border-t border-border/50">
			<div className="flex items-end gap-2 bg-background border border-border rounded-lg px-3 py-1.5 focus-within:ring-1 focus-within:ring-primary transition-all">
				<button className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0 pb-1.5">
					<Smile size={18}/>
				</button>
				<textarea
					ref={textarea_ref}
					rows={1}
					value={text}
					onChange={(e) => setText(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							handleSend();
						}
					}}
					placeholder="Type a message..."
					className="flex-1 bg-transparent text-sm text-foreground
								placeholder:text-muted-foreground outline-none py-1.5
								resize-none overflow-y-auto leading-relaxed"
				/>
				<button
					onClick={handleSend}
					className="bg-primary hover:bg-primary/90 text-primary-foreground
								rounded-md p-2 transition-colors cursor-pointer shrink-0"
				>
					<SendHorizonal size={16}/>
				</button>
			</div>
		</div>
	);
}
