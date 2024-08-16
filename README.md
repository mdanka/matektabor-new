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

## Preview

When a pull request is opened, a temporary preview version of the web app is created for testing purposes. This is linked to from the pull request in a comment.

## Deployment

- The web app is automatically deployed using Github Actions when new code is merged into the `main` branch.
- The functions need to be manually deployed from the command line using `firebase`. The functions are only used for the scheduled backups.
