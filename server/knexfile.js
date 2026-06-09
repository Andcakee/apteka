require('dotenv').config();
const path = require('path');

const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: process.env.SQLITE_FILE || path.join(__dirname, '..', 'database', 'sqlite', 'dev.db')
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, 'db', 'migrations')
    },
    seeds: {
      directory: path.join(__dirname, 'db', 'seeds')
    }
  },
  production: {
    client: 'sqlite3',
    connection: {
      filename: process.env.SQLITE_FILE || path.join(__dirname, '..', 'database', 'sqlite', 'prod.db')
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, 'db', 'migrations')
    },
    seeds: {
      directory: path.join(__dirname, 'db', 'seeds')
    }
  }
};

module.exports = config;
