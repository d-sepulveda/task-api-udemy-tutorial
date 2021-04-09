const express = require("express");
const { update } = require("../models/task");

const Task = require("../models/task");
const auth = require("../middleware/auth");
const router = new express.Router();

// --------------------- ROUTES ASYNC-AWAIT  ------------------------

router.get("/task", auth, async (req, res) => {
  const match = {};
  const sort = {};

  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":"); // createdAt:asc = convierte este string en  => [ 'createdAt', 'asc' ] = por la separacion del ":"
    sort[parts[0]] = parts[1];
  }

  try {
    await req.user
      .populate({
        path: "tasks",
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort
        },
      })
      .execPopulate();
    res.send({
      success: true,
      response: req.user.tasks,
    });
  } catch (error) {
    res.status(404).send({ success: false, error });
  }
});

router.get("/task/:id", auth, async (req, res) => {
  let _id = req.params.id;

  try {
    const response = await Task.findOne({ _id, owner: req.user._id });
    if (!response) {
      return res.status(404).send({
        success: false,
        response: "Task not found",
      });
    }

    res.send({
      success: true,
      response,
    });
  } catch (error) {
    res.status(500).send({ success: false, error });
  }
});

router.post("/task", auth, async (req, res) => {
  const TaskItem = new Task({ ...req.body, owner: req.user._id });
  try {
    const response = await TaskItem.save();
    res.status(201).send({
      success: true,
      response,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      error,
    });
  }
});

router.patch("/task/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isValidOperation = updates.every((item) =>
    allowedUpdates.includes(item)
  );

  if (!isValidOperation) {
    return res.status(400).send({ success: false, error: "Invalid updates!" });
  }

  try {
    const response = await Task.findOne({ owner: req.user._id });

    if (!response) {
      return res.status(404).send({ success: false, error: "Task not found" });
    }

    updates.forEach((update) => (response[update] = req.body[update]));
    await response.save();

    res.send({ success: true, response });
  } catch (error) {
    res.status(400).send({ success: false, error });
  }
});

router.delete("/task/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const response = await Task.findOneAndDelete({ _id, owner: req.user._id });

    if (!response) {
      return res.status(404).send({ success: false, error: "Task not found" });
    }

    res.send({ success: true, response });
  } catch (error) {
    res.status(500).send({ success: false, error });
  }
});

module.exports = router;

// ---------------------- Routes promises -------------------------------------

// router.get("/task", (req, res) => {
//   Task.find({})
//     .then((response) => {
//       res.send({
//         success: true,
//         response,
//       });
//     })
//     .catch((error) => {
//       res.status(500).send({
//         success: false,
//         error,
//       });
//     });
// });

// router.get("/task/:id", (req, res) => {
//   let _id = req.params.id;

//   Task.findById(_id)
//     .then((response) => {
//       if (!response) {
//         return res.status(404).send({
//           success: false,
//           response: "Task not found",
//         });
//       }

//       res.send({
//         success: true,
//         response,
//       });
//     })
//     .catch((error) => res.status(500).send({ success: false, error }));
// });

// router.post("/task", (req, res) => {
//   const TaskItem = new Task(req.body);

//   TaskItem.save()
//     .then((response) =>
//       res.status(201).send({
//         success: true,
//         response,
//       })
//     )
//     .catch((error) =>
//       res.status(400).send({
//         success: false,
//         error,
//       })
//     );
// });
