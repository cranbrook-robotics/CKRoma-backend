'use strict';

module.exports = function(app, next) {
  console.log('________________________________');
  console.info('Waiting for database connection');
  app.dataSources.pg.on('connected', err => {
    if (err) {
      console.log('Problem waiting for database connection:', err);
      next(err);
    } else {
      next();
    }
  });
};
