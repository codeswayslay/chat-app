var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

var app = express();

var http = require("http").Server(app);
var io = require("socket.io")(http);

app.use(express.static(__dirname))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var dbUrl = "mongodb://user:password1@ds143932.mlab.com:43932/learning-node"

var Message = mongoose.model("Message", {
    name: String,
    message: String
});

app.get("/messages", (request, response) => {
    Message.find({}, (err, messages) => {
        response.send(messages);
    });
});

app.get("/messages/:user", (request, response) => {
    var user = request.params.user;
    Message.find({name: user}, (err, messages) => {
        response.send(messages);
    });
});

app.post("/messages", async (request, response) => {

    try {
        var message = new Message(request.body);

        var savedMessage = await message.save();
        console.log("saved");

        
        var censored = await Message.findOne({message: "badword"});
        if (censored) {
            console.log("censored words found", censored);
            await Message.deleteMany({_id: censored.id});
        } else {
            io.emit("message", request.body);
        }
        response.sendStatus(200);
    } catch (error) {
        response.sendStatus(500);
        return console.error(error);
    } finally {
        console.log("message post called!");
    }
});

io.on("connection", (socket) => {
    console.log("user connected!");
})

mongoose.connect(dbUrl,  { useNewUrlParser: true }, (err) => {
    console.log("mongo db connection", err);
})

var server = http.listen(3000, () => {
    console.log("server is listening on port ", server.address().port)
});