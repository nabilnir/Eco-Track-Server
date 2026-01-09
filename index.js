const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware 
app.use(cors({
  origin: [
    'https://eco-track-client-site.web.app/',
    'https://eco-track-b4b76.firebaseapp.com',
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
let testimonialsCollection;
let blogsCollection;
let usersCollection;

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
      testimonialsCollection = database.collection("testimonials");
      blogsCollection = database.collection("blogs");
      usersCollection = database.collection("users"); // Added users collection
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
      testimonials: '/api/testimonials',
      blogs: '/api/blogs',
      slides: '/slides',
      statistics: '/api/statistics'
    }
  });
});

// CHALLENGES ROUTES 

// GET all challenges with advanced filtering
// GET all challenges with search, sort, pagination, and filters
app.get('/api/challenges', async (req, res) => {
  try {
    await connectDB();
    const {
      category,
      startDate,
      endDate,
      minParticipants,
      maxParticipants,
      search,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    let filter = {};

    // 1. Category Filter
    if (category) {
      const categories = category.split(',');
      filter.category = { $in: categories };
    }

    // 2. Date Range Filter
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
    }

    // 3. Participants Filter
    if (minParticipants || maxParticipants) {
      filter.participants = {};
      if (minParticipants) filter.participants.$gte = parseInt(minParticipants);
      if (maxParticipants) filter.participants.$lte = parseInt(maxParticipants);
    }

    // 4. Search (Title or Description)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // 5. Sorting
    let sortOptions = {};
    if (sort) {
      switch (sort) {
        case 'newest':
          sortOptions = { createdAt: -1 };
          break;
        case 'oldest':
          sortOptions = { createdAt: 1 };
          break;
        case 'participants_desc':
          sortOptions = { participants: -1 };
          break;
        case 'duration_asc':
          sortOptions = { duration: 1 };
          break;
        default:
          sortOptions = { createdAt: -1 }; // Default
      }
    } else {
      sortOptions = { createdAt: -1 };
    }

    // 6. Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute Query
    const challenges = await challengesCollection
      .find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .toArray();

    // Get Total Count for Pagination
    const total = await challengesCollection.countDocuments(filter);

    // Return Structured Response
    res.json({
      challenges,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum
      },
      // Keep root keys for easier client access if needed (optional but helpful)
      totalPages: Math.ceil(total / limitNum)
    });

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

// USER DATA ROUTES (NEW)
app.post('/api/users', async (req, res) => {
  try {
    await connectDB();
    const user = req.body;
    const query = { email: user.email };

    // Check if user exists
    const existingUser = await usersCollection.findOne(query);
    if (existingUser) {
      return res.json({ message: 'User already exists', user: existingUser });
    }

    const result = await usersCollection.insertOne({
      ...user,
      createdAt: new Date(),
      role: user.role || 'user'
    });
    res.json({ message: 'User created successfully', result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/users/:email', async (req, res) => {
  try {
    await connectDB();
    const email = req.params.email;
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
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

// TESTIMONIALS ROUTES

app.get('/api/testimonials', async (req, res) => {
  try {
    await connectDB();
    const testimonials = await testimonialsCollection.find({}).sort({ createdAt: -1 }).toArray();
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/testimonials', async (req, res) => {
  try {
    await connectDB();
    const newTestimonial = {
      ...req.body,
      rating: req.body.rating || 5,
      featured: req.body.featured || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await testimonialsCollection.insertOne(newTestimonial);
    res.status(201).json({ insertedId: result.insertedId, ...newTestimonial });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/testimonials/:id', async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    delete updateData._id;

    const result = await testimonialsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    res.json({ message: 'Testimonial updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/testimonials/:id', async (req, res) => {
  try {
    await connectDB();
    const result = await testimonialsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// BLOGS ROUTES

app.get('/api/blogs', async (req, res) => {
  try {
    await connectDB();
    const { limit = 10, page = 1, category, authorEmail } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let filter = {};
    if (category) {
      filter.category = category;
    }
    if (authorEmail) {
      filter.authorEmail = authorEmail;
    }

    const blogs = await blogsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await blogsCollection.countDocuments(filter);

    res.json({
      blogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/blogs/latest', async (req, res) => {
  try {
    await connectDB();
    const { limit = 3 } = req.query;

    const blogs = await blogsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .toArray();

    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/blogs/:id', async (req, res) => {
  try {
    await connectDB();
    const blog = await blogsCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Increment view count
    await blogsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $inc: { views: 1 } }
    );

    // Return blog with updated view count
    const updatedBlog = await blogsCollection.findOne({ _id: new ObjectId(req.params.id) });
    res.json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/blogs', async (req, res) => {
  try {
    await connectDB();
    const newBlog = {
      ...req.body,
      views: 0,
      likes: 0,
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await blogsCollection.insertOne(newBlog);
    res.status(201).json({ insertedId: result.insertedId, ...newBlog });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/blogs/:id', async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    delete updateData._id;

    const result = await blogsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json({ message: 'Blog updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/blogs/:id', async (req, res) => {
  try {
    await connectDB();
    const result = await blogsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/blogs/:id/like', async (req, res) => {
  try {
    await connectDB();
    const result = await blogsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $inc: { likes: 1 } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json({ message: 'Blog liked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/blogs/:id/comment', async (req, res) => {
  try {
    await connectDB();
    const { userId, username, content } = req.body;

    const comment = {
      userId,
      username,
      content,
      createdAt: new Date()
    };

    const result = await blogsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $push: { comments: comment } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.status(201).json({ message: 'Comment added successfully', comment });
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