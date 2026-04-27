import { FileText } from 'lucide-react';

interface ProfileBioProps {
	bio?: string | null;
	isOwnProfile: boolean;
}

export default function ProfileBio({ bio, isOwnProfile }: ProfileBioProps) {
	if (!bio && !isOwnProfile) return null;

	return (
		<div className="bg-secondary/50 rounded-xl p-6 border border-border">
			<div className="flex items-center gap-2 mb-3">
				<FileText size={16} className="text-primary" />
				<h2 className="text-sm font-semibold text-foreground">Bio</h2>
			</div>
			{bio ? (
				<p className="text-foreground/80 text-sm whitespace-pre-wrap wrap-break-word">
					{bio}
				</p>
			) : (
				<p className="text-muted-foreground/40 text-sm">
					No bio yet. Add one in profile settings.
				</p>
			)}
		</div>
	);
}
