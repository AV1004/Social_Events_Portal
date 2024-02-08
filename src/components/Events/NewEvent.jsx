import { Link, useNavigate } from "react-router-dom";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { useMutation } from "@tanstack/react-query";
import { createNewEvent, queryClient } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function NewEvent() {
  const navigate = useNavigate();
  const { mutate, isPending, isError, error } = useMutation({
    //The main thing is mutate fucntion this mutate function is use to submit data in this compoent anywhere
    mutationFn: createNewEvent, //It also has mutatinFn also has mutaionKey but that was not needed here!
    onSuccess: () => {
      //This onSuccess is function that executes after this mutate query will successfully excuted!
      queryClient.invalidateQueries({ queryKey: ["events"] }); //Now this queryClient.invalidateQueries is function that reFetches every query that include this "events" as queryKey
      navigate("/events");
    },
  }); //Now you can also use useQuery to Handle POST request but useMutation is properly build to handle POST request!

  function handleSubmit(formData) {
    mutate({ event: formData }); //The parameter that your mutation function is expecting is passed here as argument
  }

  return (
    <Modal onClose={() => navigate("../")}>
      <EventForm onSubmit={handleSubmit}>
        {isPending && "Sumbitting...."}
        {!isPending && (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Create
            </button>
          </>
        )}
      </EventForm>
      {isError && (
        <ErrorBlock
          title={"An Error Ouccred in Submission!"}
          message={
            error.info?.message ||
            "An Error Ouccred in Submission of new Event! Please check enter data first."
          }
        />
      )}
    </Modal>
  );
}
