import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import shiftController from "./controllers/shiftController";

const app = express().use(cors()).use(bodyParser.json());
const port = 8080;

app.use("/shift", shiftController);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
