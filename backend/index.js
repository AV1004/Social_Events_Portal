// import fs from "fs/promises";

import bodyParser from "body-parser";
import express from "express";
import path from "path";
import mongoose from "mongoose";
import { config } from "dotenv";
import { Event } from "./models/event.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const app = express();

app.use(bodyParser.json());
app.use(express.static("public"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  next();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use("/images", express.static(path.join(__dirname, "public")));

config({
  path: "./data/config.env",
});

app.get("/", async (req, res) => {
  res.send("Hello from Social Events Portal's API");
});

app.get("/events", async (req, res) => {
  const { max, search } = req.query;

  // const eventsFileContent = await fs.readFile("./data/events.json");

  Event.find()
    .then((eventsFileContent) => {
      // let events = JSON.parse(eventsFileContent);
      let events = eventsFileContent;

      if (search) {
        events = events.filter((event) => {
          const searchableText = `${event.title} ${event.description} ${event.location}`;
          return searchableText.toLowerCase().includes(search.toLowerCase());
        });
      }

      if (max) {
        events = events.slice(events.length - max, events.length);
      }

      res.json({
        events: events.map((event) => ({
          id: event.id,
          title: event.title,
          image: event.image,
          date: event.date,
          location: event.location,
        })),
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/events/images", async (req, res) => {
  // const imagesFileContent = await fs.readFile("./data/images.json");
  const imagesFileContent = [
    {
      path: "buzzing-city.jpg",
      caption: "People walking through a city buzzing with life at night.",
    },
    {
      path: "laptop-on-desk.jpg",
      caption: "A laptop on a desk.",
    },
    {
      path: "meeting-networking.jpg",
      caption: "A group of people meeting and networking.",
    },
    {
      path: "park.jpg",
      caption: "A park with a lake.",
    },
    {
      path: "women-coding.jpg",
      caption: "A group of women coding.",
    },
  ];

  // const images = JSON.parse(imagesFileContent);
  const images = imagesFileContent;

  res.json({ images });
});

app.get("/events/:id", async (req, res) => {
  const { id } = req.params;

  // const eventsFileContent = await fs.readFile(
  //   path.join(process.cwd() + "events.json")
  // );
  // const events = JSON.parse(eventsFileContent);

  Event.find()
    .then((eventsFileContent) => {
      const events = eventsFileContent;

      const event = events.find((event) => event.id === id);

      if (!event) {
        return res
          .status(404)
          .json({ message: `For the id ${id}, no event could be found.` });
      }

      setTimeout(() => {
        res.json({ event });
      }, 1000);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/events", async (req, res) => {
  const { event } = req.body;
  console.log(req.body);

  if (!event) {
    return res.status(400).json({ message: "Event is required" });
  }

  // console.log(event);`

  if (
    !event.title?.trim() ||
    !event.description?.trim() ||
    !event.date?.trim() ||
    !event.time?.trim() ||
    !event.image?.trim() ||
    !event.location?.trim()
  ) {
    return res.status(400).json({ message: "Invalid data provided." });
  }

  // const eventsFileContent = await fs.readFile(
  //   path.join(process.cwd() + "events.json")
  // );
  // const events = JSON.parse(eventsFileContent);

  const newEvent = {
    id: Math.round(Math.random() * 10000).toString(),
    ...event,
  };

  const eventss = new Event(newEvent);

  eventss
    .save()
    .then((result) => {
      res.json({ event: newEvent });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.put("/events/:id", async (req, res) => {
  const { id } = req.params;
  const { event } = req.body;
  // console.log(event, id, req.body);
  if (!event) {
    return res.status(400).json({ message: "Event is required" });
  }

  if (
    !event.title?.trim() ||
    !event.description?.trim() ||
    !event.date?.trim() ||
    !event.time?.trim() ||
    !event.image?.trim() ||
    !event.location?.trim()
  ) {
    return res.status(400).json({ message: "Invalid data provided." });
  }

  // const eventsFileContent = await fs.readFile(
  //   path.join(process.cwd() + "events.json")
  // );
  // const events = JSON.parse(eventsFileContent);

  Event.findById(id)
    .then((eventDoc) => {
      if (id !== eventDoc._id.toString()) {
        return res.status(400).json({ message: "Invalid data provided." });
      }

      eventDoc.title = event.title;
      eventDoc.description = event.description;
      eventDoc.date = event.date;
      eventDoc.time = event.time;
      eventDoc.image = event.image;
      eventDoc.location = event.location;

      return eventDoc.save();
    })
    .then((eventDoc) => {
      setTimeout(() => {
        res.json({ event: eventDoc });
      }, 1000);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.delete("/events/:id", async (req, res) => {
  const { id } = req.params;

  // const eventsFileContent = await fs.readFile(
  //   path.join(process.cwd() + "events.json")
  // );
  // const events = JSON.parse(eventsFileContent);

  // const eventIndex = events.findIndex((event) => event.id === id);

  // if (eventIndex === -1) {
  //   return res.status(404).json({ message: "Event not found" });
  // }

  // events.splice(eventIndex, 1);

  // await fs.writeFile(
  //   path.join(process.cwd() + "events.json"),
  //   JSON.stringify(events)
  // );

  Event.deleteOne({ _id: id })
    .then((result) => {
      setTimeout(() => {
        res.json({ message: "Event deleted" });
      }, 1000);
    })
    .catch((err) => {
      console.log(err);
    });
});

mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  })
  .catch((err) => {
    console.log(err);
  });
