import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserPlus, LogIn, X } from 'lucide-react';

interface RegistrationPromptProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegistrationPrompt: React.FC<RegistrationPromptProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const navigate = useNavigate();

  const handleSignUp = () => {
    onClose();
    navigate('/signup');
  };

  const handleSignIn = () => {
    onClose();
    navigate('/signin');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center">
            <UserPlus className="w-5 h-5 text-primary" />
            Registration Required
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            You need to register or sign in to access this feature. Join WhatToCarry to get personalized gift recommendations and discover nearby stores!
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 pt-4">
          <Button 
            onClick={handleSignUp}
            className="w-full flex items-center gap-2"
            size="lg"
          >
            <UserPlus className="w-4 h-4" />
            Create Account
          </Button>
          
          <Button 
            onClick={handleSignIn}
            variant="outline"
            className="w-full flex items-center gap-2"
            size="lg"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Button>
          
          <Button 
            onClick={onClose}
            variant="ghost"
            className="w-full flex items-center gap-2 mt-2"
            size="sm"
          >
            <X className="w-4 h-4" />
            Continue Browsing
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground text-center pt-2">
          Free account includes 5 daily AI recommendations and basic features
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationPrompt; 