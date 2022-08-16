const express = require('express')
const app = express()
const cors = require('cors')
const bodyparser = require('body-parser');
const { nanoid } = require('nanoid');
require('dotenv').config()

app.use(cors())
app.use(bodyparser.urlencoded({extended: false}));
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

let users = [];

app.post("/api/users", (req,res) => {
  const username = req.body.username;
  const id = nanoid(10);
  const data = {
    username: username,
    _id: id,
    log: []
  };
  users.push(data);
  res.json({username: data.username, _id: data._id});
});

app.get("/api/users", (req,res) => {
  const newdata = [];
  users.map((e) => newdata.push({username: e.username, _id: e._id}));
  res.json(newdata);
});

app.post("/api/users/:_id/exercises", (req,res) => {
  const userid = req.params._id;
  const description = req.body.description;
  const duration = parseInt(req.body.duration);
  let newdate = new Date().toDateString();

  if(req.body.date != undefined){
    newdate = new Date(req.body.date).toDateString();
  }

  const data = {
    description: description,
    duration: duration,
    date: newdate
  };

  const userdata = users.find((el) => el._id === userid);
  userdata.log.push(data);

  res.json({
    _id: userdata._id,
    username: userdata.username,
    date: data.date,
    duration: data.duration,
    description: data.description
  });
});

app.get("/api/users/:id/logs", (req,res) => {
  const userid = req.params.id;
  const userdata = users.find((el) => el._id === userid);
  let logsToShow = userdata.log;
  const queryLimit = parseInt(req.query.limit);
  const queryFrom = req.query.from;
  const queryTo = req.query.to;

  if((req.query.from != null && new Date(queryFrom.toString()) != "Invalid Date") || (req.query.to != null && new Date(queryTo.toString()) != "Invalid Date" )){
    logsToShowFrom = [];
    let fromQuery;
    let toQuery;

    if(req.query.from != null && req.query.to != null){
      fromQuery = Date.parse(new Date(queryFrom.toString()));
      toQuery = Date.parse(new Date(queryTo.toString()));
      logsToShow = logsToShow.map((el) => {
        if(Date.parse(el.date) >= fromQuery && Date.parse(el.date) <= toQuery){
          logsToShowFrom.push(el);
        }
      });
    } else if(req.query.from != null){
      fromQuery = Date.parse(new Date(queryFrom.toString()));
      logsToShow = logsToShow.map((el) => {
        if(Date.parse(el.date) >= fromQuery){
          logsToShowFrom.push(el);
        }
      });
      logsToShow = logsToShowFrom;
    } else if(req.query.to != null){
      toQuery = Date.parse(new Date(queryTo.toString()));
      logsToShow = logsToShow.map((el) => {
        if(Date.parse(el.date) >= toQuery){
          logsToShowFrom.push(el);
        }
      });
      logsToShow = logsToShowFrom;
    }
  }
  
  if (queryLimit > 0){
    logsToShow = logsToShow.slice(0, queryLimit);
  }

  const logcount = logsToShow.length;
  
  res.json({
    _id: userdata._id,
    username: userdata.username,
    count: logcount,
    log: logsToShow
  });
});

const listener = app.listen(process.env.PORT || 3001, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
