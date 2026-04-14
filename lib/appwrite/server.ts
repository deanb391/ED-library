// lib/appwrite/server.ts

import { Client, Databases } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
//   .setKey(process.env.APPWRITE_API_KEY!); // IMPORTANT

export const databases = new Databases(client);