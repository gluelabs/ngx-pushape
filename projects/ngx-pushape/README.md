# NgxPushape ![npm-publish](https://github.com/gluelabs/ngx-pushape/workflows/npm-publish/badge.svg) ![build](https://github.com/gluelabs/ngx-pushape/workflows/build/badge.svg)


> Project is the library used to integrate Pushape back end in an Angular project.

In order to use it you need to get Pushape account: https://glue-labs.com/pushape-invio-notifiche-push-ios-android-api-sdk

Browser support: https://caniuse.com/#feat=push-api

---

## Getting Started

### Installation

Run:

- `npm i ngx-pushape`
- `npm i pushape-js firebase browser-detect` (peer dependencies required)

### How to use it

**Configure service worker**

- create a file in the project `src/assets` directory call: `firebase-messaging-sw.js`
- copy the code below
- replace the Firebase info placeholder with yours

```JS
// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/6.0.4/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/6.0.4/firebase-messaging.js');

console.log('[NgxPushape - SW] Init');

firebase.initializeApp({
  appId: '<appId>',
  apiKey: '<apiKey>',
  authDomain: '<authDomain>',
  projectId: '<projectId>',
  messagingSenderId: '<senderId>',
});

if (firebase.messaging.isSupported()) {
  const messaging = firebase.messaging();

  /**
   * This will be triggered only if push payload will be missing notification property
   */
  messaging.setBackgroundMessageHandler((ev) => {
    console.log('[NgxPushape - SW] Handling background message', ev);
    showMessage(ev);
  });
} else {
  console.warn('[NgxPushape - SW] Firebase messaging does not supported');
}

self.addEventListener('push', function (event) {
  console.log('[NgxPushape - SW] Receive push event', event);
})

self.addEventListener('notificationclick', function (event) {
  console.log('[NgxPushape - SW] Click on notification', event);

  event.notification.close();

  // This looks to see if the current is already open and focuses if it is
  event.waitUntil(clients.matchAll({
    type: 'window',
  }).then(function (clientList) {
    for (let i = 0; i < clientList.length; i++) {
      const client = clientList[i];
      if (client.url == '/' && 'focus' in client) {
        return client.focus();
      }
    }

    if (clients.openWindow) {
      return clients.openWindow('/');
    }
  }));
});

/**
 *
 * @param {PushEvent} payload
 */
const showMessage = function (payload) {
  console.log('[NgxPushape - SW] Handling  message', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon,
    image: payload.notification.image,
    click_action: payload.notification.click_action,
    data: payload.notification.data,
    need_interaction: true,
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
}
```

**Use lib**

In `app.module.ts`:

```TS
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxPushapeModule } from 'ngx-pushape'; // add this line

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxPushapeModule, // add this line
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

**NOTE: This is a small example used to show how call functions from the library.**
**Check the [example app](https://github.com/gluelabs/ngx-pushape/tree/master/projects/example) for a more correct flow.**

**NOTE: This service generate a random UUID in order to indentify the device and than store it in the local storage.**
**You can implement your own solution for store pushape info.**

```TS
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
```

---

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.1.11.

## Code scaffolding

Run `ng generate component component-name --project ngx-pushape` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module --project ngx-pushape`.
> Note: Don't forget to add `--project ngx-pushape` or else it will be added to the default project in your `angular.json` file. 

## Build

Run `ng build ngx-pushape` to build the project. The build artifacts will be stored in the `dist/` directory.

## Publishing

After building your library with `ng build ngx-pushape`, go to the dist folder `cd dist/ngx-pushape` and run `npm publish`.

## Running unit tests

Run `ng test ngx-pushape` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
