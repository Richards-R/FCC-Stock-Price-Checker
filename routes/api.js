"use strict";
const mongoose = require("mongoose");
const IP_in_db = require("../models.js").IP_in_db;
const db = require("../db-connection.js").db;
const salt = 10;
const bcrypt = require("bcrypt");
let cryptedIp = "";
let matchesArray = [];
const express = require("express");

module.exports = function (app) {
  mongoose.connect(process.env.DB, {});

  app.route("/api/stock-prices").get(function (req, res) {
    let tickerInputArray = req.query.stock;
    let liked = req.query.like;
    let data = req.header("x-forwarded-for");
    let likes = 0;
    let resultArray = [];
    let resultData;
    if (typeof tickerInputArray !== "string") {
      // two stock input
      tickerInputArray = req.query.stock;
    } else {
      // single stock input
      tickerInputArray = [req.query.stock];
    }

    const URLArray = tickerInputArray.map(
      (ticker) =>
        `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${ticker}/quote`,
    );

    async function tickerFetch() {
      for (let i = 0; i < URLArray.length; i++) {
        let response = await fetch(URLArray[i], {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });
        let jsonStockData = await response.json();
        let tsymbol = await jsonStockData.symbol;
        let tprice = await jsonStockData.latestPrice;
        if (
          jsonStockData === "Unknown symbol" ||
          jsonStockData === "Invalid symbol"
        ) {
          return console.log(
            "*************************************\n\nSymbol entered is unknown or invalid.\nPlease enter a correct symbol\n\n*************************************",
          );
        } else {
          cryptedIp = bcrypt.hash(data, salt, function (err, result) {
            // *always* check for err
            if (err) return err.message;
            else return result;
          });

          if (liked == "true") {
            let mongoRecords = await IP_in_db.find({
              likedTickers: tsymbol,
            }).exec();
            let ipArray = mongoRecords.map((record) => record.ip);

            for (let i = 0; i < ipArray.length; i++) {
              let match = bcrypt.compare(
                data,
                ipArray[i],
                function (err, result) {
                  // *always* check for err
                  if (err) return err.message;
                  else return result;
                },
              );
              matchesArray.push(match);
            }
            if (matchesArray.indexOf(true) == -1) {
              await IP_in_db.create({
                ip: cryptedIp,
                likedTickers: tsymbol,
              });
            }
          }
          likes = await IP_in_db.countDocuments({
            likedTickers: tsymbol,
          });

          resultData = { stock: tsymbol, price: tprice, likes: likes };
          resultArray.push(resultData);
        }
      }
      jsonReturn(resultArray);
    }

    tickerFetch();

    async function jsonReturn(rA) {
      let returnObj;
      if (rA.length < 2) {
        returnObj = { stockData: rA[0] };
      } else {
        for (let i = 0; i < rA.length; i++) {
          let temp = rA[i]["likes"];
          rA[i]["rel_likes"] = temp;
          delete rA[i]["likes"];
        }
        let a = rA[0]["rel_likes"] - rA[1]["rel_likes"];
        let b = rA[1]["rel_likes"] - rA[0]["rel_likes"];
        rA[0]["rel_likes"] = a;
        rA[1]["rel_likes"] = b;
        returnObj = { stockData: rA };
      }
      return await res.json(returnObj);
    }
  });
};