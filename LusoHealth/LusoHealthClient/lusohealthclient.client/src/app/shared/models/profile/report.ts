export enum ReportState {
  Pending = 'Pending',
  Concluded = 'Concluded',
  Cancelled = 'Cancelled'
}

export class Report {
  id: number | null;
  timestamp: Date | null;
  idPatient: string | null;
  idProfesional: string | null;
  description: string | null;
  state: ReportState | null;

  constructor(
    id: number | null,
    timestamp: Date | null,
    idPatient: string | null,
    idProfesional: string | null,
    description: string | null,
    state: ReportState | null
  ) {
    this.id = id;
    this.timestamp = timestamp;
    this.idPatient = idPatient;
    this.idProfesional = idProfesional;
    this.description = description;
    this.state = state;
  }
}
