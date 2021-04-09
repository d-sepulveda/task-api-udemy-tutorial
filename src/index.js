const express = require("express");
const bcrypt = require("bcrypt");

require("./db/mongoose");
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.get("/", (req, res) => {
  try {
    res.send({ success: true, response: "index page" });
  } catch (error) {
    (error) => res.status(404).send({ succes: false, error });
  }
});

app.listen(PORT, () => console.log("Server is up on port ", PORT));

// //como usar el encriptador de texto
// const myFunction = async () => {
//   const password = "123456"
//   const hast = await bcrypt.hash(password, 10)
//   return await bcrypt.compare("123456", hast)
// }

// myFunction().then(response => console.log(response))

// -------------------------------------------------------------------------------

// const Task = require("./models/task")
// const User = require("./models/user")

// const main = async () => {
//   // const task = await User.findById("6052b3503e0e9dbcc17fe289")
//   // await task.populate('owner').execPopulate()

//   const user = await User.findById("6052b3503e0e9dbcc17fe289")
//   await user.populate('tasks').execPopulate()
//   console.log(user.tasks)
// }

// main()
