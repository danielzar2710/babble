var express =require('express');
var messages= require('./messages-util');
var bodyParser= require('body-parser');
var app =express();
var port=9000;
var users=require('./user-util');
const events = require('events');
app.use(bodyParser.json());
var messegeClients=[];
var statsClients=[];
app.use(function(req, res, next) {
    //set header for all
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  });
app.options("/*", function(req, res, next){
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.status(204).send();
});

app.post('/user',function(req,res){
  var id1=users.addUser(req.body);
  while(statsClients.length > 0)
  {
    var client=statsClients.pop();
    client.json({
      users:users.getNumOfUsers(), 
      messages:messages.getNumOfMessages()
    });
  }
  res.json({id:id1,
            user: req.body,
            messages:messages.getNumOfMessages(),
            users:users.getNumOfUsers()
    });
});

app.delete('/user',function(req,res){
  users.deleteUser(req.body);
  while(statsClients.length > 0)
  {
    var client=statsClients.pop();
    client.json({
      users:users.getNumOfUsers(), 
      messages:messages.getNumOfMessages()
    });
  }
  
});
app.get('/',function(req,res){
  res.end("Hello World");
});

app.get('/stats',function(req,res){
    statsClients.push(res);
});

app.post('/messages',function(req,res){
  var id=messages.addMessage(req.body);
  while(messegeClients.length>0)
  {
    var client=messegeClients.pop();
    client.json({
      id:id,
      message:req.body, 
    });
  }
  while(statsClients.length>0)
  {
    var client=statsClients.pop();
    client.json({
      users:users.getNumOfUsers(), 
      messages:messages.getNumOfMessages()
    });
  }
  res.json(req.body);
});

app.delete('/messages/:id',function(req,res){
  messages.deleteMessage(req.params.id);
  while(statsClients.length>0)
  {
    var client=statsClients.pop();
    client.json({
      users:users.getNumOfUsers(), 
      messages:messages.getNumOfMessages()
    });
  }
  res.json({id:req.params.id});
});

app.get('/messages', function(req,res){
  var messageCounter=req.query.counter;
  if(!messageCounter)
    res.status(400).send('Sent data is bad');
  var updates = messages.getMessages1(messageCounter);
  if(updates.length > 0)
      res.json(updates);
  else
    messegeClients.push(res);
});
app.all('/stats',function(req,res){
   res.sendStatus(405);
});
app.all('/messages',function(req,res){
   res.sendStatus(405);
});
app.all('/user',function(req,res){
   res.sendStatus(405);
});
app.listen(port);

app.use(function(req, res) {
    res.sendStatus(404);
});

