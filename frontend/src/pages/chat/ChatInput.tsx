import { useState } from "react";
import { SendHorizonal, Smile } from "lucide-react";

interface ChatInputProp {
	onSend: (content: string) => void;
}

export default function ChatInput({onSend}: ChatInputProp) {
	const [text, setText] = useState("");

	function handleSend() {
		const trimmed = text.trim();
		if (!trimmed) return;

		onSend(trimmed);
		setText("");
	}
	return (
		<div className="p-4">
			<div className="flex items-center gap-3 bg-secondary rounded-xl px-4 py-2">
				<button className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
					<Smile size={20}/>
				</button>
				<input
					type="text"
					value={text}
					onChange={(e) => setText(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter")
							handleSend();
					}}
					placeholder="What are you sinkin' about?"
					className="flex-1 bg-transparent text-sm text-foreground
								placeholder:text-muted-foreground outline-none"
				/>
				<button
					onClick={handleSend}
					className="bg-primary hover:bg-primary/80 text-foreground
								rounded-lg p-2 transition-colors cursor-pointer"
				>
					<SendHorizonal size={18}/>
				</button>
			</div>
		</div>
	);
}
