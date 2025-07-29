import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gift } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    password: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, isLoading, isAuthenticated } = useAuth();
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

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      gender: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.fullName || !formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const { error } = await signUp(
      formData.email, 
      formData.password, 
      formData.username, 
      formData.fullName,
      formData.phone,
      formData.date_of_birth,
      formData.gender
    );
    
    if (error) {
      toast({
        title: "Error",
        description: error || "Failed to create account",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success!",
        description: "Account created successfully. You can now sign in.",
      });
      navigate("/signin");
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
              <label htmlFor="username" className="text-sm font-medium">Username *</label>
              <Input 
                id="username" 
                type="text" 
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium">Full Name *</label>
              <Input 
                id="fullName" 
                type="text" 
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">{t('auth.signUp.email')} *</label>
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
              <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="Enter your phone number (optional)"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="date_of_birth" className="text-sm font-medium">Date of Birth</label>
              <Input 
                id="date_of_birth" 
                type="date" 
                value={formData.date_of_birth}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="gender" className="text-sm font-medium">Gender</label>
              <Select value={formData.gender} onValueChange={handleSelectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your gender (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">{t('auth.signUp.password')} *</label>
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