import { useDialogsStore } from "@/store/dialog.store";
import { DialogName } from "@/components/Generic/Dialogs/dialog.constants";

export function useDialog(dialogId: DialogName) {
  const dialogStore = useDialogsStore();
  return {
    dialogId,
    dialogStore,
    openDialog: (context?: any) => dialogStore.openDialog(dialogId, context),
    context: () => dialogStore.getContext(dialogId),
    closeDialog: () => dialogStore.closeDialog(dialogId),
    isDialogOpened: () => dialogStore.isDialogOpened(dialogId),
  };
}
