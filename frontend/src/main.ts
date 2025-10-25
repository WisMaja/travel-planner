// ...existing code...
import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { appConfig } from './app/app.config';
import { LucideAngularModule, Search, Plus, LogIn } from 'lucide-angular';
import { App } from './app/app';

const lucideProviders = importProvidersFrom(LucideAngularModule.pick({ Search, Plus, LogIn }));

bootstrapApplication(App, {
  ...appConfig,
  providers: [
    ...(appConfig?.providers ?? []),
    lucideProviders
  ]
})
  .catch((err) => console.error(err));
