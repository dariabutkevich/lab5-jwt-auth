exports.allAccess = (req, res) => {
  res.status(200).send("Test info lab5.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("Test User lab5.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Test Admin lab5.");
};