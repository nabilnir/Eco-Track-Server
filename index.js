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
  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    const database = client.db("ecoTrackDB");
    const challengesCollection = database.collection("challenges");
    const userChallengesCollection = database.collection("userChallenges");
    const tipsCollection = database.collection("tips");
    const eventsCollection = database.collection("events");

    // CHALLENGES ROUTES 

    //  all challenges with (advance filtering)
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

    // USER CHALLENGES ROUTES 

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

    //  TIPS ROUTES 

    app.get('/api/tips', async (req, res) => {
      try {
        const tips = await tipsCollection.find().sort({ createdAt: -1 }).limit(5).toArray();
        res.json(tips);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    app.post('/api/tips', async (req, res) => {
      try {
        const newTip = {
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const result = await tipsCollection.insertOne(newTip);
        res.status(201).json({ insertedId: result.insertedId, ...newTip });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // EVENTS ROUTES 

    app.get('/api/events', async (req, res) => {
      try {
        const events = await eventsCollection.find().sort({ date: 1 }).limit(4).toArray();
        res.json(events);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // POST create new event 
    app.post('/api/events', async (req, res) => {
      try {
        const newEvent = {
          ...req.body,
          attendees: req.body.attendees ?? 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const result = await eventsCollection.insertOne(newEvent);
        res.status(201).json({ insertedId: result.insertedId, ...newEvent });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // GET single event
    app.get('/api/events/:id', async (req, res) => {
      try {
        const event = await eventsCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (!event) {
          return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // PATCH update event
    app.patch('/api/events/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const updateData = { ...req.body, updatedAt: new Date() };
        delete updateData._id;
        
        const result = await eventsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'Event not found' });
        }
        
        res.json({ message: 'Event updated successfully' });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // DELETE event
    app.delete('/api/events/:id', async (req, res) => {
      try {
        const result = await eventsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'Event not found' });
        }
        res.json({ message: 'Event deleted successfully' });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // POST join event
    app.post('/api/events/join/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const { userId } = req.body;

        const event = await eventsCollection.findOne({ _id: new ObjectId(id) });
        if (!event) {
          return res.status(404).json({ message: 'Event not found' });
        }

        // Increment attendees count
        await eventsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $inc: { attendees: 1 } }
        );

        res.status(201).json({ message: 'Successfully joined event', userId });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });


    // SLIDES ROUTES
    app.get('/slides', async (req, res) => {
      try {
        const slides = await database.collection('slides').find({}).toArray();
        res.json(slides);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    app.post('/slides', async (req, res) => {
      try {
        const result = await database.collection('slides').insertOne(req.body);
        res.json(result);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });



    //  STATISTICS ROUTE

    app.get('/api/statistics', async (req, res) => {
      try {
        const totalChallenges = await challengesCollection.countDocuments();

        const totalParticipants = await challengesCollection.aggregate([
          { $group: { _id: null, total: { $sum: "$participants" } } }
        ]).toArray();

        const totalUserChallenges = await userChallengesCollection.countDocuments();

        // Count challenges by category
        const energyChallenges = await challengesCollection.countDocuments({
          category: { $in: ['Energy Conservation', 'Sustainable Transport'] }
        });

        const wasteChallenges = await challengesCollection.countDocuments({
          category: 'Waste Reduction'
        });

        const waterChallenges = await challengesCollection.countDocuments({
          category: 'Water Conservation'
        });

        const greenChallenges = await challengesCollection.countDocuments({
          category: 'Green Living'
        });

        res.json({
          totalChallenges,
          totalParticipants: totalParticipants[0]?.total || 0,
          totalUserChallenges,
          co2Saved: energyChallenges * 2.5,
          plasticReduced: wasteChallenges * 1.8,
          waterSaved: waterChallenges * 5,
          treesPlanted: greenChallenges * 1
        });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // Root route
    app.get('/', (req, res) => {
      res.send('EcoTrack API is running!');
    });

  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});