import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Calendar, MapPin, Bell, Users, Shield } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useNavigate } from "react-router-dom";

interface FeaturesProps {
  onChatbotOpen: () => void;
  onMapOpen: () => void;
}

const Features = ({ onChatbotOpen, onMapOpen }: FeaturesProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const features = [
    {
      icon: Bot,
      title: "AI Gift Recommendations",
      description: "Get personalized gift suggestions based on occasion, budget, and recipient preferences using advanced AI technology.",
      color: "text-blue-500",
      onClick: onChatbotOpen
    },
    {
      icon: Calendar,
      title: "Smart Calendar Integration",
      description: "Sync with Google Calendar to track important dates and never miss an occasion with automated reminders.",
      color: "text-green-500",
      onClick: () => window.open('https://calendar.google.com', '_blank')
    },
    {
      icon: MapPin,
      title: "Interactive Store Map",
      description: "Find nearby gift shops with filters, ratings, and turn-by-turn navigation to make shopping effortless.",
      color: "text-purple-500",
      onClick: onMapOpen
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Receive timely email and in-app reminders 3 days before important events so you're always prepared.",
      color: "text-orange-500",
      onClick: () => navigate('/notifications')
    },
    {
      icon: Users,
      title: "Guest & Admin Roles",
      description: "Secure user accounts with role-based access, ensuring the right features for every user type.",
      color: "text-indigo-500",
      onClick: undefined
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description: "Your data is protected with enterprise-grade security and GDPR compliance for peace of mind.",
      color: "text-red-500",
      onClick: undefined
    }
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t('features.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className={`group hover:shadow-elegant transition-all duration-500 hover:-translate-y-2 border-border/50 hover:border-primary/30 ${feature.onClick ? 'cursor-pointer' : ''} relative overflow-hidden animate-fade-in`}
                style={{animationDelay: `${index * 100}ms`}}
                onClick={feature.onClick}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="pb-4 relative z-10">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${feature.color.split('-')[1]}-500/10 to-${feature.color.split('-')[1]}-500/20 flex items-center justify-center mb-4 group-hover:scale-125 group-hover:rotate-3 transition-all duration-500 relative`}>
                    <Icon className={`h-6 w-6 ${feature.color} group-hover:scale-110 transition-transform duration-300`} />
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                    {t(`features.items.${index}.title`)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                    {t(`features.items.${index}.description`)}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;