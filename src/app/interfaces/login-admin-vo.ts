import { RolesObject } from "./roles-object";

export interface LoginAdminVo {
  id: string;
  email: string;
  status: number;
  roles: Array<RolesObject>;
}
