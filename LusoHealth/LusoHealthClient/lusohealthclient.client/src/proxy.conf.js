const PROXY_CONFIG = [
  {
    context: [
      "/api",
    ],
    target: "https://lusohealth.azurewebsites.net",
    secure: false
  }
]

module.exports = PROXY_CONFIG;
