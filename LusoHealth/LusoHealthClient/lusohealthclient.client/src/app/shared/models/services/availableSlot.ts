export class AvailableSlot {
  appointmentType: number | undefined;
  id: number | undefined;
  idService: number | undefined;
  isAvailable: boolean | undefined;
  slotDuration: number | undefined;
  start: Date | undefined;

  constructor(appointmentType: number | undefined, id: number | undefined,
    idService: number | undefined, isAvailable: boolean | undefined, slotDuration: number | undefined, start: Date | undefined) {
    this.appointmentType = appointmentType;
    this.id = id;
    this.idService = idService;
    this.isAvailable = isAvailable;
    this.slotDuration = slotDuration;
    this.start = start;
  }
}
