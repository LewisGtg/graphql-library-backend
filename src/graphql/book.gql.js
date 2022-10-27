const Book = require('../models/book.model');

const typedefs = `#graphql
    type Book {
        title: String!,
        pagesQty: Int!
    }

    input bookInput {
        title: String!,
        pagesQty: Int!

    }

    type Query {
        books: [Book!]!
        book(id: Int!): Book
    }

    # TODO: criar update e delete
    type Mutation {
        createBook(book: bookInput): Book,
    }

`

const resolvers = {
    books: async () => {
        const books = await Book.findAll();
        return books;
    },
    book: async (parent, args) => {
        const book = await Book.findOne( { raw: true, where: { id: args.id } });
        return book;
    }
};

const mutations = { 
    createBook: async (parent, args) => {
        const book = await Book.create(args.book);
        return book;
    } 
};

module.exports = { typedefs, resolvers, mutations };