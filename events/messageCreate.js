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
			avatar: Sequelize.STRING,
			banner: Sequelize.INTEGER,
			accentColor: Sequelize.INTEGER,
			bot: Sequelize.INTEGER,
			createdAt: Sequelize.DATEONLY,
			discriminator: Sequelize.STRING,
			messagesSend: Sequelize.INTEGER
		});

        Channels.sync();
        Users.sync();

        try {

            const databaseChannel = await Channels.findOne({ where: { channelID: message.channelId } });

            if (databaseChannel) {
                databaseChannel.increment('messageCount');
            }

            const databaseUser = await Users.findOne({ where: { userId: message.author.id } });

            if (databaseUser) {
                databaseUser.increment('messagesSend');
            }
        }
        catch (error) {
            console.log(error)
        }
    },
};