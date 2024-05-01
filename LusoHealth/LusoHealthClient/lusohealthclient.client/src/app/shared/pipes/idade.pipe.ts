import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'idade'
})
export class IdadePipe implements PipeTransform {

  transform(birthdate: Date | string | null | undefined): string {
    if (!birthdate) {
      return 'Não foi possível obter a idade';
    }

    let birthDate = new Date(birthdate);
    let today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    let m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age + ' anos';
  }

}
