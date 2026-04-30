const SafePlace = require('../models/SafePlace');
const SosAlert = require('../models/SosAlert');

const getNearbyPlaces = async (req, res) => {
  try {
    const { lat, lng, radius, type, limit } = req.query;

    if (!lat || !lng || isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
      return res.status(400).json({ success: false, message: "Valid latitude and longitude are required" });
    }

    const geoQuery = {
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius) || 5000
        }
      }
    };

    if (type) {
      geoQuery.type = type;
    }

    const maxLimit = parseInt(limit) || 20;
    const places = await SafePlace.find(geoQuery).limit(maxLimit);

    const R = 6371000; // Earth radius in meters
    const lat1 = parseFloat(lat) * Math.PI / 180;
    
    const placesWithDistance = places.map(place => {
      const lat2 = place.location.coordinates[1] * Math.PI / 180;
      const dlat = (place.location.coordinates[1] - parseFloat(lat)) * Math.PI / 180;
      const dlng = (place.location.coordinates[0] - parseFloat(lng)) * Math.PI / 180;
      const a = Math.sin(dlat/2)**2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlng/2)**2;
      const distance = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
      
      const distanceText = distance >= 1000 ? `${(distance / 1000).toFixed(1)} km` : `${distance} m`;

      return {
        ...place.toObject(),
        distanceMeters: distance,
        distanceText
      };
    });

    placesWithDistance.sort((a, b) => a.distanceMeters - b.distanceMeters);

    return res.status(200).json({ 
      success: true, 
      count: placesWithDistance.length, 
      places: placesWithDistance,
      center: { lat: parseFloat(lat), lng: parseFloat(lng) },
      radius: parseInt(radius) || 5000
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const addPlace = async (req, res) => {
  try {
    const { name, type, latitude, longitude, address, city, state, phone, openHours } = req.body;

    if (!name || !type || !latitude || !longitude || !address || !city) {
      return res.status(400).json({ success: false, message: "Please provide all required fields" });
    }

    const existingPlace = await SafePlace.findOne({ name, city: city.toLowerCase() });
    if (existingPlace) {
      return res.status(409).json({ success: false, message: "This place already exists" });
    }

    const place = new SafePlace({
      name,
      type,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      address,
      city: city.toLowerCase(),
      state: state || 'India',
      phone,
      openHours: openHours || '24/7',
      addedBy: req.userId
    });

    await place.save();

    return res.status(201).json({ success: true, message: "Place added. It will be reviewed for verification.", place });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const reportSafety = async (req, res) => {
  try {
    const { placeId } = req.params;
    const { rating, comment } = req.body;

    if (!placeId || rating === undefined || isNaN(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Valid placeId and rating (1-5) are required" });
    }

    const place = await SafePlace.findById(placeId);
    if (!place) {
      return res.status(404).json({ success: false, message: "Place not found" });
    }

    const newRatingCount = place.ratingCount + 1;
    const newRating = ((place.rating * place.ratingCount) + rating) / newRatingCount;
    
    place.rating = Math.round(newRating * 10) / 10;
    place.ratingCount = newRatingCount;
    place.safetyReports += 1;

    await place.save();

    return res.status(200).json({ success: true, message: "Safety report submitted", newRating: place.rating });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const searchPlaces = async (req, res) => {
  try {
    const { q, city } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, message: "Search query is required" });
    }

    const query = { name: new RegExp(q, 'i') };
    
    if (city) {
      query.city = city.toLowerCase();
    }

    const places = await SafePlace.find(query).limit(10);

    return res.status(200).json({ success: true, places });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getNearbyPlaces,
  addPlace,
  reportSafety,
  searchPlaces
};
