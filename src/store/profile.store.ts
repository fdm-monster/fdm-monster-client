import { defineStore } from "pinia";
import { UserService } from "@/backend/user.service";

interface State {
  username: string | null;
  userId: string | null;
}

export const useProfileStore = defineStore("profile", {
  state: (): State => ({
    username: null,
    userId: null,
  }),
  actions: {
    async getProfile() {
      return await UserService.getProfile().then((response) => {
        this.username = response.username;
        this.userId = response.id;
      });
    },
  },
});
