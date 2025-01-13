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
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'

import {
  AuthServiceProvider,
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

// ==============================|| APP - THEME, ROUTER, LOCAL  ||============================== //

const router = createBrowserRouter(routes);

const App: React.FC = () => {
  return (
    <AuthServiceProvider authService={new SupabaseAuthService()} >
      <StorageServiceProvider storageService={new SupabaseStorageService()} >
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
