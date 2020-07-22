import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { first } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

import { InitPushapeOptions, NgxPushapeService, RemovePushapeOptions } from 'ngx-pushape';

import { environment } from '../../environments/environment';

const PUSHAPE_OPTIONS_KEY = 'pushape-options';

@Injectable({
  providedIn: 'root',
})
export class PushapeService {

  readonly pushapeId$ = new BehaviorSubject<string | undefined>(undefined);
  readonly pushapeOptions$ = new BehaviorSubject<Partial<InitPushapeOptions>>({
    id_app: environment.pushapeAppId,
    internal_id: 'test-ngx-paolo',
    uuid: uuidv4(),
  });

  hasNotificationEnable = this.ngxPushape.hasNotificationPermission();

  readonly firebaseApp = this.ngxPushape.initializeFirebase({
    appId: environment.appId,
    apiKey: environment.apiKey,
    authDomain: environment.authDomain,
    projectId: environment.projectId,
    messagingSenderId: environment.messagingSenderId,
  });

  get appId() {
    return this.pushapeOptions$.value.id_app;
  }

  get uuid() {
    return this.pushapeOptions$.value.uuid;
  }

  get internalId() {
    return this.pushapeOptions$.value.internal_id;
  }

  constructor(
    private readonly ngxPushape: NgxPushapeService,
  ) {
    console.log('[NgxPushape - Example] Init firebase app \n', this.firebaseApp);

    const localPushapeOptionsString = localStorage.getItem(PUSHAPE_OPTIONS_KEY);
    if (localPushapeOptionsString) {
      const localPushapeOptions: Partial<InitPushapeOptions> = JSON.parse(localPushapeOptionsString);
      this.setPushapeOptions(localPushapeOptions);
    }

    this.init();
  }

  async init() {
    await this.ngxPushape.initializeFirebaseServiveWorker(this.firebaseApp, '/assets/firebase-messaging-sw.js');
    if (this.hasNotificationEnable) {
      this.askForPermissions();
    }
  }

  async askForPermissions() {
    console.log('[NgxPushape - Example] Asking for permissions');

    try {
      await this.ngxPushape.askForNotificationPermission(this.firebaseApp, 'web.it.on2off.coupon');
      console.log('[NgxPushape - Example] Permission successfully granted \n');

      this.hasNotificationEnable = this.ngxPushape.hasNotificationPermission();

      this.ngxPushape.initializeSwListeners();

      const pushapeId = await this.pushapeId$.pipe(first()).toPromise();
      if (!pushapeId) {
        this.registerPushape();
      }
    } catch (e) {
      console.warn('[NgxPushape - Example] Failed grant permission \n', e);
      return;
    }
  }

  async registerPushape() {
    const response = await this.ngxPushape.registerSimplePushape(this.pushapeOptions$.value as InitPushapeOptions);
    this.setPushapeOptions({ platform: response?.pushapeOptions.platform });
    this.setPushapeId(response?.pushapeResponse?.push_id);
  }

  async unregisterPushape() {
    await this.ngxPushape.unregisterPushape(this.pushapeOptions$.value as RemovePushapeOptions);
    this.setPushapeId();
  }

  private setPushapeOptions(options: Partial<InitPushapeOptions>) {
    const oldOptions = this.pushapeOptions$.value;
    if (oldOptions) {
      this.pushapeOptions$.next({ ...oldOptions, ...options });
    } else {
      this.pushapeOptions$.next(options);
    }
    localStorage.setItem(PUSHAPE_OPTIONS_KEY, JSON.stringify(this.pushapeOptions$.value));
  }

  private setPushapeId(id?: string) {
    this.pushapeId$.next(id);
  }
}
