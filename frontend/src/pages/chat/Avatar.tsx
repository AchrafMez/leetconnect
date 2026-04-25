interface AvatarProp {
	name: 	string;
	image?:	string | undefined;
	size?: 	"sm" | "md";
}

export default function Avatar({name, image, size = "md"}: AvatarProp) {
	const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
	const sizeClasses = size === "sm" ? "w-10 h-10 text-xs" : "w-15 h-15 text-sm";

	if (image && !image.includes('default.png')) {
		return (
			<img
				src={image}
				alt={name}
				className={`${sizeClasses} rounded-full object-cover shrink-0`}
			/>
		);
	}
	return (
		<div
			className={`${sizeClasses} rounded-full bg-primary/20 text-primary
						flex items-center justify-center font-medium shrink-0`}
		>
			{initials}
		</div>
	);
}
