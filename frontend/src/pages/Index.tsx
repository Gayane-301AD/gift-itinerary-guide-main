import { useState } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import About from "@/components/About";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import MapSelection from "@/components/MapSelection";
import RegistrationPrompt from "@/components/RegistrationPrompt";
import { useAuthGuard } from "@/hooks/useAuthGuard";

const Index = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isMapSelectionOpen, setIsMapSelectionOpen] = useState(false);
  const { requireAuth, showRegistrationPrompt, closeRegistrationPrompt } = useAuthGuard();

  const handleChatbotOpen = () => requireAuth(() => setIsChatbotOpen(true));
  const handleMapOpen = () => requireAuth(() => setIsMapSelectionOpen(true));

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <Features onChatbotOpen={handleChatbotOpen} onMapOpen={handleMapOpen} />
      <HowItWorks onChatbotOpen={handleChatbotOpen} onMapOpen={handleMapOpen} />
      <About />
      <Footer />
      
      {/* Modals */}
      <Chatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
      <MapSelection isOpen={isMapSelectionOpen} onClose={() => setIsMapSelectionOpen(false)} />
      <RegistrationPrompt isOpen={showRegistrationPrompt} onClose={closeRegistrationPrompt} />
    </div>
  );
};

export default Index;
