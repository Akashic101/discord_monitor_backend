const { Sequelize } = require('sequelize');
const { Client } = require('discord.js');

module.exports = {
	name: 'roleCreate',
	async execute(role) {

		const sequelize = new Sequelize('database', 'user', 'password', {
			host: 'localhost',
			dialect: 'sqlite',
			logging: false,
			// SQLite only
			storage: 'syndicate_motorsports_database.sqlite',
		});

		const Roles = sequelize.define('roles', {
			id: {
				type: Sequelize.INTEGER,
				unique: true,
				alllowNull: false,
				primaryKey: true
			},
			name: Sequelize.STRING,
			color: Sequelize.STRING,
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

		Roles.sync();

		try {
			await Roles.create({
				name: role.name,
				color: role.hexColor,
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

	},
};