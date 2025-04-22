import pg from 'pg';

const connectDatabase = () => {
  return new pg.Pool({
    user: 'postgres',
    password: '12345',
    database: 'lending',
    host: 'localhost',
  });
};

export { connectDatabase };
