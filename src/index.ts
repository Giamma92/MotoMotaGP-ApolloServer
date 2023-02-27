import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
// import { PersonalizationAPI } from "./data-sources/personalizationApi.js";
// import { FirebaseAPI } from "./data-sources/firebase-api.js";
import { MyDatabase }  from "./data-sources/sql-database.js";


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

    # This "Book" type defines the queryable fields for every book in our data source.

    # type Document {
    #   documents: [Entity],
    #   documentCount: Int,
    #   readTime: String,
    #   transaction: String
    # }

    # type Entity {
    #   name: String
    #   fields: [Field],
    #   createTime: String,
    #   updateTime: String,
    # }

    # type Field {
    #   name: String,
    #   value: String
    # }

    # type CustomerList {
    #   name: ID
    #   value: Customer
    # }

    type Fruit {
      nome: String
    }

    # The "Query" type is special: it lists all of the available queries that
    # clients can execute, along with the return type for each. In this
    # case, the "books" query returns an array of zero or more Books (defined above).
    type Query {
        getFruits: [Fruit],
        # entity(collection: String, id: ID): Entity,
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
    getFruits: async (parent, args, ctx: DataSourceContext) => {
      return ctx.dataSources.db.getFruits();
    },
    // getEntities: async (parent, args, ctx: DataSourceContext) => {
    //   return ctx.dataSources.db.getEntities(args.collection, args.limit);
    // },
  },
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
    host : 'sql7.freesqldatabase.com',
    port : 3306,
    user : 'sql7601282',
    password : 'PwyTAaH5TU',
    database : 'sql7601282'
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

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, {
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
