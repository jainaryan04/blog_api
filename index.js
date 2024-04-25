import express from "express"
import bodyParser from "body-parser"
import pg from "pg"
import env from "dotenv";

const app=express();
const port=3000;
env.config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

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
  var email;var password;
  app.post("/login", async (req, res) => {
    email = req.body.email;
    password = req.body.password;
    console.log(email)
    try {
      const result = await db.query("SELECT * FROM users WHERE email=$1", [email]);
      console.log(result)
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedPassword = user.password;
  
        if (password === storedPassword) {
        res.redirect("/blog")    
        
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

  app.get("/new",(req,res)=>{
    res.render("add.ejs")
  })

  app.post("/new",async(req,res)=>{
    
    const result = await db.query("UPDATE users SET title = ARRAY_APPEND(title, $1) WHERE email=$2;",
        [req.body.title, email]);
    const resul = await db.query("UPDATE users SET content = ARRAY_APPEND(content, $1) WHERE email=$2;",
          [req.body.content, email]);    
      res.redirect("/blog")
  })
var title,content
  app.get("/blog",async(req,res)=>{
    title=await db.query("SELECT title FROM users WHERE email=$1",[email]);
    content=await db.query("SELECT content FROM users WHERE email=$1",[email]);
    console.log(title.rows[0].title)
    console.log(title.rows[0].title.length)
    res.render("blog.ejs",{title:title.rows[0].title,email:email,length:title.rows[0].title.length,content:content.rows[0].content})
  })


  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
