/**
 *  App.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
// project import
import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { routes } from './pages/routes';
import ThemeCustomization from './themes/themeCustomization';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'

// ==============================|| APP - THEME, ROUTER, LOCAL  ||============================== //

const router = createBrowserRouter(routes);


const App: React.FC = () => {
  return (
    <ThemeCustomization>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <RouterProvider router={router} />
      </LocalizationProvider>
    </ThemeCustomization>
  );
}

export default App;
