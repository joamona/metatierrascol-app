import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'changeBooleanByYesNoPipe',
  standalone: true
})
export class ChangeBooleanByYesNoPipe implements PipeTransform {
  transform(value: boolean | string | number | null, spanish:boolean=false): string {
    if (value == true || value == 'true' || value == 1 || value =='1'){
      if (spanish){
        return 'Sí';
      }else{
        return 'Yes';
      }
    }else{
      if (spanish){
        return 'No';
      }else{
        return 'No';
      }
    }
  }
}
