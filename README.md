# NgxPushape

> Project contained the library used to integrate Pushape back end in an Angular project.

In order to use it you need to get Pushape account: https://glue-labs.com/pushape-invio-notifiche-push-ios-android-api-sdk

Browser support: https://caniuse.com/#feat=push-api

---

## Example

In order to run the example use `ng serve example`.

Before start the app, you need to populate `projects/example/firebase-messaging-sw.js` and `projects/example/src/environments` with your Firebase credentials.

---

## Repository branch model

The project use [Gitflow](https://datasift.github.io/gitflow/IntroducingGitFlow.html) as branching model.

---

## Commit convention

The project use Angular commit convention:

- https://www.conventionalcommits.org/en/v1.0.0-beta.2/
- https://gist.github.com/stephenparish/9941e89d80e2bc58a153

This convention is enforce by some git pre-hook.

You could make a traditional commit following the syntax rules or use `npm run commit` that help you to construct the commit message in the right way.