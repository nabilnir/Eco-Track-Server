const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware 
app.use(cors({
  origin: [
    'https://eco-tracker-service.vercel.app/',
    'https://eco-track-38040.firebaseapp.com',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true
}));
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

let database;
let challengesCollection;
let userChallengesCollection;
let tipsCollection;
let eventsCollection;

// Connect to MongoDB once
async function connectDB() {
  try {
    if (!database) {
      await client.connect();
      console.log("✅ Connected to MongoDB!");
      
      database = client.db("ecoTrackDB");
      challengesCollection = database.collection("challenges");
      userChallengesCollection = database.collection("userChallenges");
      tipsCollection = database.collection("tips");
      eventsCollection = database.collection("events");
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'EcoTrack API is running!',
    status: 'active',
    endpoints: {
      challenges: '/api/challenges',
      events: '/api/events',
      tips: '/api/tips',
      slides: '/slides',
      statistics: '/api/statistics'
    }
  });
});

// CHALLENGES ROUTES 

// GET all challenges with advanced filtering
app.get('/api/challenges', async (req, res) => {
  try {
    await connectDB();
    const { category, startDate, endDate, minParticipants, maxParticipants } = req.query;

    let filter = {};

    if (category) {
      const categories = category.split(',');
      filter.category = { $in: categories };
    }

    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
    }

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
    await connectDB();
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
    await connectDB();
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
    await connectDB();
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
    await connectDB();
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
    await connectDB();
    const { id } = req.params;
    const { userId } = req.body;

    const existing = await userChallengesCollection.findOne({
      userId: userId,
      challengeId: new ObjectId(id)
    });

    if (existing) {
      return res.status(400).json({ message: 'Already joined this challenge' });
    }

    const userChallenge = {
      userId: userId,
      challengeId: new ObjectId(id),
      status: 'Not Started',
      progress: 0,
      joinDate: new Date()
    };

    await userChallengesCollection.insertOne(userChallenge);

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

app.get('/api/user-challenges/:userId', async (req, res) => {
  try {
    await connectDB();
    const { userId } = req.params;
    const userChallenges = await userChallengesCollection.find({ userId }).toArray();

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

app.patch('/api/user-challenges/:id', async (req, res) => {
  try {
    await connectDB();
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

// TIPS ROUTES 

app.get('/api/tips', async (req, res) => {
  try {
    await connectDB();
    const tips = await tipsCollection.find().sort({ createdAt: -1 }).limit(5).toArray();
    res.json(tips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/tips', async (req, res) => {
  try {
    await connectDB();
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
    await connectDB();
    const events = await eventsCollection.find().sort({ date: 1 }).limit(4).toArray();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    await connectDB();
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

app.get('/api/events/:id', async (req, res) => {
  try {
    await connectDB();
    const event = await eventsCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/events/:id', async (req, res) => {
  try {
    await connectDB();
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

app.delete('/api/events/:id', async (req, res) => {
  try {
    await connectDB();
    const result = await eventsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/events/join/:id', async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { userId } = req.body;

    const event = await eventsCollection.findOne({ _id: new ObjectId(id) });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

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
    await connectDB();
    const slides = await database.collection('slides').find({}).toArray();
    res.json(slides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/slides', async (req, res) => {
  try {
    await connectDB();
    const result = await database.collection('slides').insertOne(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// STATISTICS ROUTE
app.get('/api/statistics', async (req, res) => {
  try {
    await connectDB();
    const totalChallenges = await challengesCollection.countDocuments();

    const totalParticipants = await challengesCollection.aggregate([
      { $group: { _id: null, total: { $sum: "$participants" } } }
    ]).toArray();

    const totalUserChallenges = await userChallengesCollection.countDocuments();

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


if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}


module.exports = app;