import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Gift, Menu, X, User, Globe } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import NotificationDropdown from "./NotificationDropdown";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const {
    user,
    signOut
  } = useAuth();
  const handleLogout = async () => {
    await signOut();
    setIsMenuOpen(false);
  };
  
  const languages = {
    'Armenian': '🇦🇲',
    'English': '🇺🇸', 
    'Russian': '🇷🇺'
  };
  
  const handleLanguageChange = (selectedLanguage: 'Armenian' | 'English' | 'Russian') => {
    setLanguage(selectedLanguage);
  };
  return <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-primary-glow">
              <Gift className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">WhatToCarry</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors scroll-smooth">
              {t('navigation.features')}
            </a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors scroll-smooth">
              {t('navigation.howItWorks')}
            </a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors scroll-smooth">
              {t('navigation.about')}
            </a>
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
            <NotificationDropdown />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" title="Change Language">
                  <span className="text-lg">{languages[language as keyof typeof languages]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background border border-border z-50">
                <div className="px-3 py-2 text-sm font-medium text-muted-foreground border-b border-border flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {t('navigation.selectLanguage')}
                </div>
                <DropdownMenuItem onClick={() => handleLanguageChange('Armenian')}>
                  🇦🇲 {t('navigation.armenian')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange('English')}>
                  🇺🇸 {t('navigation.english')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange('Russian')}>
                  🇷🇺 {t('navigation.russian')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {user ? <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="flex flex-col items-start">
                    <span className="font-medium">{user.user_metadata?.full_name || user.email?.split('@')[0]}</span>
                    <span className="text-sm text-muted-foreground">{user.email}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    {t('navigation.signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> : <>
                <Button variant="ghost" asChild>
                  <Link to="/signin">{t('navigation.signIn')}</Link>
                </Button>
                <Button variant="hero" asChild>
                  <Link to="/signup">{t('navigation.signUp')}</Link>
                </Button>
              </>}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <NotificationDropdown />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" title="Change Language">
                  <span className="text-lg">{languages[language as keyof typeof languages]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background border border-border z-50">
                <div className="px-3 py-2 text-sm font-medium text-muted-foreground border-b border-border flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {t('navigation.selectLanguage')}
                </div>
                <DropdownMenuItem onClick={() => handleLanguageChange('Armenian')}>
                  🇦🇲 {t('navigation.armenian')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange('English')}>
                  🇺🇸 {t('navigation.english')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange('Russian')}>
                  🇷🇺 {t('navigation.russian')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors scroll-smooth" onClick={() => setIsMenuOpen(false)}>
                {t('navigation.features')}
              </a>
              <a href="#how-it-works" className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors scroll-smooth" onClick={() => setIsMenuOpen(false)}>
                {t('navigation.howItWorks')}
              </a>
              <a href="#about" className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors scroll-smooth" onClick={() => setIsMenuOpen(false)}>
                {t('navigation.about')}
              </a>
              <div className="pt-4 pb-2 space-y-2">
                {user ? <>
                    <div className="px-3 py-2 text-sm">
                      <div className="font-medium">{user.user_metadata?.full_name || user.email?.split('@')[0]}</div>
                      <div className="text-muted-foreground">{user.email}</div>
                    </div>
                    <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                      {t('navigation.signOut')}
                    </Button>
                  </> : <>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link to="/signin" onClick={() => setIsMenuOpen(false)}>{t('navigation.signIn')}</Link>
                    </Button>
                    <Button variant="hero" className="w-full" asChild>
                      <Link to="/signup" onClick={() => setIsMenuOpen(false)}>{t('navigation.signUp')}</Link>
                    </Button>
                  </>}
              </div>
            </div>
          </div>}
      </div>
    </nav>;
};
export default Navigation;