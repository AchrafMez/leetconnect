// import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { TeamMemberCard } from '../components/TeamMemberCard';
import { Footer } from '../components/Footer';

import techLeadImg from '../assets/amezioun.jpg';
import projectManagerImg from '../assets/noben-ai.jpg';
import projectOwnerImg from '../assets/abmahfou.jpg';
import developer1Img from '../assets/adbouras.jpg';
import developer2Img from '../assets/ner-roui.jpg';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar/>
      <main className="flex-grow">
        <motion.section
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.5}}
          className="container mx-auto px-6 py-24 md:py-32"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
              Empowering the future of <span className="bg-gradient-to-r from-primary-light to-primary dark:from-primary-light dark:to-primary bg-clip-text text-transparent">freelancing</span>.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
              LeetConnect is the premium platform designed to bridge the gap between world-class freelancers and forward-thinking clients. We believe in seamless collaboration, high-quality work, and a system that works for everyone.
            </p>

            {/* <motion.div className="inline-flex items-center gap-2 px-4 py-2 mb-12 rounded-full bg-accent/30 border border-border/50 text-sm font-medium text-muted-foreground backdrop-blur-sm">
              <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse" />
              Based on the <span className="text-foreground font-semibold">ft_transcendence</span> project at 42
            </motion.div> */}

          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-6 py-16 border-t border-border/40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-6 mt-0">Our Story</h2>
              <p className="text-muted-foreground mb-4">
                LeetConnect is our final capstone project <span className="text-foreground font-medium">ft_transcendence</span>, developed to validate our curriculum at the 42 Network. It is designed as a fully-featured proof of concept to demonstrate our mastery of advanced web architecture.
              </p>
              {/* <p className="text-muted-foreground">
                While it looks and feels like a premium startup, please note that this is strictly an educational project. There are no real payments, transactions, or live services. It's just a reflection of everything we’ve learned.
              </p> */}
            </div>

            <div className="bg-accent/30 rounded-3xl p-8 md:p-12 border border-border/50 backdrop-blur-sm">
              <div className="space-y-8">
                <div className="border-b border-border/40 pb-6">
                  <div className="text-4xl font-bold text-foreground mb-2">10k+</div>
                  <div className="text-sm text-primary uppercase tracking-widest font-semibold font-sans">Active Freelancers</div>
                </div>
                <div className="border-b border-border/40 pb-6">
                  <div className="text-4xl font-bold text-foreground mb-2">$50M+</div>
                  <div className="text-sm text-primary uppercase tracking-widest font-semibold font-sans">Client Payouts</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-foreground mb-2">99.9%</div>
                  <div className="text-sm text-primary uppercase tracking-widest font-semibold font-sans">Platform Uptime</div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-6 py-24 my-12 bg-accent/20 rounded-3xl border border-border/40">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Our Core Values</h2>
            <p className="text-muted-foreground">We build LeetConnect based on principles that prioritize quality over quantity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-3 text-foreground">Excellence</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">We only accept the top 1% of talent, ensuring every project is delivered to the highest standards.</p>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-3 text-foreground">Transparency</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">No hidden fees or surprise charges. We operate with complete clarity for both parties.</p>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-3 text-foreground">Innovation</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Built with the modern AI-driven landscape in mind to turbocharge productivity.</p>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{opacity: 0, y: 30}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true, margin: "-100px"}}
          transition={{duration: 0.6}}
          className="container mx-auto px-6 py-24 border-t border-border/40">

          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Meet the Team</h2>
            <p className="text-muted-foreground">The visionaries and builders behind LeetConnect.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-0 md:gap-x-20 gap-y-12 max-w-[400px] md:max-w-3xl mx-auto">
            {[
              {name: 'Abdelali Mahfoudi', role: 'Project Owner', img: projectOwnerImg, delay: 100, href: 'https://github.com/abdelali77'},
              {name: 'Nouhaila Ben Aissa', role: 'Project Manager', img: projectManagerImg, delay: 200, href: 'https://github.com/Ak4ri-exe'},
              {name: 'Achraf Meziouni', role: 'Tech Lead', img: techLeadImg, delay: 0, href: 'https://github.com/AchrafMez'},
              {name: 'Adham Bouras', role: 'Developer', img: developer1Img, delay: 300, href: 'https://github.com/42-adbouras'},
              {name: 'Nisrine Er Rouihi', role: 'Developer', img: developer2Img, delay: 400, href: 'https://github.com/0x00siza'},
            ].map((member) => (
              <TeamMemberCard
                key={member.name}
                name={member.name}
                role={member.role}
                img={member.img}
                href={member.href}
                delay={member.delay}
              />
            ))}
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}
