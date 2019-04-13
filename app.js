const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cons = require("consolidate");
const dust = require("dustjs-helpers");
const { Pool, Client } = require("pg");

/* DB CONNECT STRING */
const connectionString = `postgres://fwm:123456@localhost:5432/recipebookdb`;
const pool = new Pool({
  connectionString: connectionString
});

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
  pool.query("SELECT * FROM recipes", (err, result) => {
    if (err) {
      console.error("Error running query ", err);
    }
    res.json(result.rows);
  });
});

app.post("/", (req, res) => {
  const errors = {};
  const { name, ingredirents, directions } = req.body;

  pool.query(
    `INSERT INTO recipes(name, ingredients, directions) VALUES($1, $2, $3)`,
    [name, ingredirents, directions],
    (err, result) => {
      if (err) {
        console.error("Error inserting data", err);
        errors.serverError = "Internal Server Error.";
        res.status(500).json(errors);
      }
      res.json({ success: true });
    }
  );
});

app.patch("/:id", (req, res) => {
  const errors = {};
  const { id } = req.params;
  const { name, ingredients, directions } = req.body;

  pool.query(
    `UPDATE recipes SET name=$1, ingredients=$2, directions=$3 WHERE id=${id}`,
    [name, ingredients, directions],
    (err, result) => {
      if (err) {
        console.error("Error updating data ", err);
        errors.serverError = "Internal Server Error";
        return res.status(500).json(errors);
      }
      console.log(result);
      res.json({ success: true });
    }
  );
});

app.delete("/:id", (req, res) => {
  const errors = {};
  const { id } = req.params;

  pool.query(`DELETE FROM recipes WHERE id = $1`, [id], (err, result) => {
    if (err) {
      console.error("Error deleting data", err);
      errors.serverError = "Internal Server Error.";
      return res.status(500).json(errors);
    }
    console.log(result);
    res.json({ success: true });
  });
});

let port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is runing on ${port}`);
});
