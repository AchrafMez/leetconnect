import { useState, useRef, useEffect } from "react";
import { SendHorizonal, Smile } from "lucide-react";
import { useRateLimit, RateLimitBanner } from "@/lib/RateLimit";

interface ChatInputProp {
	onSend: (content: string) => Promise<void>;
}

export default function ChatInput({onSend}: ChatInputProp) {
	const [text, setText] = useState("");
	const [sending, setSending] = useState(false);
	const textarea_ref = useRef<HTMLTextAreaElement>(null);
	const rl = useRateLimit();

	const MAX_LENGTH = 3000;
	const overLimit = text.length > MAX_LENGTH;
	const disabled = sending || rl.isLimited || overLimit;

	async function handleSend() {
		const trimmed = text.trim();
		if (!trimmed || disabled) return;
		setSending(true);
		try {
			await onSend(trimmed);
			setText("");
		} catch (err) {
			rl.handle(err);
				// console.error('Send failed:', err instanceof Error ? err.message : err);
		} finally {
			setSending(false);
		}
	}

	useEffect(() => {
		const el = textarea_ref.current;
		if (!el) return;
		el.style.height = "auto";
		el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
	}, [text]);

	return (
		<div className="p-3 border-t border-border/50 space-y-2">
			<RateLimitBanner message={rl.message} secondsLeft={rl.secondsLeft} />
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
					placeholder={rl.isLimited ? `Slow down — retry in ${rl.secondsLeft}s` : "Type a message..."}
					disabled={rl.isLimited}
					className="flex-1 bg-transparent text-sm text-foreground
								placeholder:text-muted-foreground outline-none py-1.5
								resize-none overflow-y-auto leading-relaxed disabled:cursor-not-allowed"
				/>
				<button
					onClick={handleSend}
					disabled={disabled}
					className="bg-primary hover:bg-primary/90 text-primary-foreground
								rounded-md p-2 transition-colors cursor-pointer shrink-0
								disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<SendHorizonal size={16}/>
				</button>
			</div>
			{overLimit && (
				<p className="text-xs text-destructive">
					Message too long ({text.length}/{MAX_LENGTH} characters)
				</p>
			)}
		</div>
	);
}
