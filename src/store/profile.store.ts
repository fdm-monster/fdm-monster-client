import { defineStore } from "pinia";
import { UserService } from "@/backend/user.service";

interface State {
  username: string | null;
  isDemoUser: boolean | null;
  userId: string | null;
}

export const useProfileStore = defineStore("profile", {
  state: (): State => ({
    username: null,
    isDemoUser: null,
    userId: null,
  }),
  actions: {
    async getProfile() {
      return await UserService.getProfile().then((response) => {
        this.username = response.username;
        this.userId = response.id;
        this.isDemoUser = response.isDemoUser;
      });
    },
  },
});
