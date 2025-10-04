import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Globe, Bot, Bell, Smartphone, MapPin, BarChart3, CheckCircle, ArrowRight, Languages } from "lucide-react";
import { motion } from "framer-motion";

export function SolutionOverview() {
  const coreFeatures = [
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Smart GIS Mapping",
      description: "Pan-India view of States/UTs, their agencies & projects with interactive mapping",
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-400"
    },
    {
      icon: <Bot className="w-8 h-8" />,
      title: "AI Alerts",
      description: "Intelligent dashboard that flags delays and provides automated insights",
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-400"
    },
    {
      icon: <Bell className="w-8 h-8" />,
      title: "Automated Communication",
      description: "Sends alerts/notices to States when funds released or deadlines approach",
      iconColor: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-400"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Mobile-First PWA",
      description: "Access all features from mobile devices with offline capabilities",
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-400"
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "PFMS Integration",
      description: "Real-time fund release vs utilization tracking and monitoring",
      iconColor: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-400"
    },
    {
  icon: <Languages className="w-8 h-8" />,
  title: "Multilingual Support",
  description: "Seamless accessibility with support for multiple Indian languages to ensure inclusivity",
  iconColor: "text-pink-600",
  bgColor: "bg-pink-50",
  borderColor: "border-pink-400"
}

  ];

  const benefits = [
    "Real-time visibility across all implementing agencies",
    "Automated workflow management and notifications",
    "Data-driven insights for better decision making"
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-500 to-blue-500 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        <motion.div 
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 text-slate-900 tracking-tight px-2">
            The SAMANVAY Solution
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed px-4">
            A comprehensive digital platform that brings transparency, efficiency, and accountability to PM-AJAY implementation across India
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center mb-12 sm:mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="mb-8">
              <h3 className="text-2xl sm:text-3xl md:text-4xl mb-4 sm:mb-6 text-slate-900 leading-tight">
                Digital Transformation for{" "}
                <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Good Governance
                </span>
              </h3>
              
              <p className="text-base sm:text-lg md:text-xl text-slate-700 mb-6 sm:mb-8 leading-relaxed">
                SAMANVAY leverages cutting-edge technology including AI, GIS mapping, and mobile-first design to create a unified platform for coordinating PM-AJAY components across all levels of government.
              </p>
            </div>
            
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center group cursor-pointer"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mr-4 group-hover:scale-105 transition-transform shadow-lg">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-slate-700 text-base sm:text-lg group-hover:text-slate-900 transition-colors">{benefit}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 ml-2 opacity-0 group-hover:opacity-100 transition-all" />
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <img
  src="https://images.unsplash.com/photo-1546833998-07256bcc76ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYSUyMGRpZ2l0YWwlMjB0ZWNobm9sb2d5JTIwbWFwfGVufDF8fHx8MTc1OTI5NTU0Nnww&ixlib=rb-4.1.0&q=80&w=1080"
  alt="Digital India Technology"
  className="relative rounded-2xl shadow-2xl group-hover:shadow-3xl transition-all duration-300 group-hover:scale-102"
/>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-blue-500/10 rounded-2xl"></div>
              
              {/* Static UI Elements for better performance */}
              <div className="absolute -top-4 -right-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-xl border border-white/20">
                <Bot className="w-6 h-6 text-blue-600" />
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-xl border border-white/20">
                <Globe className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Core Features Section */}
        <div className="mb-8 sm:mb-12">
          <motion.div 
            className="text-center mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl sm:text-3xl md:text-4xl mb-3 sm:mb-4 text-slate-900 px-4">Core Features</h3>
            <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto px-4">
              Comprehensive tools and capabilities that power the SAMANVAY platform
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {coreFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <Card className="group relative overflow-hidden border-0 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-250 hover:-translate-y-2 h-full">
                  {/* Simplified background on hover */}
                  <div className="absolute inset-0 bg-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-250" />
                  
                  <CardHeader className="relative pb-3 sm:pb-4">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className={`p-3 sm:p-4 ${feature.bgColor} rounded-xl sm:rounded-2xl group-hover:scale-105 transition-transform duration-200 shadow-md flex-shrink-0`}>
                        <div className={feature.iconColor}>
                          <div className="w-6 h-6 sm:w-8 sm:h-8">
                            {feature.icon}
                          </div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg sm:text-xl text-slate-900 group-hover:text-slate-700 transition-colors leading-tight mb-1 sm:mb-2">
                          {feature.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="relative pt-0">
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors">
                      {feature.description}
                    </p>
                    
                    {/* Simplified highlight indicator */}
                    <div className={`mt-3 sm:mt-4 w-10 sm:w-12 h-1 ${feature.iconColor.replace('text-', 'bg-')} rounded-full group-hover:w-14 sm:group-hover:w-16 transition-all duration-200`}></div>
                  </CardContent>
                  
                  {/* Simplified hover border */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-slate-200 rounded-lg transition-all duration-200" />
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}