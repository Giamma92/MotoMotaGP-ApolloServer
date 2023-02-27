import { SQLDataSource } from './sql-datasource.js'

const MINUTE = 60;

export class MyDatabase extends SQLDataSource {
  getFruits() {
    return this.knex.select("*").from("fruit"); //.cache(MINUTE);
  }
}
