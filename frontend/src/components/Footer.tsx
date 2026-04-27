import { Github } from "lucide-react";
import { type SVGProps } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";

function DiscordIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor">
            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
        </svg>
    );
}

export function Footer() {
    return (
        <footer className="border-t border-border bg-muted/30">
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
                    <div className="col-span-2 md:col-span-1">
                        <div className="mb-6">
                            <Logo />
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                            The modern platform for freelancers and clients to connect and
                            build amazing projects.
                        </p>
                        <div className="flex gap-3">
                            <a href="https://github.com/leetconnect/leetconnect" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-accent/50 hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors" aria-label="GitHub">
                                <Github className="w-4 h-4" />
                            </a>
                            <a href="https://discord.com/users/528349333461008384" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-accent/50 hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors" aria-label="Discord">
                                <DiscordIcon className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Product</h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a href="/#features" className="text-muted-foreground hover:text-primary transition-colors">
                                    Features
                                </a>
                            </li>
                            <li>
                                <a href="/#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
                                    How it works
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                                    About
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Legal</h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
                            </li>
                            <li>
                                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms</Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-6 border-t border-border">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        {/* <p className="text-sm text-muted-foreground">
                            © 2026 LeetConnect. All rights reserved.
                        </p> */}
                    </div>
                </div>
            </div>
        </footer>
    );
}