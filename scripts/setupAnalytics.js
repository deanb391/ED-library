const { Client, Databases, Permission, Role } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID = "69617e75000c6c010a75";
const EVENTS_COLLECTION = "analytics_events";
const METRICS_COLLECTION = "analytics_daily_metrics";

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function createCollectionSafe(collectionId, name) {
    try {
        await databases.getCollection(DATABASE_ID, collectionId);
        console.log(`Collection ${collectionId} already exists.`);
    } catch (err) {
        if (err.code === 404) {
            console.log(`Creating collection ${collectionId}...`);
            await databases.createCollection(
                DATABASE_ID,
                collectionId,
                name,
                [
                    Permission.read(Role.any()),
                    Permission.create(Role.users()), // Authenticated users can write events (or maybe just server, let's keep it restricted)
                    Permission.update(Role.users()),
                    Permission.delete(Role.users()),
                ]
            );
            console.log(`Collection ${collectionId} created.`);
        } else {
            throw err;
        }
    }
}

async function setupAnalytics() {
    try {
        // Create Collections
        await createCollectionSafe(EVENTS_COLLECTION, "Analytics Events");
        await createCollectionSafe(METRICS_COLLECTION, "Analytics Daily Metrics");

        // Setup Events Attributes
        console.log("Setting up Events attributes...");
        try { await databases.createStringAttribute(DATABASE_ID, EVENTS_COLLECTION, "eventName", 255, true); } catch (e) { if(e.code !== 409) console.error(e.message); }
        try { await databases.createStringAttribute(DATABASE_ID, EVENTS_COLLECTION, "distinctId", 255, true); } catch (e) { if(e.code !== 409) console.error(e.message); }
        try { await databases.createStringAttribute(DATABASE_ID, EVENTS_COLLECTION, "userId", 255, false); } catch (e) { if(e.code !== 409) console.error(e.message); }
        try { await databases.createStringAttribute(DATABASE_ID, EVENTS_COLLECTION, "metadata", 10000, false); } catch (e) { if(e.code !== 409) console.error(e.message); }
        try { await databases.createFloatAttribute(DATABASE_ID, EVENTS_COLLECTION, "value", false); } catch (e) { if(e.code !== 409) console.error(e.message); }
        
        // Setup Metrics Attributes
        console.log("Setting up Metrics attributes...");
        try { await databases.createStringAttribute(DATABASE_ID, METRICS_COLLECTION, "date", 255, true); } catch (e) { if(e.code !== 409) console.error(e.message); }
        try { await databases.createStringAttribute(DATABASE_ID, METRICS_COLLECTION, "metric", 255, true); } catch (e) { if(e.code !== 409) console.error(e.message); }
        try { await databases.createFloatAttribute(DATABASE_ID, METRICS_COLLECTION, "value", true); } catch (e) { if(e.code !== 409) console.error(e.message); }
        try { await databases.createStringAttribute(DATABASE_ID, METRICS_COLLECTION, "category", 255, false); } catch (e) { if(e.code !== 409) console.error(e.message); }
        try { await databases.createStringAttribute(DATABASE_ID, METRICS_COLLECTION, "dimension", 255, false); } catch (e) { if(e.code !== 409) console.error(e.message); }

        console.log("Waiting for attributes to be available...");
        await sleep(3000);

        // Setup Indexes
        console.log("Setting up Indexes...");
        try { await databases.createIndex(DATABASE_ID, EVENTS_COLLECTION, "idx_event_name", "key", ["eventName"], ["ASC"]); } catch(e) { if(e.code !== 409) console.error(e.message); }
        try { await databases.createIndex(DATABASE_ID, METRICS_COLLECTION, "idx_date_metric", "key", ["date", "metric"], ["ASC", "ASC"]); } catch(e) { if(e.code !== 409) console.error(e.message); }
        try { await databases.createIndex(DATABASE_ID, METRICS_COLLECTION, "idx_metric_date", "key", ["metric", "date"], ["ASC", "DESC"]); } catch(e) { if(e.code !== 409) console.error(e.message); }

        console.log("Setup complete!");
    } catch (err) {
        console.error("Setup failed:", err);
    }
}

setupAnalytics();
