// lib/appwrite/auth.ts
import { Client, Account } from "node-appwrite";

export async function getAuthenticatedUser(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  
  const jwt = authHeader.split(" ")[1];
  
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setJWT(jwt);
    
  const account = new Account(client);
  
  try {
    const user = await account.get();
    return user;
  } catch (error) {
    console.error("JWT Verification failed:", error);
    return null;
  }
}
