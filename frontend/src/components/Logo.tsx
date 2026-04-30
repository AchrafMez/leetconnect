import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/userContext";

interface LogoProps {
    className?: string;
}

export function Logo({ className }: LogoProps) {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const handleLogoClick = () => {
        if (user) {
            navigate("/dashboard");
        } else {
            navigate("/");
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <Link to="/" onClick={handleLogoClick} className={cn("flex items-center", className)}>
            <span className="font-sans font-bold text-[20px] tracking-tighter flex items-baseline cursor-pointer transition-colors hover:opacity-80">
                <span className="text-primary">leet</span><span className="text-muted-foreground">connect</span>
            </span>
        </Link>
    );
}
