import { RolesObject } from "./roles-object";

export interface RegistryCustomerVo {
  id: string;
  email: string;
  nickName: string;
  status: number;
  roles: Array<RolesObject>;
}
