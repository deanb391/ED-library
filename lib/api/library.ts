const jsonHeaders = {
  "Content-Type": "application/json",
};

export async function fetchLibrary(userId: string) {
  const res = await fetch(`/api/library/fetch?userId=${userId}`);
  return res.json();
}

export async function fetchLibraryCourse(userId: string) {
  try {
    const res = await fetch(`/api/library/library-courses?user_id=${encodeURIComponent(userId)}`);

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return Array.isArray(data?.courses) ? data.courses : (Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("fetchLibraryCourse error:", err);
    return [];
  }
}

export async function addCourseToLibrary(userId: string, courseIds: string[], type: string) {
 const res = await fetch("/api/library/add", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({userId, courseIds, type}),
  });

  return res.json();
}

export async function addSubscriptionsCoursesToLibrary(userId: string, courseIds: string[]) {
  const res = await fetch("/api/library/add-subscription", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ userId, courseIds }),
  });

  return res.json();
}