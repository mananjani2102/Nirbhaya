import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Search,
  Shield,
  Phone,
  Navigation,
  Filter,
  Star,
  Hospital,
  ShieldAlert,
  Info,
  Loader2
} from 'lucide-react';
import CustomMapContainer from '../components/Map/MapContainer';

const DEFAULT_POIS = [
  { id: 1, name: 'Connaught Place Police Station', type: 'Police', distance: '1.2 km', status: 'Open 24/7', rating: 4.8, lat: 28.6327, lon: 77.2197 },
  { id: 2, name: 'Ram Manohar Lohia Hospital', type: 'Hospital', distance: '2.5 km', status: 'Emergency Active', rating: 4.5, lat: 28.6344, lon: 77.1997 },
  { id: 3, name: 'Select CityWalk Mall (Safe Zone)', type: 'Safe Zone', distance: '8.0 km', status: 'High Traffic', rating: 4.9, lat: 28.5279, lon: 77.2193 },
  { id: 4, name: 'Karol Bagh Police Station', type: 'Police', distance: '4.1 km', status: 'Open 24/7', rating: 4.2, lat: 28.6508, lon: 77.1904 },
  { id: 5, name: 'Fortis Hospital Vasant Kunj', type: 'Hospital', distance: '12.4 km', status: 'Emergency Active', rating: 4.6, lat: 28.5198, lon: 77.1576 },
];

const FILTERS = [
  { label: 'All', icon: Shield },
  { label: 'Police', icon: ShieldAlert },
  { label: 'Hospital', icon: Hospital },
  { label: 'Safe Zone', icon: Star }
];

