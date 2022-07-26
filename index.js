const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, User } = require('discord.js');
const { token } = require('./config.json');
const { Sequelize, Op } = require('sequelize');

const express = require('express')
const app = express()
const port = 5000

var cors = require('cors');

//-----------------------------SEQUELIZE-----------------------------

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

Channels.sync();
Users.sync();
Roles.sync();

//-----------------------------DISCORD-----------------------------

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildPresences
	]
})

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(token);

//-----------------------------API-----------------------------

app.use(cors({ origin: true, credentials: true }));

app.get('/channel/:channelID?/:data?', async function (req, res) {

	if (req.params.channelID) {
		const channel = await Channels.findOne({ where: { channelID: req.params.channelID } });

		if (channel === null) {
			res.send('Not found!');
		} else {
			if (req.params.data) {
				res.send(channel.get(req.params.data));
				return;
			}
			else {
				res.json(channel);
				return;
			}
		}
	}
	else {
		const users = await Channels.findAll({where: {
			parentID: {
			  [Op.not]: null
			}
		  },
			order: [
				["messageCount", "DESC"],
				["parentID", "DESC"]
			]
		})
		res.json(users);
	}
})

app.get('/role/:roleID?/:data?', async function (req, res) {

	if (req.params.roleID) {
		const user = await Roles.findOne({ where: { roleId: req.params.roleID } });

		if (user === null) {
			res.send('Not found!');
		} else {
			if (req.params.data) {
				res.send(user.get(req.params.data));
				return;
			}
			else {
				res.json(user);
				return;
			}
		}
	}
	else {
		const roles = await Roles.findAll({
			order: [
				["memberCount", "DESC"],
				["createdAt", "DESC"]
			]
		})
		res.json(roles);
	}
})

app.get('/user/:userID?/:data?', async function (req, res) {

	if (req.params.userID) {
		const user = await Users.findOne({ where: { userID: req.params.userID } });

		if (user === null) {
			res.send('Not found!');
		} else {
			if (req.params.data) {
				res.send(user.get(req.params.data));
				return;
			}
			else {
				res.json(user);
				return;
			}
		}
	}
	else {
		const users = await Users.findAll({
			order: [
				["highestRoleID", "DESC"],
				["messagesSend", "DESC"],
				["bot", "ASC"]
			]
		})
		res.json(users);
	}

})

app.listen(port, () => {
	console.log(`Listening on port ${port}: http://localhost:5000`)
})