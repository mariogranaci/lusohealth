export class Appointment {  
    timesTamp: Date | null;
    location: string | null;   
    type: string | null;
    description: string | null; 
    state: string | null;
    duration: number | null;
    idPatient: string | null;
    idProfesional: string | null;
    idService: number | null;

  constructor(timesTamp: Date | null, location: string | null, type: string | null, description: string | null,
    state: string | null, duration: number | null, idPatient: string | null, idProfesional: string | null,
    idService: number | null) {
    this.timesTamp = timesTamp;
    this.location = location;
    this.type = type;
    this.description = description;
    this.state = state;
    this.duration = duration;
    this.idPatient = idPatient;
    this.idProfesional = idProfesional;
    this.idService = idService;
  }
}
