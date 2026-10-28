import {
  Error,
  Login,
  MainLayout,
  MarkdownPage,
  MinimalLayout
} from "@digitalaidseattle/mui";

import { Navigate } from "react-router-dom";

import CohortPage from "./cohort";
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
        // Cohorts now live on the home page; keep old links and bookmarks working.
        path: "cohorts",
        element: <Navigate to="/" replace />,
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
        path: "facilitators",
        element: <FacilitatorsPage />,
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
