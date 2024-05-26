import { useState } from "react";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";

import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteEvent, getEventDetail, queryClient } from "../../util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import Modal from "../UI/Modal.jsx";

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams("id");

  const {
    data: event,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => getEventDetail({ id, signal }),
  });

  const {
    mutate,
    isPending: isPendingOfDeletion,
    isError: isErrorOfDeletion,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events", id],
        // refetchType: "none", //Use this to not send "events again here"
      });
    },
  });

  let content;

  if (isLoading) {
    content = (
      <div className="center">
        <LoadingIndicator />
      </div>
    );
  }

  if (isError) {
    content = (
      <ErrorBlock
        title={"An Error Ouccred!"}
        message={
          error.info?.message ||
          "An error ouccred in fetching of event Details!"
        }
      />
    );
  }

  const handleStartDeleting = () => {
    setIsDeleting(true);
  };

  const handleStopDeleting = () => {
    setIsDeleting(false);
  };

  const handleDelete = () => {
    mutate({ id });
    navigate("/");
  };

  if (event) {
    content = (
      <article id="event-details">
        <header>
          <h1>{event.title}</h1>
          <nav>
            <button onClick={handleStartDeleting}>Delete</button>

            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${event.image}`} alt={event.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{event.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>{event.date}</time>
            </div>
            <p id="event-details-description">{event.description}</p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <>
      {isDeleting && (
        <Modal onClose={handleStopDeleting}>
          <h2>Are you sure?</h2>
          <p>
            Do you really want to delet this event? this action can't be undone.
          </p>
          <div className="form-actions">
            <button
              className="button-text"
              disabled={isPendingOfDeletion}
              onClick={handleStopDeleting}
            >
              Cancel
            </button>
            <button
              className="button"
              onClick={handleDelete}
              disabled={isPendingOfDeletion}
            >
              {!isPendingOfDeletion ? "Delete" : "Submitting..."}
            </button>
          </div>
          {isErrorOfDeletion && (
            <ErrorBlock
              title={"An Error Ouccred!"}
              message={"Could not delete event!"}
            />
          )}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>

      {content}
    </>
  );
}
