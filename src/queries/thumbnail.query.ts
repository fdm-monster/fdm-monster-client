import { useQuery } from "@tanstack/vue-query";
import { PrinterFileService } from "@/backend";
import { IdType } from "@/utils/id.type";

export const thumbnailQueryKey = "thumbnail";

export const useThumbnailQuery = (printerId?: IdType, enabled?: boolean) =>
  useQuery({
    queryKey: [thumbnailQueryKey, printerId],
    queryFn: async () => {
      if (!printerId) return "";
      return PrinterFileService.getThumbnail(printerId).then((r) => r.thumbnailBase64 || "");
    },
    enabled: !!printerId && !!enabled,
  });
