interface AvatarProp {
	name: 	string;
	image?:	string | null | undefined;
	size?: 	"xs" | "sm" | "md" | "lg";
	shape?:	"circle" | "rounded";
}

export default function Avatar({name, image, size = "md", shape = "circle"}: AvatarProp) {
	const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
	const sizeClasses =
		size === "xs" ? "w-8 h-8 text-[10px]"
		: size === "sm" ? "w-10 h-10 text-xs"
		: size === "lg" ? "w-24 h-24 text-2xl"
		: "w-15 h-15 text-sm";

	const shapeClass =
		shape === "rounded"
			? size === "xs" || size === "sm" ? "rounded-md"
			: size === "lg" ? "rounded-xl"
			: "rounded-lg"
		: "rounded-full";

	if (image) {
		return (
			<img
				src={image}
				className={`${sizeClasses} ${shapeClass} object-cover shrink-0`}
			/>
		);
	}
	return (
		<div
			className={`${sizeClasses} ${shapeClass} bg-background-elevated text-primary
						flex items-center justify-center font-medium shrink-0 relative overflow-hidden`}
		>
			<span className="absolute inset-0 bg-primary/20" />
			<span className="relative">{initials}</span>
		</div>
	);
}
