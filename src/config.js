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
		arrow: '<:arrow:1522466289199874108>',
		error: '<:no:1522467330230194268>',
		loading: '<:loading:1522467578839306260>',
		gift: '<:gift:1522467770040717403>',
		members: '<:member:732128945365057546>',
		channels: '<:channel:732125684259881052>',
		success: '<:yes:1522467214593233006>',
		timeout: '<:timeout_clock:1134453176091824250>',
		announcement: '<:announcement:732128155195801641>',
		github_star: '<:star:1522468184500862986>',
		github_fork: '<:fork:1522468239282671736>',
		exchange: '<:exchange:1522469091183694036>'
	},
	colors: {
		basic: '#3FCC65',
		error: '#CC3F3F',
		success: '#60CC3F',
		starboard: '#CCC73F'
	}
};
