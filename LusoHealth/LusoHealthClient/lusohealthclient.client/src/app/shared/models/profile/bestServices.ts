import { Professional } from "./professional";
export interface BestServices {
  serviceId: number;
  specialtyId: number;
  professionalTypeId: number;
  specialty: string;
  pricePerHour: number;
  professional: Professional;
  rating: number;
}
