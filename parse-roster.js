'use strict';

var fs = require('fs');
var parseCSV = require('csv-parse');
var _ = require('lodash');


function conciseTeamMember(m){
	// First, trim the object down to just the following three properties.
	// Then, omit preferredName if empty
	//		(happens by default when no predicate is passed because of _.identity)
	return _.pickBy( _.pick(m, ['surname', 'givenName', 'preferredName', 'classYear']) );
}

var parser = parseCSV({columns: true}, function(err, data){
	if(err){
		console.log('problem...', err);
	} else {
		var divisions = _.uniq( data.map((m) => m.division) ); 
		var org = {
			name: 'Cranbrook Schools Robotics',
			divisions: divisions.map((d) => ({name: d}))
		};
		org.divisions.forEach(function(division, i){
			var divisionMembers = data.filter((m) => m.division === division.name);
			var subdivisions = _.uniq( divisionMembers.map(m => m.subdivision) );
			division.subdivisions = subdivisions.map( s => ({name: s}) );
			division.subdivisions.forEach(subdivision => {
				var subdivisionMembers = divisionMembers.filter( m => m.subdivision === subdivision.name );
				if( !subdivision.name ) subdivision.name = null;
				var teams = _.uniq( subdivisionMembers.map( m => m.team ) );
				subdivision.teams = teams.map(teamId => {
					var teamMembers = subdivisionMembers.filter( m => m.team === teamId );
					return {
						numericName: teamId,
						members: teamMembers.map(conciseTeamMember)
					};
				});
			});
		});

		console.log(JSON.stringify(org, null, '  '));
	}
});

fs.createReadStream(__dirname+'/local-data/roster.csv').pipe(parser);
