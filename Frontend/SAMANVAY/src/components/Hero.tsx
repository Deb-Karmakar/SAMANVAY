import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Shield, CheckCircle2 } from "lucide-react";
import heroImage from "@assets/generated_images/Government_building_hero_background_395756c4.png";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Hero() {
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1], // Custom easing for smooth motion
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/75 via-slate-800/60 to-slate-900/70" />
      
      {/* Subtle Grid Pattern Overlay */}
      <motion.div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:32px_32px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      />

      <motion.div 
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div className="mb-8" variants={itemVariants}>
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-500/15 backdrop-blur-sm border border-orange-400/30 text-orange-100 text-sm font-semibold shadow-lg">
            System for Agency Mapping And Nodal VAYavastha
          </span>
        </motion.div>
        
        {/* Main Heading */}
        <motion.h1 
          className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white mb-6 max-w-5xl mx-auto leading-tight drop-shadow-lg"
          variants={itemVariants}
        >
          Unified Agency Coordination for{" "}
          <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400 bg-clip-text text-transparent">
            PM-AJAY Excellence
          </span>
        </motion.h1>
        
        {/* Subheading */}
        <motion.p 
          className="text-lg sm:text-xl lg:text-2xl text-slate-100 mb-10 max-w-3xl mx-auto leading-relaxed font-light drop-shadow-md"
          variants={itemVariants}
        >
          Transform project execution with centralized mapping, real-time transparency, and seamless multi-agency coordination across Adarsh Gram, GIA, and Hostel components.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          variants={itemVariants}
        >
          <motion.div
            variants={buttonVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="lg" 
              className="gap-2 min-w-[180px] h-12 text-base font-semibold bg-orange-600 hover:bg-orange-700 shadow-xl shadow-orange-600/20 transition-all duration-300"
              data-testid="button-cta-get-started"
              onClick={() => navigate('/login')}
            >
              Get Started <ArrowRight className="h-5 w-5" />
            </Button>
          </motion.div>
          
          <motion.div
            variants={buttonVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="lg" 
              variant="outline" 
              className="gap-2 min-w-[180px] h-12 text-base font-semibold bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/15 hover:border-orange-400/40 hover:text-orange-100 transition-all duration-300"
              data-testid="button-hero-view-demo"
            >
              <Play className="h-5 w-5" /> View Demo
            </Button>
          </motion.div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-200"
          variants={itemVariants}
        >
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <CheckCircle2 className="h-5 w-5 text-orange-400" />
            <span className="font-medium">Trusted by 15+ State Governments</span>
          </motion.div>
          <div className="hidden sm:block w-1 h-1 bg-slate-400 rounded-full"></div>
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <CheckCircle2 className="h-5 w-5 text-orange-400" />
            <span className="font-medium">100% Secure & Compliant</span>
          </motion.div>
          <div className="hidden sm:block w-1 h-1 bg-slate-400 rounded-full"></div>
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <CheckCircle2 className="h-5 w-5 text-orange-400" />
            <span className="font-medium">Real-time Monitoring</span>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
}