export interface RegistryCustomerDto {
  username: string;
  password: string;
  nickName?: string;
  invitationCode: string;
  roleIds: string[];
}
