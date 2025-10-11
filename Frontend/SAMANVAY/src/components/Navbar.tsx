import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  // Function to handle contact email redirect
  const handleContactUs = () => {
    window.location.href = "mailto:debkarma97@gmail.com";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo */}
          <div className="flex items-center gap-2 mb-1">
            <img
              src="/logo2.png"
              alt="SAMANVAY Logo"
              className="h-32 w-auto object-contain"
            />
          </div>

          {/* Right side - Buttons */}
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              data-testid="button-contact"
              onClick={handleContactUs}
            >
              Contact Us
            </Button>
            <Button
              size="sm"
              data-testid="button-get-started"
              onClick={() => navigate('/login')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}