import { Injectable } from '@angular/core';
import firebase from 'firebase/app';
import {
  askForNotificationPermission,
  hasNotificationPermission,
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
  /**
   * Permision token is the value to use in order to receiver push notification.
   * This token is implicit used by firebase inside the service worker.
   * We need to send it to the Pushape service in order to correctly subscribe to it.
   */
  pushToken?: string;

  readonly swPushEvents$ = new Subject<Event>();
  readonly swPushapeEvent$ = new Subject<MessageEvent>();
  readonly swNotificationClickEvent$ = new Subject<MessageEvent>();

  constructor() {
  }

  async init(
    firebaseOptions: InitFirebaseOptions,
    websiteUrl: string,
  ) {
    this.firebaseApp = this.initializeFirebase(firebaseOptions);
    this.swRegistration = await this.initializeFirebaseServiveWorker(this.firebaseApp);
    this.pushToken = await askForNotificationPermission(this.firebaseApp, websiteUrl);

    initializeSwListeners(
      this.swRegistration,
      (e) => this.swNotificationClickEvent$.next(e),
      (e) => this.swPushapeEvent$.next(e),
    );

    return this.firebaseApp;
  }

  clear() {
    this.firebaseApp = undefined;
    this.swRegistration = undefined;
  }

  /** Direct API from JS library */
  initializeFirebase(options: InitFirebaseOptions) {
    return initializeFirebase(options);
  }

  async initializeFirebaseServiveWorker(firebaseApp: firebase.app.App) {
    this.swRegistration = await initializeFirebaseServiveWorker(
      firebaseApp,
      (e) => this.swPushEvents$.next(e),
    );
    return this.swRegistration;
  }

  initializeSwListeners(swRegistration: ServiceWorkerRegistration) {
    initializeSwListeners(
      swRegistration,
      (e) => this.swNotificationClickEvent$.next(e),
      (e) => this.swPushapeEvent$.next(e),
    );
  }

  async askForNotificationPermission(firebaseApp: firebase.app.App, websiteUrl: string) {
    this.pushToken = await askForNotificationPermission(firebaseApp, websiteUrl);
    return this.pushToken;
  }

  hasNotificationPermission() {
    return hasNotificationPermission();
  }

  registerPushape(options: InitPushapeOptions, retryOnError = false, retryAfter = 5000) {
    return registerApiPushape(options, retryOnError, retryAfter);
  }

  unregisterPushape(options: RemovePushapeOptions) {
    return unregisterApiPushape(options);
  }
}
