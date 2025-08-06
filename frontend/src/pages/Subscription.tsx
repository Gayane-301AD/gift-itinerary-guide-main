import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Crown, Gift, ArrowLeft, CreditCard, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import apiClient from "@/lib/api";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
  description: string;
}

const Subscription = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const plans: SubscriptionPlan[] = useMemo(() => [
    {
      id: "free",
      name: t('subscription.plans.free.name'),
      price: 0,
      description: t('subscription.plans.free.description'),
      features: Array.isArray(t('subscription.plans.free.features')) 
        ? t('subscription.plans.free.features') 
        : [
            "5 AI gift recommendations per day",
            "Basic calendar features", 
            "Store map access",
            "Email notifications",
            "Basic support"
          ]
    },
    {
      id: "pro",
      name: t('subscription.plans.pro.name'),
      price: 9.99,
      description: t('subscription.plans.pro.description'),
      features: Array.isArray(t('subscription.plans.pro.features'))
        ? t('subscription.plans.pro.features')
        : [
            "Unlimited AI gift recommendations",
            "Advanced calendar with Google sync",
            "Premium store map with directions", 
            "Priority notifications",
            "Gift tracking and favorites",
            "Exclusive gift suggestions",
            "Priority support",
            "Advanced analytics"
          ],
      popular: true
    }
  ], [t]);

  const currentPlan = user?.user_metadata?.subscription_tier || 'Free';

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const response = await apiClient.getSubscription();
      if (response.data) {
        setCurrentSubscription(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
    }
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handlePlanChange = async () => {
    if (!selectedPlan || selectedPlan === currentPlan.toLowerCase()) {
      toast({
        title: t('subscription.messages.noChange'),
        description: t('subscription.messages.alreadyOnPlan'),
        variant: "default"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.updateSubscription({
        subscription_tier: selectedPlan === "free" ? "Free" : "Pro"
      });

      if (response.error) {
        throw new Error(response.error);
      }

      const planName = selectedPlan === "free" ? t('subscription.plans.free.name') : t('subscription.plans.pro.name');
      toast({
        title: t('subscription.messages.subscriptionUpdated'),
        description: t('subscription.messages.switchSuccess').replace('{{planName}}', planName),
      });
      
      // Refresh the page or update user context
      window.location.reload();
    } catch (error) {
      console.error('Subscription update error:', error);
      toast({
        title: t('common.error'),
        description: t('subscription.messages.updateError'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isCurrentPlan = (planId: string) => {
    return planId.toLowerCase() === currentPlan.toLowerCase();
  };

  const getButtonText = (planId: string) => {
    if (isCurrentPlan(planId)) {
      return t('subscription.buttons.currentPlan');
    }
    if (planId === "free") {
      return t('subscription.buttons.downgradeToFree');
    }
    return t('subscription.buttons.upgradeToPro');
  };

  const getButtonVariant = (planId: string) => {
    if (isCurrentPlan(planId)) {
      return "secondary";
    }
    if (planId === "pro") {
      return "default";
    }
    return "outline";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t('subscription.title')}</h1>
            <p className="text-muted-foreground">{t('subscription.subtitle')}</p>
          </div>
        </div>

        <div className="grid gap-8">
          {/* Current Subscription Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {t('subscription.current.title')}
              </CardTitle>
              <CardDescription>{t('subscription.current.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-primary to-primary-glow">
                    {currentPlan.toLowerCase() === 'pro' ? (
                      <Crown className="h-6 w-6 text-primary-foreground" />
                    ) : (
                      <Gift className="h-6 w-6 text-primary-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold">{currentPlan} Plan</h3>
                      {currentPlan.toLowerCase() === 'pro' && (
                        <Badge variant="secondary">Active</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {currentPlan.toLowerCase() === 'pro' 
                        ? "Enjoying unlimited access to all features" 
                        : "Limited access with upgrade options available"
                      }
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    ${currentPlan.toLowerCase() === 'pro' ? '9.99' : '0.00'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {currentPlan.toLowerCase() === 'pro' ? 'per month' : 'forever'}
                  </div>
                </div>
              </div>

              {/* Usage Stats for Free Plan */}
              {currentPlan.toLowerCase() === 'free' && (
                <>
                  <Separator className="my-4" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {user?.daily_ai_queries_used || 0}/5
                      </div>
                      <div className="text-sm text-muted-foreground">AI Queries Today</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">Basic</div>
                      <div className="text-sm text-muted-foreground">Calendar Features</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">Standard</div>
                      <div className="text-sm text-muted-foreground">Map Access</div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Available Plans */}
          <Card>
            <CardHeader>
              <CardTitle>{t('subscription.plans.title')}</CardTitle>
              <CardDescription>{t('subscription.plans.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plans.map((plan) => (
                  <Card 
                    key={plan.id}
                    className={`relative cursor-pointer transition-all hover:shadow-lg ${
                      selectedPlan === plan.id ? 'ring-2 ring-primary' : ''
                    } ${isCurrentPlan(plan.id) ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => handlePlanSelect(plan.id)}
                  >
                    {plan.popular && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        Most Popular
                      </Badge>
                    )}
                    {isCurrentPlan(plan.id) && (
                      <Badge variant="secondary" className="absolute -top-3 right-4">
                        {t('subscription.buttons.currentPlan')}
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
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="text-3xl font-bold">
                        ${plan.price}
                        <span className="text-sm font-normal text-muted-foreground">
                          {plan.price === 0 ? "" : "/month"}
                        </span>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button
                        className="w-full"
                        variant={getButtonVariant(plan.id)}
                        disabled={isCurrentPlan(plan.id)}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isCurrentPlan(plan.id)) {
                            setSelectedPlan(plan.id);
                          }
                        }}
                      >
                        {getButtonText(plan.id)}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Change Plan Button */}
              {selectedPlan && !isCurrentPlan(selectedPlan) && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{t('subscription.changePrompt.title')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedPlan === "free" 
                          ? t('subscription.changePrompt.downgradeWarning')
                          : t('subscription.changePrompt.upgradeInfo')
                        }
                      </p>
                    </div>
                    <Button
                      onClick={handlePlanChange}
                      disabled={isLoading}
                      className="ml-4"
                    >
                      {isLoading ? t('subscription.buttons.processing') : t('subscription.buttons.confirmChange')}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Billing Information (for Pro users) */}
          {currentPlan.toLowerCase() === 'pro' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {t('subscription.billing.title')}
                </CardTitle>
                <CardDescription>{t('subscription.billing.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{t('subscription.billing.nextBilling')}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{t('subscription.billing.paymentMethod')}</span>
                    <span className="text-sm text-muted-foreground">•••• •••• •••• 4242</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{t('subscription.billing.amount')}</span>
                    <span className="text-sm font-semibold">$9.99/month</span>
                  </div>
                  <Separator />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      {t('subscription.billing.updatePayment')}
                    </Button>
                    <Button variant="outline" size="sm">
                      {t('subscription.billing.downloadInvoice')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Subscription;