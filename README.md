# Gobinda Jewellers

A jewellery storefront for browsing Gobinda Jewellers' gold and silver collection, viewing current metal rates, and contacting the store.

**Live site:** [gobindajewellry.vercel.app](https://gobindajewellry.vercel.app)

## Storefront features

- Browse jewellery by category, metal, and audience.
- View product photos and details in an image gallery.
- Share links to individual jewellery pieces.
- See current gold and silver rates.
- Contact the store through WhatsApp.
- Install the storefront as a progressive web app on supported devices.
- Manage jewellery, categories, rates, and storefront imagery through the protected studio tools.

## Tech stack

- React 19 and TypeScript
- TanStack Start and TanStack Router
- Vite
- Tailwind CSS 4
- PostgreSQL for storefront data
- Better Auth for protected studio access

## Run locally

Requirements: Node.js 22 or newer and npm.

~~~sh
npm install
npm run dev
~~~

The development server starts at [http://localhost:8080](http://localhost:8080).

## Common commands

~~~sh
npm run build       # Build the app and run database migrations
npm run preview     # Preview the production build
npm run typecheck   # Check TypeScript types
npm run lint        # Run ESLint
npm test            # Run the test suite
~~~

## Configuration

The storefront uses PostgreSQL-backed data, authentication for studio management, and object storage for uploaded jewellery images. Configure the required database, authentication, and storage settings in your deployment environment before deploying. Do not commit secrets to the repository.

## Deployment

The production storefront is deployed on Vercel. Set the required environment variables and database connection in the Vercel project, then deploy the main branch.
