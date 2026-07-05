export async function trackSourceClick(name: string): Promise<boolean> {
  try {
    const res = await fetch("/api/sources/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    return data.success;
  } catch (err) {
    console.error("Error tracking source click", err);
    return false;
  }
}

export async function trackSourceSignup(name: string): Promise<boolean> {
  try {
    const res = await fetch("/api/sources/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    return data.success;
  } catch (err) {
    console.error("Error tracking source signup", err);
    return false;
  }
}

export async function trackSourceContributor(name: string): Promise<boolean> {
  try {
    const res = await fetch("/api/sources/contributor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    return data.success;
  } catch (err) {
    console.error("Error tracking source contributor", err);
    return false;
  }
}
