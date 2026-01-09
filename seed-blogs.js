const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const blogs = [
  {
    title: '10 Simple Ways to Reduce Your Carbon Footprint Today',
    excerpt: 'Discover easy and practical steps you can take right now to make a positive impact on the environment.',
    content: `In today's world, taking care of our planet is more important than ever. Climate change is real, and every small action counts. Here are 10 simple ways you can reduce your carbon footprint starting today:

1. **Use Reusable Bags**: Switch from plastic bags to reusable shopping bags. Keep them in your car or by the door so you never forget them.

2. **Reduce Meat Consumption**: Try Meatless Mondays or reduce meat intake to 2-3 times per week. The meat industry has a significant carbon footprint.

3. **Use Public Transport**: Whenever possible, use buses, trains, or carpool instead of driving alone.

4. **Switch to LED Bulbs**: LED bulbs use 75% less energy than traditional incandescent bulbs.

5. **Unplug Devices**: Unplug electronics when not in use or use power strips to easily turn off multiple devices.

6. **Buy Local**: Support local farmers and reduce transportation emissions by buying locally grown food.

7. **Reduce Water Usage**: Take shorter showers, fix leaks, and use water-efficient appliances.

8. **Compost**: Start composting your food waste instead of sending it to landfills.

9. **Use Renewable Energy**: If possible, switch to a green energy provider or install solar panels.

10. **Plant Trees**: Trees absorb CO2 and provide oxygen. Plant trees in your yard or support reforestation efforts.

Remember, every small action adds up to make a big difference!`,
    author: 'Sarah Green',
    category: 'Sustainability',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb869d09?ixlib=rb-4.0.3',
    readTime: 5,
    featured: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    views: 1250,
    likes: 89,
    comments: []
  },
  {
    title: 'The Future of Renewable Energy: What to Expect in 2024',
    excerpt: 'Explore the latest innovations and trends in renewable energy that are shaping our sustainable future.',
    content: `Renewable energy is rapidly evolving, with new technologies and breakthroughs happening every day. Let's explore what's coming in 2024 and beyond.

**Solar Power Innovations**
- Perovskite solar cells are becoming more efficient and cheaper to produce
- Building-integrated photovoltaics (BIPV) are turning windows and walls into power generators
- Floating solar farms are being deployed on reservoirs and lakes

**Wind Energy Advances**
- Offshore wind turbines are getting bigger and more efficient
- Vertical axis wind turbines are becoming popular for urban environments
- Wind-solar hybrid systems are providing more consistent power generation

**Energy Storage Solutions**
- Battery costs continue to drop, making storage more accessible
- Grid-scale battery projects are being deployed worldwide
- New battery chemistries offer better performance and sustainability

**Smart Grid Technology**
- AI-powered grid management is optimizing energy distribution
- Demand response systems are helping balance supply and demand
- Microgrids are increasing energy resilience

**Policy and Investment**
- Governments worldwide are increasing renewable energy targets
- Corporate renewable energy procurement is on the rise
- Green financing is making projects more accessible

The future of renewable energy is bright, with continued innovation driving down costs and increasing efficiency.`,
    author: 'Mike Chen',
    category: 'Renewable Energy',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3',
    readTime: 7,
    featured: false,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
    views: 980,
    likes: 67,
    comments: []
  },
  {
    title: 'Urban Gardening: Growing Food in Small Spaces',
    excerpt: 'Learn how to start your own urban garden and grow fresh food even with limited space.',
    content: `Living in a city doesn't mean you can't grow your own food. Urban gardening is becoming increasingly popular as people seek to connect with their food sources and reduce their environmental impact.

**Getting Started with Urban Gardening**

**Assess Your Space**
- Balconies, rooftops, windowsills, and even small yards can be productive
- Consider vertical gardening to maximize space
- Look into community garden plots in your area

**Choose the Right Plants**
- Start with easy-to-grow vegetables like lettuce, radishes, and herbs
- Consider dwarf varieties designed for container growing
- Choose plants that suit your light conditions

**Container Gardening Tips**
- Use containers with drainage holes
- Choose quality potting mix
- Water regularly but don't overwater
- Fertilize according to plant needs

**Vertical Gardening Solutions**
- Wall-mounted planters
- Trellises for climbing plants
- Hanging baskets and tiered planters
- DIY pallet gardens

**Indoor Gardening**
- Grow lights for year-round production
- Windowsill herb gardens
- Microgreens and sprouts
- Hydroponic systems

**Community Benefits**
- Connect with neighbors through community gardens
- Share knowledge and surplus harvests
- Create green spaces that benefit everyone

Urban gardening not only provides fresh food but also reduces transportation emissions, improves air quality, and creates beautiful green spaces in our cities.`,
    author: 'Emma Davis',
    category: 'Eco-Tips',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3',
    readTime: 4,
    featured: false,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    views: 756,
    likes: 45,
    comments: []
  },
  {
    title: 'Climate Change: Understanding the Science Behind Global Warming',
    excerpt: 'A comprehensive look at the scientific evidence for climate change and what it means for our future.',
    content: `Climate change is one of the most pressing issues of our time. Understanding the science behind it is crucial for taking meaningful action.

**The Greenhouse Effect**
The Earth's atmosphere contains greenhouse gases like CO2, methane, and water vapor. These gases trap heat from the sun, keeping our planet warm enough to support life. However, human activities are increasing the concentration of these gases, enhancing the greenhouse effect.

**Human Contributions**
- Burning fossil fuels releases CO2 and other greenhouse gases
- Deforestation reduces the Earth's ability to absorb CO2
- Agriculture produces methane and nitrous oxide
- Industrial processes release various greenhouse gases

**Scientific Evidence**
- Global temperatures have risen about 1.1°C since pre-industrial times
- Ocean temperatures are increasing, leading to coral bleaching
- Ice caps and glaciers are melting at alarming rates
- Sea levels are rising due to thermal expansion and melting ice
- Extreme weather events are becoming more frequent and severe

**Future Projections**
- Without significant action, temperatures could rise 3-4°C by 2100
- Sea levels could rise 1-2 meters, threatening coastal cities
- Food and water security will be increasingly threatened
- Biodiversity loss could accelerate dramatically

**Solutions**
- Rapid transition to renewable energy
- Improved energy efficiency
- Sustainable agriculture and forestry
- Carbon capture technologies
- International cooperation and policy changes

The science is clear: climate change is real, human-caused, and requires urgent action. Understanding the science helps us make informed decisions and support effective solutions.`,
    author: 'Dr. James Wilson',
    category: 'Climate Change',
    image: 'https://images.unsplash.com/photo-1569397954089-a9e3e4e1e4f4?ixlib=rb-4.0.3',
    readTime: 10,
    featured: false,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08'),
    views: 1450,
    likes: 112,
    comments: []
  },
  {
    title: 'Wildlife Conservation: Protecting Endangered Species',
    excerpt: 'Discover the challenges and successes in wildlife conservation efforts around the world.',
    content: `Wildlife conservation is critical for maintaining biodiversity and ecosystem health. Endangered species face numerous threats, but dedicated conservation efforts are making a difference.

**Major Threats to Wildlife**
- Habitat loss and fragmentation
- Climate change and extreme weather
- Pollution and environmental contamination
- Poaching and illegal wildlife trade
- Invasive species and disease
- Human-wildlife conflict

**Conservation Success Stories**
- Giant pandas moved from endangered to vulnerable status
- Bald eagle populations recovered after DDT ban
- Sea turtle conservation programs showing success
- Wolf reintroduction programs restoring ecosystems
- Coral reef restoration projects making progress

**Conservation Strategies**
- Protected areas and national parks
- Habitat restoration and connectivity
- Captive breeding and reintroduction programs
- Anti-poaching patrols and law enforcement
- Community-based conservation initiatives
- Scientific research and monitoring

**How You Can Help**
- Support conservation organizations
- Reduce your environmental impact
- Choose sustainable products
- Advocate for wildlife protection policies
- Volunteer for conservation projects
- Educate others about wildlife conservation

**The Future of Conservation**
- Climate-resilient conservation planning
- Technology-assisted monitoring and protection
- Innovative funding mechanisms
- Greater community involvement
- International cooperation and agreements

Wildlife conservation is a global challenge that requires local action. Every species plays a vital role in ecosystem health, and protecting them is essential for our own survival.`,
    author: 'Lisa Anderson',
    category: 'Wildlife',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3',
    readTime: 6,
    featured: false,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
    views: 890,
    likes: 78,
    comments: []
  },
  {
    title: 'The Ultimate Guide to Recycling: Do\'s and Don\'ts',
    excerpt: 'Everything you need to know about recycling properly and making a real environmental impact.',
    content: `Recycling is one of the easiest ways to reduce your environmental footprint, but many people do it incorrectly. Here's your comprehensive guide to recycling right.

**What CAN Be Recycled**

**Paper Products**
- Newspapers, magazines, and office paper
- Cardboard boxes (flattened)
- Paper bags and cardboard tubes
- Junk mail and envelopes

**Plastics**
- Check the number inside the recycling symbol
- Generally safe: #1 (PETE), #2 (HDPE)
- Always check local guidelines as they vary

**Metal**
- Aluminum cans and foil
- Steel and tin cans
- Empty aerosol cans

**Glass**
- Glass bottles and jars
- Clear, brown, green, and blue glass

**What CAN'T Be Recycled**

**Common Mistakes**
- Plastic bags (return to grocery store collection bins)
- Pizza boxes with grease stains
- Broken glass or ceramics
- Light bulbs and electronics
- Batteries (special disposal required)
- Food-soiled paper products

**Recycling Best Practices**

**Clean and Dry**
- Rinse containers to remove food residue
- Let items dry completely before recycling

**Sort Correctly**
- Follow your local recycling guidelines
- Don't "wishcycle" - if unsure, throw it out
- Keep materials loose in bins (no plastic bags)

**Reduce and Reuse First**
- Remember: Reduce > Reuse > Recycle
- Choose products with minimal packaging
- Buy in bulk when possible
- Reuse containers and bags

**Beyond Basic Recycling**
- Compost organic waste
- Properly dispose of hazardous materials
- Recycle electronics through e-waste programs
- Participate in community recycling events

**The Impact**
- Recycling one ton of paper saves 17 trees
- Recycling aluminum saves 95% of energy needed for new production
- Proper recycling reduces landfill waste and conserves resources

Proper recycling takes a little effort but makes a big difference for our planet.`,
    author: 'Tom Roberts',
    category: 'Recycling',
    image: 'https://images.unsplash.com/photo-1559028012-c72a70b1c546?ixlib=rb-4.0.3',
    readTime: 8,
    featured: false,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
    views: 1100,
    likes: 95,
    comments: []
  }
];

async function seedBlogs() {
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
    const blogsCollection = database.collection("blogs");

    // Clear existing blogs
    await blogsCollection.deleteMany({});
    console.log("🗑️ Cleared existing blogs");

    // Insert new blogs
    const result = await blogsCollection.insertMany(blogs);
    console.log(`✅ Inserted ${result.insertedCount} blogs`);

    // Verify insertion
    const count = await blogsCollection.countDocuments();
    console.log(`📊 Total blogs in database: ${count}`);

    console.log("🎉 Blogs seeded successfully!");

  } catch (error) {
    console.error('❌ Error seeding blogs:', error);
  } finally {
    await client.close();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the seed function
seedBlogs();
