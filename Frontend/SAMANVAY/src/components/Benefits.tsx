import { Card } from "@/components/ui/card";
import { TrendingUp, Target, Users2 } from "lucide-react";

const stats = [
  {
    icon: TrendingUp,
    value: "50%",
    label: "Faster Coordination",
    description: "Reduce project execution time"
  },
  {
    icon: Target,
    value: "100%",
    label: "Transparency",
    description: "Complete visibility across agencies"
  },
  {
    icon: Users2,
    value: "15+",
    label: "States Onboarded",
    description: "Growing government adoption"
  }
];

export default function Benefits() {
  return (
    <section className="py-16 md:py-24 bg-chart-1 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <pattern id="mandala" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="1"/>
            <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="1"/>
            <circle cx="100" cy="100" r="20" fill="none" stroke="currentColor" strokeWidth="1"/>
          </pattern>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#mandala)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-6">
              Transforming Government Coordination
            </h2>
            <p className="text-lg text-white/90 mb-6">
              SAMANVAY has revolutionized how state governments coordinate PM-AJAY implementation, delivering measurable results across all components.
            </p>
            <blockquote className="border-l-4 border-primary pl-4 italic text-white/90">
              "SAMANVAY has completely transformed our coordination workflow. What used to take weeks now happens in days, with complete transparency across all agencies."
            </blockquote>
            <p className="mt-3 text-sm text-white/80">
              — State Nodal Officer, Maharashtra
            </p>
          </div>

          <div className="grid gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="p-6 bg-white/10 backdrop-blur-sm border-white/20 text-white hover-elevate" data-testid={`card-stat-${index}`}>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/20">
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="font-semibold mb-1">{stat.label}</div>
                    <div className="text-sm text-white/80">{stat.description}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
