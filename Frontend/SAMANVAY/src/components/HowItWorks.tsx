import { Card } from "@/components/ui/card";
import { UserPlus, Network, CheckCircle2, BarChart3 } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: UserPlus,
    title: "Agency Registration",
    description: "Register all implementing and executing agencies on the unified platform with role-based access"
  },
  {
    number: 2,
    icon: Network,
    title: "Map Relationships",
    description: "Define agency hierarchies, responsibilities, and communication workflows for each component"
  },
  {
    number: 3,
    icon: CheckCircle2,
    title: "Execute & Track",
    description: "Coordinate project execution with real-time updates, milestone tracking, and automated alerts"
  },
  {
    number: 4,
    icon: BarChart3,
    title: "Monitor & Report",
    description: "Generate comprehensive reports and analytics for informed decision-making and compliance"
  }
];

export default function HowItWorks() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
            How SAMANVAY Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            A simple four-step process to transform your PM-AJAY coordination
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, index) => (
            <div key={index} className="relative" data-testid={`step-${index}`}>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-[calc(100%-2rem)] w-[calc(100%+4rem)] h-0.5 bg-border z-0">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full"></div>
                </div>
              )}
              
              <Card className="p-6 hover-elevate relative z-10 h-full">
                <div className="mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-4xl font-bold text-primary/20 mb-2">{step.number}</div>
                </div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
