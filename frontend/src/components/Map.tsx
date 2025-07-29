import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Phone, Globe, Clock, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/api";

interface Store {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  rating?: number;
  hours?: string;
  category?: string;
}

const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchStores();
      getUserLocation();
    }
  }, [user]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          initializeMap(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to a central location if geolocation fails
          initializeMap(40.7128, -74.0060); // New York coordinates
        }
      );
    } else {
      console.error('Geolocation is not supported');
      initializeMap(40.7128, -74.0060);
    }
  };

  const initializeMap = (lat: number, lng: number) => {
    if (!mapContainer.current) return;

    // Initialize map (you'll need to add your map library here)
    // For now, we'll create a simple placeholder
    mapContainer.current.innerHTML = `
      <div style="width: 100%; height: 400px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
        <div style="text-align: center;">
          <MapPin style="font-size: 48px; color: #666; margin-bottom: 16px;" />
          <p style="color: #666;">Map will be initialized here</p>
          <p style="color: #999; font-size: 14px;">Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}</p>
        </div>
      </div>
    `;
  };

  const fetchStores = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getStores();
      if (response.data) {
        setStores(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStoreSelect = (store: Store) => {
    setSelectedStore(store);
  };

  const handleNavigate = (store: Store) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${store.latitude},${store.longitude}`;
      window.open(url, '_blank');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please sign in to view the store map.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Store Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={mapContainer} className="w-full h-96 rounded-lg overflow-hidden" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading stores...</p>
          </div>
        ) : stores.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No stores found nearby</p>
          </div>
        ) : (
          stores.map((store) => (
            <Card 
              key={store.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedStore?.id === store.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleStoreSelect(store)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm">{store.name}</h3>
                  {store.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">{store.rating}</span>
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground mb-3">{store.address}</p>
                
                {store.category && (
                  <Badge variant="secondary" className="text-xs mb-3">
                    {store.category}
                  </Badge>
                )}
                
                <div className="space-y-1 text-xs text-muted-foreground">
                  {store.hours && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{store.hours}</span>
                    </div>
                  )}
                  
                  {store.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{store.phone}</span>
                    </div>
                  )}
                  
                  {store.website && (
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      <a 
                        href={store.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Website
                      </a>
                    </div>
                  )}
                </div>
                
                <Button 
                  size="sm" 
                  className="w-full mt-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigate(store);
                  }}
                >
                  <Navigation className="h-3 w-3 mr-1" />
                  Navigate
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Map;