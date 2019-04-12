const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cons = require("consolidate");
const dust = require("dustjs-helpers");
const { Pool, Client } = require("pg");

/* DB CONNECT STRING */
const connectionString = `postgres://fwm:123456@localhost:5432/recipebookdb`;
const app = express();

/* BODY PARSER CONFIGURATIONS */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/* ASSIGN DUST ENGINE TO .DUST FILES*/
app.engine("dust", cons.dust);

/* SET DEFAULT EXT .dust */
app.set("view engine", "dust");
app.set("views", __dirname + "/views");

/* SET PUBLIC FOLDER */
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  const pool = new Pool({
    connectionString: connectionString
  });
  // PG Connect

  pool.query("SELECT * FROM recipes", (err, result) => {
    if (err) {
      console.error("Error running query ", err);
    }
    console.log(result.rows);
    res.render("index", { recipe: result.rows });
  });
});
let port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is runing on ${port}`);
});
