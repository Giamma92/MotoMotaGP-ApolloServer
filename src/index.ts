import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
// import { PersonalizationAPI } from "./data-sources/personalizationApi.js";
// import { FirebaseAPI } from "./data-sources/firebase-api.js";
import { MyDatabase }  from "./data-sources/sql-database.js";
import { dateScalar } from './custom-types/date-scalar.js';
import { decodedToken } from './utils/decodedToken.js';
import { GraphQLError } from "graphql";

import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';



dotenv.config();

interface DataSourceContext {
  dataSources: DataSources;
  req: any
}

interface UserInterface {
  id: String,
  email: String
  token: String
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
      id: Int!
      nome: String!
      cognome: String!
      scuderia: String!
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

    type Schieramento {
      id: Int!
      idCampionato: Int!
      idGara: Int!
      username: String!
      idiPilotaGara: Int!
      idPilotaQualifica: Int!
      dataOraIns: String!
    }

    type Scommessa {
      id: Int!
      idCampionato: Int!
      username: String!
      idGara: Int!
      idPilota: Int!
      posizione: Int!
      punteggio: Int!
      dataOraIns: String!
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

    type Result {
      success: Boolean,
      message: String
    }

    type LoginResult {
      token: String
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
        piloti(idCampionato: String!): [Piloti],
        scommesse(idCampionato: String!, username: String, idGara: String, idPilota: String): [Scommessa],
        schieramenti(idCampionato: String!, username: String, idGara: String, idPilota: String): [Schieramento]
        # entity(collection: String, id: ID): Entity,
        # getEntities(collection: String, limiCurrentt: Int!): [Entity]
        # getEntities(collection: String, limit: Int!): [Entity]
    }

    type Mutation {
      insertScommessa(idCampionato: String, username: String, idPilota: String, idGara: String, posizione: String, punteggio: String): Result,
      loginUser(username: String, password: String): LoginResult
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
      const decoded = decodedToken(ctx.req);
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
    piloti: async (parent, args, ctx: DataSourceContext) => {
      return ctx.dataSources.db.getPiloti(args.idCampionato);
    },
    scommesse: async (parent, args, ctx: DataSourceContext) => {
      return ctx.dataSources.db.getScommesse(args.idCampionato, args.username, args.idGara, args.idPilota);
    },
    schieramenti: async (parent, args, ctx: DataSourceContext) => {
      return ctx.dataSources.db.getSchieramenti(args.idCampionato, args.username, args.idGara, args.idPilota);
    },
    // getEntities: async (parent, args, ctx: DataSourceContext) => {
    //   return ctx.dataSources.db.getEntities(args.collection, args.limit);
    // },
  },
  Mutation: {
    insertScommessa: async (parent, args, ctx: DataSourceContext) => {

      const config = await ctx.dataSources.db.getConfiguration('1');
      // console.log('max points', config.bets_limit_points);
      // console.log("[DEBUG scommessa maggiore del punteggio]", +args.punteggio > +config.bets_limit_points);
      
      
      const scommesse = await ctx.dataSources.db.getScommesse(args.idCampionato, args.username, args.idGara, null);
      //console.log('scommesse', scommesse);

      if(scommesse.length > +config.bets_limit_gara)
        return { success: false, message: 'Scommessa annullata: limite ' + config.bets_limit_gara+ ' scommesse superato!' };
      
      let sum = +args.punteggio;;
      !!scommesse && scommesse.forEach(s => sum += s.punteggio);
      //console.log('somma', sum);
      
      if(sum > +config.bets_limit_points)
        return { success: false, message: 'Scommessa annullata: limite ' + config.bets_limit_points+ 'pt superato!' };

      const scommessePilota = await ctx.dataSources.db.getScommesse(args.idCampionato, args.username, null, args.idPilota);
      console.log('num scommesse pilota', scommessePilota.length );

      if (scommessePilota.length >= +config.bets_limit_pilota) 
        return { success: false, message: 'Scommessa annullata: limite scommesse pilota superato!' };

      // let result = await ctx.dataSources.db.insertScommessa(args.idCampionato, args.username, args.idPilota, args.idGara, args.posizione, args.punteggio);
      // if (!result) return { success: false, message: 'Scommessa non inserita!' };
      // return {success: true, message: 'Scommessa inserita! [ID: ' + result + ']'}
      return {success: true, message: 'Scommessa inserita!'};
    },
    loginUser: async (root, args, ctx: DataSourceContext)  => {
      //const { data: { username, password } } = args;
      const authenticatedUser = await ctx.dataSources.db.getUser(args.username, args.password);
      
      if (!authenticatedUser) {
        return {token: null}
        // throw new GraphQLError('Autenticazione fallita', {
        //   extensions: {
        //     code: 'UNAUTHENTICATED',
        //     http: { status: 401 },
        //   },
        // });
      }

      //console.log("Logged user", authenticatedUser)

      const isMatch = args.password == authenticatedUser.pwd;
      if (!isMatch) {
        return {token: null}
        // throw new GraphQLError('Autenticazione fallita', {
        //   extensions: {
        //     code: 'UNAUTHENTICATED',
        //     http: { status: 401 },
        //   },
        // });
      }

      const token = jwt.sign({
        data: authenticatedUser
      }, 'supersecret', { expiresIn: 60 * 60 });

      console.log("Generated token: ", token);
      return {token : token};
    }
  },
  Date: dateScalar
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
  resolvers,
  introspection: process.env.NODE_ENV !== 'production'
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
  context: async ({req, res}) => {
    
    //const token = req.headers.authorization || '';

    //const { cache } = server;
    //const decoded = decodedToken(req);

    return {
      // We create new instances of our data sources with each request,
      // passing in our server's cache.
      dataSources: { db: db },
      req
    } as DataSourceContext
  },
});

console.log(`🚀  Server ready at: ${url}`);
