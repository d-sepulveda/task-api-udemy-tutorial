const mongoose = require("mongoose");
const validator = require("validator");

// description: string, completed: boolean

const TaskSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Types.ObjectId,
      require: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

TaskSchema.pre("save", function (next) {
  //middleware no hace nada
  next();
});

const Task = mongoose.model("Task", TaskSchema);

module.exports = Task;
