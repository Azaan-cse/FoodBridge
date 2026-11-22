import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "FoodBridge API is running!",
  });
});

app.use("/api", router);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`FoodBridge API running on port ${PORT}`);
});