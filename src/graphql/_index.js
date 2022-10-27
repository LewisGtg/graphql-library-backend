const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);

const gqlTypedefs = [];
const gqlResolvers = {};
const gqlMutationResolvers = {}

fs.readdirSync(__dirname)
    .filter((file) => {
        return (
            file.indexOf('.') !== 0 && file !== basename && file.slice(-6) === 'gql.js'
        );
    })
    .forEach((file) => {
        const graphNode = require(path.join(__dirname, file));
        const { resolvers, typedefs, relationResolvers, mutations } = graphNode;
        if (typedefs) gqlTypedefs.push(typedefs);
        for (const resolver in resolvers) gqlResolvers[resolver] = resolvers[resolver];
        for (const resolver in mutations)
            gqlMutationResolvers[resolver] = mutations[resolver];
    });


const typeDefs = gqlTypedefs[0];
const resolvers = {
    Query: {
        ...gqlResolvers
    },
    Mutation: {
        ...gqlMutationResolvers
    }
}

module.exports = { typeDefs, resolvers }