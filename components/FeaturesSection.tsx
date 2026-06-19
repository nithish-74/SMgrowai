import { Bot, Zap, BarChart3, Calendar, Instagram, Twitter, Brain, Target } from "lucide-react";

const features = [
  {
    title: "Competitor Research",
    description: "Automatically analyzes your competitors' top-performing posts and finds content gaps.",
    icon: Target,
  },
  {
    title: "Smart Content Creation",
    description: "Generates Instagram captions, carousels, and Twitter threads tailored to your brand voice.",
    icon: Brain,
  },
  {
    title: "Auto Scheduling",
    description: "Plans your content calendar 7+ days in advance and posts automatically.",
    icon: Calendar,
  },
  {
    title: "Performance Tracking",
    description: "Measures engagement, tracks uplift, and optimizes future content based on results.",
    icon: BarChart3,
  },
  {
    title: "Instagram First",
    description: "Native support for Instagram Reels, Carousels, and single-image posts.",
    icon: Instagram,
  },
  {
    title: "Twitter/X Ready",
    description: "Creates optimized threads and posts for Twitter/X algorithm.",
    icon: Twitter,
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-bg2">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Everything you need, out of the box
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            SMgrowai handles the entire marketing pipeline, from research to publishing.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="p-8 rounded-2xl bg-surface border border-border hover:border-primary/30 hover:shadow-[0_0_30px_rgba(184,255,87,0.1)] transition-all duration-300"
            >
              <feature.icon className="w-12 h-12 text-primary mb-6" />
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
