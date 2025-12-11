import app from "./src/app.js";

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Node backend running on port ${PORT}`);
});
