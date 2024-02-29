export interface MakeAppointment {
  serviceId: number | null;
  specialtyId: number;
  specialty: string;
  professionalName: string;
  category: string;
  online: boolean;
  presential: boolean;
  home: boolean;
  availability: string[] | null;
}
