const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    access_token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    refresh_token: {
      type: DataTypes.TEXT,
    },
    scope: {
      type: DataTypes.TEXT,
    },
    token_type: {
      type: DataTypes.STRING,
    },
    expiry_date: {
      type: DataTypes.BIGINT,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "user",
  }
);

module.exports = User;
