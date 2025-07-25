import express from 'express';
import { authenticateJWT } from './auth.js';
import fetch from 'node-fetch';

const router = express.Router();

// Get Google Maps API key
router.get('/token', authenticateJWT, (req, res) => {
  res.json({ 
    token: process.env.GOOGLE_MAPS_API_KEY,
    apiKey: process.env.GOOGLE_MAPS_API_KEY 
  });
});

// Get nearby stores using Google Places API
router.get('/nearby', authenticateJWT, async (req, res) => {
  try {
    const { latitude, longitude, radius = 5000, type = 'store' } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${data.status}`);
    }
    
    res.json({ 
      places: data.results || [],
      status: data.status
    });
  } catch (err) {
    console.error('Get nearby places error:', err);
    res.status(500).json({ error: 'Failed to get nearby places' });
  }
});

// Search for places
router.get('/search', authenticateJWT, async (req, res) => {
  try {
    const { query, latitude, longitude, radius = 5000 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    
    if (latitude && longitude) {
      url += `&location=${latitude},${longitude}&radius=${radius}`;
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${data.status}`);
    }
    
    res.json({ 
      places: data.results || [],
      status: data.status
    });
  } catch (err) {
    console.error('Search places error:', err);
    res.status(500).json({ error: 'Failed to search places' });
  }
});

// Get place details
router.get('/place/:placeId', authenticateJWT, async (req, res) => {
  try {
    const { placeId } = req.params;
    
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,formatted_phone_number,website,rating,opening_hours,photos,reviews&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Google Places API error: ${data.status}`);
    }
    
    res.json({ place: data.result });
  } catch (err) {
    console.error('Get place details error:', err);
    res.status(500).json({ error: 'Failed to get place details' });
  }
});

// Get directions between two points
router.get('/directions', authenticateJWT, async (req, res) => {
  try {
    const { origin, destination, mode = 'driving' } = req.query;
    
    if (!origin || !destination) {
      return res.status(400).json({ error: 'Origin and destination are required' });
    }
    
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${mode}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Google Directions API error: ${data.status}`);
    }
    
    res.json({ 
      routes: data.routes,
      status: data.status
    });
  } catch (err) {
    console.error('Get directions error:', err);
    res.status(500).json({ error: 'Failed to get directions' });
  }
});

// Geocode an address
router.get('/geocode', authenticateJWT, async (req, res) => {
  try {
    const { address } = req.query;
    
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }
    
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Google Geocoding API error: ${data.status}`);
    }
    
    res.json({ 
      results: data.results,
      status: data.status
    });
  } catch (err) {
    console.error('Geocode error:', err);
    res.status(500).json({ error: 'Failed to geocode address' });
  }
});

// Reverse geocode coordinates
router.get('/reverse-geocode', authenticateJWT, async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Google Geocoding API error: ${data.status}`);
    }
    
    res.json({ 
      results: data.results,
      status: data.status
    });
  } catch (err) {
    console.error('Reverse geocode error:', err);
    res.status(500).json({ error: 'Failed to reverse geocode coordinates' });
  }
});

// Get store types for filtering
router.get('/store-types', (req, res) => {
  const storeTypes = [
    'gift_shop',
    'jewelry_store',
    'book_store',
    'toy_store',
    'clothing_store',
    'department_store',
    'shopping_mall',
    'florist',
    'bakery',
    'cafe',
    'restaurant',
    'store'
  ];
  
  res.json({ storeTypes });
});

// Get user's current location (if available)
router.get('/location', authenticateJWT, (req, res) => {
  // This would typically be handled by the frontend using browser geolocation
  // This endpoint can be used to store/retrieve user's last known location
  res.json({ 
    message: 'Location should be obtained from frontend geolocation API',
    note: 'Use browser navigator.geolocation.getCurrentPosition()'
  });
});

export default router; 