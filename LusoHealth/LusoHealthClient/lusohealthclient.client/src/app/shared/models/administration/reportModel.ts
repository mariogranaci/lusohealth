export enum reportState {
  Pending = 'Pending',
  Concluded = 'Concluded',
  Cancel = 'Cancel'
}

export class reportModel {
  id?: number;
  timestamp: Date;
  banTime: Date;
  idPatient: string;
  idProfesional: string;
  description: string;
  state?: reportState;

  constructor(
    timestamp: Date,
    banTime: Date,
    idPatient: string,
    idProfesional: string,
    description: string,
    state?: reportState,
    id?: number
  ) {
    this.id = id;
    this.timestamp = timestamp;
    this.banTime = banTime;
    this.idPatient = idPatient;
    this.idProfesional = idProfesional;
    this.description = description;
    this.state = state;
  }
}
