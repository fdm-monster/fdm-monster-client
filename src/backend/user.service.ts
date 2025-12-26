import { ServerApi } from "@/backend/server.api";
import { BaseService } from "@/backend/base.service";
import { Role, User } from "@/models/user.model";

export interface ICreateUser {
  username: string;
  password: string;
  roles: string[];
}

export class UserService extends BaseService {
  static async createUser(data: ICreateUser) {
    const path = ServerApi.userRoute;

    await this.post(path, data);
  }

  static async listUsers() {
    const path = ServerApi.userRoute;

    return await this.get<User[]>(path);
  }

  static async listRoles() {
    const path = ServerApi.rolesRoute;

    return await this.get<Role[]>(path);
  }

  static async getProfile() {
    const path = ServerApi.userProfileRoute;
    return await this.get<User>(path);
  }

  static async changePassword(id: number, oldPassword: string, newPassword: string) {
    const path = ServerApi.userChangePasswordRoute(id);
    return await this.post(path, { oldPassword, newPassword });
  }

  static async changeUsername(id: number, username: string) {
    const path = ServerApi.userChangeUsernameRoute(id);
    return await this.post(path, { username });
  }

  static async deleteUser(id: number) {
    const path = ServerApi.userDeleteRoute(id);
    return await this.delete(path);
  }

  static async setUserVerified(id: number, isVerified: boolean) {
    const path = ServerApi.userSetVerifiedRoute(id);
    return await this.post(path, { isVerified });
  }

  static async setRootUser(id: number, isRootUser: boolean) {
    const path = ServerApi.userSetRootUserRoute(id);
    return await this.post(path, { isRootUser });
  }

  static async setUserRoles(id: number, roles: string[]) {
    const path = ServerApi.userSetUserRolesRoute(id);
    return await this.post(path, { roles });
  }
}
