import express from "express"
import bodyParser from "body-parser"
import pg from "pg"
import env from "dotenv";

const app=express();
const port=3000;
env.config();
var title,content,likes,length

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

  app.get("/modify/:id",(req,res)=>{
    var id=req.params.id;
    console.log(id)
    res.render("modify.ejs",{title:title[id],content:content[id],id:id})
  })
  
  app.post("/update/:id",async(req,res)=>{
    var id=req.params.id
    title[id]=req.body.title
    content[id]=req.body.content
    const result = await db.query("UPDATE users SET title = $1 WHERE email=$2;",
        [title, email]);
    const resul = await db.query("UPDATE users SET content=$1 WHERE email=$2;",
          [content, email]);
      res.redirect("/blog")

  })

  app.get("/new",(req,res)=>{
    res.render("add.ejs")
  })

  app.post("/new",async(req,res)=>{
    
    const result = await db.query("UPDATE users SET title = ARRAY_APPEND(title, $1) WHERE email=$2;",
        [req.body.title, email]);
    const resul = await db.query("UPDATE users SET content = ARRAY_APPEND(content, $1) WHERE email=$2;",
          [req.body.content, email]);    
    const resu = await db.query("UPDATE users SET likes = ARRAY_APPEND(likes, $1) WHERE email=$2;",
          [0, email]);
      res.redirect("/blog")
  })

  app.get("/blog",async(req,res)=>{
    title=await db.query("SELECT title FROM users WHERE email=$1",[email]);
    content=await db.query("SELECT content FROM users WHERE email=$1",[email]);
    likes=await db.query("SELECT likes FROM users WHERE email=$1",[email]);
    length=title.rows[0].title.length
    likes=likes.rows[0].likes
    title=title.rows[0].title
    content=content.rows[0].content
    res.render("blog.ejs",{likes:likes,title:title,email:email,length:length,content:content})
  })

  app.get("/like/:id",async(req,res)=>{
    likes[req.params.id]=likes[req.params.id]+1;
    const r=await db.query("UPDATE users SET likes= $1 WHERE email=$2",[likes,email])
    res.redirect("/blog")
  })
var i;
  app.get("/delete/:id",async(req,res)=>{
    i=req.params.id
    title.splice(i, 1);
    content.splice(i, 1);
    likes.splice(i, 1);
    const s=await db.query("UPDATE users SET likes= $1,content=$2,title=$3 WHERE email=$4",[likes,content,title,email])
    res.redirect("/blog")
  })


  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
