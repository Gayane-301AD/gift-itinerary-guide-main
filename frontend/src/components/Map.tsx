import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Star, Navigation, Phone, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MapProps {
  isOpen: boolean;
  onClose: () => void;
}

const Map = ({ isOpen, onClose }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isTokenSet, setIsTokenSet] = useState(false);

  // Sample gift shops data
  const giftShops = [
    {
      id: 1,
      name: "Artisan Gifts & More",
      address: "123 Main Street",
      rating: 4.8,
      phone: "(555) 123-4567",
      hours: "9 AM - 8 PM",
      coordinates: [-74.006, 40.7128] as [number, number]
    },
    {
      id: 2,
      name: "The Gift Gallery",
      address: "456 Oak Avenue", 
      rating: 4.6,
      phone: "(555) 234-5678",
      hours: "10 AM - 7 PM",
      coordinates: [-74.0065, 40.7130] as [number, number]
    },
    {
      id: 3,
      name: "Creative Corner",
      address: "789 Pine Road",
      rating: 4.9,
      phone: "(555) 345-6789", 
      hours: "8 AM - 9 PM",
      coordinates: [-74.0055, 40.7125] as [number, number]
    }
  ];

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      setIsTokenSet(true);
      initializeMap();
    }
  };

  // Try to get token from Supabase secrets first
  useEffect(() => {
    const checkForToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (data?.token) {
          setMapboxToken(data.token);
          setIsTokenSet(true);
        }
      } catch (error) {
        // Token not available in secrets, user needs to input manually
        console.log('Mapbox token not found in secrets, requiring manual input');
      }
    };
    
    if (isOpen) {
      checkForToken();
    }
  }, [isOpen]);

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    // Set Mapbox access token
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-74.006, 40.7128], // NYC coordinates
      zoom: 14
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Add geolocate control
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      }),
      'top-right'
    );

    // Add markers for gift shops
    giftShops.forEach((shop) => {
      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg cursor-pointer transform hover:scale-110 transition-transform';
      markerElement.innerHTML = '<svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path></svg>';

      // Create popup content
      const popupContent = `
        <div class="p-4 min-w-64">
          <h3 class="font-bold text-lg mb-2">${shop.name}</h3>
          <div class="space-y-2 text-sm">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
              </svg>
              <span>${shop.address}</span>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              <span>${shop.rating} stars</span>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
              </svg>
              <span>${shop.hours}</span>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
              </svg>
              <span>${shop.phone}</span>
            </div>
          </div>
          <button onclick="this.closest('.mapboxgl-popup').remove()" class="mt-3 w-full bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary/90 transition-colors">
            Get Directions
          </button>
        </div>
      `;

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false
      }).setHTML(popupContent);

      // Create marker and add to map
      new mapboxgl.Marker(markerElement)
        .setLngLat(shop.coordinates)
        .setPopup(popup)
        .addTo(map.current!);
    });
  };

  useEffect(() => {
    if (isOpen && isTokenSet && mapboxToken) {
      initializeMap();
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isOpen, isTokenSet, mapboxToken]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span>Interactive Store Map</span>
          </DialogTitle>
        </DialogHeader>

        {!isTokenSet ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <Card className="w-full max-w-md">
              <CardContent className="p-6 space-y-4">
                <div className="text-center space-y-2">
                  <MapPin className="h-12 w-12 text-primary mx-auto" />
                  <h3 className="text-lg font-semibold">Setup Mapbox Token</h3>
                  <p className="text-sm text-muted-foreground">
                    Please enter your Mapbox public token to enable the interactive map
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Input
                    type="password"
                    placeholder="Enter Mapbox public token..."
                    value={mapboxToken}
                    onChange={(e) => setMapboxToken(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleTokenSubmit()}
                  />
                  <Button 
                    onClick={handleTokenSubmit} 
                    className="w-full"
                    disabled={!mapboxToken.trim()}
                  >
                    Initialize Map
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Get your token at{' '}
                    <a 
                      href="https://mapbox.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      mapbox.com
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex-1 flex">
            {/* Sidebar with shop list */}
            <div className="w-80 border-r bg-background/50 p-4 overflow-y-auto">
              <h3 className="font-semibold text-lg mb-4">Nearby Gift Shops</h3>
              <div className="space-y-3">
                {giftShops.map((shop) => (
                  <Card key={shop.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">{shop.name}</h4>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{shop.address}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span>{shop.rating}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{shop.hours}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Map container */}
            <div className="flex-1 relative">
              <div ref={mapContainer} className="absolute inset-0" />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Map;