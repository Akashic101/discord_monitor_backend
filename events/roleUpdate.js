const { Sequelize } = require('sequelize');
const { Client } = require('discord.js');

module.exports = {
	name: 'roleUpdate',
	async execute(oldRole, newRole) {

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

		await Roles.destroy({ where: { roleId: oldRole.id } });

		await Roles.create({
			name: newRole.name,
			color: newRole.hexColor,
			createdAt: newRole.createdAt,
			icon: newRole.icon,
			roleId: newRole.id,
			managed: newRole.managed,
			mentionable: newRole.mentionable,
			position: newRole.rawPosition,
			memberCount: 0
		});
		return console.log(`Role ${newRole.name} updated.`);
	},
};