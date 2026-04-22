const jsonHeaders = {
  "Content-Type": "application/json",
};

export async function fetchLibrary(userId: string) {
  const res = await fetch(`/api/library/fetch?userId=${userId}`);
  return res.json();
}

export async function addCourseToLibrary(userId: string, courseIds: string[], type: string) {
 const res = await fetch("/api/library/add", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({userId, courseIds, type}),
  });

  return res.json();
}