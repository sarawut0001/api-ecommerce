const express = require("express");
const app = express();
const morgan = require("morgan");
const { readdirSync } = require("fs");
const cors = require("cors");

// middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

readdirSync("./routes").map((item) =>
  app.use("/api", require("./routes/" + item))
);

app.listen(3001, () => console.log("server is runing on port 3001"));
