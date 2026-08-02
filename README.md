# Matektábor App

## Copyright

This work is not licensed - all rights are reserved.

## Data backup

Monthly backups are created automatically using GCP's Cloud Scheduler and a backend function. The backups are saved to Cloud Storage.

To trigger a new backup, open Cloud Scheduler in the GCP Console and click on Run Now or an equivalent button.

# Development

This project is built on [Vite](https://vitejs.dev/).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Run `yarn start` to start the Firebase Emulators AND to start the Vite webserver with HMR (Hot Module Replacement), meaning that the page will automatically update as you make edits. Use the URL created by Vite (something like `http://localhost:5173/`) for viewing the page with HMR.

The Firebase Emulators are important because this will set up a local Firestore instance with a local database. This means that you can freely test the app's functions without affecting the production database. The local database uses a snapshot of the database but with all names changed to protect personal information.

### `yarn build`

Builds the app for production to the `dist` folder.

### `yarn lint`

Runs ESLint. Make sure you fix linting errors because this is a required check before merging a pull request.

### `yarn add-viewer`

Grants someone access to the app by adding their email address to the viewers list (the `admin/roles` document in Firestore). This is what the Firestore security rules check, matched against the verified email of the signed-in Google account, so the address has to be the one they sign in with.

The script is a dry run by default — it prints what it would change and writes nothing:

```bash
yarn add-viewer --email someone@example.com
```

Add `--commit` to actually write. Writing to production additionally needs `--confirm-prod`, and then asks you to retype the email address to confirm:

```bash
yarn add-viewer --email someone@example.com --commit --confirm-prod
```

To try it against the local emulator instead (start it with `yarn start` first):

```bash
yarn add-viewer --email someone@example.com --target emulator --commit
```

Adding an email that is already on the list does nothing, so it is safe to re-run.

Production access uses your gcloud Application Default Credentials — run `gcloud auth application-default login` if the script reports a credentials error. The emulator needs no credentials.

## Preview

When a pull request is opened, a temporary preview version of the web app is created for testing purposes. This is linked to from the pull request in a comment.

## Deployment

- The web app is automatically deployed using Github Actions when new code is merged into the `main` branch.
- The functions need to be manually deployed from the command line using `firebase`. The functions are only used for the scheduled backups.
