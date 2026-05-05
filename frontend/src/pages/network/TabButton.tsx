import type { LucideIcon } from 'lucide-react';

interface TabButtonProps {
	icon: 		LucideIcon;
	label: 		string;
	count: 		number;
	isActive:	boolean;
	onClick: 	() => void;
}

export default function TabButton({ icon: Icon, label, count, isActive, onClick }: TabButtonProps) {
	return (
		<button
			onClick={onClick}
			className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 -mb-px border-b-2 text-sm font-medium whitespace-nowrap transition-colors ${
				isActive
					? 'border-primary text-foreground'
					: 'border-transparent text-muted-foreground hover:text-foreground'
			}`}
		>
			<Icon size={16} className={isActive ? 'text-primary' : ''} />
			{label}
			<span className={`text-xs px-1.5 py-0.5 rounded-full ${
				isActive
					? 'bg-primary/20 text-primary'
					: 'bg-secondary text-muted-foreground'
			}`}>
				{count}
			</span>
		</button>
	);
}
