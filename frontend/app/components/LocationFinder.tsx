'use client';

import { useState } from 'react';
import { MapPin, Navigation, ExternalLink, Loader2 } from 'lucide-react';

interface Location {
  name: string;
  type: 'hospital' | 'pharmacy';
  distance?: string;
  address: string;
  phone?: string;
}

export default function LocationFinder() {
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const findNearby = () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        
        // Open Google Maps with nearby hospitals/pharmacies search
        const query = 'hospitals+emergency+pharmacies';
        window.open(
          `https://www.google.com/maps/search/${query}/@${latitude},${longitude},14z`,
          '_blank'
        );
        
        setLoading(false);
      },
      (err) => {
        setError('Unable to get your location. Please enable location services.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <MapPin className="w-6 h-6 text-blue-400" />
        <h3 className="text-xl font-semibold text-black">Find Nearby Help</h3>
      </div>
      
      <p className="text-zinc-400 text-sm mb-4">
        Privacy-preserving: Location is only used to open maps, never stored or transmitted to our servers.
      </p>

      <button
        onClick={findNearby}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-black py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Getting Location...
          </>
        ) : (
          <>
            <Navigation className="w-5 h-5" />
            Find Hospitals & Pharmacies
          </>
        )}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg">
        <p className="text-zinc-400 text-xs">
          <strong className="text-zinc-300">Note:</strong> This opens Google Maps with your location. 
          No data is collected by Lumora.
        </p>
      </div>
    </div>
  );
}
