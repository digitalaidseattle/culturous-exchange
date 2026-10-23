/**
 *  App.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
// project import
import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';

import { createClient } from "@supabase/supabase-js";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import {
  AuthServiceProvider,
  setCoreServices,
  StorageServiceProvider,
  UserContextProvider
} from "@digitalaidseattle/core";
import { LayoutConfigurationProvider } from "@digitalaidseattle/mui";

import { routes } from './pages/routes';
import {
  SupabaseAuthService,
  SupabaseStorageService
} from '@digitalaidseattle/supabase';
import { Config } from './Config';

import "./App.css";
import { setConfiguration } from './api/Configuration';
import { UploadProgressProvider } from './components/UploadProgressContext';

// ==============================|| APP - THEME, ROUTER, LOCAL  ||============================== //

const router = createBrowserRouter(routes);

const App: React.FC = () => {

  const authService = new SupabaseAuthService();
  const storageService = new SupabaseStorageService();

  setCoreServices({
    authService: authService,
    storageService: storageService
  })

  setConfiguration(
    {
      supabaseClient: createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      )
    }
  )

  return (
    <AuthServiceProvider authService={authService} >
      <StorageServiceProvider storageService={storageService} >
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <UserContextProvider>
            <LayoutConfigurationProvider configuration={Config}>
              <UploadProgressProvider>
                <RouterProvider router={router} />
              </UploadProgressProvider>
            </LayoutConfigurationProvider>
          </UserContextProvider>
        </LocalizationProvider>
      </StorageServiceProvider>
    </AuthServiceProvider>
  );
}

export default App;
