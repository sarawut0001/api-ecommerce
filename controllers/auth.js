const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!password)
      return res.status(400).json({ message: "Password is required" });

    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (user) return res.status(400).json({ message: "Email already exist!!" });

    const hashPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        password: hashPassword,
      },
    });

    res.send("Register successfully!!");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sever Error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user || !user.enable)
      return res
        .status(400)
        .json({ message: "User not found or not enabled!!" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ message: "Password Invalid!!" });

    const payload = {
      id: user.id,
      password: user.email,
      role: user.role,
    };

    jwt.sign(
      payload,
      process.env.SECRET_KEY,
      {
        expiresIn: "1d",
      },
      (err, token) => {
        if (err) return res.status(500).json({ message: "Server error" });

        res.json({ payload, token });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sever Error" });
  }
};

exports.currentUser = async (req, res) => {
  try {
    res.send("Hello current user in Controller");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sever Error" });
  }
};
