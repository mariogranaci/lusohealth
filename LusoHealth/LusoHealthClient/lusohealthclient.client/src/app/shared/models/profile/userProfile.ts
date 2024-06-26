export class UserProfile {
  id: string | null;
  firstName: string | null; 
  lastName: string | null;
  email: string | null;
  nif: string | null;
  telemovel: string | null;
  dataNascimento: Date | null;
  genero: string | null;
  picture: string | null;
  provider: string | null;

  constructor(id: string | null, firstName: string | null, lastName: string | null, email: string | null,
    nif: string | null, telemovel: string | null, dataNascimento: Date | null, genero: string | null, picture: string | null, provider: string | null) {
    this.id = id;
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
