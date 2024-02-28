export interface Review {
  idPatient: string;
  patientName: string;
  patientPicture: string | null;
  idService: number;
  serviceName: string;
  stars: number;
  description: string;
}
