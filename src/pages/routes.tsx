import {
  Error,
  Login,
  MainLayout,
  MarkdownPage,
  MinimalLayout
} from "@digitalaidseattle/mui";

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
        element: <MarkdownPage filepath='privacy.md'/>,
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
        element: <Error />
      }
    ]
  }
];

export { routes };
