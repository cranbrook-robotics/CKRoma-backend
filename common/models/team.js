'use strict';

module.exports = function(Team) {
	var app = require('../../server/server');

	Team.observe('before delete', function(ctx, next){
		var Member = app.models.Member;
		console.log('Team before delete, where:', ctx.where);
		Member.destroyAll({teamId: ctx.where.id})
		.catch(next)
		.then(function(result){
			console.log('done destroying team members', result);
			next();
		});
	});
};
