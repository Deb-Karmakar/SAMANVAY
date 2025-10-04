import { Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  product: [
    { name: "Features", href: "#" },
    { name: "Components", href: "#" },
    { name: "Pricing", href: "#" },
    { name: "Documentation", href: "#" }
  ],
  resources: [
    { name: "User Guide", href: "#" },
    { name: "API Reference", href: "#" },
    { name: "Support", href: "#" },
    { name: "Training", href: "#" }
  ],
  legal: [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Security", href: "#" },
    { name: "Compliance", href: "#" }
  ]
};

export default function Footer() {
  return (
    <footer className="bg-chart-1 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div>
                <h3 className="font-bold text-lg">SAMANVAY</h3>
                <p className="text-xs text-white/80">समन्वय</p>
              </div>
            </div>
            <p className="text-sm text-white/80 mb-4">
              System for Agency Mapping And Nodal VAYavastha - Transforming PM-AJAY coordination across India.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-white/80 hover:text-white transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-white/80 hover:text-white transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-white/80">
                <Mail className="h-4 w-4 mt-0.5" />
                <span>support@samanvay.gov.in</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-white/80">
                <Phone className="h-4 w-4 mt-0.5" />
                <span>1800-XXX-XXXX (Toll Free)</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-white/80">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>Ministry of Rural Development, New Delhi</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/80">
              © 2024 SAMANVAY. All rights reserved. | Government of India Initiative
            </p>
            <div className="flex gap-6">
              {footerLinks.legal.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm text-white/80 hover:text-white transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
