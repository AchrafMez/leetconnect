import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { reviewsApi, type Review } from "@/lib/api";

interface Props {
	userId:		string;
	interval?:	number;
}

export default function ClosedJobReviews({ userId, interval = 6000 }: Props) {
	const [reviews, setReviews] = useState<Review[]>([]);
	const [loading, setLoading] = useState(true);
	const [index, setIndex] = useState(0);
	const [paused, setPaused] = useState(false);
	const [transitioning, setTransitioning] = useState(true);

	useEffect(() => {
		let alive = true;
		setLoading(true);
		reviewsApi
			.getForUser(userId, { closedOnly: true })
			.then((res) => {
				if (!alive) return;
				setReviews(res.reviews || []);
			})
			.catch((err) => console.error("failed to load reviews:", err))
			.finally(() => alive && setLoading(false));
		return () => {
			alive = false;
		};
	}, [userId]);

	// auto advance the slide.
	useEffect(() => {
		if (paused || reviews.length <= 1) return;
		const id = setTimeout(() => setIndex((i) => i + 1), interval);
		return () => clearTimeout(id);
	}, [paused, index, reviews.length, interval]);

	if (loading) return <ReviewsSkeleton />;
	if (!reviews.length) return null;

	if (reviews.length === 1) {
		return (
			<section aria-label="Closed job reviews" className="space-y-3">
				<Header count={1} />
				<ReviewCard review={reviews[0]} />
			</section>
		);
	}

	// append a clone of the first review
	const extended = [...reviews, reviews[0]];
	const total = extended.length;

	const handleTransitionEnd = () => {
		if (index >= reviews.length) {
			setTransitioning(false);
			setIndex(0);

			requestAnimationFrame(() => {
				requestAnimationFrame(() => setTransitioning(true));
			});
		}
	};

	return (
		<section aria-label="Closed job reviews" className="space-y-3">
			<Header count={reviews.length} />

			<div
				className="relative overflow-hidden"
				onMouseEnter={() => setPaused(true)}
				onMouseLeave={() => setPaused(false)}
			>
				<div
					className="flex"
					style={{
						width: `calc(${total} * 100%)`,
						transform: `translateX(calc(-${index} * (100% / ${total})))`,
						transition: transitioning ? "transform 600ms ease-out" : "none",
					}}
					onTransitionEnd={handleTransitionEnd}
				>
					{extended.map((r, i) => (
						<div
							key={`${r.id}-${i}`}
							className="shrink-0"
							style={{ width: `calc(100% / ${total})` }}
							aria-hidden={i === reviews.length || undefined}
						>
							<ReviewCard review={r} />
						</div>
					))}
				</div>
			</div>

			{/* Dot indicators */}
			<div className="flex justify-center gap-1.5 pt-1">
				{reviews.map((_, i) => {
					const active = (index % reviews.length) === i;
					return (
						<button
							key={i}
							type="button"
							onClick={() => {
								setTransitioning(true);
								setIndex(i);
							}}
							aria-label={`Show review ${i + 1} of ${reviews.length}`}
							aria-current={active || undefined}
							className={`h-1.5 rounded-full transition-all cursor-pointer ${
								active
									? "w-6 bg-primary"
									: "w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/60"
							}`}
						/>
					);
				})}
			</div>
		</section>
	);
}

function Header({ count }: { count: number }) {
	return (
		<div className="flex items-baseline justify-between">
			<h2 className="text-sm font-semibold">Reviews</h2>
			<span className="text-xs text-muted-foreground">
				{count} completed {count === 1 ? "project" : "projects"}
			</span>
		</div>
	);
}

function ReviewCard({ review }: { review: Review }) {
	const author =
		[review.fromUser?.firstname, review.fromUser?.lastname]
			.filter(Boolean)
			.join(" ") ||
		review.fromUser?.username ||
		"Anonymous";

	const initial = (author[0] || "?").toUpperCase();

	return (
		<Card className="w-full border-border/50 bg-background-elevated shadow-none">
			<CardContent className="p-5 sm:p-6 space-y-4">
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-3 min-w-0">
						<Avatar className="h-10 w-10 shrink-0">
							<AvatarImage src={review.fromUser?.avatar || undefined} alt={author} />
							<AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
								{initial}
							</AvatarFallback>
						</Avatar>
						<div className="min-w-0">
							<p className="text-sm font-semibold truncate">{author}</p>
							<p className="text-xs text-muted-foreground truncate">
								{new Date(review.createdAt).toLocaleDateString(undefined, {
									year:	"numeric",
									month:	"short",
									day:	"numeric",
								})}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-0.5 text-yellow-500 shrink-0">
						{[1, 2, 3, 4, 5].map((s) => (
							<Star key={s} size={14} fill={s <= review.rating ? "currentColor" : "none"} />
						))}
					</div>
				</div>

				<div className="relative">
					<Quote size={18} className="absolute -top-1 -left-1 text-primary/20" />
					<p className="text-sm text-muted-foreground leading-relaxed line-clamp-4 pl-5">
						{review.comment}
					</p>
				</div>

				<div className="flex items-center gap-2 pt-2 border-t border-border/40">
					<Badge variant="secondary" className="text-[10px] truncate max-w-[50%]">
						{review.job.category}
					</Badge>
					<span className="text-xs text-muted-foreground truncate">
						{review.job.title}
					</span>
				</div>
			</CardContent>
		</Card>
	);
}

function ReviewsSkeleton() {
	return (
		<section className="space-y-3">
			<div className="h-4 w-20 bg-muted rounded animate-pulse" />
			<Card className="border-border/50 bg-background-elevated shadow-none">
				<CardContent className="p-5 sm:p-6 space-y-4">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-muted animate-pulse shrink-0" />
						<div className="flex-1 space-y-2">
							<div className="h-3 w-1/3 bg-muted rounded animate-pulse" />
							<div className="h-3 w-1/4 bg-muted rounded animate-pulse" />
						</div>
					</div>
					<div className="h-3 w-full bg-muted rounded animate-pulse" />
					<div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
				</CardContent>
			</Card>
		</section>
	);
}
