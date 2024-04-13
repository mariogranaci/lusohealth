import { Message } from "./message";

export interface Chat {
  id: number | null;
  appointmentId: number | null;
  isActive: boolean | null;
  messages: Message[] | null;
}
