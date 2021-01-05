const mongoose = require('mongoose');
const Coffeeplace = require('../models/Coffeeplace');
const cities = require('all-the-cities');
const { descriptors, places} = require('./seedHelpers');
//I went out the scope of the course and found this library

mongoose.connect('mongodb://localhost:27017/cawfeeplaces', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Databse Connected");
});

const city = cities.filter(city => city.country.match('SA') && city.population > 100000);
//finding major (more than 1M resident) citites in Saudi Arabia

const sample = arr => arr[Math.floor(Math.random() * arr.length)];
//find index random in a given array
const seedDB = async () => {
    await Coffeeplace.deleteMany({});
    for(let i=0; i<5; i++){
        const random = Math.floor(Math.random() * 10);
        const place = Coffeeplace({
            location: `${ city[random].name }`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/436278/1600x900',
            price: random,
            descreption: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Accusamus, natus. Illo dolore, optio debitis adipisci, est culpa minima repudiandae libero, recusandae facilis modi velit. Facilis possimus fugit et molestiae sunt!'
        });
        await place.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close();
});