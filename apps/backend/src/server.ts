import { env } from "./config/env";
import { app } from "./app";

app.listen(env.PORT, () => {
  console.log(`🚀 Node.js Express API running on port ${env.PORT}`);
  console.log(`📡 Health check available at http://localhost:${env.PORT}/health`);
});
