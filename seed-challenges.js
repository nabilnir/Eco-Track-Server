const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@ecotrack0.zoz8wuc.mongodb.net/?appName=EcoTrack0`;
const client = new MongoClient(uri);

const challenges = [
    {
        title: "Zero Waste Week",
        category: "Waste Reduction",
        description: "Commit to producing zero landfill waste for one entire week. Compost organic matter and recycle everything else.",
        duration: 7,
        target: "0g Landfill Waste",
        impactMetric: "kg Waste Diverted",
        startDate: new Date("2024-02-01"),
        endDate: new Date("2024-02-07"),
        imageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=2670&auto=format&fit=crop",
        participants: 120,
        createdBy: "admin@ecotrack.com"
    },
    {
        title: "Bike to Work Month",
        category: "Sustainable Transport",
        description: "Leave the car at home and cycle to work or school every day for a month.",
        duration: 30,
        target: "20 Rides",
        impactMetric: "kg CO2 Saved",
        startDate: new Date("2024-03-01"),
        endDate: new Date("2024-03-31"),
        imageUrl: "https://images.unsplash.com/photo-1485965120184-e224f7a1dcfe?q=80&w=2670&auto=format&fit=crop",
        participants: 85,
        createdBy: "admin@ecotrack.com"
    },
    {
        title: "Plant-Based Power",
        category: "Green Living",
        description: "Switch to a fully plant-based diet for two weeks to reduce your carbon footprint.",
        duration: 14,
        target: "14 Days Meat-Free",
        impactMetric: "kg CO2 Saved",
        startDate: new Date("2024-04-01"),
        endDate: new Date("2024-04-14"),
        imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2670&auto=format&fit=crop",
        participants: 200,
        createdBy: "admin@ecotrack.com"
    },
    {
        title: "Shorter Showers Challenge",
        category: "Water Conservation",
        description: "Limit your showers to 4 minutes or less to save water and energy.",
        duration: 21,
        target: "Max 4 mins/shower",
        impactMetric: "Liters Water Saved",
        startDate: new Date("2024-02-15"),
        endDate: new Date("2024-03-07"),
        imageUrl: "https://images.unsplash.com/photo-1520189334586-a2374786411f?q=80&w=2670&auto=format&fit=crop",
        participants: 350,
        createdBy: "admin@ecotrack.com"
    },
    {
        title: "Unplugged Weekend",
        category: "Energy Conservation",
        description: "Disconnect all non-essential electronics for 48 hours to save energy and reconnect with nature.",
        duration: 2,
        target: "48 Hours",
        impactMetric: "kWh Saved",
        startDate: new Date("2024-02-10"),
        endDate: new Date("2024-02-12"),
        imageUrl: "https://images.unsplash.com/photo-1496309732348-3627f3f040ee?q=80&w=2670&auto=format&fit=crop",
        participants: 45,
        createdBy: "admin@ecotrack.com"
    },
    {
        title: "Plastic-Free Shopping",
        category: "Waste Reduction",
        description: "Avoid all single-use plastics when grocery shopping. Use cloth bags and bulk containers.",
        duration: 30,
        target: "0 Single-Use Items",
        impactMetric: "Plastic Items Avoided",
        startDate: new Date("2024-05-01"),
        endDate: new Date("2024-05-31"),
        imageUrl: "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?q=80&w=2574&auto=format&fit=crop",
        participants: 156,
        createdBy: "admin@ecotrack.com"
    },
    {
        title: "Community Clean-Up",
        category: "Waste Reduction",
        description: "Join your local community group to pick up litter in parks and streets.",
        duration: 1,
        target: "1 Bag of Litter",
        impactMetric: "kg Litter Collected",
        startDate: new Date("2024-04-22"),
        endDate: new Date("2024-04-22"),
        imageUrl: "https://images.unsplash.com/photo-1618477461853-5f8dd68aa62e?q=80&w=2574&auto=format&fit=crop",
        participants: 500,
        createdBy: "admin@ecotrack.com"
    },
    {
        title: "Solar Charging Only",
        category: "Energy Conservation",
        description: "Charge your phone and small devices using only solar power banks for a week.",
        duration: 7,
        target: "100% Solar Energy",
        impactMetric: "kWh Grid Energy Saved",
        startDate: new Date("2024-06-10"),
        endDate: new Date("2024-06-17"),
        imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2672&auto=format&fit=crop",
        participants: 28,
        createdBy: "admin@ecotrack.com"
    },
    {
        title: "Walk Everywhere",
        category: "Sustainable Transport",
        description: "For distances under 2km, commit to walking instead of driving or taking public transport.",
        duration: 14,
        target: "20km Walked",
        impactMetric: "kg CO2 Saved",
        startDate: new Date("2024-03-15"),
        endDate: new Date("2024-03-29"),
        imageUrl: "https://images.unsplash.com/photo-1475518112798-86ae35e9e6d0?q=80&w=2609&auto=format&fit=crop",
        participants: 92,
        createdBy: "admin@ecotrack.com"
    },
    {
        title: "Fix It, Don't Trash It",
        category: "Waste Reduction",
        description: "Repair a broken item instead of throwing it away and buying a new one.",
        duration: 7,
        target: "1 Item Repaired",
        impactMetric: "kg Waste Prevented",
        startDate: new Date("2024-02-20"),
        endDate: new Date("2024-02-27"),
        imageUrl: "https://images.unsplash.com/photo-1581092921461-eab62e97a782?q=80&w=2670&auto=format&fit=crop",
        participants: 67,
        createdBy: "admin@ecotrack.com"
    },
    {
        title: "Cold Water Wash",
        category: "Energy Conservation",
        description: "Wash all your clothes in cold water for a month to save heating energy.",
        duration: 30,
        target: "8 Loads Cold Wash",
        impactMetric: "kWh Saved",
        startDate: new Date("2024-03-01"),
        endDate: new Date("2024-03-31"),
        imageUrl: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?q=80&w=2670&auto=format&fit=crop",
        participants: 210,
        createdBy: "admin@ecotrack.com"
    },
    {
        title: "Grow Your Own Herbs",
        category: "Green Living",
        description: "Start a small herb garden in your kitchen or balcony.",
        duration: 60,
        target: "3 Herb Plants",
        impactMetric: "Food Miles Saved",
        startDate: new Date("2024-04-01"),
        endDate: new Date("2024-05-31"),
        imageUrl: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=2670&auto=format&fit=crop",
        participants: 134,
        createdBy: "admin@ecotrack.com"
    },
    {
        title: "Rainwater Harvesting",
        category: "Water Conservation",
        description: "Collect rainwater to water your plants instead of using tap water.",
        duration: 30,
        target: "50 Liters Collected",
        impactMetric: "Liters Tap Water Saved",
        startDate: new Date("2024-04-15"),
        endDate: new Date("2024-05-15"),
        imageUrl: "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2670&auto=format&fit=crop",
        participants: 40,
        createdBy: "admin@ecotrack.com"
    },
    {
        title: "Carpool Week",
        category: "Sustainable Transport",
        description: "Share a ride to work or school with a colleague or friend.",
        duration: 5,
        target: "5 Shared Rides",
        impactMetric: "kg CO2 Saved",
        startDate: new Date("2024-05-10"),
        endDate: new Date("2024-05-14"),
        imageUrl: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2670&auto=format&fit=crop",
        participants: 78,
        createdBy: "admin@ecotrack.com"
    },
    {
        title: "Reusable Bottle Challenge",
        category: "Waste Reduction",
        description: "Use a reusable water bottle exclusively. Do not buy any plastic bottled water.",
        duration: 30,
        target: "0 Plastic Bottles",
        impactMetric: "Plastic Bottles Avoided",
        startDate: new Date("2024-06-01"),
        endDate: new Date("2024-06-30"),
        imageUrl: "https://images.unsplash.com/photo-1602143407151-5114025f6f4d?q=80&w=2574&auto=format&fit=crop",
        participants: 412,
        createdBy: "admin@ecotrack.com"
    },
    {
        title: "Lights Off Hour",
        category: "Energy Conservation",
        description: "Turn off all lights in your home for one designated hour every evening.",
        duration: 7,
        target: "7 Hours of Darkness",
        impactMetric: "kWh Saved",
        startDate: new Date("2024-02-21"),
        endDate: new Date("2024-02-28"),
        imageUrl: "https://images.unsplash.com/photo-1517482390886-0969695f32eb?q=80&w=2535&auto=format&fit=crop",
        participants: 190,
        createdBy: "admin@ecotrack.com"
    },
    {
        title: "Compost Crusade",
        category: "Waste Reduction",
        description: "Set up a composting system for your kitchen scraps.",
        duration: 21,
        target: "10kg Organic Waste Composted",
        impactMetric: "kg Waste Diverted",
        startDate: new Date("2024-03-10"),
        endDate: new Date("2024-03-31"),
        imageUrl: "https://images.unsplash.com/photo-1594490513904-4552467b7f1e?q=80&w=2670&auto=format&fit=crop",
        participants: 110,
        createdBy: "admin@ecotrack.com"
    },
    {
        title: "Public Transport Month",
        category: "Sustainable Transport",
        description: "Use buses, trains, or trams for all your commutes this month.",
        duration: 30,
        target: "100% Public Transport",
        impactMetric: "kg CO2 Saved",
        startDate: new Date("2024-05-01"),
        endDate: new Date("2024-05-31"),
        imageUrl: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=2671&auto=format&fit=crop",
        participants: 55,
        createdBy: "admin@ecotrack.com"
    },
    {
        title: "Thrift Shop Challenge",
        category: "Green Living",
        description: "Buy only second-hand clothes for the next three months.",
        duration: 90,
        target: "0 New Clothes",
        impactMetric: "kg Textile Waste Prevented",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-03-31"),
        imageUrl: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=2670&auto=format&fit=crop",
        participants: 300,
        createdBy: "admin@ecotrack.com"
    },
    {
        title: "Leak Detective",
        category: "Water Conservation",
        description: "Inspect your home for water leaks and fix any dripping taps or toilets.",
        duration: 3,
        target: "0 Leaks",
        impactMetric: "Liters Water Saved/Year",
        startDate: new Date("2024-02-05"),
        endDate: new Date("2024-02-08"),
        imageUrl: "https://images.unsplash.com/photo-1585909698188-da5675f5c6e4?q=80&w=2670&auto=format&fit=crop",
        participants: 90,
        createdBy: "admin@ecotrack.com"
    }
];

async function run() {
    try {
        await client.connect();
        console.log("Connected correctly to server");

        const db = client.db("ecoTrackDB");
        const col = db.collection("challenges");

        // Optional: Drop existing challenges to start fresh
        // await col.deleteMany({}); 

        const result = await col.insertMany(challenges.map(c => ({
            ...c,
            createdAt: new Date(),
            updatedAt: new Date()
        })));

        console.log(`${result.insertedCount} challenges inserted successfully!`);

    } catch (err) {
        console.log(err.stack);
    } finally {
        await client.close();
    }
}

run().catch(console.dir);
