// Example model


module.exports = function (sequelize, DataTypes) {

  var User = sequelize.define('User', {
    username: DataTypes.STRING,
    email: DataTypes.STRING,
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

