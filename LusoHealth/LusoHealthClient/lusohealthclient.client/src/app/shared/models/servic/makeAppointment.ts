export interface MakeAppointment {
  serviceId: number | null;
  specialtyId: number;
  specialty: string;
  professionalName: string;
  category: string;
  online: boolean;
  presential: boolean;
  home: boolean;
  pricePerHour: number;
  availability: string[] | null;
  professionalId: string | null;
}
