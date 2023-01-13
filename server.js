const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone')
const sequelize = require('./src/db/conn');

// const User = require('./src/models/user.model');

const { typeDefs, resolvers } = require('./src/graphql/_index');

const port = 5000;

const server  = new ApolloServer({
    typeDefs,
    resolvers
});

sequelize
    .sync()
    //.sync({force: true})
    .then( async() => {
        const { url } = await startStandaloneServer(server, {
            listen: { port: port }
        })

        console.log(`🚀  Server ready at: ${url}`);
    })
