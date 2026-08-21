const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);
const databases = new Databases(client);
const DATABASE_ID = '69617e75000c6c010a75';
async function getColl() {
  const attrs = await databases.listAttributes(DATABASE_ID, 'threads');
  console.log(attrs.attributes.map(a => ${a.key}:  (size: , array: )).join('\n'));
}
getColl();
