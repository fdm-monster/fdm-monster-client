import { useQuery } from "@tanstack/vue-query";
import { PrinterFileService } from "@/backend";
import { ComputedRef } from "vue";

export const thumbnailQueryKey = "thumbnail";

export const useThumbnailQuery = (
  printerId: ComputedRef<number | undefined>,
  enabled?: boolean
) => {
  return useQuery({
    queryKey: [thumbnailQueryKey, printerId],
    queryFn: async () => {
      if (!printerId.value) return "";
      return PrinterFileService.getThumbnail(printerId.value).then((r) => r.thumbnailBase64 || "");
    },
    enabled: !!printerId && !!enabled,
  });
};
