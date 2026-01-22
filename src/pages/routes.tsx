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
import PlanPage from "./plan";
import HomePage from "./home";
import FacilitatorsPage from "./facilitators";

const routes = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "",
        element: <HomePage />,
      },
      {
        path: "home",
        element: <HomePage />,
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
        path: "plan/:id",
        element: <PlanPage />,
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
        path: "facilitators",
        element: <FacilitatorsPage />,
      },
      {
        path: "facilitator/:id",
        element: <StudentPage />,
      },
      {
        path: "privacy",
        element: <MarkdownPage filepath='privacy.md' />,
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
