// Middleware to parse FormData nested fields into objects
export const parseFormData = (req, res, next) => {
  // Debug: log all body keys to see what we're receiving
  // console.log('FormData keys:', Object.keys(req.body));
  
  // Check if we have nested FormData fields (indicated by bracket notation)
  const hasNestedFields = Object.keys(req.body).some(key => key.includes('[') || key.includes('.'));

  if (hasNestedFields) {
    // Parse location object from FormData
    if (req.body['location[address]'] || req.body['location.city']) {
      req.body.location = {
        address: req.body['location[address]'] || req.body['location.address'] || '',
        city: req.body['location[city]'] || req.body['location.city'] || '',
        state: req.body['location[state]'] || req.body['location.state'] || '',
        pincode: req.body['location[pincode]'] || req.body['location.pincode'] || '',
        coordinates: {
          lat: Number(req.body['location[coordinates][lat]'] || req.body['location.coordinates.lat'] || 0),
          lng: Number(req.body['location[coordinates][lng]'] || req.body['location.coordinates.lng'] || 0),
        },
      };
      
      // Clean up individual location fields
      Object.keys(req.body).forEach(key => {
        if (key.startsWith('location[') || key.startsWith('location.')) {
          delete req.body[key];
        }
      });
    }

    // Parse operatingHours object from FormData
    if (req.body['operatingHours[open]'] || req.body['operatingHours.open']) {
      req.body.operatingHours = {
        open: req.body['operatingHours[open]'] || req.body['operatingHours.open'] || '06:00',
        close: req.body['operatingHours[close]'] || req.body['operatingHours.close'] || '22:00',
      };
      
      // Clean up individual operatingHours fields
      Object.keys(req.body).forEach(key => {
        if (key.startsWith('operatingHours[') || key.startsWith('operatingHours.')) {
          delete req.body[key];
        }
      });
    }
  }

  // Ensure amenities and rules are arrays (multer already handles this, but just in case)
  if (req.body.amenities) {
    if (!Array.isArray(req.body.amenities)) {
      req.body.amenities = [req.body.amenities];
    }
    // Filter out empty strings
    req.body.amenities = req.body.amenities.filter(a => a && a.trim());
  }
  
  if (req.body.rules) {
    if (!Array.isArray(req.body.rules)) {
      req.body.rules = [req.body.rules];
    }
    // Filter out empty strings
    req.body.rules = req.body.rules.filter(r => r && r.trim());
  }

  next();
};

