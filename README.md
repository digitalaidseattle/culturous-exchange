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