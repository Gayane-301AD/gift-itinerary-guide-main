import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Calendar, MapPin, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";

interface HowItWorksProps {
  onChatbotOpen: () => void;
  onMapOpen: () => void;
}

const HowItWorks = ({ onChatbotOpen, onMapOpen }: HowItWorksProps) => {
  const { t } = useTranslation();
  const steps = [
    {
      number: "01",
      icon: MessageSquare,
      title: "Chat with AI",
      description: "Tell our AI about your occasion, budget, and recipient preferences. Get instant, personalized gift recommendations.",
      color: "from-blue-500 to-blue-600",
      onClick: onChatbotOpen
    },
    {
      number: "02", 
      icon: Calendar,
      title: "Mark Important Dates",
      description: "Add events to your calendar and sync with Google Calendar. Receive smart reminders 3 days before each occasion.",
      color: "from-green-500 to-green-600",
      onClick: () => window.open('https://calendar.google.com', '_blank')
    },
    {
      number: "03",
      icon: MapPin,
      title: "Find Nearby Stores",
      description: "Discover gift shops near you with our interactive map. View ratings, details, and get turn-by-turn directions.",
      color: "from-purple-500 to-purple-600",
      onClick: onMapOpen
    },
    {
      number: "04",
      icon: Gift,
      title: "Perfect Gift Delivered",
      description: "Arrive confident with the perfect gift, having made an informed decision that will create lasting memories.",
      color: "from-orange-500 to-orange-600",
      onClick: undefined
    }
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/30 to-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t('howItWorks.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('howItWorks.subtitle')}
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className={`group relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-elegant hover:-translate-y-2 animate-fade-in ${step.onClick ? 'cursor-pointer' : ''}`} style={{animationDelay: `${index * 150}ms`}} onClick={step.onClick}>
                {/* Background Gradient */}
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${step.color} group-hover:h-2 transition-all duration-300`} />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardContent className="p-8 relative z-10">
                  <div className="flex items-start space-x-4">
                    {/* Step Number */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 relative`}>
                      {step.number}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    
                    <div className="flex-grow">
                      {/* Icon and Title */}
                      <div className="flex items-center space-x-3 mb-3">
                        <Icon className="h-6 w-6 text-primary group-hover:text-primary-glow group-hover:scale-110 transition-all duration-300" />
                        <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                          {t(`howItWorks.steps.${index}.title`)}
                        </h3>
                      </div>
                      
                      {/* Description */}
                      <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                        {t(`howItWorks.steps.${index}.description`)}
                      </p>
                    </div>
                  </div>
                </CardContent>
                
                {/* Connecting line for larger screens */}
                {index < steps.length - 1 && index % 2 === 0 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary to-transparent z-20" />
                )}
              </Card>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;