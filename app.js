const express = require('express');
const mysql = require('mysql');
const knex = require('knex');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

var database = knex({
    client: "mysql",
    connection: {
        host: "127.0.0.1",
        user: "root",
        password: "",
        database: "mandesi"
    }
});

app.use('/static', express.static('static'));
// app.set('view engine', 'pug');
//app.set('view engine', 'jade');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

var emailID = "";
app.get('/', function(req,res){
    if(emailID!=""){
        emailID = "";
    }
    res.sendFile(__dirname + '/index.html');
})  

app.get('/signUp', function(req,res){
    res.sendFile(__dirname + '/signUp.html');
})

app.post('/chatBox',function(req,res){
    emailID = req.body.emailID;
    const password = req.body.password;
    database
        .select("*")
        .from("users")
        .where("emailID","=", emailID)
        .then(data => {
            if(!data[0]){
                res.send("Invalid emailID");
            }
            else{
                const isValid = password === data[0].password ? true:false;
                if(isValid){
                    //res.sendFile(__dirname+'/inbox.html');
                    //res.json(data[0]);
                    // res.render('inbox.html', {message: });
                    database
                        .select("mto","mfrom","chats","dateTime")
                        .from("conversations")
                        .where("mto","=", data[0].emailID)
                        .then(data3 => {
                            if(data3[0]){
                                const det = [];
                                var  i;
                                var j=0;
                                for(i=Object.keys(data3).length-1; i>=0; i--){
                                    if(j<Object.keys(data3).length){
                                        det[j] = data3[i];
                                        j++;
                                    }
                                    else{
                                        break;
                                    }
                                }
                                //console.log(data3);
                                console.log(det);
                                res.render('inbox.html', {message: data[0].name,
                                message2: det, message3: emailID})
                            }
                            else{
                                console.log("null");
                                res.render('inbox.html', {message: data[0].name,
                                message2: null, message3: emailID})
                            }
                        })
                }
                else{
                    res.send("Invalid password");
                }
            }
        })
    //res.send("hello there "+username);
})

app.post('/register', function(req,res){
    const {name, emailID, gender, password, cpassword} = req.body;
    database
        .select("*")
        .from("users")
        .where("emailID", "=", emailID)
        .then(data => {
            if(!data[0]){
                database("users")
                    .returning("*")
                    .insert({
                        name: name,
                        emailID: emailID,
                        gender: gender,
                        password: cpassword
                    })
                    .then(data2 => {
                        if(!data2[0]){
                            res.send("fail");
                        }
                        else{
                            res.send("Done");
                        }
                    })
            }
            else{
                res.send("Already registered!")
            }
        })
})

// const d = null;
// app.post('/page', function(req,res){
//     d = req.body.data;
// })

app.post('/sendMessage', function(req,res){
    const mto = req.body.to;
    const mesg = req.body.message;
    const mfrom = req.body.from;
    let date_ob = new Date();
    //res.sendFile(__dirname + '/response.html');
    database("conversations")
        .returning("*")
        .insert({
            mfrom: mfrom,
            mto: mto,
            chats: mesg,
            dateTime: date_ob
        })
        .then(data => {
            if(data){
                console.log(data);
                res.send("Sent successfully.");
                //alert("Sent successfully.");
            }
            else{
                res.send("Error");
            }
        })
})

app.get('/sentBox', function(req,res){
    database
    .select("*")
    .from("users")
    .where("emailID","=",emailID)
    .then(data2 => {
        if(data2){
            database
            .select("mto","mfrom","chats","dateTime")
            .from("conversations")
            .where("mfrom","=", emailID)
            .then(data => {
                if(data[0]){
                    //console.log(data);
                    const dat = [];
                    var i;
                    var j=0;
                    for(i=Object.keys(data).length-1; i>=0; i--){
                        if(j<Object.keys(data).length){
                            dat[j] = data[i];
                            j++;
                        }
                        else{
                            break;
                        }
                }
                console.log(dat);
                res.render('sentBox.html', {message: data2[0].name,
                    message2: dat, message3: emailID})    
                }
                else{
                    // console.log("null");
                    res.render('sentBox.html', {message: data2[0].name,
                        message2: null, message3: emailID})
                }
            })
        }
        else{
            res.render('sentBox.html', {message: null})
        }
    })
})

app.get('/inbox', function(req,res){
    database
    .select("*")
    .from("users")
    .where("emailID","=",emailID)
    .then(data2 => {
        if(data2){
            database
            .select("mto","mfrom","chats","dateTime")
            .from("conversations")
            .where("mto","=", emailID)
            .then(data3 => {
                if(data3[0]){
                    const det = [];
                    var  i;
                    var j=0;
                    for(i=Object.keys(data3).length-1; i>=0; i--){
                        if(j<Object.keys(data3).length){
                            det[j] = data3[i];
                            j++;
                        }
                        else{
                            break;
                        }
                    }
                    console.log(det);
                    res.render('inbox.html', {message: data2[0].name,
                    message2: det, message3: emailID})
                }
                else{
                    console.log("null");
                    res.render('inbox.html', {message: data2[0].name,
                    message2: null, message3: emailID})
                }
            })
        }
        else{
            console.log("null");
            res.render('inbox.html', {message: null})
        }
    })
})

// app.get('/logout', function(req,res){
//     emailID = null;
//     res.sendFile(__dirname + '/index.html');
//})

app.listen(3000, ()=>{
    console.log("port is started at 3000");
});