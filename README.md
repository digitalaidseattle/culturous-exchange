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

## A. Project Installation

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

## B. Prerequites to Setup Local Environment

   1. Install [DOCKER]: **(https://www.docker.com/)**
      > Docker is required to run Supabase locally, as Supabase uses Docker containers for Postgres and other services.
      a. Install Docker Desktop
         > Download and install Docker Desktop for your operating system.
         > Launch Docker Desktop and wait until the status says “Docker Desktop is running.”
           
      b. Verify Docker CLI Installation
         - Once Docker Desktop is running, open a terminal and check the version:
            ```
            docker version
            ```
         - If the command returns something like:
           ```
           Client:
              Version: x.x.x
              ....
           Server: Docker Desktop
              Engine:
                 Version: x.x.x
                 .....
           ```
         - Then, confirm the setup by running:
              ```
              docker run hello-world
              ```
         - Expected output:
              ```
              Hello from Docker!
              This message shows that your installation appears to be working correctly.
              ```
           ~ Success! Docker is ready to use
      
        c.Troubleshooting:
         - If you see errors like `command not found` or `Unable to find`, check that Docker is in your system’s PATH:
               ```
                  echo $PATH
                  which docker
               ```
         - If these commands return empty results, locate the Docker CLI manually, for example:
               ```
                  ls /usr/local/bin/docker
               ```
         - If Docker is still not found, check the official Docker documentation or search online for solutions.


   4. Install [SUPABASE CLI]: **(https://supabase.com/docs/guides/local-development)**
      - The Supabase CLI is used to manage and run Supabase locally
      
        a. Install the CLI:
            If Brew: `brew install supabase/tap/supabase`
            If npm: `npm install supabase --save-dev`
        b. Initial a supabase project:
         ```
         npx supabase init
         ```
        c. Start the Supabase local instance in Docker containers:
         ```
         npx supabase start
         ```
        d. If wants to stop or reset Supabase:
         ```
         npx supabase stop
         ``` 
         

## C. Setup Environments:
   1. Local Environment:
      - Required variables for `.env.local` file:
        
         ```
         VITE_SUPABASE_URL=...
         VITE_SUPABASE_ANON_KEY=...
         VITE_IPGEOLOCATION_KEY=...
         SUPABASE_GOOGLE_CLIENT_ID=...
         SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=...
         ```
      - Contact Admin to get required environment variable values.
      - Update the `API URL` and `anon key` from `supabase start` output with `.env.local` file.
      - > **Note:** `.env.local` overrides `.env` when running the app locally
      
   3. Production Environment:
      - Required variables for `.env.production` file:
        
         ```
         VITE_SUPABASE_ANON_KEY=....
         VITE_IPGEOLOCATION_KEY=....
         ```

## D. Start the Application:
   1. Pre-Run Setup Checklist:
      - Docker is installed and running.
      - Supabase is installed and running: `supabase start`
      - Verify required values from local environment file are corrects.
   2. Run App:
      - Start the development server:
         ```
         npm run dev
         ```
      - Open http://localhost:3000 to view the app.
