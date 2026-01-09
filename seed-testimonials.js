const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Environmental Enthusiast',
    content: 'EcoTrack has completely changed how I approach sustainability. I love seeing my impact grow every day!',
    rating: 5,
    avatar: '👩‍🌾',
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Mike Chen',
    role: 'Community Leader',
    content: 'The challenges feature keeps our community engaged and motivated to make a real difference together.',
    rating: 5,
    avatar: '👨‍💼',
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Emma Davis',
    role: 'Student',
    content: 'Perfect for tracking my environmental footprint and learning new ways to be eco-friendly every day.',
    rating: 5,
    avatar: '👩‍🎓',
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Alex Rodriguez',
    role: 'Urban Planner',
    content: 'As a planner, I appreciate how EcoTrack helps communities visualize their collective environmental impact.',
    rating: 5,
    avatar: '👨‍💻',
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Lisa Thompson',
    role: 'Teacher',
    content: 'I use EcoTrack in my classroom to teach students about sustainability. It\'s engaging and educational!',
    rating: 5,
    avatar: '👩‍🏫',
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'David Kim',
    role: 'Small Business Owner',
    content: 'EcoTrack helped my business reduce waste and save money while being more environmentally conscious.',
    rating: 4,
    avatar: '👨‍🔧',
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Maria Garcia',
    role: 'Environmental Scientist',
    content: 'The data and insights from EcoTrack are invaluable for understanding personal environmental impact.',
    rating: 5,
    avatar: '👩‍🔬',
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'James Wilson',
    role: 'Fitness Coach',
    content: 'I love how EcoTrack combines health and environmental goals. It\'s a win-win for people and planet!',
    rating: 5,
    avatar: '👨‍🏃',
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedTestimonials() {
  const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@ecotrack0.zoz8wuc.mongodb.net/?appName=EcoTrack0`;
  
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB!");

    const database = client.db("ecoTrackDB");
    const testimonialsCollection = database.collection("testimonials");

    // Clear existing testimonials
    await testimonialsCollection.deleteMany({});
    console.log("🗑️ Cleared existing testimonials");

    // Insert new testimonials
    const result = await testimonialsCollection.insertMany(testimonials);
    console.log(`✅ Inserted ${result.insertedCount} testimonials`);

    // Verify insertion
    const count = await testimonialsCollection.countDocuments();
    console.log(`📊 Total testimonials in database: ${count}`);

    console.log("🎉 Testimonials seeded successfully!");

  } catch (error) {
    console.error('❌ Error seeding testimonials:', error);
  } finally {
    await client.close();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the seed function
seedTestimonials();
