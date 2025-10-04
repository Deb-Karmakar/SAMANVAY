import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import heroImage from "@assets/generated_images/Government_building_hero_background_395756c4.png";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate hook

export default function Hero() {
  const navigate = useNavigate(); // 2. Initialize the hook

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-chart-1/90 via-chart-1/70 to-chart-1/50" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="mb-6">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 text-primary-foreground text-sm font-medium">
            System for Agency Mapping And Nodal VAYavastha
          </span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 max-w-4xl mx-auto">
          Unified Agency Coordination for PM-AJAY Excellence
        </h1>
        
        <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-3xl mx-auto">
          Transform project execution with centralized mapping, real-time transparency, and seamless multi-agency coordination across Adarsh Gram, GIA, and Hostel components.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Button 
            size="lg" 
            className="gap-2 min-w-[160px]"
            data-testid="button-cta-get-started"
            onClick={() => navigate('/login')} // 3. Add onClick handler to navigate
          >
            Get Started <ArrowRight className="h-4 w-4" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="gap-2 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 min-w-[160px]"
            data-testid="button-hero-view-demo"
          >
            <Play className="h-4 w-4" /> View Demo
          </Button>
        </div>

        <p className="text-sm text-white/80 flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 bg-chart-3 rounded-full"></span>
          Trusted by 15+ State Governments across India
        </p>
      </div>
    </section>
  );
}
