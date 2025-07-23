import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, ExternalLink } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface MapSelectionProps {
  isOpen: boolean;
  onClose: () => void;
}

const MapSelection: React.FC<MapSelectionProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  const handleGoogleMaps = () => {
    // Open Google Maps with a general search for gift shops
    const googleMapsUrl = 'https://www.google.com/maps/search/gift+shops+near+me';
    window.open(googleMapsUrl, '_blank');
    onClose();
  };

  const handleYandexMaps = () => {
    // Open Yandex Maps with a general search for gift shops
    const yandexMapsUrl = 'https://yandex.com/maps/?text=gift%20shops%20near%20me';
    window.open(yandexMapsUrl, '_blank');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md sm:max-w-lg max-h-[90vh] p-6 overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {t('mapSelection.title')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-muted-foreground text-sm">
            {t('mapSelection.description')}
          </p>
          
          <div className="grid gap-3">
            <Card className="transition-all hover:shadow-md border-2 hover:border-primary/20">
              <CardContent className="p-4">
                <Button
                  onClick={handleGoogleMaps}
                  variant="ghost"
                  className="w-full justify-between h-auto p-0 hover:bg-transparent"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-lg">G</span>
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium">{t('mapSelection.googleMaps')}</h3>
                      <p className="text-sm text-muted-foreground">{t('mapSelection.googleDescription')}</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </Button>
              </CardContent>
            </Card>

            <Card className="transition-all hover:shadow-md border-2 hover:border-primary/20">
              <CardContent className="p-4">
                <Button
                  onClick={handleYandexMaps}
                  variant="ghost"
                  className="w-full justify-between h-auto p-0 hover:bg-transparent"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                      <span className="text-red-600 font-semibold text-lg">Y</span>
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium">{t('mapSelection.yandexMaps')}</h3>
                      <p className="text-sm text-muted-foreground">{t('mapSelection.yandexDescription')}</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MapSelection;