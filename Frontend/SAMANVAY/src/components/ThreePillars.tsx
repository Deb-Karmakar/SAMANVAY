import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import adarshGramImage from "@assets/generated_images/Adarsh_Gram_village_illustration_819594e2.png";
import giaImage from "@assets/generated_images/GIA_grant_system_illustration_3601a9c7.png";
import hostelImage from "@assets/generated_images/Hostel_building_illustration_fba8bf2b.png";
import { motion } from "framer-motion";

const pillars = [
  {
    title: "Adarsh Gram",
    subtitle: "आदर्श ग्राम",
    description: "Comprehensive village development coordination with real-time tracking of implementing agencies, resource allocation, and project milestones.",
    image: adarshGramImage,
    gradient: "from-green-500 to-emerald-600",
    bgGradient: "from-green-500/10 to-emerald-500/5",
    iconBg: "bg-green-500/10",
    textColor: "text-green-600 dark:text-green-400",
    borderColor: "border-green-200 dark:border-green-900"
  },
  {
    title: "GIA",
    subtitle: "Grant-in-Aid",
    description: "Streamlined grant management system ensuring transparent fund disbursement, utilization tracking, and accountability across all stakeholders.",
    image: giaImage,
    gradient: "from-blue-500 to-cyan-600",
    bgGradient: "from-blue-500/10 to-cyan-500/5",
    iconBg: "bg-blue-500/10",
    textColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-900"
  },
  {
    title: "Hostel",
    subtitle: "छात्रावास",
    description: "Efficient hostel facility coordination managing construction, maintenance, and operations through unified agency collaboration.",
    image: hostelImage,
    gradient: "from-orange-500 to-amber-600",
    bgGradient: "from-orange-500/10 to-amber-500/5",
    iconBg: "bg-orange-500/10",
    textColor: "text-orange-600 dark:text-orange-400",
    borderColor: "border-orange-200 dark:border-orange-900"
  }
];

export default function ThreePillars() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const handleLearnMore = () => {
    window.open("https://pmajay.dosje.gov.in/", "_blank", "noopener,noreferrer");
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-orange-500/5 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-500/5 to-transparent rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-sm font-semibold mb-6">
            <Sparkles className="h-4 w-4" />
            PM-AJAY Components
          </div>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent">
            Three Pillars of PM-AJAY Coordination
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            SAMANVAY provides unified coordination across all three components of PM-AJAY with seamless agency mapping and transparent workflows.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <motion.div 
          className="grid md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {pillars.map((pillar, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <Card 
                className={`overflow-hidden group h-full border-2 ${pillar.borderColor} hover:shadow-2xl transition-all duration-300 bg-gradient-to-br ${pillar.bgGradient}`}
                data-testid={`card-pillar-${index}`}
              >
                {/* Image Container */}
                <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${pillar.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  <img 
                    src={pillar.image} 
                    alt={pillar.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Content */}
                <div className="p-6 lg:p-7">
                  {/* Subtitle Badge */}
                  <motion.div 
                    className={`inline-flex items-center px-3 py-1.5 rounded-full ${pillar.iconBg} border ${pillar.borderColor} text-xs font-semibold mb-4`}
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className={pillar.textColor}>{pillar.subtitle}</span>
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-slate-900 group-hover:to-slate-700 dark:group-hover:from-white dark:group-hover:to-slate-300 transition-all duration-300">
                    {pillar.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed mb-6 min-h-[120px]">
                    {pillar.description}
                  </p>

                  {/* CTA Button */}
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button 
                      variant="ghost" 
                      className={`gap-2 p-0 h-auto font-semibold ${pillar.textColor} hover:bg-transparent group/btn`}
                      data-testid={`button-learn-more-${index}`}
                      onClick={handleLearnMore}
                    >
                      Learn More 
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </motion.div>
                </div>

                {/* Bottom accent line */}
                <div className={`h-1 bg-gradient-to-r ${pillar.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA (Optional) */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <p className="text-sm text-muted-foreground mb-4">
            Discover how SAMANVAY integrates all three pillars seamlessly
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-75"></div>
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse delay-150"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}