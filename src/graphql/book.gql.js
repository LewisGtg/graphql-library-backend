'use strict'

const { ApolloError } = require('apollo-server-express');
const Book = require('../models/book.model');

const typedefs = `#graphql
    type Book {
        title: String!,
        pagesQty: Int!,
        isBorrow: Boolean!
    }

    input bookInput {
        title: String!,
        pagesQty: Int!
    }

    type Query {
        books: [Book!]!
        book(id: Int!): Book,
    }

    type Mutation {
        createBook(book: bookInput): Book,
        deleteBook(id: Int!): Book,
        updateBook(id: Int!, book: bookInput): Book
    }
`

const relationResolvers = {
    Book: {
        isBorrow: async (book) => {
            const isBorrow = await book.getUser() ? true : false;
            return isBorrow;
        }
    }
}

const resolvers = {
    books: async () => {
        const books = await Book.findAll();
        return books;
    },
    book: async (parent, args) => {
        const book = await Book.findOne( { where: { id: args.id } });

        if (!book)
            throw new ApolloError('Livro não encontrado!', 422);

        return book;
    },
};

const mutations = { 
    createBook: async (parent, args) => {
        const book = await Book.create(args.book);
        return book;
    },
    deleteBook: async (parent, args) => {
        const book = await Book.findOne({ raw: true, where: { id: args.id } });
        await Book.destroy({ where: { id: args.id } });
        return book;
    },
    updateBook: async (parent, args) => {
        const id = args.id;
        const newBook = args.book;

        const book = await Book.findOne({ raw: true, where: { id: id } });

        if (!book)
            throw new ApolloError('Livro não encontrado!', 422);

        await Book.update(newBook, { where: { id: id } });
        
        return newBook;
    }
};

module.exports = { typedefs, resolvers, relationResolvers, mutations };