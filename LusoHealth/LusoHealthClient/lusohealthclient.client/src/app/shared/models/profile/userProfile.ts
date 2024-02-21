export class UserProfile {
  firstName: string | null; 
  lastName: string | null;
  email: string | null;
  nif: string | null;
  telemovel: string | null;
  dataNascimento: Date | null;
  genero: string | null;
  picture: string | null;
  provider: string | null;

  constructor(firstName: string | null, lastName: string | null, email: string | null,
    nif: string | null, telemovel: string | null, dataNascimento: Date | null, genero: string | null, picture: string | null, provider: string | null) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.nif = nif;
    this.telemovel = telemovel;
    this.dataNascimento = dataNascimento;
    this.genero = genero;
    this.picture = picture;
    this.provider = provider;
  }
}
