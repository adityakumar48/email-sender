const nodemailer = require("nodemailer");
const axios = require("axios");
const path = require("path");
const express = require("express");
const app = express();
const port = process.env.PORT || 8000;
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2");

const db = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/data/email/list", (req, res) => {
  const sqlGet = `SELECT * FROM emails_list`;
  db.query(sqlGet, (err, result) => {
    console.log("ERROR", err);
    console.log("result", result);
    res.send(result);
  });
});

app.post("/data/email/add", (req, res) => {
  const { email } = req.body;
  const sqlInsert = `INSERT INTO emails_list (email) VALUES(?)`;
  db.query(sqlInsert, [email], (err, result) => {
    if (err) {
      console.log(error);
    }
  });
});

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "/index.html"));

  const sendEmail = async () => {
    try {
      const transporter = nodemailer.createTransport({
        service: "hotmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAILPASSWORD,
        },
      });

      //
      const Api = await axios.get(
        "https://programming-quotes-api.herokuapp.com/quotes/random"
      ); // Api
      const Data = Api.data;
      // console.log(Data);
      //
      const sqlGet = `SELECT * FROM emails_list`;
      db.query(sqlGet, async (err, result) => {
        // console.log("ERROR", err);
        // console.log("result", result);
        await transporter.sendMail({
          from: `Daily Quotes <${process.env.EMAIL}>`,
          to: result.map((item) => {
            return item.email;
          }),
          subject: "Here is the Daily Quotes",
          // text: `\n\n ${Data.en} \n\n\n Author - ${Data.author}`,
          html: `<br><br><p>${Data.en}</p><br><br>Author - ${Data.author}`,
        });
      });

      console.log("Email Sent Successfully");
    } catch (error) {
      console.log(error, "email not sent");
    }
  };
  setInterval(() => sendEmail(), 120000); // every 1 min send email
});

app.listen(port, () =>
  console.log("Server started at http://localhost:" + port)
);
