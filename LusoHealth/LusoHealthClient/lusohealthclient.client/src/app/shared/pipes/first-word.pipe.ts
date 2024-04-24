import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'firstWord'
})
export class FirstWordPipe implements PipeTransform {

  transform(value: string | null): string {
    if (!value) {
      return '';
    }
    // Divide a string em palavras e retorna a primeira
    return value.split(' ')[0];
  }

}
