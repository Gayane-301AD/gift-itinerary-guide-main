import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Play, Star, Zap, Heart, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import Chatbot from "./Chatbot";
import RegistrationPrompt from "./RegistrationPrompt";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthGuard } from "@/hooks/useAuthGuard";

const Hero = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const { requireAuth, showRegistrationPrompt, closeRegistrationPrompt } = useAuthGuard();
  const { t } = useTranslation();
  return (
    <section className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-primary/5 to-muted/30 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-glow/20 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 to-transparent rounded-full blur-3xl animate-spin" style={{animationDuration: '20s'}} />
      
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center">
          {/* Floating elements */}
          <div className="absolute top-10 left-1/4 animate-bounce delay-300">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div className="absolute top-20 right-1/4 animate-bounce delay-700">
            <div className="w-10 h-10 bg-primary-glow/20 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-glow" />
            </div>
          </div>
          <div className="absolute top-32 left-1/3 animate-bounce delay-1000">
            <div className="w-6 h-6 bg-primary/30 rounded-full flex items-center justify-center">
              <Zap className="w-3 h-3 text-primary" />
            </div>
          </div>
          <div className="absolute top-16 right-1/3 animate-bounce delay-500">
            <div className="w-7 h-7 bg-primary-glow/25 rounded-full flex items-center justify-center">
              <Bell className="w-4 h-4 text-primary-glow" />
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-primary-glow/10 text-primary border border-primary/20 mb-8 backdrop-blur-sm hover:scale-105 transition-all duration-300 hover:shadow-elegant animate-fade-in">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-medium">{t('hero.badge')}</span>
            <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground mb-6 leading-tight animate-fade-in hover:scale-105 transition-transform duration-500">
            {t('hero.title')}{" "}
            <span className="bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent animate-pulse bg-[length:200%_100%] animate-[gradient_3s_ease-in-out_infinite]" style={{backgroundImage: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary-glow)), hsl(var(--primary)))', backgroundSize: '200% 100%', animation: 'gradient 3s ease-in-out infinite'}}>
              {t('hero.titleHighlight')}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in opacity-90 hover:opacity-100 transition-opacity duration-300">
            {t('hero.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in">
            <Button 
              variant="hero" 
              size="lg" 
              className="text-base px-8 group relative overflow-hidden hover:shadow-elegant hover:-translate-y-1 transition-all duration-300"
              onClick={() => requireAuth(() => setIsChatbotOpen(true))}
            >
              <span className="relative z-10">{t('hero.ctaStart')}</span>
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary-glow to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-base px-8 group hover:shadow-lg hover:border-primary/40 transition-all duration-300 hover:bg-primary/5"
              onClick={() => {
                // Scroll to features section or show demo
                const featuresSection = document.getElementById('features');
                if (featuresSection) {
                  featuresSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <Play className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
              {t('hero.ctaFeatures')}
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in">
            <div className="text-center group cursor-pointer hover:scale-105 transition-all duration-300">
              <div className="text-3xl font-bold text-primary mb-2 group-hover:text-primary-glow transition-colors duration-300 relative">
                10K+
                <div className="absolute -top-2 -right-2 w-3 h-3 bg-primary rounded-full animate-ping opacity-75" />
              </div>
              <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">{t('hero.stats.happyGuests')}</div>
            </div>
            <div className="text-center group cursor-pointer hover:scale-105 transition-all duration-300">
              <div className="text-3xl font-bold text-primary mb-2 group-hover:text-primary-glow transition-colors duration-300">
                98%
              </div>
              <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">{t('hero.stats.successRate')}</div>
            </div>
            <div className="text-center group cursor-pointer hover:scale-105 transition-all duration-300">
              <div className="text-3xl font-bold text-primary mb-2 group-hover:text-primary-glow transition-colors duration-300">
                5M+
              </div>
              <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">{t('hero.stats.recommendations')}</div>
            </div>
            <div className="text-center group cursor-pointer hover:scale-105 transition-all duration-300">
              <div className="text-3xl font-bold text-primary mb-2 group-hover:text-primary-glow transition-colors duration-300 relative">
                24/7
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-success rounded-full animate-pulse" />
              </div>
              <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">{t('hero.stats.aiAssistant')}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chatbot */}
      <Chatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
      
      {/* Registration Prompt */}
      <RegistrationPrompt isOpen={showRegistrationPrompt} onClose={closeRegistrationPrompt} />
    </section>
  );
};

export default Hero;