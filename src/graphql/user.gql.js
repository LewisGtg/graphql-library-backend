'use strict'

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const { ApolloError } = require('apollo-server-express');
const User = require('../models/user.model');
const Book = require('../models/book.model');

const typedefs = `#graphql
    type User {
        username: String!,
        name: String!,
        books: [Book!]!
    }

    input userInput {
        username: String!,
        name: String!,
        password: String!
    }

    input loginInput {
        username: String!,
        password: String!
    }

    type UserToken {
        token: String!,
        username: String!
    }

    type Query {
        users: [User!]!,
        user(id: Int!): User!
    }

    type Mutation {
        createUser(user: userInput!): User,
        login(user: loginInput!): UserToken,
        updateUser(id: Int!, user: userInput!): User,
        deleteUser(id: Int!): User,
        addBook(userId: Int!, bookId: Int!): [Book]
        returnBook(userId: Int!, bookId: Int!): [Book]
    }
`

const resolvers = {
    users: async () => {
        const users = await User.findAll();
        console.log(users);
        return users;
    },
    user: async (parent, args) => {
        const user = await User.findOne({ where: { id: args.id } });
        console.log(user);

        if (!user)
            throw new ApolloError('Usuário não encontrado!', 422);

        return user;       
    } 
};

const relationResolvers = {
    User: {
        books: async (user) => {
            const books = await user.getBooks();
            return books;
        }
    }
}

const mutations = {
    createUser: async (parent, args) => {
        const newUser = args.user;

        const usrAlreadyExists = await User.findOne({ where: { username: newUser.username } });
        if (usrAlreadyExists)
            throw new ApolloError('Nome de usuário já cadastrado');

        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(newUser.password, salt);
        newUser.password = passwordHash;

        await User.create(newUser);

        return newUser;
    },
    login: async (parent, args) => {
        const user = await User.findOne({ where: { username: args.user.username } });

        if (!user)
            throw new ApolloError('Usuário não encontrado', 422);

        const auth = await bcrypt.compare(args.user.password, user.dataValues.password);
        if (!auth)
            throw new ApolloError('Usuário ou senha incorretos');

        const privateKeyPath = path.join(__dirname, '..', '..', '/private.key');
        const privateKey = fs.readFileSync(privateKeyPath);

        const token = jwt.sign({ username: args.user.username }, privateKey, {
            expiresIn: '1h'
        });  

        // TODO: Rever melhor retorno do login
        return {
            username: args.user.username,
            token: token
        } 
    },
    updateUser: async (parent, args) => {
        const id = args.id;
        const newUser = args.user;
        
        const user = await User.findOne({ raw: true, where: { id: id } });
        if (!user)
            throw new ApolloError('Usuário não encontrado', 422);

        await User.update(newUser, { where: { id: id } })
        return newUser;
    },
    deleteUser: async (parent, args) => {
        const id = args.id;

        const user = await User.findOne({ raw: true, where: { id: id } });
        if (!user)
            throw new ApolloError('Usuário não encontrado', 422);

        await User.destroy({ where: { id: id } });
        return user;
    },
    addBook: async (parent, args) => {
        const userId = args.userId;
        const bookId = args.bookId;

        const user = await resolvers.user(null, { id: userId });
        const book = await Book.findOne({ where: {id: bookId } });

        if (!book)
            throw new ApolloError('Livro não encontrado!', 422);

        const allUserBooks = await user.getBooks();
        const bookIsBorrowed = await book.getUser();

        if (allUserBooks.length >= 3)
            throw new ApolloError('O limite de livros emprestado por vez é 3');

        if (bookIsBorrowed)
            throw new ApolloError('O livro já foi emprestado.');

        await user.addBook(book);
        return user.getBooks();
    },
    returnBook: async (parent, args) => {
        const userId = args.userId;
        const bookId = args.bookId;

        const user = await resolvers.user(null, { id: userId });
        const book = await Book.findOne({ where: { id: bookId } });

        if (!book)
            throw new ApolloError('Livro não encontrado!', 422);

        await user.removeBook(book);
        await book.setUser(null);

        return user.getBooks();
    }
}

module.exports = { typedefs, resolvers, relationResolvers, mutations };
