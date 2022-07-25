const { Sequelize } = require('sequelize');
const { Client } = require('discord.js');

module.exports = {
	name: 'channelDelete',
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
			createdAt: Sequelize.DATEONLY,
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
			await Channels.destroy({ where: {  channelID: channel.id } });
		}

		catch (error) {
			if (error.name === 'SequelizeUniqueConstraintError') {
				return console.log('That channel already exists.');
			}
		}
		return console.log(`Channel ${channel.name} deleted.`);
	},
};