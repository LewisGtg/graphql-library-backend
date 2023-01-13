const { mergeTypeDefs } = require('@graphql-tools/merge')
const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);

const gqlTypedefs = [];
const gqlResolvers = {};
const gqlRelationResolvers = {};
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
        for (const resolver in relationResolvers)
            gqlRelationResolvers[resolver] = relationResolvers[resolver];
        for (const resolver in mutations)
            gqlMutationResolvers[resolver] = mutations[resolver];
    });


const typeDefs = mergeTypeDefs(gqlTypedefs);
const resolvers = {
    Query: {
        ...gqlResolvers
    },
    ...gqlRelationResolvers,
    Mutation: {
        ...gqlMutationResolvers
    }
}


module.exports = { typeDefs, resolvers }