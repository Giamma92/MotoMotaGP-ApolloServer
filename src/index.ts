import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
// import { PersonalizationAPI } from "./data-sources/personalizationApi.js";
// import { FirebaseAPI } from "./data-sources/firebase-api.js";
import { MyDatabase }  from "./data-sources/sql-database.js";
import { dateScalar } from './custom-types/date-scalar.js';

import dotenv from 'dotenv';

dotenv.config();

interface DataSourceContext {
  dataSources: DataSources;
}

interface DataSources {
  db: MyDatabase
}

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = `#graphql
    # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

    scalar Date

    type Calendario {
      id: Int!
      ordine_gp: Int!
      nome_gara: String!
      luogo_gara: String!
      data: Date!
      ora_limite_scommesse: String!
      # fk_gara: Int!
      # fk_campionato: Int
      # ordine_gp: Int!
    }

    type Campionati {
      pk: Int!
      descrizione: String!
      data_inizio: String!
      anno: Int!
    }

    type Classifica {
      id: Int!
      username: String!
      nomeCognome: String!
      # fk_campionato: Int!
      posizione: Int!
      punteggio: Int!
    }

    type Configurazione {
      id: Int!
      id_campionato: Int!
      session_timeout: Int!
      bets_limit_points: Int!
      bets_limit_sprintrace_points: Int!
      bets_limit_pilota: Int!
      bets_limit_sprint_pilota: Int!
      bets_limit_gara: Int!
      bets_limit_gara_sprint: Int!
      formation_limit_pilota: Int!
    }

    type Gare {
      pk: Int!
      nome: String!
      luogo: String!
    }

    type Pagamenti {
      pk: Int!
      iduser: String!
      fk_calendario: Int
      pagato: Int!
      quota: Int!
      timestamp: String!
    }

    type Piloti {
      pk: Int!
      nome: String!
      cognome: String!
    }

    type Piloti_campionato {
      pk: Int!
      fk_campionato: Int!
      fk_pilota: Int!
      fk_scuderia: Int!
    }

    type Regolamenti {
      pk: Int!
      fk_campionato: Int!
      nome_doc: String!
    }

    type Risultatimotogp {
      pk: Int!
      fk_campionato: Int!
      fk_gara: Int!
      fk_pilota: Int!
      nome_pilota: String!
      cognome_pilota: String!
      punti_qualifica: Int!
      punti_gara: Int!
    }

    type Ruoli {
      pk_ruolo: Int!
      descr: String!
    }

    type Schieramenti {
      pk: Int!
      fk_campionato: Int!
      fk_gara: Int!
      id_utente: String!
      fk_pilota_gara: Int!
      fk_pilota_qualifica: Int!
      data_ora_ins: String!
    }

    type Scommesse {
      pk: Int!
      fk_campionato: Int!
      idutente: String!
      fk_gara: Int!
      fk_pilota: Int!
      posizione: Int!
      pt: Int!
      data_ora_ins: String!
      esito: Int
    }

    type Scommesse_sprintrace {
      pk: Int!
      fk_campionato: Int!
      idutente: String!
      fk_gara: Int!
      fk_pilota: Int!
      posizione: Int!
      pt: Int!
      data_ora_ins: String!
      esito: Int
    }

    type Scuderie {
      pk: Int!
      nome: String!
    }

    type Teams {
      id: Int!
      username: String!
      nome: String!
      teamimage: String!
      id_campionato: Int!
      pilota_fascia1: String!
      pilota_fascia2: String!
      pilota_fascia3: String!

      # pilota_fascia1_nome: String!
      # pilota_fascia1_cognome: String!
      # pilota_fascia2_nome: String!
      # pilota_fascia2_cognome: String!
      # pilota_fascia3_nome: String!
      # pilota_fascia3_cognome: String!
    }

    type Utenti {
      iduser: String!
      pwd: String!
      last_access: String
      change_first: Int!
      nome: String
      cognome: String
      idprofile: String!
      profileimage: String!
    }

    type Utenti_ruoli {
      pk: Int!
      fk_utente: String!
      fk_ruolo: Int!
    }

    # The "Query" type is special: it lists all of the available queries that
    # clients can execute, along with the return type for each.
    type Query {
        calendario(idCampionato: String!): [Calendario],
        config(id: String!): Configurazione,
        user(username: String!, password: String!): Utenti,
        team(username: String!, idCampionato: String!): Teams,
        teams(idCampionato: String!): [Teams],
        classifica(idCampionato: String!, username: String): [Classifica],
        nextRace(idCampionato: String!): Calendario,
        currentRace(idCampionato: String!): Calendario,
        # entity(collection: String, id: ID): Entity,
        # getEntities(collection: String, limiCurrentt: Int!): [Entity]
        # getEntities(collection: String, limit: Int!): [Entity]
    }
`;

// const books = [
//   {
//     title: "The Awakening",
//     author: "Kate Chopin",
//   },
//   {
//     title: "City of Glass",
//     author: "Paul Auster",
//   },
// ];

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    calendario: async (parent, args, ctx: DataSourceContext) => {
      return ctx.dataSources.db.getCalendar(args.idCampionato);
    },
    config: async (parent, args, ctx: DataSourceContext) => {
      return ctx.dataSources.db.getConfiguration(args.id);
    },
    user: async (parent, args, ctx: DataSourceContext) => {
      return ctx.dataSources.db.getUser(args.username, args.password);
    },
    team: async (parent, args, ctx: DataSourceContext) => {
      return ctx.dataSources.db.getTeam(args.username, args.idCampionato);
    },
    teams: async (parent, args, ctx: DataSourceContext) => {
      return ctx.dataSources.db.getTeams(args.idCampionato);
    },
    classifica: async (parent, args, ctx: DataSourceContext) => {
      return ctx.dataSources.db.getClassifica(args.idCampionato, args.username);
    },
    nextRace: async (parent, args, ctx: DataSourceContext) => {
      return ctx.dataSources.db.getNextRace(args.idCampionato);
    },
    currentRace: async (parent, args, ctx: DataSourceContext) => {
      return ctx.dataSources.db.getCurrentRace(args.idCampionato);
    },
    // getEntities: async (parent, args, ctx: DataSourceContext) => {
    //   return ctx.dataSources.db.getEntities(args.collection, args.limit);
    // },
  },
  Date: dateScalar,
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
// const server = new ApolloServer({
//   typeDefs,
//   resolvers,
// });

const knexConfig = {
  client: 'mysql',
  connection: {
    host : process.env.DB_HOST,
    port : process.env.DB_PORT,
    user : process.env.DB_USERNAME,
    password : process.env.DB_PWD,
    database : process.env.DB_NAME,
    ssl : true
  }
};

// you can also pass a knex instance instead of a configuration object
const db = new MyDatabase(knexConfig);

const server = new ApolloServer({
  typeDefs,
  resolvers
  // cache,
  // context,
  // dataSources: () => ({ db })
});


// await server.listen({ port: process.env.PORT || 4000 });
// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, {
  listen: { port: +process.env.PORT || 4000 },
  context: async () => {
    const { cache } = server;
    return {
      // We create new instances of our data sources with each request,
      // passing in our server's cache.
      dataSources: { db: db },
    } as DataSourceContext
  },
});

console.log(`🚀  Server ready at: ${url}`);
