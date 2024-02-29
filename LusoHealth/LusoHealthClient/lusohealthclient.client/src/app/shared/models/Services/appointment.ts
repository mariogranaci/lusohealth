export interface Appointment {
   
    timesTamp: Date;
    location: string;   
    type: string;
    description: string; 
    state: string;
    duration: number;
		idPatient : string;
    idProfesional: string;
}
