import { Routes } from '@angular/router';

// ====== Strony główne / auth / ustawienia ======
import { HomePage } from './pages/home-page/home-page';
import { Signin } from './auth/signin/signin';
import { Signup } from './auth/signup/signup';
import { Settings } from './pages/settings/settings';

// ====== Plan: sekcje i edycje ======
import { PlanOverview } from './pages/plan-overview/plan-overview';
import { PlanBasicInfo } from './pages/plan-basic-info/plan-basic-info';
import { PlanBasicInfoEdit } from './pages/plan-basic-info-edit/plan-basic-info-edit';
import { PlanBookings } from './pages/plan-bookings/plan-bookings';
import { PlanBookingsEdit } from './pages/plan-bookings-edit/plan-bookings-edit';
import { PlanPlaces } from './pages/plan-places/plan-places';
import { PlanPlacesEdit } from './pages/plan-places-edit/plan-places-edit';
import { PlanRoutes } from './pages/plan-routes/plan-routes';
import { PlanRoutesEdit } from './pages/plan-routes-edit/plan-routes-edit';
import { PlanChecklist } from './pages/plan-checklist/plan-checklist';

export const routes: Routes = [
  // --- Główne ekrany aplikacji ---
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomePage },
  { path: 'signin', component: Signin },
  { path: 'signup', component: Signup },
  { path: 'settings', component: Settings },

  // --- Plan: widoki i edycje ---
  { path: 'plan/overview', component: PlanOverview },
  { path: 'plan/basic-info', component: PlanBasicInfo },
  { path: 'plan/basic-info/edit', component: PlanBasicInfoEdit },
  { path: 'plan/bookings', component: PlanBookings },
  { path: 'plan/bookings/edit', component: PlanBookingsEdit },
  { path: 'plan/places', component: PlanPlaces },
  { path: 'plan/places/edit', component: PlanPlacesEdit },
  { path: 'plan/routes', component: PlanRoutes },
  { path: 'plan/routes/edit', component: PlanRoutesEdit },
  { path: 'plan/checklist', component: PlanChecklist },

  // --- Strona nieznaleziona (404) ---
  { path: '**', redirectTo: 'home' },
];
