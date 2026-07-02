module.exports = {
	owners: ['439079453650321409', '867048292566302730'], // ID администраторов для команд eval, shell и block
	channels: {
		serverLogs: '1137366763177267261', // ID канала с логами о серверах, куда добавлен бот
		startLogs: '1115145596429406280', // ID канала с логами о запуске бота
		errorLogs: '1115145596429406280', // ID канала для сообщений об ошибках
		dbLogs: '1124261194325299271', // ID канала для логов базы данных
		statLogs: '1325531515148308640' // ID канала для ежедневной статистики
	},
	emojis: { // Эмодзи, которые будут использоваться в командах
		// Эмодзи в /userinfo надо настраивать в файле cmds/slashCommands/Main/userinfo.js
		arrow: '<:arrow:1140937463209152572>',
		error: '<:no:1107254682100957224>',
		loading: '<a:loading:673777314584199169>',
		gift: '<:Gift:1189196716373725235>',
		members: '<:member:732128945365057546>',
		channels: '<:channel:732125684259881052>',
		success: '<:yes:1107254746336735312>',
		timeout: '<:timeout_clock:1134453176091824250>',
		announcement: '<:announcement:732128155195801641>',
		github_star: '<:star:1238381503352803359>',
		github_fork: '<:fork:1238381500748271677>',
		exchange: '<:exchange:1315673012271321251>'
	},
	colors: {
		basic: '#3FCC65',
		error: '#CC3F3F',
		success: '#60CC3F',
		starboard: '#CCC73F'
	}
};
