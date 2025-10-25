import { Component } from '@angular/core';
import { Button } from '../components/button/button'; 

@Component({
  selector: 'app-home-page',
  imports: [Button],
  templateUrl: './home-page.html',
  styleUrls: ['./home-page.scss'], // <-- poprawione
})
export class HomePage {
  onAddTrip(): void { console.log('ADD TRIP'); }
  onSort(): void { console.log('SORT CLICK'); }  
}