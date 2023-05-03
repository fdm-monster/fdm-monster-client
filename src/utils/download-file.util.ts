import { apiBase } from "../backend/base.service";

export function downloadFileByBlob(data: ArrayBuffer, fileName: string) {
  const blob = new Blob([data], { type: "text" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
}

export async function downloadFileByUrl(url: string, fileName: string) {
  const isAbsolute = url.indexOf("http://") === 0 || url.indexOf("https://") === 0;
  const finalUrl = isAbsolute ? url : `${apiBase}/${url}`;
  const link = document.createElement("a");
  link.href = finalUrl;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
}
