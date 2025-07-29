import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
}

const SubscriptionSelect = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const plans: SubscriptionPlan[] = [
    {
      id: "free",
      name: "Free",
      price: 0,
      features: [
        "5 AI gift recommendations per day",
        "Basic calendar features",
        "Store map access",
        "Email notifications"
      ]
    },
    {
      id: "pro",
      name: "Pro",
      price: 9.99,
      features: [
        "Unlimited AI gift recommendations",
        "Advanced calendar with Google sync",
        "Premium store map with directions",
        "Priority notifications",
        "Gift tracking and favorites",
        "Exclusive gift suggestions"
      ],
      popular: true
    }
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan || !user) return;

    setIsLoading(true);
    try {
      if (selectedPlan === "free") {
        // For free plan, just redirect to dashboard
        toast({
          title: "Welcome to WhatToCarry!",
          description: "You're all set with the free plan. Start exploring!",
        });
        navigate("/");
      } else {
        // For pro plan, you would integrate with Stripe here
        // For now, we'll simulate the subscription
        const response = await apiClient.updateSubscription({
          subscription_tier: "Pro",
          subscribed: true
        });

        if (response.error) {
          throw new Error(response.error);
        }

        toast({
          title: "Welcome to Pro!",
          description: "You now have access to all premium features.",
        });
        navigate("/");
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Error",
        description: "Failed to update subscription. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-r from-primary to-primary-glow">
              <Crown className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
          <p className="text-muted-foreground">
            Select the plan that best fits your gift-giving needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative cursor-pointer transition-all hover:shadow-lg ${
                selectedPlan === plan.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handlePlanSelect(plan.id)}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {plan.id === "pro" ? (
                    <Crown className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Gift className="h-5 w-5" />
                  )}
                  {plan.name}
                </CardTitle>
                <CardDescription>
                  {plan.id === "free" ? "Perfect for getting started" : "Best for serious gift-givers"}
                </CardDescription>
                <div className="text-3xl font-bold">
                  ${plan.price}
                  <span className="text-sm font-normal text-muted-foreground">
                    {plan.price === 0 ? "" : "/month"}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isLoading}
            className="flex-1 sm:flex-none"
          >
            Skip for Now
          </Button>
          <Button
            onClick={handleSubscribe}
            disabled={!selectedPlan || isLoading}
            className="flex-1 sm:flex-none"
          >
            {isLoading ? "Processing..." : selectedPlan === "free" ? "Get Started" : "Subscribe to Pro"}
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          You can upgrade or downgrade your plan at any time in your account settings.
        </p>
      </div>
    </div>
  );
};

export default SubscriptionSelect;