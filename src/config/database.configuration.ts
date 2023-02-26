export default () => ({
  db_kind: process.env.DATABASE_KIND || 'postgres',
  db_host: process.env.DATABASE_HOST || 'localhost',
  db_port: process.env.DATABASE_PORT
    ? parseInt(process.env.DATABASE_PORT, 10)
    : 5432,
  db_user: process.env.DATABASE_USER || 'root',
  db_pass: process.env.DATABASE_PASS || 'root',
  db_name: process.env.DATABASE_NAME || 'todo',
});
