import { Card } from "@/components/ui/card";
import { AlertCircle, Network, Clock, FileQuestion, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

const challenges = [
  {
    icon: Network,
    title: "No Centralized Mapping",
    description: "Lack of structured mapping of implementing and executing agencies",
    color: "text-red-500",
    bgColor: "bg-red-500/10"
  },
  {
    icon: AlertCircle,
    title: "Coordination Bottlenecks",
    description: "States with multiple executing agencies face coordination challenges",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10"
  },
  {
    icon: FileQuestion,
    title: "Lack of Transparency",
    description: "No clear visibility on roles, timelines, and responsibilities",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10"
  },
  {
    icon: Clock,
    title: "Delayed Execution",
    description: "Confusion leads to delayed project execution and implementation",
    color: "text-red-600",
    bgColor: "bg-red-600/10"
  }
];

export default function ProblemStatement() {
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
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Challenges */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-semibold mb-6">
                <TrendingDown className="h-4 w-4" />
                Current Challenges
              </div>
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                The Challenge with PM-AJAY Implementation
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                PM-AJAY consists of three components—Adarsh Gram, GIA, and Hostel—implemented by State/UT governments and executed through multiple agencies. Lack of structured mapping and communication creates significant obstacles.
              </p>
            </motion.div>

            <motion.div 
              className="space-y-4"
              variants={containerVariants}
            >
              {challenges.map((challenge, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, x: 8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="p-5 border-l-4 border-l-red-500/50 hover:shadow-lg transition-shadow duration-300 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${challenge.bgColor}`}>
                        <challenge.icon className={`h-6 w-6 ${challenge.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">{challenge.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {challenge.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column - Current Workflow */}
          <motion.div 
            className="flex items-center justify-center lg:justify-end"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={cardVariants}
          >
            <Card className="p-8 lg:p-10 w-full max-w-md shadow-2xl border-2 relative overflow-hidden">
              {/* Decorative background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-amber-500/10 to-red-500/10 rounded-full blur-3xl"></div>
              
              <div className="relative space-y-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 mb-4 shadow-lg">
                    <AlertCircle className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-2xl mb-2">Current Workflow</h3>
                  <p className="text-sm text-muted-foreground">Inefficient Process Flow</p>
                </div>

                <div className="space-y-5">
                  {/* Step 1 */}
                  <motion.div 
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-sm font-bold shadow-md flex-shrink-0">
                      1
                    </div>
                    <div className="flex-1 p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-semibold">Multiple Agencies</p>
                      <p className="text-xs text-muted-foreground mt-1">Disconnected entities</p>
                    </div>
                  </motion.div>

                  {/* Connector */}
                  <div className="flex justify-center">
                    <div className="w-0.5 h-8 bg-gradient-to-b from-slate-300 to-red-300 dark:from-slate-600 dark:to-red-600"></div>
                  </div>

                  {/* Step 2 */}
                  <motion.div 
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-bold shadow-md flex-shrink-0">
                      2
                    </div>
                    <div className="flex-1 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900">
                      <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">Disconnected Communication</p>
                      <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">Information silos</p>
                    </div>
                  </motion.div>

                  {/* Connector */}
                  <div className="flex justify-center">
                    <div className="w-0.5 h-8 bg-gradient-to-b from-red-300 to-red-500 dark:from-red-600 dark:to-red-700"></div>
                  </div>

                  {/* Step 3 */}
                  <motion.div 
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white text-sm font-bold shadow-lg flex-shrink-0 animate-pulse">
                      3
                    </div>
                    <div className="flex-1 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border-2 border-red-300 dark:border-red-800">
                      <p className="text-sm font-bold text-red-900 dark:text-red-100">Project Delays</p>
                      <p className="text-xs text-red-700 dark:text-red-300 mt-1">Critical impact on execution</p>
                    </div>
                  </motion.div>
                </div>

                {/* Impact indicator */}
                <div className="pt-6 border-t border-dashed">
                  <div className="flex items-center justify-center gap-2 text-sm text-red-600 dark:text-red-400 font-semibold">
                    <TrendingDown className="h-4 w-4" />
                    <span>Reduced Efficiency & Accountability</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}