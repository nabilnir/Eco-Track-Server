const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware 
app.use(cors({
  origin: [
    'https://eco-track-client-site.web.app',
    'https://eco-track-b4b76.firebaseapp.com',
    'http://localhost:5173',
    'http://localhost:5177',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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
let userEventsCollection; // New collection
let testimonialsCollection;
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
      userEventsCollection = database.collection("userEvents"); // Initialize
      testimonialsCollection = database.collection("testimonials");
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

// GET all users (for admin dashboard)
app.get('/api/users', async (req, res) => {
  try {
    await connectDB();
    const users = await usersCollection.find().toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH update user (role, status, etc.)
app.patch('/api/users/:id', async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    delete updateData._id; // Prevent updating _id

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update user profile (by email)
app.put('/api/users/profile/:email', async (req, res) => {
  try {
    await connectDB();
    const { email } = req.params;
    const { displayName, bio, photoURL, coverPhotoURL } = req.body;

    const updateData = {
      updatedAt: new Date()
    };

    if (displayName !== undefined) updateData.displayName = displayName;
    if (bio !== undefined) updateData.bio = bio;
    if (photoURL !== undefined) updateData.photoURL = photoURL;
    if (coverPhotoURL !== undefined) updateData.coverPhotoURL = coverPhotoURL;

    const result = await usersCollection.updateOne(
      { email },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await usersCollection.findOne({ email });
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE user
app.delete('/api/users/:id', async (req, res) => {
  try {
    await connectDB();
    const result = await usersCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
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

    // Check if user already joined
    const existing = await userEventsCollection.findOne({
      userId: userId,
      eventId: new ObjectId(id)
    });

    if (existing) {
      return res.status(400).json({ message: 'Already joined this event' });
    }

    const event = await eventsCollection.findOne({ _id: new ObjectId(id) });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Insert into userEvents
    const userEvent = {
      userId: userId, // Assuming email is passed as userId based on frontend code
      eventId: new ObjectId(id),
      joinDate: new Date()
    };

    await userEventsCollection.insertOne(userEvent);

    // Increment attendees
    await eventsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { attendees: 1 } }
    );

    res.status(201).json({ message: 'Successfully joined event', userId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET joined events for a user
app.get('/api/user-events/:userId', async (req, res) => {
  try {
    await connectDB();
    const { userId } = req.params;
    // userId is email in this app context
    const userEvents = await userEventsCollection.find({ userId }).toArray();

    const eventsWithDetails = await Promise.all(
      userEvents.map(async (ue) => {
        const event = await eventsCollection.findOne({ _id: ue.eventId });
        return { ...ue, event };
      })
    );

    res.json(eventsWithDetails);
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


// STATISTICS ROUTE
app.get('/api/statistics', async (req, res) => {
  try {
    await connectDB();
    const totalChallenges = await challengesCollection.countDocuments();

    const totalParticipants = await challengesCollection.aggregate([
      { $group: { _id: null, total: { $sum: "$participants" } } }
    ]).toArray();

    const totalUserChallenges = await userChallengesCollection.countDocuments();

    const totalUsers = await usersCollection.countDocuments();
    const totalEvents = await eventsCollection.countDocuments();

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

    // Growth Logic (Mocked logic for demo purposes if real historical data isn't easily queryable without created timestamps on everything, 
    // but assuming createdAt exists on users and userChallenges)
    const now = new Date();
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // User Growth
    const currentMonthUsers = await usersCollection.countDocuments({ createdAt: { $gte: firstDayCurrentMonth } });
    const lastMonthUsers = await usersCollection.countDocuments({
      createdAt: { $gte: firstDayLastMonth, $lt: firstDayCurrentMonth }
    });

    // Avoid division by zero
    const previousTotalUsers = totalUsers - currentMonthUsers;
    // Simplified calculation for "growth based on recent additions relative to total" or just month-over-month new users
    // Let's do month-over-month growth of *total base* if possible, or just user acquisition rate.
    // Let's try to do (New Users This Month - New Users Last Month) / New Users Last Month for "Growth in Rate" OR
    // (Total Now - Total Last Month) / Total Last Month.
    // Let's go with (Current Month New Users) vs (Last Month New Users) trend ?? 
    // Actually typically stats cards show "vs last month" meaning % increase in total count over last month?
    // Let's just do: ((currentMonthUsers) / (totalUsers - currentMonthUsers)) * 100 approx?
    // Let's stick to safe math:
    const userGrowth = previousTotalUsers > 0 ? ((currentMonthUsers / previousTotalUsers) * 100).toFixed(1) : 0;

    // Activity Growth
    const currentMonthActivities = await userChallengesCollection.countDocuments({ joinDate: { $gte: firstDayCurrentMonth } }); // Assuming joinDate for activities
    const previousTotalActivities = totalUserChallenges - currentMonthActivities;
    const activityGrowth = previousTotalActivities > 0 ? ((currentMonthActivities / previousTotalActivities) * 100).toFixed(1) : 0;


    res.json({
      totalChallenges,
      totalParticipants: totalParticipants[0]?.total || 0,
      totalUserChallenges,
      totalUsers,
      totalEvents,
      co2Saved: energyChallenges * 2.5,
      plasticReduced: wasteChallenges * 1.8,
      waterSaved: waterChallenges * 5,
      treesPlanted: greenChallenges * 1,
      userGrowth,
      activityGrowth
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// DASHBOARD CHARTS ROUTES
app.get('/api/dashboard/charts', async (req, res) => {
  try {
    await connectDB();

    // 1. Monthly Data (Last 6 months)
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({
        monthName: d.toLocaleString('default', { month: 'short' }),
        monthIndex: d.getMonth(),
        year: d.getFullYear()
      });
    }

    const monthlyDataPromises = months.map(async (m) => {
      const start = new Date(m.year, m.monthIndex, 1);
      const end = new Date(m.year, m.monthIndex + 1, 0); // Last day of month

      const userCount = await usersCollection.countDocuments({
        createdAt: { $lte: end } // Cumulative
      });

      const activityCount = await userChallengesCollection.countDocuments({
        joinDate: { $lte: end } // Cumulative
      });

      return {
        month: m.monthName,
        users: userCount,
        activities: activityCount
      };
    });

    const monthlyData = await Promise.all(monthlyDataPromises);

    // 2. Category Data (Pie Chart)
    const categoryAggregation = await challengesCollection.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]).toArray();

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
    const categoryData = categoryAggregation.map((cat, index) => ({
      name: cat._id,
      value: cat.count,
      color: COLORS[index % COLORS.length]
    }));

    // 3. Weekly Activity Trend (Last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d);
    }

    const activityDataPromises = last7Days.map(async (date) => {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      const count = await userChallengesCollection.countDocuments({
        joinDate: { $gte: start, $lte: end } // Daily count
      });

      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count: count
      };
    });

    const activityData = await Promise.all(activityDataPromises);

    res.json({
      monthlyData,
      categoryData,
      activityData
    });

  } catch (error) {
    console.error("Chart data error:", error);
    res.status(500).json({ message: error.message });
  }
});



// USER DASHBOARD STATS
app.get('/api/dashboard/user-stats', async (req, res) => {
  try {
    await connectDB();
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email required' });

    // 1. My Challenges (All joined challenges)
    const myChallengesCount = await userChallengesCollection.countDocuments({ userId: email });

    // 2. My Events (All joined events)
    // The user asked for "total number of events the user joined", likely all, not just upcoming.
    const myEventsCount = await userEventsCollection.countDocuments({ userId: email });

    // 3. My Total Activities (Sum of both)
    const totalActivities = myChallengesCount + myEventsCount;

    // Growth check (Activity Growth for challenges)
    const now = new Date();
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthChallenges = await userChallengesCollection.countDocuments({
      userId: email,
      joinDate: { $gte: firstDayCurrentMonth }
    });
    const priorChallenges = myChallengesCount - currentMonthChallenges;
    const activityGrowth = priorChallenges > 0 ? ((currentMonthChallenges / priorChallenges) * 100).toFixed(1) : 0;

    res.json({
      totalActivities,      // Sum
      myChallengesCount,    // Challenges
      myEventsCount,        // Events
      activityGrowth
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// USER DASHBOARD CHARTS
app.get('/api/dashboard/user-charts', async (req, res) => {
  try {
    await connectDB();
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email required' });

    // 1. Monthly Data (Last 6 months) for User
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({
        monthName: d.toLocaleString('default', { month: 'short' }),
        monthIndex: d.getMonth(),
        year: d.getFullYear()
      });
    }

    const monthlyDataPromises = months.map(async (m) => {
      const end = new Date(m.year, m.monthIndex + 1, 0);

      const activityCount = await userChallengesCollection.countDocuments({
        userId: email,
        joinDate: { $lte: end }
      });

      return {
        month: m.monthName,
        activities: activityCount,
        users: 0 // Not relevant for user dashboard
      };
    });

    const monthlyData = await Promise.all(monthlyDataPromises);

    // 2. Category Data (Pie Chart) - Need to join with challenges to get category
    // Using aggregation with lookup
    const categoryAggregation = await userChallengesCollection.aggregate([
      { $match: { userId: email } },
      {
        $lookup: {
          from: 'challenges',
          localField: 'challengeId',
          foreignField: '_id',
          as: 'challengeDetails'
        }
      },
      { $unwind: '$challengeDetails' },
      { $group: { _id: '$challengeDetails.category', count: { $sum: 1 } } }
    ]).toArray();

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
    const categoryData = categoryAggregation.map((cat, index) => ({
      name: cat._id,
      value: cat.count,
      color: COLORS[index % COLORS.length]
    }));

    // 3. Weekly Activity Trend (Last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d);
    }

    const activityDataPromises = last7Days.map(async (date) => {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      const count = await userChallengesCollection.countDocuments({
        userId: email,
        joinDate: { $gte: start, $lte: end }
      });

      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count: count
      };
    });

    const activityData = await Promise.all(activityDataPromises);

    res.json({
      monthlyData,
      categoryData,
      activityData
    });

  } catch (error) {
    console.error("User chart data error:", error);
    res.status(500).json({ message: error.message });
  }
});


if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}


module.exports = app;