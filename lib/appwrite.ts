// src/lib/appwrite.ts
import { Client, Account, Storage, Databases } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const account = new Account(client);
export const storage = new Storage(client);
export const databases = new Databases(client);


export async function signIn(email: string, password: string) {
  try {
    const session = await account.createEmailPasswordSession(
      email,
      password
    );
    console.log("Session: ", session)
    return session;
  } catch (error) {
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    return await account.get();
  } catch {
    return null;
  }
}