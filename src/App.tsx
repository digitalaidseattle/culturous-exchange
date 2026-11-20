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
  SupabaseConfiguration,
  SupabaseStorageService
} from '@digitalaidseattle/supabase';
import { Config } from './Config';

import "./App.css";

// ==============================|| APP - THEME, ROUTER, LOCAL  ||============================== //

const router = createBrowserRouter(routes);

SupabaseConfiguration.props({
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
});

const authService = SupabaseAuthService.getInstance();
const storageService = SupabaseStorageService.getInstance();

setCoreServices({
  authService: authService,
  storageService: storageService
})

const App: React.FC = () => {

  return (
    <AuthServiceProvider authService={authService} >
      <StorageServiceProvider storageService={storageService} >
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <UserContextProvider>
            <LayoutConfigurationProvider configuration={Config}>
              <RouterProvider router={router} />
            </LayoutConfigurationProvider>
          </UserContextProvider>
        </LocalizationProvider>
      </StorageServiceProvider>
    </AuthServiceProvider>
  );
}

export default App;
