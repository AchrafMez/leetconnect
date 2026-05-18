import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import stepImage from "../assets/1.webp";
import stepImage1 from "../assets/3.webp";
import stepImage2 from "../assets/2.webp";

interface StepItemProps {
  number: string;
  title: string;
  description: string;
  image: string;
  index?: number;
}

export function StepItem({ number, title, description, image, index = 0 }: StepItemProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.2 }}
      className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${isEven ? "" : "lg:grid-flow-dense"
        }`}>
      <div className={isEven ? "" : "lg:col-start-2"}>
        <div className="text-6xl sm:text-7xl font-bold text-muted-foreground/20 mb-4">
          {number}
        </div>
        <h3 className="text-3xl sm:text-4xl font-semibold mb-4 tracking-tight text-foreground">
          {title}
        </h3>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      <div className={isEven ? "lg:col-start-2" : "lg:col-start-1 lg:row-start-1"}>
        <div className="relative rounded-2xl overflow-hidden border border-border bg-card shadow-2xl shadow-black/10">
          <img
            src={image}
            alt={title}
            className="w-full h-[400px] object-cover opacity-90 transition-opacity hover:opacity-100" />
        </div>
      </div>
    </motion.div>
  );
}

const steps = [
  {
    number: "01",
    title: "Create your profile",
    description: "Sign up and showcase your skills, portfolio, and experience.",
    image: stepImage,
  },
  {
    number: "02",
    title: "Find the perfect match",
    description: "Browse opportunities or get matched with verified professionals.",
    image: stepImage1,
  },
  {
    number: "03",
    title: "Collaborate and deliver",
    description: "Work together with built-in tools. Track progress and communicate.",
    image: stepImage2,
  },
];

export function Howitwork() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-secondary/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}>

            <h2 className="text-4xl sm:text-5xl font-semibold mb-4 tracking-tight text-foreground">
              How it works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in three simple steps. No complexity, just results.
            </p>
          </motion.div>
        </div>

        <div className="space-y-24">
          {steps.map((step, index) => (
            <StepItem
              key={index}
              index={index}
              number={step.number}
              title={step.title}
              description={step.description}
              image={step.image}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

