import express from "express";
import { validationResult } from "express-validator";
import { getMedia, writeMedia } from "../../lib/fs-tools.js";
import { mediaPostValidation } from "./validation.js";
import uniqid from "uniqid";
import createError from "http-errors";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const MediaRouter = express.Router();

/********************POST MEDIA***********************/

MediaRouter.post("/", mediaPostValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      next(createError(400, { errorList: errors }));
    } else {
      console.log(req.body);
      //   const newMedia = {
      //     Title,
      //     Year,
      //     imdbID: uniqid(),
      //     Type,
      //     Poster,
      //     createdAt: new Date(),
      //     Reviews,
      //   };

      const newMedia = {
        imdbID: uniqid(),
        createdAt: new Date(),
        ...req.body,
        Reviews: [],
      };

      const media = await getMedia();
      media.push(newMedia);
      console.log(newMedia);

      await writeMedia(media);
      res.status(201).send(media);
    }
  } catch (error) {
    next(error);
  }
});

/********************GET MEDIA lIST WITH REVIEWS***********************/

MediaRouter.get("/", async (req, res, next) => {
  try {
    const media = await getMedia();
    res.send(media);
  } catch (error) {
    next(error);
  }
});

/********************GET SINGLE MEDIA WITH REVIEWS**********************/
MediaRouter.get("/:id", async (req, res, next) => {
  try {
    const media = await getMedia();
    const medium = media.find((m) => m.imdbID === req.params.id);
    if (medium) {
      res.send(medium);
    } else {
      next(createError(404, `Media ${req.params.id} not found `));
      // createError(err.status, error.message)
    }
  } catch (error) {
    next(error);
  }
});

/********************UPDATE SINGLE MEDIA **********************/
MediaRouter.put("/:id", async (req, res, next) => {
  try {
    const media = await getMedia();
    const notSelected = media.filter((m) => m.imdbID !== req.params.id);
    const editedMedium = {
      ...req.body,
      imdbID: req.params.id,
      updatedAt: new Date(),
    };
    notSelected.push(editedMedium);
    writeMedia(notSelected);
    res.send(editedMedium);
  } catch (error) {
    next(error);
  }
});

/********************UPLOAD POSTER TO SINGLE MEDIA **********************/
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "Strive",
  },
});
const upload = multer({ storage: cloudinaryStorage }).single("Poster");

MediaRouter.post("/:id/uploadPoster", upload, async (req, res, next) => {
  try {
    const media = await getMedia();
    let updatedMedia = media.map((m) => {
      if (m.imdbID === req.params.id) {
        m.Poster = req.file.path;
        console.log(m.Poster);
      }
      return m;
    });
    await writeMedia(updatedMedia);
    res.send(req.file.path);
  } catch (error) {
    next(error);
  }
});

/********************DELETE SINGLE MEDIA **********************/
MediaRouter.delete("/:id", async (req, res, next) => {
  try {
    const media = await getMedia();
    const notSelected = media.filter((m) => m.imdbID !== req.params.id);

    writeMedia(notSelected);
    res.send("media deleted");
  } catch (error) {
    next(error);
  }
});

/********************POST REVIEW TO SINGLE MEDIA **********************/
MediaRouter.post("/:id/review", async (req, res, next) => {
  try {
    const newReview = {
      _id: uniqid(),
      ...req.body,
      elementId: req.params.id,
      createdAt: new Date(),
    };
    console.log(newReview);

    const media = await getMedia();
    const medium = media.find((m) => m.imdbID === req.params.id);

    console.log(medium);
    console.log(medium.Reviews);
    medium.Reviews.push(newReview);
    writeMedia(media);
    //   console.log(blogPost);
    res.status(201).send(medium);
  } catch (error) {
    next(error);
  }
});

/********************DELETE REVIEW **********************/
MediaRouter.delete("/:id/review/:asin", async (req, res, next) => {
  try {
    // console.log(req.params.asin);
    const media = await getMedia();
    const medium = media.find((m) => m.imdbID === req.params.id);
    // console.log(medium.Reviews);
    const notSelectedReview = medium.Reviews.filter(
      (m) => m._id !== req.params.asin
    );
    // console.log("this is ", notSelectedReview);
    medium.Reviews = notSelectedReview;

    writeMedia(media);
    res.send("review deleted");
  } catch (error) {
    next(error);
  }
});

export default MediaRouter;
