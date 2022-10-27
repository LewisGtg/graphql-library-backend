const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db/conn');

class Book extends Model {}

Book.init({
    title: {
        type: DataTypes.STRING,
        required: true
    },
    pagesQty: {
        type: DataTypes.INTEGER,
        required: true
    }
}, {
    sequelize,
    modelName: 'book'
});

module.exports = Book;