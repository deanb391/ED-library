export async function uploadToServer(file: File, folder: string) {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: form,
  });

  if (!res.ok) throw new Error("Upload failed");

  const data = await res.json();
  return data.url as string;
}


export async function fetchDownloadUrl(url: string) {
  const res = await fetch(`/api/upload?url=${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error("Failed to fetch download URL");

  const data = await res.json();

  return data.signedUrl as string;
}