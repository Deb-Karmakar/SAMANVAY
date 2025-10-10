import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Globe, Bot, Bell, Smartphone, MapPin, BarChart3, CheckCircle, ArrowRight, Languages, Fingerprint, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";

export function SolutionOverview() {
  const coreFeatures = [
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Smart GIS Mapping",
      description: "Pan-India view of States/UTs, their agencies & projects with interactive mapping",
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      gradientFrom: "from-blue-500",
      gradientTo: "to-cyan-500",
      borderColor: "border-blue-200 dark:border-blue-900"
    },
    {
      icon: <Bot className="w-8 h-8" />,
      title: "AI Alerts",
      description: "Intelligent dashboard that flags delays and provides automated insights",
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
      gradientFrom: "from-emerald-500",
      gradientTo: "to-green-500",
      borderColor: "border-emerald-200 dark:border-emerald-900"
    },
    {
      icon: <Bell className="w-8 h-8" />,
      title: "Automated Communication",
      description: "Sends alerts/notices to States when funds released or deadlines approach",
      iconColor: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
      gradientFrom: "from-orange-500",
      gradientTo: "to-amber-500",
      borderColor: "border-orange-200 dark:border-orange-900"
    },
    {
      icon: <Fingerprint className="w-8 h-8" />,
      title: "Blockchain-Enabled Transparency",
      description: "Creates a tamper-proof, immutable ledger for key approvals and milestones, ensuring unparalleled transparency.",
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
      gradientFrom: "from-purple-500",
      gradientTo: "to-pink-500",
      borderColor: "border-purple-200 dark:border-purple-900"
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "PFMS Integration",
      description: "Real-time fund release vs utilization tracking and monitoring",
      iconColor: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950/30",
      gradientFrom: "from-red-500",
      gradientTo: "to-rose-500",
      borderColor: "border-red-200 dark:border-red-900"
    },
    {
      icon: <Languages className="w-8 h-8" />,
      title: "Multilingual Support",
      description: "Seamless accessibility with support for multiple Indian languages to ensure inclusivity",
      iconColor: "text-pink-600",
      bgColor: "bg-pink-50 dark:bg-pink-950/30",
      gradientFrom: "from-pink-500",
      gradientTo: "to-rose-500",
      borderColor: "border-pink-200 dark:border-pink-900"
    }
  ];

  const benefits = [
    {
      text: "Real-time visibility across all implementing agencies",
      icon: <Globe className="w-5 h-5" />
    },
    {
      text: "Automated workflow management and notifications",
      icon: <Zap className="w-5 h-5" />
    },
    {
      text: "Data-driven insights for better decision making",
      icon: <BarChart3 className="w-5 h-5" />
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section className="py-16 md:py-24 lg:py-32 px-4 sm:px-6 bg-gradient-to-br from-white via-slate-50/80 to-blue-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 opacity-30 dark:opacity-10">
        <div className="absolute top-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-green-500 to-blue-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header Section */}
        <motion.div 
          className="text-center mb-16 md:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-6">
            <Sparkles className="h-4 w-4" />
            Our Solution
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-white dark:via-blue-100 dark:to-white bg-clip-text text-transparent tracking-tight px-2 leading-tight">
            The SAMANVAY Solution
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed px-4">
            A comprehensive digital platform that brings transparency, efficiency, and accountability to PM-AJAY implementation across India
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 lg:gap-20 items-center mb-20 md:mb-28">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="mb-10">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white leading-tight">
                Digital Transformation for{" "}
                <span className="bg-gradient-to-r from-orange-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                  Good Governance
                </span>
              </h3>
              
              <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 mb-8 leading-relaxed">
                SAMANVAY leverages cutting-edge technology including AI, GIS mapping, and mobile-first design to create a unified platform for coordinating PM-AJAY components across all levels of government.
              </p>
            </div>
            
            {/* Benefits List */}
            <div className="space-y-5">
              {benefits.map((benefit, index) => (
                <motion.div 
                  key={index}
                  className="group cursor-pointer"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ x: 8 }}
                >
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700 group-hover:border-green-400 dark:group-hover:border-green-600 group-hover:shadow-lg transition-all duration-300">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 text-base md:text-lg font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors flex-1">
                      {benefit.text}
                    </span>
                    <div className="text-slate-400 group-hover:text-green-600 transition-colors">
                      {benefit.icon}
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-green-600 transition-all" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Right Image */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-6 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Main image */}
              <div className="relative overflow-hidden rounded-2xl">
                <img
                  src="https://images.unsplash.com/photo-1546833998-07256bcc76ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYSUyMGRpZ2l0YWwlMjB0ZWNobm9sb2d5JTIwbWFwfGVufDF8fHx8MTc1OTI5NTU0Nnww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Digital India Technology"
                  className="relative rounded-2xl shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-105 w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-blue-500/10 rounded-2xl"></div>
              </div>
              
              {/* Floating icons */}
              <motion.div 
                className="absolute -top-6 -right-6 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-2xl border border-slate-200 dark:border-slate-700"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Bot className="w-8 h-8 text-blue-600" />
              </motion.div>
              
              <motion.div 
                className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-2xl border border-slate-200 dark:border-slate-700"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              >
                <Globe className="w-8 h-8 text-green-600" />
              </motion.div>

              <motion.div 
                className="absolute top-1/2 -right-6 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-2xl border border-slate-200 dark:border-slate-700"
                animate={{ x: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.75 }}
              >
                <Fingerprint className="w-8 h-8 text-purple-600" />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Core Features Section */}
        <div>
          <motion.div 
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            
                        <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent px-4">
              Core Features
            </h3>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto px-4 leading-relaxed">
              Comprehensive tools and capabilities that power the SAMANVAY platform
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {coreFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`group relative overflow-hidden border-2 ${feature.borderColor} bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 h-full`}>
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradientFrom} ${feature.gradientTo} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  <CardHeader className="relative pb-4">
                    <div className="flex items-start space-x-4">
                      {/* Icon container */}
                      <motion.div 
                        className={`p-4 ${feature.bgColor} rounded-2xl shadow-md flex-shrink-0 border ${feature.borderColor}`}
                        whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className={feature.iconColor}>
                          {feature.icon}
                        </div>
                      </motion.div>
                      
                      <div className="flex-1 pt-1">
                        <CardTitle className="text-xl md:text-2xl text-slate-900 dark:text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-slate-900 group-hover:to-slate-700 dark:group-hover:from-white dark:group-hover:to-slate-300 transition-all leading-tight">
                          {feature.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="relative">
                    <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors mb-4">
                      {feature.description}
                    </p>
                    
                    {/* Animated progress bar */}
                    <div className="relative h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full bg-gradient-to-r ${feature.gradientFrom} ${feature.gradientTo} rounded-full`}
                        initial={{ width: "0%" }}
                        whileInView={{ width: "100%" }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        viewport={{ once: true }}
                      />
                    </div>
                  </CardContent>
                  
                  {/* Bottom accent border */}
                  <div className={`h-1.5 bg-gradient-to-r ${feature.gradientFrom} ${feature.gradientTo} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
                  
                  {/* Corner decoration */}
                  <div className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className={`absolute top-0 right-0 w-full h-full bg-gradient-to-br ${feature.gradientFrom} ${feature.gradientTo} opacity-10 rounded-bl-full`}></div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom Stats/Info Section */}
          <motion.div 
            className="mt-16 md:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200 dark:border-blue-900">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                100%
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-medium">
                Digital Transparency
              </p>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-900">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                24/7
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-medium">
                Real-time Monitoring
              </p>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-200 dark:border-orange-900">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
                Pan-India
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-medium">
                Coverage & Reach
              </p>
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
              Experience the future of government coordination
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}