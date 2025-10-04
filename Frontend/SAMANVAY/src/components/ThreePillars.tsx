import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import adarshGramImage from "@assets/generated_images/Adarsh_Gram_village_illustration_819594e2.png";
import giaImage from "@assets/generated_images/GIA_grant_system_illustration_3601a9c7.png";
import hostelImage from "@assets/generated_images/Hostel_building_illustration_fba8bf2b.png";

const pillars = [
  {
    title: "Adarsh Gram",
    subtitle: "आदर्श ग्राम",
    description: "Comprehensive village development coordination with real-time tracking of implementing agencies, resource allocation, and project milestones.",
    image: adarshGramImage,
    color: "chart-3"
  },
  {
    title: "GIA",
    subtitle: "Grant-in-Aid",
    description: "Streamlined grant management system ensuring transparent fund disbursement, utilization tracking, and accountability across all stakeholders.",
    image: giaImage,
    color: "chart-2"
  },
  {
    title: "Hostel",
    subtitle: "छात्रावास",
    description: "Efficient hostel facility coordination managing construction, maintenance, and operations through unified agency collaboration.",
    image: hostelImage,
    color: "chart-1"
  }
];

export default function ThreePillars() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
            Three Pillars of PM-AJAY Coordination
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            SAMANVAY provides unified coordination across all three components of PM-AJAY with seamless agency mapping and transparent workflows.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => (
            <Card key={index} className="overflow-hidden group hover-elevate" data-testid={`card-pillar-${index}`}>
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img 
                  src={pillar.image} 
                  alt={pillar.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <div className={`inline-block px-3 py-1 rounded-full bg-${pillar.color}/10 text-${pillar.color} text-xs font-medium mb-3`}>
                  {pillar.subtitle}
                </div>
                <h3 className="text-xl font-bold mb-3">{pillar.title}</h3>
                <p className="text-muted-foreground mb-4">{pillar.description}</p>
                <Button variant="ghost" className="gap-2 p-0" data-testid={`button-learn-more-${index}`}>
                  Learn More <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
