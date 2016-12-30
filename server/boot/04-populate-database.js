'use strict';

var orgTemplate = require('../../local-data/roster.json');
var _ = require('lodash');


function deepCreate(Model, data, parentIdForeignKey, parentId) {
  let x = 5;
  const y = 2;
  return Promise.all(data.map(object => {
    var relationKeys = [];//can be concise with a map call and object.getOwnPropertyNames
    for (var key in object){
      var relationInfo = Model.relations[key];
      if (relationInfo) {
        relationKeys.push(key);
        //TODO: check that object[key] is an array
      }
    }
    var thisObjectOnly = _.omit(object, relationKeys);
    if (parentIdForeignKey) {
      thisObjectOnly[parentIdForeignKey] = parentId;
    }

    return Model.create(thisObjectOnly)
    .catch(err => {
      console.log('Problem in creating %s\nError: %s', thisObjectOnly, err);
    })
    .then(dbObject => {
      var childPromises = [];
      relationKeys.forEach(rKey => {
        var relationInfo = Model.relations[rKey];
        var ChildModel = relationInfo.modelTo;
        var childrenData = object[rKey];
        var fkOfChild = relationInfo.keyTo;
        var id = dbObject[relationInfo.keyFrom];
        childPromises.push(deepCreate(ChildModel, childrenData, fkOfChild, id));
      });
      return Promise.all(childPromises);
    });
  }));
}


module.exports = function(app, next) {
  console.log('________________________________');
  console.info('Checking for starter data.');

  var Organization = app.models.Organization;

  Organization.findOne({where: {name: orgTemplate.name}})
  .catch(err => {
    console.log('problem when finding Organization:', err);
    next(err);
  })
  .then(foundOrg => {
    console.log('got this:', foundOrg);
    var toCreate = [];
    if (foundOrg === null) {
      toCreate.push(orgTemplate);
    }
    console.log('Going to create:', toCreate);
    return deepCreate(Organization, toCreate);
  })

  .catch(err => {
    console.log('Problem in creating initial data:', err);
    next(err);
  })
  .then(result => {
    console.log('Done creating initial data.');
    next();
  });

};
