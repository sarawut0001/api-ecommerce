exports.create = async (req, res) => {
  try {
    res.send("Hello category");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sever Error" });
  }
};

exports.list = async (req, res) => {
  try {
    res.send("Hello category list");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sever Error" });
  }
};

exports.remove = async (req, res) => {
  try {
    console.log(req.body);
    res.send("Hello remove category");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sever Error" });
  }
};
