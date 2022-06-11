const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");
const axios = require("axios");

mongoose
  .connect("mongodb://localhost:27017/yelp-camp")
  .then(console.log("DB connected"))
  .catch((e) => console.log(e));

const createTitle = (list) => list[Math.floor(Math.random() * list.length)];

const getImage = async () => {
  try {
    const image = await axios.get(
      "https://api.unsplash.com/photos/random/?client_id=HndTSFLUqz0aPWTReGT1Aejq0ZR2ce7WtHQw5hHE0_U&collections=11649432"
    );
    return image.data.urls.small;
  } catch (error) {
    console.log(error);
  }
};

const seedDb = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 20; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 30);
    await Campground.create({
      author: "628294e11a46b5d4cffd7541",
      title: `${createTitle(descriptors)} ${createTitle(places)}`,
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      geometry: { type: "Point", coordinates: [76.09927, 13.007082] },
      // image: await getImage(),
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam neque vitae quisquam saepe amet voluptas facere minima porro, deleniti rerum delectus quibusdam obcaecati atque corrupti sit sequi suscipit, dolorum laboriosam.",
      price,
      images: [
        {
          url: "https://res.cloudinary.com/dywbs306a/image/upload/v1654782879/YelpCamp/btinr8tvrkituoglsqz7.jpg",
          filename: "YelpCamp/btinr8tvrkituoglsqz7",
        },
        {
          url: "https://res.cloudinary.com/dywbs306a/image/upload/v1654782881/YelpCamp/qam5jrpphfgr1ov3skgg.jpg",
          filename: "YelpCamp/qam5jrpphfgr1ov3skgg",
        },
      ],
    });
  }
};

seedDb().then(() => mongoose.connection.close());
