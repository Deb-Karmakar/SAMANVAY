// Backend/utils/geocoder.js (Final Corrected Version)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const districtsPath = path.join(__dirname, 'india-districts.json');
let districts = [];

try {
    const fileContent = fs.readFileSync(districtsPath, 'utf8');
    // We expect the file to be a simple array [] of objects
    districts = JSON.parse(fileContent);

    if (!Array.isArray(districts)) {
        throw new Error("The districts JSON file is not an array.");
    }
    
    console.log(`✅ Geocoder successfully loaded ${districts.length} districts from file.`);

} catch (error) {
    console.error('❌ CRITICAL: Failed to load or parse india-districts.json for geocoder.', error);
}

export const getCoordsForProject = (districtName, stateName) => {
    if (!districtName || !stateName) return null;

    // This will now work because 'districts' is an array
    const found = districts.find(d => 
        d.district.toLowerCase() === districtName.toLowerCase() &&
        d.state.toLowerCase() === stateName.toLowerCase()
    );

    if (found && found.longitude && found.latitude) {
        return {
            type: 'Point',
            coordinates: [parseFloat(found.longitude), parseFloat(found.latitude)]
        };
    }
    
    console.warn(`⚠️  Geocoder couldn't find coordinates for District: ${districtName}, State: ${stateName}`);
    return null;
};