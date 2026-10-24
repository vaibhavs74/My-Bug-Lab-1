# MyBugLab

A beginner-friendly, local-only web security practice site using Node.js, Express, and MongoDB.

## Included
- Dashboard UI
- Health and lab-info endpoints
- Fictional profile and search demo APIs
- MongoDB-backed practice posts
- Server-side input validation for saved posts
- Local-only bind (`127.0.0.1`)

## Requirements
- Node.js LTS and npm
- MongoDB Community Server running locally (optional for the dashboard; required for saved posts)

## Windows setup
1. Extract the ZIP to a folder such as `C:\Users\<you>\MyBugLab`.
2. Open that folder in VS Code.
3. Open Terminal → New Terminal.
4. Install dependencies:

   ```powershell
   npm install
   ```

5. Start MongoDB Community Server. If installed as a Windows service, check PowerShell:

   ```powershell
   Get-Service MongoDB
   ```

   If it is stopped, run PowerShell as Administrator and use:

   ```powershell
   Start-Service MongoDB
   ```

6. Start MyBugLab:

   ```powershell
   npm start
   ```

7. Open `http://127.0.0.1:3000`.

## Test endpoints
- `GET http://127.0.0.1:3000/api/health`
- `GET http://127.0.0.1:3000/api/lab-info`
- `GET http://127.0.0.1:3000/api/demo/profiles`
- `GET http://127.0.0.1:3000/api/demo/search?q=HTTP`
- `GET http://127.0.0.1:3000/api/posts`
- `POST http://127.0.0.1:3000/api/posts` with JSON such as:

  ```json
  {
    "title": "My first API test",
    "body": "I inspected this request in Burp Suite."
  }
  ```

## MongoDB
The app connects to `mongodb://127.0.0.1:27017` and uses database `mybuglab` by default. Override with environment variables `MONGO_URI` and `DB_NAME` if needed.

## Burp Suite Community
1. Start MyBugLab and keep its terminal open.
2. Open Burp Suite → Proxy → Intercept.
3. Configure your browser to use Burp's local proxy (commonly `127.0.0.1:8080`) or use Burp's built-in browser.
4. Visit `http://127.0.0.1:3000` through that browser.
5. Inspect requests to `/api/health`, `/api/demo/search`, and `/api/posts`.
6. Use Repeater only against your own local lab. Keep this app bound to localhost and don't port-forward it or deploy it publicly.

## Learning note
This starter is intentionally safe-by-default. It is not yet a deliberately vulnerable challenge app: it demonstrates API inspection and input handling. Add vulnerabilities only as clearly labeled, isolated local exercises after the baseline is working. Never test systems without authorization.
