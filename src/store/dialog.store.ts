import { defineStore } from "pinia";
import { DialogName } from "@/components/Generic/Dialogs/dialog.constants";

interface DialogReference {
  id: DialogName;
  opened: boolean;
  context?: any;
}

export type DialogsById = { [k: string]: DialogReference };

interface State {
  ids: DialogName[];
  dialogsById: DialogsById;
}

export const useDialogsStore = defineStore("Dialog", {
  state: (): State => ({
    ids: [],
    dialogsById: {},
  }),
  getters: {
    dialogs(): DialogReference[] {
      return this.ids.map((i) => this.dialogsById[i]);
    },
    getContext() {
      return (id: DialogName) => {
        return this.dialogsById[id]?.context;
      };
    },
    isDialogOpened() {
      return (id: DialogName) => {
        return this.dialogsById[id]?.opened;
      };
    },
  },
  actions: {
    openDialog(id: DialogName, context?: any) {
      let dialog = this.dialogsById[id];
      if (!dialog) {
        dialog = this.registerDialogReference(id);
      }
      dialog.opened = true;
      dialog.context = context;
      console.log(`[Pinia Dialog ${id}] Opened with context`, context);
    },
    closeDialog(id: DialogName) {
      let dialog = this.dialogsById[id];
      if (!dialog) {
        dialog = this.registerDialogReference(id);
      }
      dialog.opened = false;
      delete dialog.context;
      console.log(`[Pinia Dialog ${id}] Closed`);
    },
    unregisterDialogReference(id: DialogName) {
      delete this.dialogsById[id];
      this.ids = this.ids.filter((i) => i !== id);
    },
    registerDialogReference(id?: DialogName) {
      if (!id) throw new Error("Cannot unregister undefined dialog reference");

      const existingDialog = this.dialogsById[id];
      if (existingDialog) {
        return existingDialog;
      }

      const dialogRef = {
        id,
        opened: false,
      };
      this.dialogsById[id] = dialogRef;
      this.ids.push(id);
      return dialogRef;
    },
  },
});
