import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 4000;

let posts = [
  {
    id: 1,
    title: "how to make my plant look happy ?",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur finibus erat tellus, quis interdum enim laoreet in. Aliquam erat volutpat. Integer elit justo, venenatis in neque ac, imperdiet egestas nibh. Mauris a tristique enim. Ut eget placerat sem, ut lacinia ipsum. Cras sed cursus ex. Quisque a dolor in arcu euismod lacinia.",    
  },
  {
    id: 2,
    title: "are there any dating apps for plants ?",
    content:
      "Donec id condimentum orci, sed aliquet sapien. Nullam bibendum purus vel elit elementum, at pellentesque urna malesuada. Mauris vel pulvinar mi. ",
  },
  {
    id: 3,
    title: "is watering cycle different for different plants ?",
    content:
      "Sed in lorem congue, scelerisque eros quis, pulvinar dui. Donec ut mauris at sem tincidunt auctor eget a felis. In orci erat, tempus eu fringilla vitae, posuere vel quam. ",
  },
];

let lastId = 3;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/posts", (req, res) => {
  console.log(posts);
  res.json(posts);
});


app.get("/posts/:id", (req, res) => {
  const post = posts.find((p) => p.id === parseInt(req.params.id));
  if (!post) return res.status(404).json({ message: "Post not found" });
  res.json(post);
});

app.post("/posts", (req, res) => {
  const newId = lastId += 1;
  const post = {
    id: newId,
    title: req.body.title,
    content: req.body.content,
  };
  lastId = newId;
  posts.push(post);
  res.status(201).json(post);
});

app.patch("/posts/:id", (req, res) => {
  const post = posts.find((p) => p.id === parseInt(req.params.id));
  if (!post) return res.status(404).json({ message: "Post not found" });

  if (req.body.title) post.title = req.body.title;
  if (req.body.content) post.content = req.body.content;

  res.json(post);
});


app.delete("/posts/:id", (req, res) => {
  const index = posts.findIndex((p) => p.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: "Post not found" });

  posts.splice(index, 1);
  res.json({ message: "Post deleted" });
});

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});
