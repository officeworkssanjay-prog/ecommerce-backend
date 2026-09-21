import { app } from "./app";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Node.js Express API running on port ${PORT}`);
  console.log(`📡 Health check available at http://localhost:${PORT}/health`);
});
