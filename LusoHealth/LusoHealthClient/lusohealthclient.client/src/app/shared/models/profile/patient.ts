import { Relative } from "./relative";
import { UserProfile } from "./userProfile";

export interface Patient {
  userId: string | undefined;
  user: UserProfile | undefined;
  familtyMembers: Relative[] | undefined;
}
