// src/lib/appwrite.ts
import { Client, Account, Storage, Databases, ID, Avatars, OAuthProvider } from "appwrite";
// @ts-ignore: 'expo-web-browser' may not be installed in this environment


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

    // Create wallet for the new user
    const { createWalletService } = await import('./wallet.service');
    await createWalletService(userAccount.$id);

    return userDoc;
  } catch (error) {
    throw error;
  }
}


export async function updateUser({
  userId,
  lastTime
}: {
  userId: string,
  lastTime: Date
}) {

  return databases.updateDocument(
    DATABASE_ID,
    USER_COLLECTION,
    userId,
    {
      lastTime: lastTime
    }
  )

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
      // 4. If document doesn't exist, return null (don't create)
      return null;
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


export async function sendPasswordRecovery(email: string) {
  const redirectUrl = `${window.location.origin}/reset-password`;

  return account.createRecovery(email, redirectUrl);
}

export async function completePasswordRecovery(
  userId: string,
  secret: string,
  password: string
) {
  return account.updateRecovery(userId, secret, password);
}



// export const googleSignIn = async () => {
//   try {
//     const redirectUrl = "https://cca59d659739.ngrok-free.app";

//     const response = await account.createOAuth2Token(
//       OAuthProvider.Google,
//       redirectUrl,
//       redirectUrl
//     );

//     // Appwrite gives you a URL
//     const authUrl = response.toString();

//     // Redirect the browser
//     window.location.href = authUrl;

//   } catch (error) {
//     console.error("Error during Google sign-in:", error);
//     throw error;
//   }
// };

export async function googleSignIn() {
  try {
    const redirectUrl = `https://www.ed-library.app/auth/callback`;

    const response = await account.createOAuth2Token(
      OAuthProvider.Google,
      redirectUrl,
      redirectUrl
    );

    // Redirect manually
    if (!response) {
  throw new Error("OAuth URL was not returned");
}

window.location.href = response;

  } catch (error) {
    console.error("Error during Google sign-in:", error);
    throw error;
  }
}



export async function handleOAuthSignIn(userId: string, secret: string) {
  // 1. Create session
  await account.createSession(userId, secret);

  // 2. Get auth user
  const authUser = await account.get();

  // 3. Check if profile exists
  try {
    await databases.getDocument(
      DATABASE_ID,
      USER_COLLECTION,
      authUser.$id
    );

    return {
      status: "EXISTS",
      user: authUser,
    };
  } catch {
    return {
      status: "NEW",
      user: authUser,
    };
  }
}



export async function createUserProfile(authUser: any, data: {
  username: string;
  level: number;
  department: string;
}) {
  const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    data.username
  )}&background=random&color=fff`;

  const userDoc = await databases.createDocument(
    DATABASE_ID,
    USER_COLLECTION,
    authUser.$id,
    {
      username: data.username,
      email: authUser.email,
      level: data.level,
      department: data.department,
      avatar,
      isAdmin: false,
    }
  );

  const { createWalletService } = await import('./wallet.service');
  await createWalletService(authUser.$id);

  return userDoc;
}
