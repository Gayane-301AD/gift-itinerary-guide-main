import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const navigate = useNavigate();
  const { signIn, isLoading, user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const { error } = await signIn(formData.email, formData.password);
    
    if (error) {
      toast({
        title: "Error",
        description: error || "Failed to sign in",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success!",
        description: "Signed in successfully"
      });
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-r from-primary to-primary-glow">
              <Gift className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">{t('auth.signIn.title')}</CardTitle>
          <CardDescription>
            {t('auth.signIn.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">{t('auth.signIn.email')}</label>
              <Input 
                id="email" 
                type="email" 
                placeholder={t('auth.signIn.emailPlaceholder')}
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">{t('auth.signIn.password')}</label>
              <Input 
                id="password" 
                type="password" 
                placeholder={t('auth.signIn.passwordPlaceholder')}
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <Button className="w-full" variant="hero" type="submit" disabled={isLoading}>
              {isLoading ? "Signing In..." : t('auth.signIn.signInButton')}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link to="/signup" className="text-primary hover:underline">
              {t('auth.signIn.noAccount')} {t('auth.signIn.signUpLink')}
            </Link>
          </div>
          <div className="text-center mt-2">
            <Link to="/" className="text-muted-foreground hover:text-foreground text-sm">
              {t('auth.signIn.backToHome')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;