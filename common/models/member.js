'use strict';

module.exports = function(Member) {

	Member.validatesPresenceOf('teamId', {
		message: 'Members cannot be created without a parent Team.'
	});

};
