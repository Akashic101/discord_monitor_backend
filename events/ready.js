const Sequelize = require('sequelize');

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
			},
			color: Sequelize.STRING
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
			createdAt: Sequelize.DATEONLY,
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
			createdAt: Sequelize.DATEONLY,
			discriminator: Sequelize.STRING,
			messagesSend: Sequelize.INTEGER,
			highestRoleID: Sequelize.INTEGER,
			highestRoleName: Sequelize.STRING
		});

		Channels.sync();
		Roles.sync();
		Users.sync();

		//sync channels

		client.channels.cache.map(async (item) => {

			const databaseChannel = await Channels.findOne({ where: { channelID: item.id } });

			if (!databaseChannel) {

				try {

					let colorBase = item.parentId || 764329
					let colorConverted = colorBase.toString()
					let colorSliced = colorConverted.slice(-6)

					await Channels.create({
						createdAt: item.createdAt,
						channelID: item.id,
						channelName: item.name,
						channelTopic: item.topic,
						channelNSFW: item.channelNSFW,
						parentID: item.parentId,
						url: item.url,
						type: item.type,
						color: colorSliced
					});
				}
				catch (error) {
					console.error(error)
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
					console.error(error)
				}
			}
		}))

		//sync user
		const Guilds = client.guilds.cache.map((guild) => guild);
		Guilds[0].members.fetch().then((members) => {
			members.map(async (member) => {

				try {

					let memberHighestRole = member.roles

					let person = Guilds[0].members.cache.get(member.id);

					const databaseUser = await Users.findOne({ where: { userId: member.id } });

					if (!databaseUser) {

						await Users.create({
							userId: person.user.id,
							username: person.user.username,
							nickname: member.nickname,
							avatar: person.user.displayAvatarURL({ format: 'jpg', size: 256 }),
							banner: person.user.bannerURL(),
							accentColor: member.displayHexColor,
							bot: person.user.bot,
							createdAt: person.user.createdAt,
							discriminator: person.user.discriminator,
							messagesSend: 0,
							highestRoleID: memberHighestRole.highest.position,
							highestRoleName: memberHighestRole.highest.name

						});
					}
				}
				catch (error) {
					console.error(error)
				}
			})
		})

		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};