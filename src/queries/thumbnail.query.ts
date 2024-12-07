import { useQuery } from "@tanstack/vue-query";
import { PrinterFileService } from "@/backend";
import { IdType } from "@/utils/id.type";
import { ComputedRef } from "vue";

export const thumbnailQueryKey = "thumbnail";

export const useThumbnailQuery = (
  printerId: ComputedRef<IdType | undefined>,
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
