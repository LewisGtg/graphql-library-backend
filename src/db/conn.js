const { Sequelize } = require("sequelize");

const sequelize = new Sequelize('library', 'root', '1234', {
    host: 'localhost',
    dialect: "postgres"
});

const start = async () => {
    try {
        await sequelize.authenticate();
        console.log("Db connected");
    } catch (err) {
        console.log(err);
    }
}

module.exports = sequelize;