export class RegisterWithGoogle {
  firstName: string;
  lastName: string;
  nif: string;
  telemovel: string;
  dataNascimento: Date;
  genero: string;
  tipoUser: string;
  email: string;
  accessToken: string;
  provider: string;
  profilePicPath: string | undefined;
  userId: string;

  constructor(firstName: string, lastName: string, nif: string, telemovel: string, dataNascimento: Date,
    genero: string, tipoUser: string, email: string, accessToken: string, provider: string, profilePicpath: string | undefined, userId: string) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.nif = nif;
    this.telemovel = telemovel;
    this.dataNascimento = dataNascimento;
    this.genero = genero;
    this.tipoUser = tipoUser;
    this.email = email;
    this.accessToken = accessToken;
    this.provider = provider;
    this.profilePicPath = profilePicpath;
    this.userId = userId;
  }
}
