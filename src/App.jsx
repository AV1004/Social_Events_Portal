import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";

import Events from "./components/Events/Events.jsx";
import EventDetails from "./components/Events/EventDetails.jsx";
import NewEvent from "./components/Events/NewEvent.jsx";
import EditEvent, {
  editEventAction,
  editEventLoader,
} from "./components/Events/EditEvent.jsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./util/http.js";
import NewEventsSection from "./components/Events/NewEventsSection.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/events" />,
  },
  {
    path: "/events",
    element: <Events />,

    children: [
      {
        path: "/events/new",
        element: <NewEvent />,
      },
    ],
  },
  {
    path: "/events/:id",
    element: <EventDetails />,
    children: [
      {
        path: "/events/:id/edit",
        element: <EditEvent />,
        loader: editEventLoader,
        action: editEventAction,
      },
    ],
  },
  {
    path: "/events/allEvents",
    element: <NewEventsSection />,
  },
]);

//As we know to use useQuery hook we have to wrap Component with a proivder which is QueryClientProvider and it take QueryClient as prop

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
