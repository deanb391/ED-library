import { NextRequest, NextResponse } from 'next/server';
import { fetchCommunityByContributorService, createCommunityService } from '@/lib/services/communities.service';

export async function GET(req: NextRequest) {
  try {
    const contributorId = req.nextUrl.searchParams.get('contributorId');
    if (!contributorId) return NextResponse.json({ error: 'Missing contributorId' }, { status: 400 });

    let community = await fetchCommunityByContributorService(contributorId);
    if (!community) {
      community = await createCommunityService(contributorId);
    }

    return NextResponse.json({ community });
  } catch (err) {
    console.error('Fetch community failed:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
