export interface ActivationCodeVo {
  id: string;
  code: string;
  createTime: string;
  endTime: string;
  activatedUserId: number;
  status: number;
}
