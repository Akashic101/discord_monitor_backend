const { Sequelize } = require('sequelize');
const { Client } = require('discord.js');

module.exports = {
	name: 'ready',
	once: true,
	execute(client, guild) {

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

		const Roles = sequelize.define('roles', {
			id: {
				type: Sequelize.INTEGER,
				unique: true,
				alllowNull: false,
				primaryKey: true
			},
			name: Sequelize.STRING,
			color: Sequelize.INTEGER,
			createdAt: Sequelize.INTEGER,
			icon: Sequelize.STRING,
			roleId: {
				type: Sequelize.STRING,
				unique: true
			},
			managed: Sequelize.INTEGER,
			mentionable: Sequelize.INTEGER,
			position: Sequelize.INTEGER,
			memberCount: {
				type: Sequelize.INTEGER,
				defaultValue: 0
			}
		});

		Channels.sync();
		Roles.sync();

		//sync channels

		client.channels.cache.map(async (item, i) => {

			const databaseChannel = await Channels.findOne({ where: { channelID: item.id } });

			if (!databaseChannel) {

				try {
					const channel = await Channels.create({
						createdAt: item.createdAt,
						channelID: item.id,
						channelName: item.name,
						channelTopic: item.topic,
						channelNSFW: item.channelNSFW,
						parentID: item.parentId,
						url: item.url,
						type: item.type
					});

					return console.log(`Channel ${channel.channelName} added.`);
				}
				catch (error) {
					if (error.name === 'SequelizeUniqueConstraintError') {
						return console.log('That channel already exists.');
					}
				}
			}
		});

		//sync roles



		client.guilds.cache.map(guild => guild.roles.cache.forEach(async role => {

			const databaseRole = await Roles.findOne({ where: { roleId: role.id, } });

			if (!databaseRole) {
				try {
					await Roles.create({
						name: role.name,
						color: role.color,
						createdAt: role.createdAt,
						icon: role.icon,
						roleId: role.id,
						managed: role.managed,
						mentionable: role.mentionable,
						position: role.rawPosition,
						memberCount: 0
					});
				}
				catch (error) {
					if (error.name === 'SequelizeUniqueConstraintError') {
						return console.log('That role already exists.');
					}
				}
				return console.log(`Role ${role.name} added.`);
			}
		}))

	console.log(`Ready! Logged in as ${client.user.tag}`);
},
};