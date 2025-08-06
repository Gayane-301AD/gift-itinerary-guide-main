import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Gift, Menu, X, User, Globe, CreditCard, UserCircle } from "lucide-react";
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
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name || user.email} />
                      <AvatarFallback>
                        {(user.user_metadata?.full_name || user.email)?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  {/* User Info Header */}
                  <div className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name || user.email} />
                        <AvatarFallback>
                          {(user.user_metadata?.full_name || user.email)?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {user.user_metadata?.full_name || user.email?.split('@')[0]}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                        {user.user_metadata?.username && (
                          <p className="text-xs text-muted-foreground truncate">
                            @{user.user_metadata.username}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {user.user_metadata?.subscription_tier || 'Free'} Plan
                      </Badge>
                    </div>
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  {/* User Details */}
                  <div className="px-3 py-2 space-y-1">
                    {user.user_metadata?.phone && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span className="w-12 shrink-0">Phone:</span>
                        <span>{user.user_metadata.phone}</span>
                      </div>
                    )}
                    {user.user_metadata?.date_of_birth && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span className="w-12 shrink-0">Born:</span>
                        <span>{new Date(user.user_metadata.date_of_birth).toLocaleDateString()}</span>
                      </div>
                    )}
                    {user.user_metadata?.gender && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span className="w-12 shrink-0">Gender:</span>
                        <span>{user.user_metadata.gender}</span>
                      </div>
                    )}
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Menu Items */}
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Profile Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/subscription" className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Subscription</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
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
                    <div className="px-3 py-3 bg-muted/30 rounded-lg mx-2">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name || user.email} />
                          <AvatarFallback>
                            {(user.user_metadata?.full_name || user.email)?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {user.user_metadata?.full_name || user.email?.split('@')[0]}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </div>
                          {user.user_metadata?.username && (
                            <div className="text-xs text-muted-foreground truncate">
                              @{user.user_metadata.username}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {user.user_metadata?.subscription_tier || 'Free'} Plan
                      </Badge>
                    </div>
                    
                    <Button variant="ghost" className="w-full justify-start text-left" asChild>
                      <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                        <UserCircle className="mr-2 h-4 w-4" />
                        Profile Settings
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link to="/subscription" onClick={() => setIsMenuOpen(false)}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Subscription
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-600" onClick={handleLogout}>
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