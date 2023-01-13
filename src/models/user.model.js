const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db/conn');
const Book = require('./book.model.js');

class User extends Model {
    static associate() {
        User.hasMany(Book);
        Book.belongsTo(User);
    }
};

User.init({
    username: {
        type: DataTypes.STRING(),
        required: true,
        unique: true
    },
    name: {
        type: DataTypes.STRING(),
        required: true
    },
    password: {
        type: DataTypes.STRING(),
        required: true
    }
}, {
    sequelize,
    modelName: 'user',
    timestamps: false,
})

User.associate();

module.exports = User