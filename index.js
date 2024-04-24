import express from "express"
import bodyParser from "body-parser"
import pg from "pg"
import env from "dotenv";

env.config();
const HOST_URL = "http://localhost:4000";
const port=3000;
const app=express();
app.use(bodyParser.urlencoded({ extended: true }));
const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
  });
  db.connect();

  app.get("/",(req,res)=>{
    res.render("home.ejs")
  })
  app.get("/login", (req, res) => {
    res.render("login.ejs");
  });
  app.get("/register", (req, res) => {
    res.render("register.ejs");
  });

  app.post("/register", async(req,res)=> {
    const email = req.body.email;
    const password = req.body.password;
  
    try {
      const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
  
      if (checkResult.rows.length > 0) {
        res.render("login.ejs",{msg:"Email aldready exists. Try logging in"});
      } else {
        const result = await db.query(
          "INSERT INTO users (email, password) VALUES ($1, $2)",
          [email, password]
        );
        console.log(result);
        try {
            const response = await axios.get(`${HOST_URL}/posts`);
            console.log(response);
            res.render("blog.ejs", { posts: response.data });
          } catch (error) {
            res.status(500).json({ message: "Error fetching posts" });
          }
      }
    } catch (err) {
      console.log(err);
    }
  });
  
  app.post("/login", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
  
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedPassword = user.password;
  
        if (password === storedPassword) {
            try {
                const response = await axios.get(`${HOST_URL}/posts`);
                console.log(response);
                res.render("blog.ejs", { posts: response.data });
              } catch (error) {
                res.status(500).json({ message: "Error fetching posts" });
              }
        } else {
          res.render("login.ejs",{msg:"Incorrect Password. Try again"});
        }
      } else {
        res.render("login.ejs",{msg:"User not found"});
      }
    } catch (err) {
      console.log(err);
    }
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

