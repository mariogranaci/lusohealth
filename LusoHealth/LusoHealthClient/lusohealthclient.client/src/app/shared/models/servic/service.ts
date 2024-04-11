import { Professional } from "../profile/professional";

export interface Service {
  serviceId: number | null;
  specialtyId: number;
  specialty: string | null;
  pricePerHour: number;
  online: boolean;
  presential: boolean;
  home: boolean;
  professional: Professional;
}
