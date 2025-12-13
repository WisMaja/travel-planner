import { Routes } from '@angular/router';

// ====== Strony główne / auth / ustawienia ======
import { HomePage } from './pages/home-page/home-page';
import { Signin } from './auth/signin/signin';
import { Signup } from './auth/signup/signup';
import { Settings } from './pages/settings/settings';
import { FindPlaces } from './pages/components/maps/find-places/find-places';
import { MapTest } from './pages/map-test/map-test';

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

// ====== Guards ======
import { authGuard, loginGuard } from './guards/auth.guard';

export const routes: Routes = [
  // --- Strony autoryzacji (dostępne tylko dla niezalogowanych) ---
  { path: '', redirectTo: 'signin', pathMatch: 'full' },
  { path: 'signin', component: Signin, data: { animation: 'SigninPage' }, canActivate: [loginGuard] },
  { path: 'signup', component: Signup, data: { animation: 'SignupPage' }, canActivate: [loginGuard] },
  
  // --- Główne ekrany aplikacji (wymagają logowania) ---
  { path: 'home', component: HomePage, data: { animation: 'HomePage' }, canActivate: [authGuard] },
  { path: 'find-places', component: FindPlaces, data: { animation: 'FindPlacesPage' }, canActivate: [authGuard] },
  { path: 'map-test', component: MapTest, canActivate: [authGuard] },
  { path: 'settings', component: Settings, canActivate: [authGuard] },

  // --- Plan: widoki i edycje (wymagają logowania) ---
  { path: 'plan/overview', component: PlanOverview, canActivate: [authGuard] },
  { path: 'plan/basic-info', component: PlanBasicInfo, canActivate: [authGuard] },
  { path: 'plan/basic-info/edit', component: PlanBasicInfoEdit, canActivate: [authGuard] },
  { path: 'plan/bookings', component: PlanBookings, canActivate: [authGuard] },
  { path: 'plan/bookings/edit', component: PlanBookingsEdit, canActivate: [authGuard] },
  { path: 'plan/places', component: PlanPlaces, canActivate: [authGuard] },
  { path: 'plan/places/edit', component: PlanPlacesEdit, canActivate: [authGuard] },
  { path: 'plan/routes', component: PlanRoutes, canActivate: [authGuard] },
  { path: 'plan/routes/edit', component: PlanRoutesEdit, canActivate: [authGuard] },
  { path: 'plan/checklist', component: PlanChecklist, canActivate: [authGuard] },

  // --- Strona nieznaleziona (404) ---
  { path: '**', redirectTo: 'signin' },
];
