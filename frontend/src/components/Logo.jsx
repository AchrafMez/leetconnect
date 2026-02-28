import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export function Logo({ className }) {
    const handleScrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <Link to="/" onClick={handleScrollToTop} className={cn("flex items-center", className)}>
            <span className="font-sans font-bold text-[20px] tracking-tighter flex items-baseline cursor-pointer transition-colors hover:opacity-80">
                <span className="text-primary">leet</span><span className="text-muted-foreground">connect</span>
            </span>
        </Link>
    );
}
