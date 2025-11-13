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
  
}

run().catch(console.dir);



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});