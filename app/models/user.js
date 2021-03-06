// Example model


module.exports = function (sequelize, DataTypes) {

  var User = sequelize.define('User', {
    username: DataTypes.STRING,
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    image: DataTypes.STRING,
    version: DataTypes.STRING,
    password: DataTypes.TEXT,
    admin: {
       type: DataTypes.BOOLEAN,
       defaultValue: false,
       allowNull: false
     },
  }, {
    classMethods: {
      associate: function (models) {
        // example on how to add relations
      }
    }
  });

  return User;
};

