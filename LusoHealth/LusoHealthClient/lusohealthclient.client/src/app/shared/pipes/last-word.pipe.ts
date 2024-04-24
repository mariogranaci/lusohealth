import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'lastWord'
})
export class LastWordPipe implements PipeTransform {

  transform(value: string | null): string {
    if (!value) {
      return '';
    }
    const words = value.split(' ');
    return words.length > 0 ? words[words.length - 1] : '';
  }

}
