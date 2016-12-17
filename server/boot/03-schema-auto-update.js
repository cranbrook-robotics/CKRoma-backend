'use strict';

module.exports = function(app) {
	var pg = app.dataSources.pg;
	pg.isActual(null, function(err, actual){
		if(err){
			console.log('problem running isActual');
			console.log(err);
		} else {
			if(!actual){
				pg.autoupdate(null, function(err, result){
					if(err){
						console.log('problem running autoupdate');
						console.log(err);
					} else{
						console.log(result);
					}
				});
			} else {
				console.log('It is "actual"');
			}
		}
	});
};
