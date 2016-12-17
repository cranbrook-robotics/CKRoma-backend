'use strict';

var fs = require('fs');
var parseCSV = require('csv-parse');
var _ = require('lodash');


function conciseTeamMember(m){
	// First, trim the object down to just the following three properties.
	// Then, omit preferredName if empty
	//		(happens by default when no predicate is passed because of _.identity)
	return _.pickBy( _.pick(m, ['surname', 'givenName', 'preferredName']) );
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
			var teams = _.uniq( divisionMembers.map((m) => m.team) );
			division.teams = teams.map(function(teamName){
				var teamMembers = divisionMembers.filter((m) => m.team === teamName);
				return {
					numericName: teamName,
					members: teamMembers.map(conciseTeamMember)
				};
			});
		});

		console.log(JSON.stringify(org, null, '  '));
	}
});

fs.createReadStream(__dirname+'/local-data/roster.csv').pipe(parser);
