export class Relative {
  id: number | null;
  nome: string;
  nif: string | null;
  dataNascimento: Date;
  genero: string;
  localizacao: string | null;

  constructor(id: number | null, nome: string, nif: string | null,
    dataNascimento: Date , genero: string, localizacao: string | null,) {
    this.id = id;
    this.nome = nome;
    this.genero = genero;
    this.nif = nif;
    this.localizacao = localizacao;
    this.dataNascimento = dataNascimento;
  }
}
