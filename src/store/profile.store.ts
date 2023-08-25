import { defineStore } from "pinia";
import { AxiosError } from "axios";
import { UserService } from "@/backend/user.service";

interface State {
  username: string | null;
}

export const useProfileStore = defineStore("profile", {
  state: (): State => ({
    username: null,
  }),
  actions: {
    async getProfile() {
      return await UserService.getProfile()
        .then((response) => {
          this.username = response.username;
        })
        .catch((e: AxiosError) => {
          console.log("getProfile: failed to get profile", e.code);
        });
    },
  },
});
