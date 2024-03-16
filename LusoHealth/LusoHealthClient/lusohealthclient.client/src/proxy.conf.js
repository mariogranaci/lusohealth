const PROXY_CONFIG = [
  {
    context: [
      //"/weatherforecast",
      "/api",
    ],
    //target: "https://localhost:7090",
    target: "https://lusohealthbackend.azurewebsites.net",
    secure: false
  }
]

module.exports = PROXY_CONFIG;
