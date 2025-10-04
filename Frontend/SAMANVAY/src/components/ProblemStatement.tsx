import { Card } from "@/components/ui/card";
import { AlertCircle, Network, Clock, FileQuestion } from "lucide-react";

const challenges = [
  {
    icon: Network,
    title: "No Centralized Mapping",
    description: "Lack of structured mapping of implementing and executing agencies"
  },
  {
    icon: AlertCircle,
    title: "Coordination Bottlenecks",
    description: "States with multiple executing agencies face coordination challenges"
  },
  {
    icon: FileQuestion,
    title: "Lack of Transparency",
    description: "No clear visibility on roles, timelines, and responsibilities"
  },
  {
    icon: Clock,
    title: "Delayed Execution",
    description: "Confusion leads to delayed project execution and implementation"
  }
];

export default function ProblemStatement() {
  return (
    <section className="py-16 md:py-24 bg-accent/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-6">
              The Challenge with PM-AJAY Implementation
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              PM-AJAY consists of three components—Adarsh Gram, GIA, and Hostel—implemented by State/UT governments and executed through multiple agencies. Lack of structured mapping and communication creates significant obstacles.
            </p>
            <div className="space-y-4">
              {challenges.map((challenge, index) => (
                <Card key={index} className="p-4 hover-elevate">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-destructive/10">
                      <challenge.icon className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{challenge.title}</h3>
                      <p className="text-sm text-muted-foreground">{challenge.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <Card className="p-8 w-full max-w-md">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="font-bold text-xl mb-4">Current Workflow</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">1</div>
                    <div className="flex-1 p-3 rounded-lg bg-muted/50 text-sm">Multiple Agencies</div>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-px h-8 bg-border"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">2</div>
                    <div className="flex-1 p-3 rounded-lg bg-destructive/10 text-sm">Disconnected Communication</div>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-px h-8 bg-border"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">3</div>
                    <div className="flex-1 p-3 rounded-lg bg-destructive/20 text-sm font-semibold">Project Delays</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
