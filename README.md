# contactapi

An open-source API to save contacts. Send a `POST` with an email and any other
JSON fields you want, and they get saved as-is. Manage them with simple CRUD.

Built with [Hono](https://hono.dev) and deployed on [Vercel](https://vercel.com).

- **Landing page & docs** — [`/`](src/pages/home.ts)
- **Log in** — [`/login`](src/pages/login.ts)
- **Sign up** — [`/signup`](src/pages/signup.ts)
- **LLM-friendly docs** — [`/llms.txt`](src/content/llms.ts)

## API overview

The base URL is `https://contactapi.dev` and every request carries your API key
as a Bearer token:

```
Authorization: Bearer YOUR_KEY
```

| Method   | Path                | Key                   | Description                          |
| -------- | ------------------- | --------------------- | ------------------------------------ |
| `POST`   | `/v1/contacts`      | secret or publishable | Create (or upsert) a contact by email |
| `GET`    | `/v1/contacts`      | secret                | List contacts, paginated              |
| `GET`    | `/v1/contacts/:id`  | secret                | Fetch a single contact                |
| `PATCH`  | `/v1/contacts/:id`  | secret                | Update a contact                      |
| `DELETE` | `/v1/contacts/:id`  | secret                | Delete a contact                      |

Contacts are keyed by email — creating one whose email already exists updates it
in place rather than duplicating it. Full reference lives on the landing page and
in [`/llms.txt`](src/content/llms.ts).

There are two kinds of key:

- `ck_secret_…` — secret key, for your backend. Full access to every endpoint.
- `ck_pub_…` — publishable key, for the browser. Can only create contacts and is
  locked to your domains.

## Development

Prerequisites: [Vercel CLI](https://vercel.com/docs/cli) installed globally.

```bash
npm install
vc dev
open http://localhost:3000
```

## Build

```bash
npm install
vc build
```

## Deploy

```bash
npm install
vc deploy
```

## License

[MIT](LICENSE.md)
