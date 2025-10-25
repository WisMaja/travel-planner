import { Routes } from '@angular/router';
import { HomePage } from './pages/home-page/home-page';
import { Signin } from './auth/signin/signin';
import { Settings } from './pages/settings/settings';

export const routes: Routes = [
    {path: '', component: HomePage},
    { path: 'home', component: HomePage },
    { path: 'signin', component: Signin },
    { path: 'settings', component: Settings },
    { path: '**', redirectTo: '' } 
];
