import { useDialogsStore } from "@/store/dialog.store";
import { DialogName } from "@/components/Generic/Dialogs/dialog.constants";
import { watchEffect } from "vue";

export function useDialog<T = any, O = any>(dialogId: DialogName) {
  const dialogStore = useDialogsStore();

  async function openDialog(context?: T) {
    const beforeOpenedCallback = dialogStore.getBeforeOpenedCallback(dialogId);
    if (beforeOpenedCallback) {
      await beforeOpenedCallback(context);
    }

    dialogStore.openDialogWithContext(dialogId, context);

    const openedCallback = dialogStore.getOpenedCallback(dialogId);
    if (openedCallback) {
      await openedCallback(context);
    }
  }

  return {
    dialogId,
    dialogStore,
    openDialog,
    context: () => dialogStore.getContext(dialogId),
    closeDialog: (output?: O) => dialogStore.closeDialog(dialogId, output),
    isDialogOpened: () => dialogStore.isDialogOpened(dialogId),
    handleAsync: async (input: T): Promise<O> => {
      await openDialog(input);

      return new Promise<O>((resolve) => {
        watchEffect(() => {
          if (!dialogStore.isDialogOpened(dialogId)) {
            resolve(dialogStore.getOutput(dialogId));
          }
        });
      });
    },
  };
}
