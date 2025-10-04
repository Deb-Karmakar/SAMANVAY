import { Card } from "@/components/ui/card";
import {
  Map,
  Eye,
  Users,
  Clock,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { SolutionOverview } from "./SolutionOverview"; // ✅ Import SolutionOverview

const features = [
  {
    icon: Map,
    title: "Centralized Mapping",
    description:
      "Complete visibility of all implementing and executing agencies in one unified platform",
  },
  {
    icon: Eye,
    title: "Real-time Transparency",
    description:
      "Live tracking of project status, resource allocation, and milestone completion",
  },
  {
    icon: Users,
    title: "Multi-agency Coordination",
    description:
      "Seamless collaboration tools for states with multiple executing agencies",
  },
  {
    icon: Clock,
    title: "Timeline Tracking",
    description:
      "Automated timeline management with alerts for critical milestones and deadlines",
  },
  {
    icon: ShieldCheck,
    title: "Role Clarity",
    description:
      "Clear definition of responsibilities and accountability across all stakeholders",
  },
  {
    icon: FileText,
    title: "Automated Reporting",
    description:
      "Generate comprehensive reports for monitoring, evaluation, and compliance",
  },
];

export default function KeyFeatures() {
  return (
    <>
      {/* ✅ Show SolutionOverview first */}
      <SolutionOverview />

      {/* Key Features Section */}
      {/* <section className="py-16 md:py-24 bg-accent/30 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-64 h-64 border-2 border-primary rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 border-2 border-chart-3 rounded-full"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
              Powerful Features for Seamless Coordination
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Everything you need to transform PM-AJAY implementation with
              data-driven insights and efficient workflows.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 hover-elevate"
                data-testid={`card-feature-${index}`}
              >
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section> */}
    </>
  );
}
