import { ServerApi } from "@/backend/server.api";
import { BaseService } from "@/backend/base.service";
import { Role, User } from "@/models/user.model";

export class UserService extends BaseService {
  static async listUsers() {
    const path = ServerApi.userRoute;

    return await this.getApi<User[]>(path);
  }

  static async listRoles() {
    const path = ServerApi.rolesRoute;

    return await this.getApi<Role[]>(path);
  }

  static async getProfile() {
    const path = ServerApi.userProfileRoute;
    return await this.getApi<User>(path);
  }

  static async changePassword(id: string, oldPassword: string, newPassword: string) {
    const path = ServerApi.userChangePasswordRoute(id);
    return await this.postApi(path, { oldPassword, newPassword });
  }

  static async changeUsername(id: string, username: string) {
    const path = ServerApi.userChangeUsernameRoute(id);
    return await this.postApi(path, { username });
  }

  static async deleteUser(id: string) {
    const path = ServerApi.userDeleteRoute(id);
    return await this.deleteApi(path);
  }

  static async setUserVerified(id: string, isVerified: boolean) {
    const path = ServerApi.userSetVerifiedRoute(id);
    return await this.postApi(path, { isVerified });
  }

  static async setRootUser(id: string, isRootUser: boolean) {
    const path = ServerApi.userSetRootUserRoute(id);
    return await this.postApi(path, { isRootUser });
  }
}
