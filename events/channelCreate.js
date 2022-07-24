const { Sequelize } = require('sequelize');
const { Client } = require('discord.js');

module.exports = {
    name: 'channelCreate',
    async execute(channel) {

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
            const createdChannel = await Channels.create({
                createdAt: channel.createdAt,
                channelID: channel.id,
                channelName: channel.name,
                channelTopic: channel.topic,
                channelNSFW: channel.channelNSFW,
                parentID: channel.parentId,
                url: channel.url,
                type: channel.type
            });
        }
        catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return console.log('That channel already exists.');
            }
        }
        return console.log(`Channel ${channel.name} added.`);
    },
};