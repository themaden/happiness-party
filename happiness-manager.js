const fs = require('fs');
const path = require('path');

function processGuests(guests) {
    // Kontrol için konsole yazdırma
    console.log('Processing guests:', guests);

    const drinks = {
        "6-packs-beers": 0,
        "wine-bottles": 0,
        "water-bottles": 0,
        "soft-bottles": 0
    };

    const foods = {
        "eggplants": 0,
        "mushrooms": 0,
        "hummus": 0,
        "courgettes": 0,
        "burgers": 0,
        "sardines": 0,
        "kebabs": 0,
        "potatoes": 0
    };

    let totalVips = 0;

    for (const guest of guests) {
        if (!guest.drinks && !guest.foods) continue;

        totalVips++;
        
        const drinksNeeded = guest.drinks || {};
        const foodsNeeded = guest.foods || {};
        
        drinks["6-packs-beers"] += (drinksNeeded.beers || 0);
        drinks["wine-bottles"] += (drinksNeeded.wine || 0);
        drinks["water-bottles"] += (drinksNeeded.water || 0);
        drinks["soft-bottles"] += (drinksNeeded.soft_drinks || 0);
        
        const veg = foodsNeeded.vegetarian || {};
        foods["eggplants"] += (veg.eggplants || 0);
        foods["mushrooms"] += (veg.mushrooms || 0);
        foods["hummus"] += (veg.hummus || 0);
        foods["courgettes"] += (veg.courgettes || 0);
        
        foods["burgers"] += (foodsNeeded.meat_eaters || 0);
        foods["sardines"] += (foodsNeeded.fish_lovers || 0);
        foods["kebabs"] += (foodsNeeded.meat_lovers || 0);
    }

    // Process drinks
    for (const key of Object.keys(drinks)) {
        if (drinks[key] > 0) {
            drinks[key] = Math.ceil(drinks[key] / (key === "6-packs-beers" ? 6 : 4));
        } else {
            delete drinks[key];
        }
    }

    // Process foods
    for (const key of Object.keys(foods)) {
        if (foods[key] > 0) {
            if (["eggplants", "mushrooms", "hummus", "courgettes"].includes(key)) {
                foods[key] = Math.ceil(foods[key] / 3) * 3;
            } else if (key === "kebabs") {
                foods[key] *= 3;
            }
        } else {
            delete foods[key];
        }
    }

    // Add potatoes
    if (totalVips > 0) {
        foods["potatoes"] = totalVips;
    }

    return { ...drinks, ...foods };
}

function updateOrCreateFile(filePath, data) {
    if (fs.existsSync(filePath)) {
        const existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const updatedData = { ...existingData, ...data };
        fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));
    } else {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }
}

function main(guestDir, fileName) {
    const filePath = path.join(guestDir, fileName);
    console.log(`Looking for file at: ${filePath}`);  // Bu satırı ekleyin

    if (!fs.existsSync(filePath)) {
        console.log("File not found.");
        return;
    }

    let guests;
    try {
        guests = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (!Array.isArray(guests)) {
            throw new Error("Guests data is not an array.");
        }
    } catch (error) {
        console.error("Error reading or parsing the JSON file:", error);
        return;
    }

    const data = processGuests(guests);

    if (Object.keys(data).length === 0) {
        console.log("No one is coming.");
        return;
    }

    updateOrCreateFile(filePath, data);
}

const [,, guestDir, fileName] = process.argv;

if (!guestDir || !fileName) {
    console.log("Usage: node happiness-manager.js <guest_dir> <file_name>");
} else {
    main(guestDir, fileName);
}
