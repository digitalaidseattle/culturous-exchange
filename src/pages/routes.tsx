import MainCard from '../components/MainCard';
import MainLayout from '../layout/MainLayout';
import MinimalLayout from '../layout/MinimalLayout';
import TicketPage from '../sections/tickets/TicketPage';
import TicketsGrid from '../sections/tickets/TicketsGrid';
import TicketsTable from '../sections/tickets/TicketsTable';
import PrivacyPage from './PrivacyPage';
import UploadPage from './UploadPage';
import Login from './authentication/Login';
import DashboardDefault from './dashboard';
import DragDropPage from './dragdrop/DragDropPage';
import Page404 from './error/404';
import SamplePage from './extra-pages/SamplePage';

const routes = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "",
        element: <DashboardDefault />,
      },
      {
        path: "sample-page",
        element: <SamplePage />,
      },
      {
        path: "ticket/:id",
        element: <TicketPage />,
      },
      {
        path: "tickets",
        element: (
          <MainCard title="Tickets Page">
            <TicketsTable />
          </MainCard>),
      },
      {
        path: "tickets-grid",
        element: (
          <MainCard title="Tickets Page">
            <TicketsGrid />
          </MainCard>
        ),
      },
      {
        path: "privacy",
        element: <PrivacyPage />,
      },
      {
        path: "upload",
        element: <UploadPage />,
      },
      {
        path: "drag-drop",
        element: <DragDropPage />,
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
