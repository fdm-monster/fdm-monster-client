import { defineStore } from "pinia";
import { DialogName } from "@/components/Generic/Dialogs/dialog.constants";

interface DialogReference<T = any> {
  id: DialogName;
  opened: boolean;
  beforeOpenedCallback?: (input?: T) => void | Promise<void>;
  openedCallback?: (input?: T) => void | Promise<void>;
  context?: any;
  output?: any;
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
    getBeforeOpenedCallback() {
      return (id: DialogName) => this.dialogsById[id]?.beforeOpenedCallback;
    },
    getOpenedCallback() {
      return (id: DialogName) => this.dialogsById[id]?.openedCallback;
    },
    getContext() {
      return (id: DialogName) => {
        return this.dialogsById[id]?.context;
      };
    },
    getOutput() {
      return (id: DialogName) => {
        return this.dialogsById[id]?.output;
      };
    },
    isDialogOpened() {
      return (id: DialogName) => {
        return this.dialogsById[id]?.opened;
      };
    },
  },
  actions: {
    openDialogWithContext<T = any>(id: DialogName, context?: T) {
      let dialog = this.dialogsById[id];
      if (!dialog) {
        dialog = this.registerDialogReference(id);
      }
      dialog.opened = true;
      dialog.context = context;
      // Vue 2 reactivity issue
      this.dialogsById = {
        ...this.dialogsById,
      };
      console.debug(`[Pinia Dialog ${id}] Opened with context`, context);
    },
    closeDialog(id: DialogName, output?: any) {
      let dialog = this.dialogsById[id];
      if (!dialog) {
        dialog = this.registerDialogReference(id);
      }
      dialog.opened = false;
      delete dialog.context;
      dialog.output = output;
      // Vue 2 reactivity issue
      this.dialogsById = {
        ...this.dialogsById,
      };
      console.debug(`[Pinia Dialog ${id}] Closed`);
    },
    unregisterDialogReference(id: DialogName) {
      delete this.dialogsById[id];
      this.ids = this.ids.filter((i) => i !== id);
    },
    registerDialogReference<T = any>(
      id?: DialogName,
      callbacks?: {
        beforeOpenedCallback?: (input?: T) => void;
        openedCallback?: (input?: T) => void;
      }
    ) {
      if (!id) {
        throw new Error("Cannot unregister undefined dialog reference");
      }

      console.debug(`[Pinia Dialog ${id}] Registered`);
      const existingDialog = this.dialogsById[id];
      if (existingDialog) {
        console.debug(`[Pinia Dialog ${id}]  Already registered dialog, not registering again`);
        return existingDialog;
      }

      const dialogRef = {
        id,
        opened: false,
        beforeOpenedCallback: callbacks?.beforeOpenedCallback,
        openedCallback: callbacks?.openedCallback,
      };
      this.dialogsById[id] = dialogRef;
      this.ids.push(id);
      return dialogRef;
    },
  },
});
