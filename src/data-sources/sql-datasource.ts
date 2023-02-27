import { RESTDataSource } from "@apollo/datasource-rest";
import { InMemoryLRUCache } from "@apollo/utils.keyvaluecache";

// import sha256 from "crypto-js/sha256";
// import Base64 from "crypto-js/enc-base64";

import CryptoJS from"crypto-js";

import { Knex } from 'knex';
import knex from 'knex'

//import knexTinyLogger from "knex-tiny-logger";
// import knexTinyLogger from "knex-tiny-logger";

const { DEBUG } = process.env;

let hasLogger = false;

// interface KnexConfig {
//     [key: string]: object;
// };

export class SQLDataSource extends RESTDataSource {
  knex: any;

  context: any;
  cache: any;

  constructor(knexConfig) {
    super();

    const config: Knex.Config = knexConfig;

    this.knex = knex(config);

    const _this = this;
    if (!this.knex.cache) {
    //   knex.QueryBuilder.extend("cache", function (ttl) {
    //     return _this.cacheQuery(ttl, this);
    //   });
    }
  }

  initialize(config) {
    this.context = config.context;
    this.cache = config.cache || new InMemoryLRUCache();

    if (DEBUG && !hasLogger) {
      hasLogger = true; // Prevent duplicate loggers
      //knexTinyLogger(this.knex); // Add a logging utility for debugging
    }
  }

  cacheQuery(ttl = 5, query) {
    const cacheKey = CryptoJS.sha256(CryptoJS.Base64.stringify(query.toString()));

    return this.cache.get(cacheKey).then((entry) => {
      if (entry) return Promise.resolve(JSON.parse(entry));

      return query.then((rows) => {
        if (rows) this.cache.set(cacheKey, JSON.stringify(rows), { ttl });

        return Promise.resolve(rows);
      });
    });
  }
}

