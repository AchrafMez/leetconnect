import React from 'react';
import { motion } from 'framer-motion';

export function TeamMemberCard({ name, role, img, href = "", delay = 0 }){
    return (
        <motion.a
            initial={{opacity: 0, y: 40}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, margin: "-50px"}}
            transition={{duration: 0.8, delay: delay / 1000, ease: "easeOut"}}
            href={href}
            target={href !== "" ? "_blank" : undefined}
            rel={href !== "" ? "noopener noreferrer" : undefined}
            className="flex flex-col items-center md:items-start group w-[50%] md:w-[160px] px-2 md:px-0 cursor-pointer block">

            <div className="w-24 h-24 mb-4 rounded-xl overflow-hidden bg-accent/20">
                <img
                    src={img}
                    alt={name}
                    className="w-full h-full object-cover transition-all duration-500 grayscale group-hover:grayscale-0 group-hover:scale-105" />
            </div>
            <h3 className="text-[14px] md:text-[15px] font-semibold text-foreground mb-0.5 text-center md:text-left">
                {name}
            </h3>
            <p className="text-[#8A8F98] text-[13px] md:text-[14px] text-center md:text-left">
                {role}
            </p>
        </motion.a>
    );
}
