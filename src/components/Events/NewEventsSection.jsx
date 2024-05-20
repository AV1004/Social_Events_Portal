import { useQuery } from "@tanstack/react-query";

import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import EventItem from "./EventItem.jsx";
import { fetchEvents } from "../../util/http.js";

export default function NewEventsSection({ type }) {
  // const [data, setData] = useState();
  // const [error, setError] = useState();
  // const [isLoading, setIsLoading] = useState(false);

  // useEffect(() => {
  //   async function fetchEvents() {
  //     setIsLoading(true);
  //     const response = await fetch('http://localhost:3000/events');

  //     if (!response.ok) {
  //       const error = new Error('An error occurred while fetching the events');
  //       error.code = response.status;
  //       error.info = await response.json();
  //       throw error;
  //     }

  //     const { events } = await response.json();

  //     return events;
  //   }

  //   fetchEvents()
  //     .then((events) => {
  //       setData(events);
  //     })
  //     .catch((error) => {
  //       setError(error);
  //     })
  //     .finally(() => {
  //       setIsLoading(false);
  //     });
  // }, []);

  // let content;

  // if (isLoading) {
  //   content = <LoadingIndicator />;
  // }

  // if (error) {
  //   content = (
  //     <ErrorBlock title="An error occurred" message="Failed to fetch events" />
  //   );
  // }

  //This all code is not false but it does not provide automatic referesh when user swtich tabs so that if data in backend is changed then it automatic update our page and also this is very larger code every time you have handle 3 states to mange this data and show loading text and error this code can be shorten by tanstack Query known as formaly react query

  //so starting with main custom hook that is provided by tanstack query that is useQuery Hook

  //first of all tanstack does not proivde features of fetching the data from backend and extra this all stuff have to hardcorded by us it gives data on that request's response , check util folder where i hardcoded that fetching fucntion

  const { data, isPending, isError, error } = useQuery({
    //Understanding one by one data is data that is recived by our funtion that is queryFn : fetchEvents , isPending return boolean of that if data isPending or not ,  isError proivdes boolean of in fetching error is ouccur ot not (this only works if our fetchFunction throws error (you can check fetchEvents it is indeed handle errors) , error proivdes error that is ouccur in fetching fucntion  )
    queryKey: [
      type === "recent" ? "events" : "allEvents",
      { max: type === "recent" ? 3 : undefined },
    ], //Now this queryKey is very important that is because queryKey stores cache data as it can be use by other components to render it (note that is is also one of the main function of tanstack) , so to use this data again from cache it should have key to identifie that data so queryKey is that key , this key can be multiple items in array but it shold be array
    queryFn: ({ signal, queryKey }) => fetchEvents({ signal, ...queryKey[1] }), //As mention above this is a function that fetch the data from server or we can say that does the first step of fetching data
    // React Query passes a object in above (fetchEvents) function as it is called like this! to see that simply log the obj in function GoTo http.js

    //Now to use useQuery in any compnent we have to wrap all components with a spacial proivder, go check out App.jsx

    staleTime: 5000, //This is a time that if user go to another page in 5 secs and again came back to this page then there is no need of sending request again (does't mean that tanStack does not send reqs it is but it shows data from cache so it is fast) , here default time is 0
    // gcTime: 30000, garbageCollection time means it removes data from cache every Half Secs and the default is 5 mins
  });
  //Now we can use the data,isPending ,isError and error to render elements

  let content;
  if (isPending) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <ErrorBlock
        title="An error occurred"
        message={
          error.info
            ? error.message
            : "Some Error ouccred in fetching of events"
        }
      />
    );
  }

  if (data) {
    content = (
      <ul className="events-list">
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="content-section" id="new-events-section">
      <header>
        {type === "recent" ? (
          <h2>Recently added events</h2>
        ) : (
          <h2>All Events</h2>
        )}
      </header>
      {content}
    </section>
  );
}
