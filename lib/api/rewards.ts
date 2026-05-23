// lib/api/rewards.ts — Client-side API for rewards (streak, leaderboard, top contributor)

const jsonHeaders = { "Content-Type": "application/json" };

// --- Streak ---

export type StreakData = {
  contributorId: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastUploadDate: string;
  streakHistory: string[];
  joinedDate: string;
};

export async function fetchStreak(contributorId: string): Promise<StreakData | null> {
  const res = await fetch(`/api/rewards/streak?contributorId=${encodeURIComponent(contributorId)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.streak;
}

// --- Leaderboard ---

export type LeaderboardEntry = {
  rank: number;
  contributorId: string;
  username: string;
  profileImage: string;
  institution: string;
  uploadCount: number;
  isTopContributor: boolean;
};

export async function fetchLeaderboard(
  limit = 50,
  offset = 0
): Promise<LeaderboardEntry[]> {
  const res = await fetch(
    `/api/rewards/leaderboard?limit=${limit}&offset=${offset}`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.entries || [];
}

export async function fetchContributorRank(
  contributorId: string
): Promise<{ rank: number | null; uploadCount: number }> {
  const res = await fetch(
    `/api/rewards/leaderboard/rank?contributorId=${encodeURIComponent(contributorId)}`
  );
  if (!res.ok) return { rank: null, uploadCount: 0 };
  return res.json();
}

// --- Top Contributor ---

export type WeeklyAward = {
  id: string;
  contributorId: string;
  contributorName: string;
  contributorImage: string;
  weekStart: string;
  weekEnd: string;
  weeklyUploads: number;
  totalUploads: number;
  awardedAt: string;
};

export async function fetchTopContributor(): Promise<WeeklyAward | null> {
  const res = await fetch("/api/rewards/top-contributor");
  if (!res.ok) return null;
  const data = await res.json();
  return data.award;
}
