const { Sequelize } = require('sequelize');
const { Client } = require('discord.js');

module.exports = {
    name: 'channelUpdate',
    async execute(oldChannel, newChannel) {

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
			await Channels.destroy({ where: { channelID: oldChannel.id } });

			await Channels.create({
                createdAt: newChannel.createdAt,
                channelID: newChannel.id,
                channelName: newChannel.name,
                channelTopic: newChannel.topic,
                channelNSFW: newChannel.channelNSFW,
                parentID: newChannel.parentId,
                url: newChannel.url,
                type: newChannel.type
            });
		}
        catch (error) {
            console.log(error)
        }
        return console.log(`Channel ${newChannel.name} updated.`);
    },
};