import { getBaseUri } from "@/shared/http-client";

export function downloadFileByBlob(data: ArrayBuffer, fileName: string) {
  if (!data) {
    throw new Error("No data to download");
  }
  const blob = new Blob([data], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
}

export async function downloadFileByUrl(url: string, fileName: string) {
  const apiBase = await getBaseUri();
  const isAbsolute = url.indexOf("http://") === 0 || url.indexOf("https://") === 0;
  const finalUrl = isAbsolute ? url : `${apiBase}/${url}`;
  const link = document.createElement("a");
  link.href = finalUrl;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
}
