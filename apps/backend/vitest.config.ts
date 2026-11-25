import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
    testTimeout: 20000,
    hookTimeout: 30000,
    // Tests share one database, so run files one after another.
    fileParallelism: false,
    env: {
      NODE_ENV: "test",
      // Fake gateway keys: the Razorpay HTTP call is mocked, signature checks use the real code.
      RAZORPAY_KEY_ID: "rzp_test_unit_key",
      RAZORPAY_KEY_SECRET: "rzp_test_unit_secret_value",
    },
  },
});
