const express = require("express");

const User = require("../models/user");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const {
  sendWelcomeEmail,
  sendDeleteAccountEmail,
} = require("../emails/accounts");
// const { diskStorage } = require("multer");

// ---------------------- CONFIG -----------------------------------

const router = new express.Router();
const upload = multer({
  // dest: "statics/images/avatar",
  // storage: diskStorage({
  //   destination: "statics/images/avatar",
  //   filename: function (req, file, cb) {
  //     cb(null, file.originalname);
  //   },
  // }),
  limits: {
    fieldSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      // /\.(doc|docx)$/ esto es una expresion regular, estudiarlas mas a fondo.
      cb("Su imagen no es del formato adecuado", false);
      return;
    }

    cb(undefined, true);
  },
});

// --------------------- ROUTES ASYNC-AWAIT  ------------------------

router.get("/users/me", auth, async (req, res) => {
  res.send({ success: true, response: req.user });
});

router.post(
  "/users/me",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    // req.user.avatar = req.file.buffer;
    const buffer = await sharp(req.file.buffer)
      .png()
      .resize({ width: 250, height: 250 })
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send({ success: true });
  },
  (error, req, res, next) => {
    res.status(400).send({ success: false, error });
  }
);

router.delete("/users/me/avatar", auth, async (req, res) => {
  try {
    req.user.avatar = null;
    await req.user.save;
    res.send({ success: true, response: req.user });
  } catch (error) {
    res.status(500).send({ success: false, error: "something went wrong." });
  }
});

router.get("/users/:id/avatar", async (req, res) => {
  try {
    const response = await User.findById(req.params.id);
    res.set({ "content-type": "image/jpeg" });
    res.send(response.avatar);
  } catch (error) {
    res.status(400).send({ success: false, error });
  }
});

router.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    const response = await user.save();
    const token = await response.generateAuthToken();
    sendWelcomeEmail(response.email, response.name)
    res.status(201).send({
      success: true,
      response,
      token,
    });
  } catch (error) {
    res.status(400).send({ success: false, error });
  }
});

router.post("/users/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const response = await User.findByCredentials({ email, password });
    const token = await response.generateAuthToken();
    res.send({ success: true, response, token });
  } catch (error) {
    res.status(400).send({ success: false, error });
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();

    res.send();
  } catch (error) {
    res.status(500).send({ success, error });
  }
});

router.post("/users/logout-all", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    res.send();
  } catch (error) {
    res.status(500).send({ success, error });
  }
});

router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidOpeation = updates.every((item) =>
    allowedUpdates.includes(item)
  );

  if (!isValidOpeation) {
    return res.status(400).send({ success: false, error: "Invalid updates!" });
  }

  try {
    const response = req.user;

    updates.forEach((update) => (response[update] = req.body[update]));
    await response.save();

    res.send({ success: true, response });
  } catch (error) {
    res.status(400).send({ success: false, error });
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    sendDeleteAccountEmail(req.user.email, req.user.name)
    res.send({ success: true, response: req.user });
  } catch (error) {
    res.status(500).send({ success: false, error: "something went wrong." });
  }
});

module.exports = router;

// ---------------------- Routes promises -------------------------------------

// router.get("/users", (req, res) => {
//   User.find({})
//     .then((response) =>
//       res.send({
//         success: true,
//         response,
//       })
//     )
//     .catch((error) =>
//       res.status(500).send({
//         success: false,
//         error,
//       })
//     );
// });

// router.get("/users/:id", (req, res) => {
//   let _id = req.params.id;

//   User.findById(_id)
//     .then((user) => {
//       if (!user) {
//         return res.status(404).send({
//           success: false,
//           error: "User not found",
//         });
//       }

//       res.send({
//         success: true,
//         respose: user,
//       });
//     })
//     .catch((error) => {
//       res.status(500).send({
//         success: false,
//         error,
//       });
//     });
// });

// router.post("/users", (req, res) => {
//   const user = new User(req.body);

//   user
//     .save()
//     .then((user) => res.status(201).send(user))
//     .catch((error) => res.status(400).send(error));
// });
