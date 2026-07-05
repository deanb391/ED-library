const { Client, Databases, Query } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID = "69617e75000c6c010a75";
const CONTEST_PERFORMANCE_COLLECTION = "contest_performance";

async function fix() {
  console.log("Fixing relationship arrays in contest_performance...");
  try {
    const res = await databases.listDocuments(DATABASE_ID, CONTEST_PERFORMANCE_COLLECTION, [Query.limit(500)]);
    for (const doc of res.documents) {
      if (Array.isArray(doc.contributors) && doc.contributors.length > 0) {
        console.log(`Fixing doc ${doc.$id}`);
        try {
          await databases.updateDocument(DATABASE_ID, CONTEST_PERFORMANCE_COLLECTION, doc.$id, {
            contributors: doc.contributors[0].$id || doc.contributors[0]
          });
        } catch(e) {
          console.error(`Failed to update doc ${doc.$id}`, e.message);
        }
      } else if (doc.contributors && typeof doc.contributors === "object" && !Array.isArray(doc.contributors)) {
         // It's a single object, maybe update to string?
         console.log(`Doc ${doc.$id} has object, updating to string ID`);
         try {
          await databases.updateDocument(DATABASE_ID, CONTEST_PERFORMANCE_COLLECTION, doc.$id, {
            contributors: doc.contributors.$id
          });
         } catch(e) {
           console.error(`Failed to update doc ${doc.$id}`, e.message);
         }
      }
    }
  } catch (err) {
    console.error(err);
  }
  console.log("Done!");
}

fix();
