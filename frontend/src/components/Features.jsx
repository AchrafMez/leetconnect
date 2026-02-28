import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Search,MessageSquare,Shield,Zap,Globe,Award,} from "lucide-react";

const features = [
    {
      icon: Search,
      title: "Smart Matching",
      description:
        "Our algorithm connects clients with ideal freelancers based on skills and exact project criteria.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Launch your projects in minutes. Skip lengthy signups and complex workflows to hire talent fast.",
    },
    {
      icon: MessageSquare,
      title: "Real-time Communication",
      description:
        "Built-in messaging, team chats, and project tools keep your remote teams aligned and productive.",
    },
    {
      icon: Shield,
      title: "Trusted & Secure",
      description:
        "Verified freelance profiles, secure payments, and strict privacy controls keep your business safe.",
    },
    {
      icon: Globe,
      title: "Global Talent Pool",
      description:
        "Access elite tech professionals globally. Collaborate with top-tier experts regardless of region.",
    },
    {
      icon: Award,
      title: "Quality Guaranteed",
      description:
        "Detailed reviews, skill validations, and our project guarantees ensure high-quality deliverables.",
    },
  ];

export function FeatureCard({icon: Icon, title, description, index = 0 }){
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
  
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="relative group">
        <div className="p-8 rounded-2xl border border-border bg-card hover:border-foreground/20 transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
            <Icon className="w-6 h-6" />
          </div>
          <h3 className="text-xl mb-3">{title}</h3>
          <p className="text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </motion.div>
    );
  }

export function Features(){
  return (
    <section id="features" className="py-24 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}>
            <h2 className="text-4xl sm:text-5xl font-semibold mb-4 tracking-tight">
              Everything you need
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete platform designed to make freelancing simple, secure,
              and successful for everyone.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
        <FeatureCard key={index} {...feature} index={index}/>
))}
        </div>
      </div>
    </section>
  );
}