export default function MapPage() {
  const [location, setLocation] = useState([28.6139, 77.2090]); // Delhi default
  const [pois, setPois] = useState(DEFAULT_POIS);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingGeo, setIsLoadingGeo] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);

  const locateUser = () => {
    setIsLoadingGeo(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setLocation([lat, lon]);
          
          try {
            // Fetch real POIs from Overpass API (OpenStreetMap) within 5km radius
            const query = `
              [out:json][timeout:15];
              (
                node["amenity"="police"](around:5000, ${lat}, ${lon});
                way["amenity"="police"](around:5000, ${lat}, ${lon});
                node["amenity"="hospital"](around:5000, ${lat}, ${lon});
                way["amenity"="hospital"](around:5000, ${lat}, ${lon});
                node["shop"="mall"](around:5000, ${lat}, ${lon});
                way["shop"="mall"](around:5000, ${lat}, ${lon});
                node["public_transport"="station"](around:5000, ${lat}, ${lon});
              );
              out center;
            `;
            const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.elements && data.elements.length > 0) {
              const realPois = data.elements.map((el, index) => {
                  const isPolice = el.tags?.amenity === 'police';
                  const isHospital = el.tags?.amenity === 'hospital';
                  
                  let type = 'Safe Zone';
                  if (isPolice) type = 'Police';
                  if (isHospital) type = 'Hospital';

                  const latPos = el.lat || el.center?.lat;
                  const lonPos = el.lon || el.center?.lon;
                  
                  let name = el.tags?.name;
                  if (!name) {
                      if (isPolice) name = 'Local Police Station';
                      else if (isHospital) name = 'Local Hospital';
                      else name = 'Public Safe Zone';
                  }
                  
                  // Calculate rough distance
                  const R = 6371; // km
                  const dLat = (latPos - lat) * Math.PI / 180;
                  const dLon = (lonPos - lon) * Math.PI / 180;
                  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                            Math.cos(lat * Math.PI / 180) * Math.cos(latPos * Math.PI / 180) *
                            Math.sin(dLon/2) * Math.sin(dLon/2);
                  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                  const d = R * c;
                  
                  return {
                      id: el.id || index,
                      name: name,
                      type: type,
                      distance: d.toFixed(1) + ' km',
                      status: 'Real Location',
                      rating: (Math.random() * (5 - 3.8) + 3.8).toFixed(1), // Mock rating for UI
                      lat: latPos,
                      lon: lonPos,
                      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${latPos},${lonPos}`
                  };
              });
              // Sort by distance first
              realPois.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
              
              // Ensure a balanced mix of locations (max 6 of each type)
              const police = realPois.filter(p => p.type === 'Police');
              const hospitals = realPois.filter(p => p.type === 'Hospital');
              const safeZones = realPois.filter(p => p.type === 'Safe Zone');
              
              const balancedPois = [
                  ...police.slice(0, 6),
                  ...hospitals.slice(0, 6),
                  ...safeZones.slice(0, 6)
              ];
              
              // Sort the final balanced list by distance
              balancedPois.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
              
              setPois(balancedPois);
            }
          } catch (err) {
             console.error("Failed to fetch real POIs", err);
             // keep the mock fallback if the API fails
          }
          
          setIsLoadingGeo(false);
        },
        (err) => {
          console.warn("Geolocation error:", err.message);
          setIsLoadingGeo(false);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        },
        { timeout: 10000 }
      );
    } else {
      setIsLoadingGeo(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  useEffect(() => {
    locateUser();
  }, []);

  const filteredPois = pois.filter(p => {
    const matchesFilter = activeFilter === 'All' || p.type.toLowerCase().includes(activeFilter.toLowerCase());
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="h-[calc(100vh-70px)] flex flex-col lg:flex-row overflow-hidden bg-white">
      
      {/* Toast Notification for Default Location */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[2000] bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Info className="w-5 h-5 text-yellow-400" />
          <span className="font-label text-sm font-semibold">Using default location (Delhi)</span>
        </div>
      )}

      {/* Sidebar: Search & Places */}
      <aside className="w-full lg:w-[400px] border-r border-gray-100 flex flex-col bg-white z-20 shadow-xl lg:shadow-none flex-shrink-0">
        <div className="p-6 border-b border-gray-100 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold font-serif text-[#2c2a1e]">Safety Explorer</h2>
            {/* Sidebar location button */}
            <button 
              onClick={locateUser} 
              className="p-2 bg-[#7a8a42]/10 rounded-lg text-[#7a8a42] hover:bg-[#7a8a42]/20 transition-colors" 
              title="Refresh Location"
            >
              <Navigation className="w-5 h-5 fill-current" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search safe locations..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-[#7a8a42] transition-all outline-none text-sm font-medium text-[#2c2a1e]"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {FILTERS.map(f => (
              <button
                key={f.label}
                onClick={() => setActiveFilter(f.label)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  activeFilter === f.label
                    ? 'bg-[#7a8a42] text-white shadow-lg'
                    : 'bg-gray-100 text-[#6b6550] hover:bg-gray-200'
                }`}
              >
                <f.icon className="w-3.5 h-3.5" />
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#6b6550]">Nearby Safe Locations</p>
            <Filter className="w-4 h-4 text-gray-400 cursor-pointer" />
          </div>

          <div className="space-y-4">
            {filteredPois.length === 0 ? (
              <div className="text-center py-10 px-4">
                <ShieldAlert className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 font-medium text-sm">No results found for "{searchQuery}"</p>
              </div>
            ) : (
              filteredPois.map((place) => (
                <div 
                  key={place.id} 
                  onClick={() => {
                    setLocation([place.lat, place.lon]);
                    setSelectedPlaceId(place.id);
                  }}
                  className={`group p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedPlaceId === place.id 
                      ? 'border-[#7a8a42] bg-[#7a8a42]/5' 
                      : 'border-gray-100 hover:border-[#7a8a42] hover:bg-[#7a8a42]/5'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-bold transition-colors ${selectedPlaceId === place.id ? 'text-[#7a8a42]' : 'text-[#2c2a1e] group-hover:text-[#7a8a42]'}`}>
                      {place.name}
                    </h3>
                    <span className="text-[10px] font-black text-[#7a8a42] bg-[#7a8a42]/10 px-2 py-0.5 rounded-full whitespace-nowrap ml-2">
                      {place.distance}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1 text-[#6b6550] font-medium">
                      <Shield className="w-3 h-3" /> {place.type}
                    </span>
                    <span className="flex items-center gap-1 text-green-600 font-bold">
                      <Star className="w-3 h-3 fill-current" /> {place.rating}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-gray-400 italic">{place.status}</p>
                    <div className="flex gap-2">
                      <button 
                        className="p-2 bg-white rounded-lg border border-gray-100 text-gray-400 hover:text-[#7a8a42] shadow-sm transition-colors" 
                        onClick={(e) => { e.stopPropagation(); /* handle call */ }}
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-2 bg-[#7a8a42] rounded-lg text-white shadow-md hover:shadow-lg transition-all" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          if (place.googleMapsUrl) {
                            window.open(place.googleMapsUrl, '_blank');
                          } else {
                            setLocation([place.lat, place.lon]); 
                          }
                        }}
                        title={place.googleMapsUrl ? "Open in Google Maps" : "Go to location"}
                      >
                        <Navigation className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Community Alert Strip */}
        <div className="p-6 bg-[#2c2a1e] text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-white/10 rounded-lg">
              <Shield className="w-5 h-5 text-[#a8b86e]" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#a8b86e]">Community Alert</p>
              <p className="text-xs font-body opacity-80">Connaught Place area verified safe by 42 users today.</p>
            </div>
          </div>
          <button className="w-full py-3 bg-[#7a8a42] rounded-xl font-bold text-sm hover:bg-[#a8b86e] transition-all">
            Report Safety Concern
          </button>
        </div>
      </aside>

      {/* Main Content: Map */}
      <main className="flex-1 relative bg-gray-50 flex items-center justify-center">
        
        {/* Loading State or Map */}
        {isLoadingGeo ? (
          <div className="flex flex-col items-center gap-4 text-[#7a8a42]">
            <Loader2 className="w-10 h-10 animate-spin" />
            <p className="font-bold text-sm animate-pulse">Locating your safe zone...</p>
          </div>
        ) : (
          <div className="absolute inset-0 z-0">
            <CustomMapContainer location={location} pois={filteredPois} />
          </div>
        )}

        {/* Floating Map Controls (My Location) */}
        {!isLoadingGeo && (
          <div className="absolute top-8 right-8 z-[1000] flex flex-col gap-4">
            <button 
              onClick={locateUser}
              className="p-4 bg-white rounded-full shadow-2xl text-[#7a8a42] hover:bg-[#7a8a42] hover:text-white transition-all group"
              title="Go to My Location"
            >
              <Navigation className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        )}

        {/* SOS Floating Action (Mobile only) */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-sm px-4 lg:hidden pointer-events-none">
          <button className="w-full bg-[#DC2626] text-white py-4 rounded-2xl flex items-center justify-center gap-3 shadow-2xl animate-pulse pointer-events-auto">
            <ShieldAlert className="w-6 h-6" />
            <span className="text-sm font-bold uppercase tracking-widest">Trigger Emergency SOS</span>
          </button>
        </div>

      </main>
    </div>
  );
}
