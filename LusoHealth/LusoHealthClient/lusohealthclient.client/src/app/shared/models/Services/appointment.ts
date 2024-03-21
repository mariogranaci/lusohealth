export class Appointment {
    id: number | null;
    timestamp: Date | null;
    location: string | null;   
    type: string | null;
    description: string | null; 
    state: string | null;
    duration: number | null;
    idPatient: string | null;
    idProfessional: string | null;
    idService: number | null;
    

  constructor(timestamp: Date | null, location: string | null, type: string | null, description: string | null,
    state: string | null, duration: number | null, idPatient: string | null,
    id: number | null, idProfessional: string | null, idService: number | null) {
    this.timestamp = timestamp;
    this.location = location;
    this.type = type;
    this.description = description;
    this.state = state;
    this.duration = duration;
    this.idPatient = idPatient;
    this.idProfessional = idProfessional;
    this.idService = idService;
    this.id = id;
  }
}
