import {
  Link,
  redirect,
  useNavigate,
  useNavigation,
  useParams,
  useSubmit,
} from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import {
  fetchEvents,
  getEventDetail,
  queryClient,
  updateEvent,
} from "../../util/http.js";

export default function EditEvent() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const submit = useSubmit();
  const { id } = useParams("id");
  const {
    data: event,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => getEventDetail({ id, signal }),
    staleTime: 10000,
  });

  // const {
  //   mutate,
  //   isPending: isPendingUpdation,
  //   isError: isErrorUpdation,
  //   error: errorInUpdation,
  // } = useMutation({
  //   mutationFn: updateEvent,
  //   // onSuccess: () => {
  //   //   queryClient.invalidateQueries({
  //   //     queryKey: ["events"],
  //   //     refetchType: "none", //Use this to not send "events again here"            //This is ok but not optimistic
  //   //   });
  //   //   // navigate("/events");
  //   // },

  //   // This method is use to update data optimistcally

  //   onMutate: async (data) => {
  //     //This func will excute before mutaion func execute , the data is the data that you have submited to mutation fucntion
  //     const newEvent = data.event;

  //     await queryClient.cancelQueries({ queryKey: ["events", id] }); //This is use too clear data
  //     const previousEvent = queryClient.getQueryData(["events", id]); //use to get previous data

  //     await queryClient.setQueryData(["events", id], newEvent); //To make optimistic update we simply seting our event first here in frontend

  //     return { previousEvent };
  //   },
  //   onError: (error, data, context) => {
  //     //you already know Error and data , context is previosData that we have return in onMutate function will automatically get here!
  //     queryClient.setQueryData(["events", id], context.previousEvent); //Here we rolling back if data is not updated in backend you can throw error or handle error here (to try this go to edit and empty the title and try to edit as empty title which will not accpeted by our backend)
  //   },
  //   onSettled: () => {
  //     queryClient.invalidateQueries(["events", id]); //Last we settled all of the queries that are related to this key to make sure our app does't crash!
  //   },
  // });

  //Here we are using action that's why we don't need to use this

  function handleSubmit(formData) {
    // mutate({ event: { event: formData }, id }); //In case in future see this to understand how data transfer take place between backend and frontend
    // navigate("../");

    submit(formData, { method: "PUT" });
  }

  function handleClose() {
    navigate("../");
  }

  return (
    <Modal onClose={handleClose}>
      {/* {isPending && (
        <div className="center">
          <LoadingIndicator />                   //This is not needed because the data is came from cache so user will see smooth interface
        </div>
      )} */}
      {isError && (
        <>
          <ErrorBlock
            title={"An Error Ouccred!"}
            message={error.info?.message || "Can't fetch event data!"}
          />
          <div className="form-actions">
            <Link to="../" className="button">
              Ok
            </Link>
          </div>
        </>
      )}
      {!isPending && !isError && (
        <EventForm inputData={event} onSubmit={handleSubmit}>
          {navigation.state === "submitting" ? (
            <p>Submitting...</p>
          ) : (
            <>
              <Link to="../" className="button-text">
                Cancel
              </Link>
              <button
                type="submit"
                className="button"
                // disabled={isPendingUpdation}
              >
                {/* {!isPendingUpdation ? "Update" : "Submitting...."} */}
                Update
              </button>
            </>
          )}
        </EventForm>
      )}
      {/* {isErrorUpdation && (
        <ErrorBlock
          title={"An Error Oucccred!"}
          message={
            errorInUpdation.info?.message ||
            "Can't update event try again later!"          //You can only use this apporach while using mutation
          }
        />
      )} */}
    </Modal>
  );
}

export const editEventLoader = async ({ params }) => {
  return queryClient.fetchQuery({
    //This fetchQuery method is use to excute query programatically
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => getEventDetail({ id: params.id, signal }), //SO fetchQuery will load data as it is called in loader function and then store that data in cache then when user goto this component (page) then loaded cache data will be render

    //The other thing is when we use this cache method then the useQuery hook in the component will also executes but as of now because of loader the loading UI does't not need here!
    //In short uper code of useQuery does not need to remove from this code as we can also use the fetures of Tanstack Queries to handle data
  });
};

export const editEventAction = async ({ request, params }) => {
  const formData = await request.formData();
  const updatedEventData = Object.fromEntries(formData);
  await updateEvent({ event: updatedEventData, id: params.id });
  await queryClient.invalidateQueries(["events"]);
  return redirect("../");
};

//Now this action will excutes automatically when the form in the router(where this action is called) is submitted!
//SO the mutate function of this component is not needed here as of now that will never executes and the action will execute first this is alternative of the mutate fucntion
//And also here you have to build your own logic of optimistic updation
