const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone')
const sequelize = require('./src/db/conn');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

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
            context: async ({req}) => {
                const token = req.headers.authorization?.split(' ')[1] || '';
                
                if (!token) return;

                const key = fs.readFileSync(path.resolve(__dirname, 'private.key'));

                const user = jwt.verify(token, key, function (err, decoded) {
                    if (err) console.log(err);                    
                    else return decoded
                });

                return { user }
            },
            listen: { port: port }
        })

        console.log(`🚀  Server ready at: ${url}`);
    })
