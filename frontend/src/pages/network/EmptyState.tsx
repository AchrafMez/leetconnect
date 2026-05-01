import type { LucideIcon } from 'lucide-react';

interface EmptyStateProp {
	icon: 		LucideIcon;
	title: 		string;
	message:	string;
}

export default function EmptyState({ icon: Icon, title, message }: EmptyStateProp) {
	return (
		<div className="flex flex-col items-center justify-center py-12 text-center">
			<div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
				<Icon size={20} className="text-muted-foreground" />
			</div>
			<p className="text-foreground font-medium">{title}</p>
			<p className="text-sm text-muted-foreground mt-1 max-w-xs">{message}</p>
		</div>
	);
}
