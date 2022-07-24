const { Sequelize } = require('sequelize');
const { Client } = require('discord.js');
const { STRING } = require('sequelize');

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

		const Users = sequelize.define('users', {
			id: {
				type: Sequelize.INTEGER,
				unique: true,
				alllowNull: false,
				primaryKey: true
			},
			userId: {
				type: Sequelize.STRING,
				unique: true
			},
			username: Sequelize.STRING,
			nickname: Sequelize.STRING,
			avatar: Sequelize.STRING,
			banner: Sequelize.INTEGER,
			accentColor: Sequelize.STRING,
			bot: Sequelize.INTEGER,
			createdAt: Sequelize.INTEGER,
			discriminator: Sequelize.STRING,
			messagesSend: Sequelize.INTEGER
		});

		Channels.sync();
		Roles.sync();
		Users.sync();

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
					console.log(error)
				}
				return console.log(`Role ${role.name} added.`);
			}
		}))

		//sync user
		const Guilds = client.guilds.cache.map((guild) => guild);
		Guilds[0].members.fetch().then((members) => {
			members.map(async (member) => {

				try {
					let person = Guilds[0].members.cache.get(member.id);
					const databaseUser = await Users.findOne({ where: { userId: member.id } });

					if (!databaseUser) {

						await Users.create({
							userId: person.user.id,
							username: person.user.username,
							nickname: member.nickname,
							avatar: person.user.avatarURL(),
							banner: person.user.bannerURL(),
							accentColor: person.user.hexAccentColor,
							bot: person.user.bot,
							createdAt: person.user.createdAt,
							discriminator: person.user.discriminator,
							messagesSend: 0
						});
					}
				}
				catch (error) {
					console.log(error)
				}
			})
		})

		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};