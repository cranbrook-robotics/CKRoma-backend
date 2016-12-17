'use strict';

module.exports = function(Organization) {
	var app = require('../../server/server');

	Organization.observe('before delete', function(ctx, next){
		var Division = app.models.Division;
		console.log('Organization before delete, where:', ctx.where);
		
		Division.find({where: {organizationId: ctx.where.id}})
		
		.catch(next)
		.then(function(divisions){
			console.log('destroying divisions', divisions);
			var tasks = divisions.map(d => d.destroy());
			return Promise.all(tasks);
		})

		.catch(next)
		.then(function(result){
			console.log('done destroying divisions', result);
			next();
		});
	});
};
