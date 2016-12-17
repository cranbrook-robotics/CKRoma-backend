'use strict';



module.exports = function(Division) {
	var app = require('../../server/server');

	Division.observe('before delete', function(ctx, next){
		var Team = app.models.Team;
		console.log('Division before delete, where:', ctx.where);
		Team.destroyAll({divisionId: ctx.where.id})
		.catch(next)
		.then(function(result){
			console.log('done destroying teams', result);
			next();
		});
	});
};
