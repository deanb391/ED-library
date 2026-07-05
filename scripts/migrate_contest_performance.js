const { Client, Databases } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID = "69617e75000c6c010a75";
const CONTEST_PERFORMANCE_COLLECTION = "contest_performance";

async function migrate() {
  console.log("Starting migration for contest_performance...");

  try {
    // Add new attributes
    console.log("Adding new attributes...");
    
    await databases.createFloatAttribute(DATABASE_ID, CONTEST_PERFORMANCE_COLLECTION, "acquisitionScore", false, 0, 50, 0);
    await databases.createFloatAttribute(DATABASE_ID, CONTEST_PERFORMANCE_COLLECTION, "engagementScore", false, 0, 40, 0);
    await databases.createFloatAttribute(DATABASE_ID, CONTEST_PERFORMANCE_COLLECTION, "contentScore", false, 0, 10, 0);
    await databases.createStringAttribute(DATABASE_ID, CONTEST_PERFORMANCE_COLLECTION, "engagementActivity", 65535, false, "{}");
    await databases.createStringAttribute(DATABASE_ID, CONTEST_PERFORMANCE_COLLECTION, "dailyCourseRatings", 65535, false, "{}");

    console.log("Waiting for new attributes to be created (this can take a few seconds)...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Remove old attributes
    console.log("Removing old attributes...");
    const oldAttributes = ["coursesPoints", "uploadQuality", "referralClicks", "uploadsCreated"];
    for (const attr of oldAttributes) {
      try {
        await databases.deleteAttribute(DATABASE_ID, CONTEST_PERFORMANCE_COLLECTION, attr);
        console.log(`Deleted attribute: ${attr}`);
      } catch (err) {
        console.log(`Skipped deleting ${attr}: ${err.message}`);
      }
    }

    console.log("Migration complete!");
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

migrate();
