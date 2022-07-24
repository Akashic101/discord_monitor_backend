const { Sequelize } = require('sequelize');
const { Client } = require('discord.js');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldUser, newUser) {
        console.log("yes")
        console.log(newUser)
    },
};