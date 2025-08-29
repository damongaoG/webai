import { PermissionsObject } from "./permissions-object";

export interface RolesObject {
  id: string;
  role: string;
  description: string;
  status: number;
  weight: number;
  scopeId: number;
  permissions: Array<PermissionsObject>;
}
