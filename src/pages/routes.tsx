import {
  Error,
  Login,
  MainLayout,
  MarkdownPage,
  MinimalLayout
} from "@digitalaidseattle/mui";

import CohortPage from "./cohort";
import CohortsPage from "./cohorts";
import StudentPage from './student';
import StudentsPage from './students';

const routes = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "",
        element: <CohortsPage />,
      },
      {
        path: "cohorts",
        element: <CohortsPage />,
      },
      {
        path: "cohort/:id",
        element: <CohortPage />,
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
