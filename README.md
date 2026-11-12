# Family Cookbook — GitHub + Vercel revision

This replaces Apps Script with a Next.js application deployed from GitHub to Vercel. It **keeps the existing Family Cookbook Google Sheet and Drive folder** as data storage. Do not delete the existing spreadsheet or folders.

## What changed

- **GitHub** stores version-controlled application code.
- **Vercel** hosts the site and Next.js server routes.
- A dedicated **Google Cloud service account** reads/writes only the existing Sheet and Drive folder.
- Family/admin PINs, Google IDs, service-account JSON, and session secret are Vercel environment variables. Never commit them.
- The Apps Script deployment is no longer used after cutover.

## One-time Google Cloud setup

1. In Google Cloud Console, create/select a Cloud project.
2. Enable **Google Sheets API** and **Google Drive API**.
3. Create a service account and create a JSON key for it. Keep the downloaded JSON private.
4. Copy the service account email address.
5. Share the existing **Family Cookbook Data** spreadsheet with that email as **Editor**.
6. Share the existing **Family Cookbook Files** Drive folder with that email as **Editor**.
7. Copy the Sheet ID from its Google Sheets URL and the Drive folder ID from its Drive URL.

The Google Sheet must retain the existing tabs and header rows created by Apps Script:
`Recipes`, `Ingredients`, `Instructions`, `Tags`, and `Import History`.

## GitHub

1. Create a **private** GitHub repository named `family-cookbook`.
2. Extract this package into that repository.
3. Commit and push all files. Confirm `.env.local`, credentials, and service-account JSON are not committed.

## Vercel

1. In Vercel, choose **New Project**, import the private GitHub repository, and keep the detected Next.js preset.
2. In Project Settings > Environment Variables, add each value from `.env.example` for **Production** and **Preview**:
   - `GOOGLE_SERVICE_ACCOUNT_JSON`: the entire one-line contents of the service-account JSON key.
   - `GOOGLE_SHEETS_ID`: existing Family Cookbook Sheet ID.
   - `GOOGLE_DRIVE_FOLDER_ID`: existing Family Cookbook Files folder ID.
   - `FAMILY_PIN`: long shared household secret.
   - `ADMIN_PIN`: different, long owner-only secret.
   - `SESSION_SECRET`: random 32+ character string.
   - `SESSION_VERSION`: `1`.
3. Deploy.

## Cutover test

1. Open the Vercel URL in an incognito window.
2. Sign in using the family PIN.
3. Confirm old recipes appear from the same Sheet.
4. Add a test recipe and verify a new `Recipes` row appears in the existing Sheet.
5. Use RecipeSage JSON-LD import with the admin PIN. Confirm the original JSON is archived in the existing Drive folder.
6. Only after this succeeds, stop sharing the Apps Script web-app URL.

## Security and operations

- The raw PINs live only in Vercel encrypted environment variables, not source code.
- The browser receives an HTTP-only signed session cookie, never a Google credential.
- Updating a secret requires a redeploy. To invalidate all sessions, change `SESSION_VERSION` to the next number and redeploy.
- Any GitHub commit pushed to the production branch deploys automatically once the repository is connected to Vercel.
- This starter deliberately does not put service-account credentials in `NEXT_PUBLIC_*` variables.

## Current scope

Includes family-PIN login, admin-PIN import, recipe list/search/create/edit, RecipeSage JSON-LD preview/import, archive logging to Drive, and import history. It reuses existing data but does not use Apps Script at runtime.
