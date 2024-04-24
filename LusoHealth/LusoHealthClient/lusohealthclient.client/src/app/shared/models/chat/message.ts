export interface Message {
  id: number | null;
  userId: string | null;
  text: string | null;
  isImage: boolean | null;
  imageUrl: string | null;
  timestamp: Date | null;
  chatId: number | null;
}
