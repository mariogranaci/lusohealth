const PROXY_CONFIG = [
  {
    context: [
      "/api",
    ],
    target: "https://luso-health-backend.azurewebsites.net",
    secure: false
  }
]

module.exports = PROXY_CONFIG;
