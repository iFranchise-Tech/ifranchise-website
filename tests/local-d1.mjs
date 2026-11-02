import {DatabaseSync} from 'node:sqlite';

export function localD1() {
  const database = new DatabaseSync(':memory:');
  const DB = {
    prepare(sql) {
      const statement = (args = []) => ({
        bind: (...values) => statement(values),
        async run() { const result=database.prepare(sql).run(...args); return {success:true,meta:{changes:result.changes}}; },
        async first() { return database.prepare(sql).get(...args) ?? null; },
        async all() { return {results:database.prepare(sql).all(...args)}; },
      });
      return statement();
    },
    async batch(statements) {
      database.exec('BEGIN');
      try { const result=[]; for(const statement of statements)result.push(await statement.run()); database.exec('COMMIT'); return result; }
      catch(error) { database.exec('ROLLBACK'); throw error; }
    },
  };
  return {database, DB};
}
