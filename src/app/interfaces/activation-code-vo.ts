export interface ActivationCodeVo {
  id: string;
  code: string;
  status: number;
  startTime: string;
  endTime: string;
  ownerUserId: string;
  activatedUserId: string;
}
