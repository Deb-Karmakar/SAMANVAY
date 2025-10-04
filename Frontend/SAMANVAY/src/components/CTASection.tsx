import { Button } from "@/components/ui/button";
import { ArrowRight, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom"; // 1. Import the useNavigate hook

export default function CTASection() {
  const navigate = useNavigate(); // 2. Initialize the hook

  // 3. Create a handler function for navigation
  const handleGetStartedClick = () => {
    navigate('/login');
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background via-accent/20 to-primary/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-6">
          Transform Your PM-AJAY Coordination Today
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Join 15+ state governments already benefiting from unified agency coordination and transparent project execution.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          {/* 4. Add the onClick event to the button */}
          <Button 
            size="lg" 
            className="gap-2" 
            data-testid="button-cta-get-started"
            onClick={handleGetStartedClick}
          >
            Get Started Now <ArrowRight className="h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" className="gap-2" data-testid="button-cta-contact">
            <Mail className="h-4 w-4" /> Contact Sales
          </Button>
        </div>

        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-chart-3 flex items-center justify-center text-white text-xs">✓</div>
            <span>Government Certified</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-chart-3 flex items-center justify-center text-white text-xs">✓</div>
            <span>Secure & Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-chart-3 flex items-center justify-center text-white text-xs">✓</div>
            <span>24/7 Support</span>
          </div>
        </div>
      </div>
    </section>
  );
}
