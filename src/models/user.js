const mongoose = require("mongoose");
const validator = require("validator");
const { isEmail } = validator;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Task = require("./task");

// name: string, email: string, password: string(6), age: number

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate: (value) => EmailValidator(value),
    },

    password: {
      type: String,
      required: true,
      trim: true,
      minLength: 6,
      validate: (value) => NotWordPasswordIncludeValidation("password", value),
    },

    age: {
      type: Number,
      default: 0,
      validate: (value) => PositiveNumberValidator(value),
    },

    avatar: {
      type: Buffer,
      default: null
    },

    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

UserSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

UserSchema.statics.findByCredentials = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Unable login");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Unable login");
  }

  return user;
};

UserSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
});

UserSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }

  next();
});

UserSchema.pre("remove", async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });

  next();
});

const User = mongoose.model("User", UserSchema);

module.exports = User;

// ------------------- Validator Function -----------------

const PositiveNumberValidator = (value) => {
  if (value < 0) {
    throw new Error("Age must be a positive number");
  }
};

const EmailValidator = (value) => {
  if (!isEmail(value)) {
    throw new Error("Is not email");
  }
};

const NotWordPasswordIncludeValidation = (word, value) => {
  if (value.toLowerCase().includes(word)) {
    throw new Error("Password contain password word");
  }
};
