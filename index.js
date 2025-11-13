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


    // PATCH update challenge
    app.patch('/api/challenges/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const updateData = { ...req.body, updatedAt: new Date() };
        delete updateData._id;
        
        const result = await challengesCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'Challenge not found' });
        }
        
        res.json({ message: 'Challenge updated successfully' });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

     // DELETE challenge
    app.delete('/api/challenges/:id', async (req, res) => {
      try {
        const result = await challengesCollection.deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'Challenge not found' });
        }
        res.json({ message: 'Challenge deleted successfully' });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });



    // POST join challenge
    app.post('/api/challenges/join/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const { userId } = req.body;

        // Check if already joined
        const existing = await userChallengesCollection.findOne({
          userId: userId,
          challengeId: new ObjectId(id)
        });

        if (existing) {
          return res.status(400).json({ message: 'Already joined this challenge' });
        }

        // Create user challenge entry
        const userChallenge = {
          userId: userId,
          challengeId: new ObjectId(id),
          status: 'Not Started',
          progress: 0,
          joinDate: new Date()
        };

        await userChallengesCollection.insertOne(userChallenge);

        // Increment participants count
        await challengesCollection.updateOne(
          { _id: new ObjectId(id) },
          { $inc: { participants: 1 } }
        );

        res.status(201).json({ message: 'Successfully joined challenge', userChallenge });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });


    // GET user's challenges
    app.get('/api/user-challenges/:userId', async (req, res) => {
      try {
        const { userId } = req.params;
        const userChallenges = await userChallengesCollection.find({ userId }).toArray();
        
        // Populate challenge details
        const challengesWithDetails = await Promise.all(
          userChallenges.map(async (uc) => {
            const challenge = await challengesCollection.findOne({ _id: uc.challengeId });
            return { ...uc, challenge };
          })
        );
        
        res.json(challengesWithDetails);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });


    // PATCH update user challenge progress
    app.patch('/api/user-challenges/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const { progress, status } = req.body;
        
        const result = await userChallengesCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { progress, status, updatedAt: new Date() } }
        );
        
        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'User challenge not found' });
        }
        
        res.json({ message: 'Progress updated successfully' });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });
  
}

run().catch(console.dir);



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});