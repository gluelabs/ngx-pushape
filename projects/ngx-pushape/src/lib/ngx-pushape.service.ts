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
  initSimplePushape,
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

  async initializeFirebaseServiveWorker(firebaseApp: firebase.app.App, swPathName = 'firebase-messaging-sw.js') {
    this.swRegistration = await initializeFirebaseServiveWorker(
      firebaseApp,
      (e) => this.swPushEvents$.next(e),
      swPathName,
    );
    return this.swRegistration;
  }

  async askForNotificationPermission(firebaseApp: firebase.app.App, websiteUrl: string) {
    this.pushToken = await askForNotificationPermission(firebaseApp, websiteUrl);
    return this.pushToken;
  }

  clear() {
    this.firebaseApp = undefined;
    this.swRegistration = undefined;
  }

  /** Direct API from JS library */
  initializeFirebase(options: InitFirebaseOptions) {
    return initializeFirebase(options);
  }

  initializeSwListeners(swRegistration: ServiceWorkerRegistration) {
    initializeSwListeners(
      swRegistration,
      (e) => this.swNotificationClickEvent$.next(e),
      (e) => this.swPushapeEvent$.next(e),
    );
  }

  hasNotificationPermission() {
    return hasNotificationPermission();
  }

  registerSimplePushape(options: Partial<InitPushapeOptions>) {
    if (!this.pushToken) {
      throw new Error('Cannot register pushape without a regid (push token)');
    }
    if (!options.id_app) {
      throw new Error('Cannot register pushape without an app id');
    }
    if (!options.internal_id) {
      throw new Error('Cannot register pushape without an internal id');
    }
    if (!options.uuid) {
      throw new Error('Cannot register pushape without an uuid');
    }

    return initSimplePushape({
      id_app: options.id_app,
      regid: options.regid || this.pushToken,
      internal_id: options.internal_id,
      uuid: options.uuid,
      platform: options.platform,
    } as InitPushapeOptions);
  }

  registerPushape(options: InitPushapeOptions, retryOnError = false, retryAfter = 5000) {
    return registerApiPushape(options, retryOnError, retryAfter);
  }

  unregisterPushape(options: RemovePushapeOptions) {
    return unregisterApiPushape(options);
  }
}
