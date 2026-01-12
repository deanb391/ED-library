// src/lib/appwrite.ts
import { Client, Account, Storage, Databases, ID, Avatars } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const account = new Account(client);
export const storage = new Storage(client);
export const databases = new Databases(client);

const avatars = new Avatars(client);



const DATABASE_ID = "69617e75000c6c010a75";
const USER_COLLECTION = "user";

function generateAvatar(username: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    username
  )}&background=random&color=fff`;
}

export async function createUser({
  email,
  password,
  username,
  level,
  department,
}: {
  email: string;
  password: string;
  username: string;
  level: number;
  department: string;
}) {
  try {
    // 1. Create auth account
    const userAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    // 2. Create session immediately
    await account.createEmailPasswordSession(email, password);

    // 3. Create user document
    const avatar = avatars.getInitials(username);


    const userDoc = await databases.createDocument(
      DATABASE_ID,
      USER_COLLECTION,
      userAccount.$id, // IMPORTANT: same ID
      {
        username,
        email,
        level,
        department,
        avatar,
        isAdmin: false,
      }
    );

    return userDoc;
  } catch (error) {
    throw error;
  }
}



export async function getCurrentUser() {
  try {
    // 1. Check session
    const session = await account.getSession("current");

    if (!session) return null;

    // 2. Get auth user
    const authUser = await account.get();

    // 3. Try to get user document
    try {
      const userDoc = await databases.getDocument(
        DATABASE_ID,
        USER_COLLECTION,
        authUser.$id
      );

      return userDoc;
    } catch {
      // 4. If document doesn't exist, create it
      const avatar = generateAvatar(authUser.name || "User");

      const newUserDoc = await databases.createDocument(
        DATABASE_ID,
        USER_COLLECTION,
        authUser.$id,
        {
          username: authUser.name,
          email: authUser.email,
          level: null,
          department: null,
          avatar,
          isAdmin: false,
        }
      );

      return newUserDoc;
    }
  } catch {
    return null;
  }
}


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