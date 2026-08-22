export async function createEarning(data: any) {
  const res = await fetch("/api/earnings/create", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return res.json();
}

export async function fetchContributorEarnings(contributorId: string) {
  const res = await fetch(
    `/api/earnings/fetch?contributorId=${contributorId}`
  );

  return res.json();
}