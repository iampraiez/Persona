import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Alex Johnson",
    role: "Software Engineer",
    content: "TimeForge has completely changed how I manage my side projects. The AI insights are surprisingly helpful!",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  },
  {
    name: "Sarah Chen",
    role: "Product Designer",
    content: "The goal tracking feature is exactly what I needed. Breaking things down into 10 steps makes everything feel achievable.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  },
  {
    name: "Michael Ross",
    role: "Entrepreneur",
    content: "I've tried every productivity app out there. TimeForge is the first one that actually sticks because it's so intuitive.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
  },
  {
    name: "Future User",
    role: "Hopefully You",
    content: "No users yet lol. Be the first to actually use this and tell me if it works!",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541",
  },
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Join thousands of people who are already mastering their time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card p-8 rounded-2xl shadow-sm border border-border"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-foreground/80 mb-6 italic">"{testimonial.content}"</p>
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full bg-secondary"
                />
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-foreground/60">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
