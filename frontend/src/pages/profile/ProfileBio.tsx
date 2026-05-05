import { FileText, Globe, Mail, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProfileBioProps {
	profileUser:	any;
	isOwnProfile:	boolean;
}

export default function ProfileBio({ profileUser, isOwnProfile }: ProfileBioProps) {
	const { bio, location, website, email } = profileUser;

	const hasBio = !!bio;

	const websiteHref = website
		? website.startsWith('http://') || website.startsWith('https://')
			? website
			: `https://${website}`
		: null;
	const websiteLabel = website?.replace(/^https?:\/\//, '');
	const emptyText = isOwnProfile ? 'Not set' : '';

	return (
		<Card className="border-border/50 bg-background-elevated">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<FileText size={16} className="text-primary" />
					About
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-5">
				{/* bio */}
				<div>
					<h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
						Bio
					</h3>
					{hasBio ? (
						<p className="text-foreground/80 text-sm whitespace-pre-wrap wrap-break-word leading-relaxed">
							{bio}
						</p>
					) : (
						<p className="text-muted-foreground/60 text-sm italic">
							{isOwnProfile
								? 'No bio yet. Add one in profile settings.'
								: 'No bio.'}
						</p>
					)}
				</div>

				{/* details */}
				<div className="pt-4 border-t border-border/50">
					<h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
						Details
					</h3>
					<dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
						<div className="flex items-start gap-2.5 min-w-0">
							<MapPin size={16} className="text-primary/70 mt-0.5 shrink-0" />
							<div className="min-w-0">
								<dt className="text-xs text-muted-foreground">Location</dt>
								<dd className={`truncate ${location ? 'text-foreground' : 'text-muted-foreground/60 italic'}`}>
									{location || emptyText}
								</dd>
							</div>
						</div>

						<div className="flex items-start gap-2.5 min-w-0">
							<Globe size={16} className="text-primary/70 mt-0.5 shrink-0" />
							<div className="min-w-0">
								<dt className="text-xs text-muted-foreground">Website</dt>
								<dd className="truncate">
									{websiteHref ? (
										<a
											href={websiteHref}
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary hover:underline"
										>
											{websiteLabel}
										</a>
									) : (
										<span className="text-muted-foreground/60 italic">{emptyText}</span>
									)}
								</dd>
							</div>
						</div>

						{isOwnProfile && email && (
							<div className="flex items-start gap-2.5 min-w-0">
								<Mail size={16} className="text-primary/70 mt-0.5 shrink-0" />
								<div className="min-w-0">
									<dt className="text-xs text-muted-foreground">Email</dt>
									<dd className="text-foreground truncate">{email}</dd>
								</div>
							</div>
						)}
					</dl>
				</div>
			</CardContent>
		</Card>
	);
}
