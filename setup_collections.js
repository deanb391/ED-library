const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '../ed-library/.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = '69617e75000c6c010a75';

async function setup() {
  try {
    console.log('Creating communities collection...');
    const commColl = await databases.createCollection(DATABASE_ID, 'communities', 'Communities');
    await databases.createStringAttribute(DATABASE_ID, commColl.$id, 'contributorId', 255, true);
    console.log('Communities collection created.');
    
    console.log('Creating threads collection...');
    const threadColl = await databases.createCollection(DATABASE_ID, 'threads', 'Threads');
    await databases.createStringAttribute(DATABASE_ID, threadColl.$id, 'communityId', 255, true);
    await databases.createStringAttribute(DATABASE_ID, threadColl.$id, 'posterId', 255, true);
    await databases.createBooleanAttribute(DATABASE_ID, threadColl.$id, 'isPosterAContributor', true);
    await databases.createStringAttribute(DATABASE_ID, threadColl.$id, 'content', 65535, true);
    await databases.createStringAttribute(DATABASE_ID, threadColl.$id, 'mediaUrl', 2048, false);
    await databases.createStringAttribute(DATABASE_ID, threadColl.$id, 'mediaType', 50, false);
    console.log('Threads collection created.');
    
    console.log('Setup complete!');
  } catch(e) {
    console.error(e);
  }
}
setup();
