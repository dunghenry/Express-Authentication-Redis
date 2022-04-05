const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const axios = require("axios");
const Redis = require("redis");
const redisClient = Redis.createClient();
const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};
const DEFAULT_EXPIRATION = 3000;
const port = process.env.PORT || 4000;
dotenv.config();
const app = express();
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());
app.use(cors(corsOptions));
app.use(morgan("combined"));

app.get("/photos", async (req, res) => {
  const albumId = req.query.albumId;
  const photos = await getOrSetCache(`photos?albumId=${albumId}`, async () => {
    const {
      data
    } = await axios.get("https://jsonplaceholder.typicode.com/photos", {
      params: {
        albumId,
      }
    });
    return data;
  });
  // redisClient.get(`photos?albumId=${albumId}`, async (error, photos) => {
  //     if (error) console.log(error);
  //     if (photos != null) {
  //         console.log("Cache Hit");
  //         return res.json(JSON.parse(photos));
  //     } else {
  //         console.log("Cache Miss")
  //         const {data} = await axios.get("https://jsonplaceholder.typicode.com/photos", {
  //             params: {
  //                 albumId
  //             }
  //         })
  //         redisClient.setex(`photos?albumId=${albumId}`, DEFAULT_EXPIRATION, JSON.stringify(data));
  //         res.json(data);
  //     }
  // })

  res.json(photos);
});

app.get("/photos/:id", async (req, res) => {
  const photo = await getOrSetCache(`photos:${req.params.id}`, async () => {
    const {data} = await axios.get(`https://jsonplaceholder.typicode.com/photos/${req.params.id}`);
    return data;
  });

  res.json(photo);
});

function getOrSetCache(key, cb) {
  return new Promise((resolve, reject) => {
    redisClient.get(key, async (err, data) => {
      if (err) return reject(err);
      if (data != null) return resolve(JSON.parse(data));
      const freshData = await cb();
      redisClient.setex(key, DEFAULT_EXPIRATION, JSON.stringify(freshData));
      resolve(freshData);
    });
  });
}
app.listen(port, () => console.log(`App listening on http://localhost:${port}`));