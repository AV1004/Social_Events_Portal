import { Link, Outlet } from "react-router-dom";

import Header from "../Header.jsx";
import EventsIntroSection from "./EventsIntroSection.jsx";
import FindEventSection from "./FindEventSection.jsx";
import NewEventsSection from "./NewEventsSection.jsx";

export default function Events() {
  return (
    <>
      <Outlet />
      <Header>
        <Link to="/events/allEvents" className="button">
          All Events
        </Link>
        <Link to="/events/new" className="button">
          New Event
        </Link>
      </Header>
      <main>
        <EventsIntroSection />
        <NewEventsSection type={"recent"} />
        <FindEventSection />
      </main>
    </>
  );
}
