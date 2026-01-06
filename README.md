# CursedPhone

## Setup

### Prereqs

- Node.js 12.x (the project expects the version in `.nvmrc`)
- A Firebase project with Firestore + Storage enabled

On macOS, the `canvas` dependency also needs native libraries (via Homebrew):

```bash
brew install pkg-config pixman cairo pango libpng jpeg giflib librsvg
```

### Environment variables

1. Copy the example env file:

```bash
cp .env.example .env.local
```

2. Fill in Firebase values (used client-side):

- `NEXT_PUBLIC_APIKEY`
- `NEXT_PUBLIC_AUTHDOMAIN`
- `NEXT_PUBLIC_DATABASEURL`
- `NEXT_PUBLIC_PROJECTID`
- `NEXT_PUBLIC_STORAGEBUCKET`
- `NEXT_PUBLIC_MESSAGINGSENDERID`
- `NEXT_PUBLIC_APPID`
- `NEXT_PUBLIC_MEASUREMENTID`

3. (Optional) Configure the server-side image transform API:

- `CURSEDPHONE_TRANSFORM_API_URL` (POST endpoint)
- `CURSEDPHONE_TRANSFORM_API_KEY` (optional Bearer token)

If `CURSEDPHONE_TRANSFORM_API_URL` is not set, drawings are uploaded unchanged.

## Development

```bash
nvm install
nvm use
npm i
npm run dev
```
