import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, isLoading, user } = useAuth();
  const { t } = useTranslation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const { error } = await signUp(formData.email, formData.password, formData.name);
    
    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success!",
        description: "Account created successfully. Please check your email to verify your account.",
      });
      navigate("/subscription-select");
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
          <CardTitle className="text-2xl">{t('auth.signUp.title')}</CardTitle>
          <CardDescription>
            {t('auth.signUp.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">{t('auth.signUp.name')}</label>
              <Input 
                id="name" 
                type="text" 
                placeholder={t('auth.signUp.namePlaceholder')}
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">{t('auth.signUp.email')}</label>
              <Input 
                id="email" 
                type="email" 
                placeholder={t('auth.signUp.emailPlaceholder')}
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">{t('auth.signUp.password')}</label>
              <Input 
                id="password" 
                type="password" 
                placeholder={t('auth.signUp.passwordPlaceholder')}
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <Button className="w-full" variant="hero" type="submit" disabled={isLoading}>
              {isLoading ? "Creating Account..." : t('auth.signUp.signUpButton')}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link to="/signin" className="text-primary hover:underline">
              {t('auth.signUp.hasAccount')} {t('auth.signUp.signInLink')}
            </Link>
          </div>
          <div className="text-center mt-2">
            <Link to="/" className="text-muted-foreground hover:text-foreground text-sm">
              {t('auth.signUp.backToHome')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;