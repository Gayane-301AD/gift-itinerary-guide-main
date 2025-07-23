import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const SubscriptionSelect = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handlePlanSelection = async (plan: 'Free' | 'Pro') => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please sign in to continue",
        variant: "destructive"
      });
      navigate("/signin");
      return;
    }

    setIsLoading(true);

    try {
      // Create or update subscriber record
      const { error } = await supabase
        .from('subscribers')
        .upsert({
          user_id: user.id,
          email: user.email,
          subscription_tier: plan,
          subscribed: plan === 'Pro',
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'email' 
        });

      if (error) throw error;

      if (plan === 'Free') {
        toast({
          title: "Welcome to WhatToCarry!",
          description: "You're all set with the Free plan"
        });
        navigate("/");
      } else {
        // For Pro plan, we'll need Stripe integration later
        toast({
          title: "Pro Plan Selected",
          description: "Redirecting to payment...",
        });
        // TODO: Implement Stripe checkout
        navigate("/");
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Error",
        description: "Failed to update subscription. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
          <p className="text-muted-foreground">
            Select the plan that best fits your travel needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-r from-secondary to-secondary/80">
                  <Star className="h-8 w-8 text-secondary-foreground" />
                </div>
              </div>
              <CardTitle className="text-2xl">Free</CardTitle>
              <CardDescription>Perfect for occasional travelers</CardDescription>
              <div className="text-3xl font-bold mt-4">$0<span className="text-sm font-normal">/month</span></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Basic packing lists</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Weather-based suggestions</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Up to 3 saved trips</span>
                </div>
              </div>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => handlePlanSelection('Free')}
                disabled={isLoading}
              >
                Start with Free
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-2 border-primary">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                Recommended
              </div>
            </div>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-r from-primary to-primary-glow">
                  <Crown className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <CardTitle className="text-2xl">Pro</CardTitle>
              <CardDescription>For frequent travelers and professionals</CardDescription>
              <div className="text-3xl font-bold mt-4">$9.99<span className="text-sm font-normal">/month</span></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Everything in Free</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>AI-powered recommendations</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Unlimited saved trips</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Collaboration features</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Priority support</span>
                </div>
              </div>
              <Button 
                className="w-full" 
                variant="hero"
                onClick={() => handlePlanSelection('Pro')}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Upgrade to Pro"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Link to="/" className="text-muted-foreground hover:text-foreground text-sm">
            ← Skip for now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSelect;