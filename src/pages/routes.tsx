import MainLayout from '../layout/MainLayout';
import MinimalLayout from '../layout/MinimalLayout';
import PrivacyPage from './PrivacyPage';
import Login from './authentication/Login';
import Page404 from './error/404';
import SessionPage from './session';
import SessionsPage from './sessions';
import StudentPage from './student';
import StudentsPage from './students';

const routes = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "",
        element: <SessionsPage />,
      },
      {
        path: "sessions",
        element: <SessionsPage />,
      },
      {
        path: "session/:id",
        element: <SessionPage />,
      },
      {
        path: "students",
        element: <StudentsPage />,

      },
      {
        path: "student/:id",
        element: <StudentPage />,
      },
      {
        path: "privacy",
        element: <PrivacyPage />,
      }
    ]
  },
  {
    path: "/",
    element: <MinimalLayout />,
    children: [
      {
        path: 'login',
        element: <Login />
      }
    ]
  },
  {
    path: "*",
    element: <MinimalLayout />,
    children: [
      {
        path: '*',
        element: <Page404 />
      }
    ]
  }
];

export { routes };
