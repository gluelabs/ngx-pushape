import { Injectable } from '@angular/core';
import {
  askForPermissions,
  InitFirebaseOptions,
  initializeFirebase,
  initializeFirebaseServiveWorker,
  initializeSwListeners,
  InitPushapeOptions,
  registerApiPushape,
  RemovePushapeOptions,
  unregisterApiPushape,
} from 'pushape-js';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NgxPushapeService {

  firebaseApp?: firebase.app.App;
  swRegistration?: ServiceWorkerRegistration;
  permissionToken?: string | false; // FIXME: Next release will remove `false` type

  readonly swPushEvents$ = new Subject<Event>();
  readonly swPushapeEvent$ = new Subject<MessageEvent>();
  readonly swNotificationClickEvent$ = new Subject<MessageEvent>();

  constructor() {
  }

  async init(
    firebaseOptions: InitFirebaseOptions,
    websiteUrl: string,
  ) {
    this.firebaseApp = initializeFirebase(firebaseOptions);

    this.swRegistration = await initializeFirebaseServiveWorker(
      this.firebaseApp,
      (e) => this.swPushEvents$.next(e) as undefined, // FIXME: Next release will remove `undefined` return type and propagate void
    );
    this.permissionToken = await askForPermissions(this.firebaseApp, websiteUrl);

    initializeSwListeners(
      this.swRegistration,
      // FIXME: Next release will remove `undefined` return type and propagate void
      (e) => this.swNotificationClickEvent$.next(e) as undefined,
      (e) => this.swPushapeEvent$.next(e) as undefined,
    );
  }

  clear() {
    this.firebaseApp = undefined;
    this.swRegistration = undefined;
  }

  /** Direct API from JS library */

  registerPushape(options: InitPushapeOptions, retryOnError = false, retryAfter = 5000) {
    return registerApiPushape(options, retryOnError, retryAfter);
  }

  unregisterPushape(options: RemovePushapeOptions) {
    return unregisterApiPushape(options);
  }
}
