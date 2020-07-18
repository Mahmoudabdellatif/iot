var express = require("express"),
  http = require("http"),
  app = express(),
  path = require("path"),
  cfenv = require("cfenv"),
  appEnv = cfenv.getAppEnv(),
  bodyParser = require("body-parser"),
  cloudant = require("@cloudant/cloudant"),
  device_type = "mypulse",
  device_info = null,
  dbname = "device_info",
  host = process.env.VCAP_APP_HOST || "localhost",
  port = process.env.PORT || 3000,
  api = require("./routes/api");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.set("port", port);
app.use("/api", api);

// if (process.env.VCAP_SERVICES) {
//   var env = JSON.parse(process.env.VCAP_SERVICES);
//   console.log(env);

//   if (env["cloudantNoSQLDB"]) {
//     db_props = env["cloudantNoSQLDB"][0]["credentials"];
//     console.log(db_props);
//   } else {
//     console.log("You must bind the Cloudant DB to this application");
//   }

//   if (env["iotf-service"]) {
//     iot_props = env["iotf-service"][0]["credentials"];
//     console.log(iot_props);
//   } else {
//     console.log(
//       "You must bind the Internet of Things service to this application"
//     );
//   }
// }

db_props = {
  apikey: "PylGV2FClEjJiy51o_QGYQ6x0D4D-Vp0Zt7IGiMsSpQi",
  host:
    "90932f91-0bf4-46cb-8241-bbe3d88e4242-bluemix.cloudantnosqldb.appdomain.cloud",
  password: "cf0785041888e8b1cb146bf5b746f20212ed2fd73a9b90bc0517628e0e7c5f87",
  port: 443,
  url:
    "https://90932f91-0bf4-46cb-8241-bbe3d88e4242-bluemix:cf0785041888e8b1cb146bf5b746f20212ed2fd73a9b90bc0517628e0e7c5f87@90932f91-0bf4-46cb-8241-bbe3d88e4242-bluemix.cloudantnosqldb.appdomain.cloud",
  username: "90932f91-0bf4-46cb-8241-bbe3d88e4242-bluemix",
};

cloudant({ account: db_props.username, password: db_props.password }, function (
  err,
  cloudant
) {
  console.log("Connected to Cloudant");
  cloudant.db.list(function (err, all_dbs) {
    if (all_dbs.indexOf(dbname) < 0) {
      cloudant.db.create(dbname, function () {
        device_info = cloudant.use(dbname);
        console.log("created DB " + dbname);
      });
    } else {
      console.log("found DB " + dbname);
      device_info = cloudant.use(dbname);
    }
  });
});

app.get("/api/:sensordata", function (req, res) {
  var data = req.params.sensordata;
  var parsed = JSON.parse(data);
  device_info.insert({
    data: data,
    deviceid: parsed.d.deviceid,
    date: new Date(),
  }); //, data, function(err, body) {
});

app.listen(app.get("port"), function () {
  console.log("Server started at " + host + ":" + port);
});

module.exports = app;
