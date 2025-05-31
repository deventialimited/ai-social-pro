module.exports = {
  apps: [
    {
      name: "backend",
      script: "./index.js",
      watch: true,
      ignore_watch: ["public/generated"],
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
