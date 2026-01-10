const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@ecotrack0.zoz8wuc.mongodb.net/?appName=EcoTrack0`;
const client = new MongoClient(uri);

const users = [
    {
        displayName: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        status: 'active',
        joinDate: '2024-01-01',
        totalActivities: 42,
        totalPoints: 1250,
        lastLogin: '2024-01-15',
        photoURL: 'https://picsum.photos/seed/john@example.com/200/200.jpg'
    },
    {
        displayName: 'Jane Smith',
        email: 'jane@example.com',
        role: 'user',
        status: 'active',
        joinDate: '2024-01-05',
        totalActivities: 28,
        totalPoints: 890,
        lastLogin: '2024-01-14',
        photoURL: 'https://picsum.photos/seed/jane@example.com/200/200.jpg'
    },
    {
        displayName: 'Admin User',
        email: 'admin@ecotrack.com',
        role: 'admin',
        status: 'active',
        joinDate: '2023-12-01',
        totalActivities: 156,
        totalPoints: 3450,
        lastLogin: '2024-01-15',
        photoURL: 'https://picsum.photos/seed/admin@ecotrack.com/200/200.jpg'
    },
    {
        displayName: 'Mike Johnson',
        email: 'mike@example.com',
        role: 'user',
        status: 'inactive',
        joinDate: '2024-01-10',
        totalActivities: 5,
        totalPoints: 120,
        lastLogin: '2024-01-12',
        photoURL: 'https://picsum.photos/seed/mike@example.com/200/200.jpg'
    },
    {
        displayName: 'Sarah Wilson',
        email: 'sarah@example.com',
        role: 'user',
        status: 'suspended',
        joinDate: '2023-12-15',
        totalActivities: 89,
        totalPoints: 2340,
        lastLogin: '2024-01-08',
        photoURL: 'https://picsum.photos/seed/sarah@example.com/200/200.jpg'
    }
];

async function run() {
    try {
        await client.connect();
        console.log("Connected correctly to server");

        const db = client.db("ecoTrackDB");
        const col = db.collection("users");

        // Optional: clear existing users to prevent duplicates if running multiple times
        // await col.deleteMany({});

        // Only insert users that don't already exist (by email) to be safe
        let count = 0;
        for (const user of users) {
            const existing = await col.findOne({ email: user.email });
            if (!existing) {
                await col.insertOne({
                    ...user,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                count++;
            }
        }

        console.log(`${count} users inserted successfully!`);

    } catch (err) {
        console.log(err.stack);
    } finally {
        await client.close();
    }
}

run().catch(console.dir);
