import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Airena load test service is running 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
