# Culturous Exchange

[Culturous Exchange](https://www.culturous.org)'s mission is to provide teenagers from around the world the opportunity to exchange culture, build meaningful connections, and develop compassion through virtual cultural exchange.  

## Introduction

This project aims to develop a matching tool that automate team matching based on applicants’ availability and nationality through a streamlined, web-based solution. It addresses key pain points for facilitators who manually group up to 70 applicants while trying to balance diversity and scheduling compatibility.  The tool will increase efficiency, support scalability, and standardize the process, enabling greater impact in fostering cross-cultural communication and compassion among global teenagers.

## Technology Stack

**Frontend:** TypeScript, React, Material UI  
**Hosting:** Firebase  
**Database:** Supabase  
**Build tool:** Vite  
**Authentication:** Supabase/Google OAuth

## Prerequisites

- **[Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) version 18.x** to ensure compatibility with the Supabase CLI
- **npm** (comes with Node.js)

## Installation

1. Clone the repository:  
   ```
   git clone https://github.com/digitalaidseattle/culturous-exchange.git
   ```
2. Navigate to the project directory:  
   ```
   cd culturous-exchange
   ```  
3. Install dependencies:  
   ```
   npm install
   ```

## Setting Up Environment Variables

### Production:
1. Copy .env.example to .env (for production) in the root directory if it doesn't exist:
   ```
   cp .env.example .env
   ```
2. Add the following keys:
    ```
    VITE_SUPABASE_URL=https://your-project.supabase.co
    VITE_SUPABASE_ANON_KEY=your-public-anon-key
    
    VITE_IPGEOLOCATION_KEY=your-ipgeolocation-api-key

    SUPABASE_GOOGLE_CLIENT_ID=your-google-client-id
    SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=your-google-client-secret
    ```

## Running The Application:

1. Start the development server:
   ```
   npm run dev
   ```
2. Open http://localhost:3000 to view the app.

## (Optional) Setting Up Local Database With Supabase:

### Requirements
- **[Docker](https://www.docker.com/)**
- **[Supabase CLI](https://supabase.com/docs/guides/local-development)**

### Setup Instructions
1. Open Docker app and wait until it is running
2. Initilalize Supabse:
   ```
   supabase init
   ```
3. Start local Supabase:
   ```
   supabase start
   ```
4. Copy .env.example to .env.local (for local development) in the root directory if it doesn't exist:
   ```
   cp .env.example .env.local
   ```
5. Use `API URL` and `anon key` output to update .env.local:
   ```
    VITE_SUPABASE_URL=API-URL
    VITE_SUPABASE_ANON_KEY=anon-key
    ```
> **Note:** `.env.local` overrides `.env` when running the app locally
6. When you want to stop local supabase:
   ```
   supabase stop
   ```

## Features

### Application Shell
The responsive shell that provides a toolbar, navbar, and aside. 

### Authentication
The DAS template uses Supabase for user authentication and authorization.  Implementation for Google and Microsoft authentication is provided.

### CRUD
The DAS template uses Supabase for data storage.  It is anticipated that applications requiring RDBMS support would use this.  Examples of lists, dialogs, and forms with validation are available.

### Markdown
The DAS template includes support for displaying Markdown. The typical use-case is to display privacy policies and/or terms and conditions.  The content on the page can be stored as a application resource to allow changes withou redployment.  One consequence of supporting Markdown is not using Tailwind CSS.  Tailwind removes default formatting from HTML components (e.g. h1 renders plainly with default font size and weight). Markdown is implemented with react-markdown.

### File Storage
The DAS template includes an example of uploading, reading, as listing of files in Supabase's storage system.  The use-case for this could include storing documents, like release forms, for an application.

<!-- The file `src/pages/UploadPage.tsx` is the entry point for the example. -->

<!-- ### Maps
The DAS template includes an example mapping page `src/pages/MapPage.tsx`.  Maps were implemented with react-map-gl & maplibre-gl. -->

### Drag & Drop
The DAS template includes an example of drag-and-drop use. Drag and drop is implemented with @dnd-kit/core and @dnd-kit/sortable.

### Polling
The application shell includes a 10 second timer. The refresh context can be used to refresh components with current data.

```
    const { refresh } = useContext(RefreshContext)

    useEffect(() => {
        // Refresh action
        ticketService.getTickets(NUM_TIX)
            .then((tix) => setTickets(tix))
    }, [refresh])
```

## Deployment
The application is deployed at Google's Firebase as a static website.  GitHub's workflow action adds site secrets to the build before deploying.

## FAQ
### How do I connect to Supabase?
Environment variables for the connecting to Supabase must be added to the hosting platform as well as the `.env.local` file.  Squad members must obtain the supabase url and auth_anon_key for accessing the Supabase project.

### How do I change the menu items?
Contents of the navbar, the drawer of links on the left of the application window, can be modified by changing the contents of `/src/menu-items/index.tsx`.

### How do I change the toolbar items?
Contents of the toolbar, the links at the top the application window and left of the profile button, can be modified by changing the contents of `/src/toolbar-items/index.tsx`. The file `/src/sections/tickets/TicketToolbarItem` contains an example of what can be done with a toolbar item.

### How do I add a page to the application?
Since the template uses `react-router-dom` for application routing, there is no requirement to placement new pages in the `pages` folder.  It is by convention that new pages are placed there.  For the page to be included in the application `src/pages/routes.tsx` must be updated to include the new page.

### Where does the partner logo get changed?
The logo, displayed in the upper left hand of the application window and elsewhere, can be modified in `/src/components/Logo/Logo.tsx`.  The image files should be placed in the `/src/assets/images/` directory.
