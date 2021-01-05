const mongooge = require('mongoose');
const Schema = mongooge.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

UserSchema.plugin(passportLocalMongoose);
//from the docs:
//Passport-Local Mongoose will add a username,
//hash and salt field to store the username, the hashed password and the salt value

module.exports = mongooge.model('User', UserSchema);