export async function fetchLibrary(userId: string) {
  const res = await fetch(`/api/library/fetch?userId=${userId}`);
  return res.json();
}