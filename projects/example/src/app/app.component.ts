import { Component } from '@angular/core';
import { map } from 'rxjs/operators';

import { PushapeService } from './services/pushape.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  readonly isPushapeSubscribe$ = this.pushapeService.pushapeId$;
  readonly pushapeIdLabel$ = this.pushapeService.pushapeId$.pipe(map((id) => id || 'No pushape id found'));

  hasNotificationEnable = this.pushapeService.hasNotificationEnable;

  constructor(
    readonly pushapeService: PushapeService,
  ) {
  }

  async askNotificationPermissionHandler() {
    await this.pushapeService.askForPermissions();
    this.hasNotificationEnable = this.pushapeService.hasNotificationEnable;
  }

  registerPushapeHandler() {
    this.pushapeService.registerPushape();
  }

  unregisterPushapeHandler() {
    this.pushapeService.unregisterPushape();
  }
}
