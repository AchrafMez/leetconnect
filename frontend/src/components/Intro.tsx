import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

export function Intro(){
    return (
        <section className="relative pt-32 pb-20 px-6 overflow-hidden">
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-light/20 dark:bg-primary-light/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/20 dark:bg-primary/10 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto max-w-7xl">
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5}}
                    className="text-center">
                    
                    {/* <motion.div
                        initial={{opacity: 0, scale: 0.9}}
                        animate={{opacity: 1, scale: 1}}
                        transition={{duration: 0.5, delay: 0.1}}
                        className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-accent text-sm">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Now accepting new freelancers
                    </motion.div> */}

                    <motion.h1
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.5, delay: 0.2}}
                        className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 leading-tight">
                        Connect with top talent.
                        <br />
                        <span className="bg-gradient-to-r from-primary-light to-primary dark:from-primary-light dark:to-primary bg-clip-text text-transparent">
                            Build faster.
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.5, delay: 0.3}}
                        className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                        The modern freelancing platform that connects ambitious projects
                        with exceptional developers, designers, and creators worldwide.
                    </motion.p>

                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.5, delay: 0.4}}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Button size="lg" className="gap-2 group" asChild>
                            <Link to="/auth/sign-up?type=CLIENT">
                                Start Hiring
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>

                        <Button size="lg" variant="outline" asChild>
                            <Link to="/market/find-work">Find Work</Link>
                        </Button>
                    </motion.div>

                    <motion.p
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{duration: 0.5, delay: 0.5}}
                        className="text-sm text-muted-foreground mt-6">
                        Trusted by 100+ companies worldwide
                    </motion.p>
                </motion.div>
            </div>
        </section>
    );
}