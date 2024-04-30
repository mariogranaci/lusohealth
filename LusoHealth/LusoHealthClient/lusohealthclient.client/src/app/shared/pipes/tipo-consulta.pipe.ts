import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tipoConsulta'
})
export class TipoConsultaPipe implements PipeTransform {

  transform(value: string | undefined | null): string | undefined | null {
    switch (value) {
      case 'Home':
        return 'Domiciliar';
      case 'Presential':
        return 'Presencial';
      default:
        return value; // Ou você pode retornar um valor padrão ou lançar um erro se preferir
    }
  }

}
