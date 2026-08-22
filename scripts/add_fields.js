const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const dbId = "69617e75000c6c010a75";
const colId = "contest_performance";

async function addFields() {
    try {
        console.log("Adding Prize attribute...");
        await databases.createFloatAttribute(dbId, colId, 'Prize', false, 0);
        console.log("Prize added.");
    } catch(e) {
        console.log("Error adding Prize:", e.message);
    }
    
    try {
        console.log("Adding isTop3Contributor attribute...");
        await databases.createBooleanAttribute(dbId, colId, 'isTop3Contributor', false, false);
        console.log("isTop3Contributor added.");
    } catch(e) {
        console.log("Error adding isTop3Contributor:", e.message);
    }
}

addFields();
