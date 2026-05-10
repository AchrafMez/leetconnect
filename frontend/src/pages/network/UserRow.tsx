import type { ReactNode } from 'react';
import Avatar from '@/components/ui/Avatar';

interface UserRowProps {
	name: 		string;
	avatar?: 	string | undefined;
	online?: 	boolean | undefined;
	subtitle: 	ReactNode;
	onSelect: 	() => void;
	children?: 	ReactNode | undefined;
}

export default function UserRow({ name, avatar, online, subtitle, onSelect, children }: UserRowProps) {
	return (
		<div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors">
			<button
				type="button"
				onClick={onSelect}
				className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
			>
				<div className="relative shrink-0">
					<Avatar name={name || '?'} image={avatar} size="sm" />
					{online !== undefined && (
						<span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background-elevated ${
							online ? 'bg-primary' : 'bg-muted-foreground'
						}`} />
					)}
				</div>
				<div className="min-w-0">
					<p className="text-sm font-medium text-foreground truncate">
						{name}
					</p>
					<div className="text-xs">
						{subtitle}
					</div>
				</div>
			</button>

			{children && (
				<div className="flex gap-1 shrink-0">
					{children}
				</div>
			)}
		</div>
	);
}
