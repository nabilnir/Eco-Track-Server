const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@ecotrack0.zoz8wuc.mongodb.net/?appName=EcoTrack0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {

  try{

    await client.connect();
    console.log("Connected to MongoDB!");

    const database = client.db("ecoTrackDB");
    const challengesCollection = database.collection("challenges");
    const userChallengesCollection = database.collection("userChallenges");
    const tipsCollection = database.collection("tips");
    const eventsCollection = database.collection("events");

  }

  // advanced filtering
    app.get('/api/challenges', async (req, res) => {
      try {
        const { category, startDate, endDate, minParticipants, maxParticipants } = req.query;
        
        let filter = {};
        
        // Category filter using $in
        if (category) {
          const categories = category.split(',');
          filter.category = { $in: categories };
        }
        
        // Date range filtering
        if (startDate || endDate) {
          filter.startDate = {};
          if (startDate) filter.startDate.$gte = new Date(startDate);
          if (endDate) filter.startDate.$lte = new Date(endDate);
        }
        
        // Participants range filtering
        if (minParticipants || maxParticipants) {
          filter.participants = {};
          if (minParticipants) filter.participants.$gte = parseInt(minParticipants);
          if (maxParticipants) filter.participants.$lte = parseInt(maxParticipants);
        }
        
        const challenges = await challengesCollection.find(filter).toArray();
        res.json(challenges);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // GET single challenge
    app.get('/api/challenges/:id', async (req, res) => {
      try {
        const challenge = await challengesCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (!challenge) {
          return res.status(404).json({ message: 'Challenge not found' });
        }
        res.json(challenge);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });


    // POST create new challenge
    app.post('/api/challenges', async (req, res) => {
      try {
        const newChallenge = {
          ...req.body,
          participants: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const result = await challengesCollection.insertOne(newChallenge);
        res.status(201).json({ insertedId: result.insertedId, ...newChallenge });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });
  
}

run().catch(console.dir);



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});