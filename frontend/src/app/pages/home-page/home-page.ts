import { Component } from '@angular/core';
import { Button } from '../components/button/button'; 
import { Logo } from '../components/logo/logo';
import { SearchBar } from '../components/search-bar/search-bar';
import { TopBar } from '../components/top-bar/top-bar';

@Component({
  selector: 'app-home-page',
  imports: [],//Button, Logo, SearchBar, TopBar],
  templateUrl:'./home-page.html',
  styleUrl: './home-page.scss', 
})
export class HomePage {
  onAddTrip(): void { console.log('ADD TRIP'); }
  onSort(): void { console.log('SORT CLICK'); }  
}