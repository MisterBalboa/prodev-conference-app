'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function(db) {
  await db.createTable('badges', {
    id: {
      notNull: true,
      primaryKey: true,
      type: 'int',
      unsigned: true,
    },
    email: {
      length: 100,
      notNull: true,
      type: 'string',
    },
    name: {
      notNull: true,
      type: 'string',
      length: 100,
    },
    company_name: {
      length: 100,
      type: 'string',
    },
    role: {
      type: 'string',
      length: 20,
    },
  });
  return await db.addIndex('badges', ['email'], true);
};

exports.down = function(db) {
  return db.dropTable('badges');
};

exports._meta = {
  "version": 1
};
