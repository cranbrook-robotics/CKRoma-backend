'use strict';

var orgTemplate = require('../../local-data/roster.json');
var _ = require('lodash');


module.exports = function(app) {
	var Organization = app.models.Organization;

	var orgWithName = _.pick(orgTemplate, 'name');

	Organization.findOrCreate( {
		where: orgWithName,
		include: {divisions: {teams: {
			members: {}//['surname', 'givenName', 'preferredName']
		}}}
	}, orgWithName )
	
	.catch(function(err){
		console.log('problem getting orgs', err);
	})
	.then(function(params){
		var org = params[0];
		var orgData = org.toJSON();
		console.log(JSON.stringify(orgData, null, 2));
		var divisionsToPut = _.differenceBy(orgTemplate.divisions, orgData.divisions, 'name');
		divisionsToPut = divisionsToPut.map( (d) => _.pick(d, 'name') );
		console.log('Create these divisions', divisionsToPut);
		return org.divisions.create(divisionsToPut)
	})

	.catch(function(err){
		console.log('problem creating divisions', err);
	})
	.then(function(createdDivisions) {
		//console.log(createdDivisions);
		var teamCreationPromises = [];
		createdDivisions.forEach(function(d){
			let divisionTeams = _.find(orgTemplate.divisions, _.pick(d, 'name')).teams;
			let teamsToMake = divisionTeams.map( (t) => _.pick(t, ['numericName', 'name']) );
			console.log('Team to make for '+d.name, teamsToMake);
			let divisionTeamsPromise = d.teams.create(teamsToMake)
			.catch(function(err){
				console.log('problem creating one set of teams', err);
			})
			.then(function(createdTeams){
				let memberPromises = [];
				createdTeams.forEach(function(team){
					let membersToMake = _.find(divisionTeams, _.pick(team, 'numericName')).members;
					memberPromises.push( team.members.create(membersToMake) );
				});
				return Promise.all(memberPromises);
			});
			teamCreationPromises.push(divisionTeamsPromise);
		});
		return Promise.all(teamCreationPromises);
	})

	.catch(function(err){
		console.log('problem creating teams', err);
	})
	.then(function(teamSets){
		console.log('done making teamses');
		console.log(teamSets);
	});
};
