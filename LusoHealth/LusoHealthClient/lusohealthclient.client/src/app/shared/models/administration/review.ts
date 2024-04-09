export enum ReviewState {
  Pending = 'Pending',
  Concluded = 'Concluded',
  Cancelled = 'Cancelled'
}

export class Review {
  id: number;
  idPatient: string;
  patientPicture?: string;
  idService: number;
  timestamp: Date;
  state?: ReviewState;
  stars: number;
  description: string;

  constructor(
    id: number,
    idPatient: string,
    idService: number,
    timestamp: Date,
    stars: number,
    description: string,
    state?: ReviewState,
  )
  {
    this.id = id;
    this.idPatient = idPatient;
    this.idService = idService;
    this.timestamp = timestamp;
    this.state = state;
    this.stars = stars;
    this.description = description;
  }
}
