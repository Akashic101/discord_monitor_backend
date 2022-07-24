const { Sequelize } = require('sequelize');
const { Client } = require('discord.js');

module.exports = {
    name: 'messageCreate',
    async execute(message) {

        const sequelize = new Sequelize('database', 'user', 'password', {
            host: 'localhost',
            dialect: 'sqlite',
            logging: false,
            // SQLite only
            storage: 'syndicate_motorsports_database.sqlite',
        });

        const Channels = sequelize.define('channels', {
            id: {
                type: Sequelize.INTEGER,
                unique: true,
                alllowNull: false,
                primaryKey: true
            },
            createdAt: Sequelize.INTEGER,
            channelID: Sequelize.STRING,
            channelName: Sequelize.STRING,
            channelTopic: Sequelize.STRING,
            channelNSFW: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            parentID: Sequelize.STRING,
            url: Sequelize.STRING,
            type: Sequelize.STRING,
            messageCount: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            }
        });

        Channels.sync();

        try {

            const databaseChannel = await Channels.findOne({ where: { channelID: message.channelId } });

            if (databaseChannel) {
                databaseChannel.increment('messageCount');
            }
        }
        catch (error) {
            console.log(error)
        }
    },
};