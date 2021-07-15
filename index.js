const { default: axios } = require("axios");
const express = require("express");
const app = express();
const p = process.env.PORT || 8001;
const moment = require("moment");
const time = 3000;
const FlyingObject = require("./models/FlyingObject");

// Mongoose connection
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/iss", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});
const db = mongoose.connection;

// Check for DB connection
db.once("open", function () {
	console.log("Connected to MongoDB successfully!");
});
db.on("error", function () {
	console.log(err);
});

const convertTime = (givenTimeStamp) => {
	if (givenTimeStamp !== null) {
		return moment.unix(givenTimeStamp).format("MM/DD/YY hh:mm:ss a");
	}
};

let latestISSs = [];

setInterval(() => {
	axios.get("http://api.open-notify.org/iss-now.json").then((response) => {
		let convertResData = {
			timestamp: convertTime(response.data.timestamp),
			lat: Number(response.data.iss_position.latitude),
			lng: Number(response.data.iss_position.longitude),
			created: String(Date()),
		};
		latestISSs[0] = convertResData;

		FlyingObject.create(convertResData, function (err) {
			if (err) throw err;
			// console.log("Inserted a New Data")
			console.log(convertResData);
		});

	});
}, time);

app.get("/", (req, res) => res.send(latestISSs[latestISSs.length - 1]));

app.listen(p, () => console.log(`Live on http://localhost:${p}`));
