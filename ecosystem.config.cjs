module.exports = {
  apps: [
    {
      name: "manna-hub",
      script: "dist/index.js",
      interpreter: "/home/qsfttpdi/.nvm/versions/node/v20.20.2/bin/node",
      node_args: "--max-old-space-size=256",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
      // Restart policy — back off if crashing to avoid hammering resource limits
      max_restarts: 5,
      min_uptime: "10s",
      restart_delay: 5000,
    },
  ],
};
