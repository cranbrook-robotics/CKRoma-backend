'use strict';

module.exports = function(app, next) {
  console.log('________________________________');
  console.info('Checking database schema');
  var pg = app.dataSources.pg;
  const resetDatabase = false;

  if (resetDatabase) {
    pg.automigrate()
    .catch(err => {
      console.log('problem during automigrate:', err);
      next(err);
    })
    .then(() => {
      console.log('migration complete');
      next();
    });
    return;
  }

  new Promise((resolve, reject) => {
    console.log('running isActual');
    pg.isActual((err, actual) => {
      if (err) {
        reject(err);
      } else {
        resolve(actual);
      }
    });
  })

  .catch(err => {
    console.log('problem running isActual: ', err);
    next(err);
  })
  .then(schemaIsActual => {
    if (schemaIsActual) {
      console.log('Database schema is already matching the models. [%s]', schemaIsActual);
      return null;
    }

    console.log('Running autoupdate');
    return pg.autoupdate();
  })

  .catch(err => {
    console.log('problem running autoupdate: ', err);
    next(err);
  })
  .then(result => {
    console.log('Done checking/updating database schema: ', result);
    next();
  });

};
