import { defineStore } from "pinia";

interface State {
  gridEditMode: boolean;
}
export const useGridStore = defineStore("GridStore", {
  state: (): State => ({
    gridEditMode: false,
  }),
});
