import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { Camera, Save, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/lib/api";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    username: user?.user_metadata?.username || "",
    fullName: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    phone: user?.user_metadata?.phone || "",
    date_of_birth: user?.user_metadata?.date_of_birth || "",
    gender: user?.user_metadata?.gender || "",
    avatar_url: user?.user_metadata?.avatar_url || ""
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Helper function to construct full avatar URL
  const getAvatarUrl = (avatarPath: string) => {
    if (!avatarPath) return "";
    if (avatarPath.startsWith('http')) return avatarPath;
    if (avatarPath.startsWith('/uploads')) {
      return `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}${avatarPath}`;
    }
    return avatarPath;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.id]: e.target.value
    });
  };

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      gender: value
    });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      
      try {
        // Upload the file to the backend
        const response = await apiClient.uploadAvatar(file);
        
        if (response.error) {
          toast({
            title: t('profile.messages.avatarUploadError'),
            description: response.error,
            variant: "destructive"
          });
          return;
        }

        // Update the form data with the new avatar URL
        setFormData({
          ...formData,
          avatar_url: response.data?.avatar_url || ""
        });

        toast({
          title: t('profile.messages.avatarUploadSuccess'),
          description: t('profile.messages.avatarUploadSuccess')
        });
      } catch (error) {
        toast({
          title: t('profile.messages.avatarUploadError'),
          description: t('profile.messages.avatarUploadError'),
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await apiClient.updateProfile(formData);
      
      toast({
        title: t('profile.messages.profileUpdateSuccess'),
        description: t('profile.messages.profileUpdateSuccess')
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('profile.messages.profileUpdateError'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: t('common.error'),
        description: t('profile.messages.passwordMismatch'),
        variant: "destructive"
      });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast({
        title: t('common.error'),
        description: t('profile.messages.passwordTooShort'),
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await apiClient.updatePassword(passwordData.currentPassword, passwordData.newPassword);
      
      toast({
        title: t('profile.messages.passwordUpdateSuccess'),
        description: t('profile.messages.passwordUpdateSuccess')
      });
      
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('profile.messages.passwordUpdateError'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t('profile.title')}</h1>
            <p className="text-muted-foreground">{t('profile.subtitle')}</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Profile Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.information.title')}</CardTitle>
              <CardDescription>{t('profile.information.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={getAvatarUrl(formData.avatar_url)} alt={formData.fullName} />
                      <AvatarFallback className="text-lg">
                        {formData.fullName?.charAt(0).toUpperCase() || formData.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                      onClick={handleAvatarClick}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{formData.fullName || "User"}</h3>
                    <p className="text-sm text-muted-foreground">{formData.email}</p>
                    <Badge variant="secondary" className="mt-2">
                      {user.user_metadata?.subscription_tier || 'Free'} Plan
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">{t('profile.fields.username')}</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder={t('profile.placeholders.username')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t('profile.fields.fullName')}</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder={t('profile.placeholders.fullName')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('profile.fields.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={t('profile.placeholders.email')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('profile.fields.phone')}</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder={t('profile.placeholders.phone')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">{t('profile.fields.dateOfBirth')}</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">{t('profile.fields.gender')}</Label>
                    <Select value={formData.gender} onValueChange={handleSelectChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('profile.fields.gender')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">{t('profile.genderOptions.male')}</SelectItem>
                        <SelectItem value="female">{t('profile.genderOptions.female')}</SelectItem>
                        <SelectItem value="other">{t('profile.genderOptions.other')}</SelectItem>
                        <SelectItem value="prefer-not-to-say">{t('profile.genderOptions.preferNotToSay')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? t('profile.buttons.saving') : t('profile.buttons.saveChanges')}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Change Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.password.title')}</CardTitle>
              <CardDescription>{t('profile.password.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">{t('profile.fields.currentPassword')}</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder={t('profile.placeholders.currentPassword')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">{t('profile.fields.newPassword')}</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder={t('profile.placeholders.newPassword')}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t('profile.fields.confirmPassword')}</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder={t('profile.placeholders.confirmPassword')}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} variant="outline" className="w-full md:w-auto">
                  {isLoading ? t('profile.buttons.updating') : t('profile.buttons.updatePassword')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;