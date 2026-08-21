import { NextRequest, NextResponse } from 'next/server';
import { databases, getUserById } from '@/lib/appwrite/server';
import { fetchContributorService } from '@/lib/services/contributors.service';

const DATABASE_ID = '69617e75000c6c010a75';
const THREADS_COLLECTION = 'threads';

export async function GET(req: NextRequest) {
  try {
    const threadId = req.nextUrl.searchParams.get('threadId');
    if (!threadId) return NextResponse.json({ error: 'Missing threadId' }, { status: 400 });

    const doc = await databases.getDocument(DATABASE_ID, THREADS_COLLECTION, threadId);

    let posterDetails: any = null;
    if (doc.isPosterAContributor) {
      try {
         const contributor = await fetchContributorService(doc.posterId);
         posterDetails = { name: contributor.username, avatar: contributor.profileImage, isContributor: true };
      } catch(e) {}
    } else {
      try {
         const user = await getUserById(doc.posterId);
         posterDetails = { name: user?.username || 'User', avatar: user?.avatar || '', isContributor: false };
      } catch(e) {}
    }
    
    let likesArray = [];
    if (doc.likes) {
      try { likesArray = JSON.parse(doc.likes); } catch(e) {}
    }

    const thread = { ...doc, posterDetails, likesArray };
    return NextResponse.json({ thread });
  } catch (err) {
    console.error('Fetch single thread failed:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
