const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone')
const sequelize = require('./src/db/conn');

const { typeDefs, resolvers } = require('./src/graphql/_index');

const db = require('./src/db/conn');

const port = 4000;

const server  = new ApolloServer({
    typeDefs,
    resolvers
});

sequelize
    .sync()
    .then( async() => {
        const { url } = await startStandaloneServer(server, {
            listen: { port: port }
        })

        console.log(`🚀  Server ready at: ${url}`);
    })
