export class Availability {
  startDate: Date | null;
  endDate: Date | null;
  startTime: Date | null;
  endTime: Date | null;
  serviceId: number | null;
  slotDuration: number | null;
  type: string | null;
  id: number | null;

  constructor(
    startDate: Date | null,
    endDate: Date | null,
    startTime: Date | null,
    endTime: Date | null,
    serviceId: number | null,
    slotDuration: number | null,
    type: string | null,
    id: number | null
  ) {
    this.startDate = startDate;
    this.endDate = endDate;
    this.startTime = startTime;
    this.endTime = endTime;
    this.serviceId = serviceId;
    this.slotDuration = slotDuration;
    this.type = type;
    this.id = id;
  }
}
