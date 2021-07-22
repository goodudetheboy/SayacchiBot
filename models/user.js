const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var client;

const userSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    name: String
})

userSchema.statics.getNameById = async function (userId) {
    let user;
    if (userId.startsWith('test')) return userId;
    user = await this.findById(userId);
    return user.name;
}

userSchema.statics.checkExist = async function (userId) {
    const userExist = await this.exists({ _id: userId });
    if (!userExist) {
        await this.addUser(userId);
    }
}

userSchema.statics.addUser = async function (userId) {
    let username = 'test';

    if(!userId.startsWith('test')) {
        const discordUser = await client.users.fetch(userId);
        username = discordUser.username;
    }

    let newUser = new User({
        _id: userId,
        name: username
    });
    await newUser.save()
                 .catch(console.error);
    console.log(`Added player with userId ${ userId } with username ${ username } to user database`);
}

function setDiscordClient(discordClient) {
    client = discordClient;
}

const User = mongoose.model('User', userSchema);
module.exports = {
    User, setDiscordClient
};
