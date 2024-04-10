export class AvailableSlot {
  appointmentType: string | undefined;
  id: number | undefined;
  idService: number | undefined;
  isAvailable: boolean | undefined;
  slotDuration: number | undefined;
  start: Date | undefined;
  appointmentId: number | undefined;

  constructor(appointmentType: string | undefined, id: number | undefined,
    idService: number | undefined, isAvailable: boolean | undefined, slotDuration: number | undefined, start: Date | undefined, appointmentId: number | undefined) {
    this.appointmentType = appointmentType;
    this.id = id;
    this.idService = idService;
    this.isAvailable = isAvailable;
    this.slotDuration = slotDuration;
    this.start = start;
    this.appointmentId = appointmentId;
  }
}
