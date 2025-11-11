import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { trigger, transition, style, query, animate, group } from '@angular/animations';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  animations: [
    trigger('routeAnimations', [
      transition('SigninPage => SignupPage, SignupPage => SigninPage', [
        style({ position: 'relative' }),
        query(':enter, :leave', [
          style({
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          })
        ]),
        query(':enter', [
          style({ opacity: 0 })
        ]),
        query(':leave', [
          style({ opacity: 1 })
        ]),
        group([
          query(':leave', [
            animate('300ms ease-out', style({ opacity: 0 }))
          ]),
          query(':enter', [
            animate('300ms ease-in', style({ opacity: 1 }))
          ])
        ])
      ]),
      transition('* => SigninPage, * => SignupPage', [
        style({ position: 'relative' }),
        query(':enter, :leave', [
          style({
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          })
        ]),
        query(':enter', [
          style({ opacity: 0 })
        ]),
        group([
          query(':enter', [
            animate('300ms ease-in', style({ opacity: 1 }))
          ])
        ])
      ])
    ])
  ]
})
export class App {
  protected readonly title = signal('frontend');

  prepareRoute(outlet: RouterOutlet): string {
    return outlet?.activatedRouteData?.['animation'] || '';
  }
}
