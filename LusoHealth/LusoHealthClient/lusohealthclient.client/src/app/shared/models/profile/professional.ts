import { Certificate } from "./certificate";
import { Review } from "./review";
import { Service } from "./service";
import { UserProfile } from "./userProfile";

export interface Professional {
  professionalInfo: UserProfile;
  services: Service[];
  certificates: Certificate[];
  reviews: Review[];
  location: string | null;
  address: string | null;
  description: string | null;
  professionalType: string;
  concelho: string | undefined;
  averageStars: number | undefined;
}
