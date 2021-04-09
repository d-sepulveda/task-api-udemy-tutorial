require("../src/db/mongoose");
const Task = require("../src/models/task");

const DeleteAndUpdate = async (taskID) => {
  await Task.findByIdAndDelete(taskID);
  return await Task.countDocuments({ completed: false });
};

DeleteAndUpdate("602f1a4643bd3bdb1f296c54")
  .then((response) => console.log("response --->", response))
  .catch((error) => console.log("error --->", error));
