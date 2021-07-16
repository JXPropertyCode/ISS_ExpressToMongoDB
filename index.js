require("dotenv").config();
const { default: axios } = require("axios");
const express = require("express");
const app = express();
const p = process.env.PORT;
const moment = require("moment");
const time = 3000;
const FlyingObject = require("./models/FlyingObject");

// Mongoose connection
const mongoose = require("mongoose");

// sends to atlas server instead of my local mongodb
const url = process.env.MONGODB_ATLAS_URL;

mongoose.connect(url, {
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

setInterval(() => {
	axios.get("http://api.open-notify.org/iss-now.json").then((response) => {
		console.log(response.data);
		let convertResData = {
			timestamp: convertTime(response.data.timestamp),
			lat: Number(response.data.iss_position.latitude),
			lng: Number(response.data.iss_position.longitude),
		};

		FlyingObject.create(convertResData, function (err) {
			if (err) throw err;
			// console.log("Inserted a New Data")
			// console.log(convertResData);
		});
	});
}, time);

app.get("/", (req, res) => res.send("ok"));

app.listen(p, () => console.log(`Live on http://localhost:${p}`));
