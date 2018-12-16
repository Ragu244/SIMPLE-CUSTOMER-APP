const express=require('express');
const bodyparser=require('body-parser');
const path=require('path');
const app=express();
const expressvalidator=require('express-validator');
const mongojs=require('mongojs');
const db=mongojs('customerapp',['users']);
const ObjectId=mongojs.ObjectId;
/*

const logger=function(req,res,next)
{
    console.log('logging..');
    next();
};

app.use(logger);

*/

//body parser middleware
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:false}));

//css and html files are to be added in public folder
app.use(express.static(path.join(__dirname,'public')));


//Global var for errors
app.use(function(req,res,next)
{
    res.locals.errors=null;
    next();
});

/*

// to display array object

const people=[
    {
    name:'ragu',
    age:19  
    },
    {
        name:'vel',
        age:20
    },
    {
        name:'abu',
        age:20
    }
];

app.get('/',function(req,res)
{
    res.json(people);
});

*/

//express validator 
app.use(expressvalidator({
    errorFormatter:function(param,msg,value)
    {
        const namespace=param.split('.'),
        root=namespace.shift(),
        formParam=root;

        while(namespace.length)
        {
            formParam+='['+namespace.shift()+']';
        }
        return{
            param:formParam,
            msg:msg,
            value:value
        };
    }
}));

/*

const users=[
    {
        id:01,
        first_name:'jack',
        last_name:'john',
        email:'ragu741721@gmail.com'
    },
    {
        id:02,
        first_name:'Bob',
        last_name:'Smith',
        email:'ra721@gmail.com'
    },
    {
        id:01,
        first_name:'Jill',
        last_name:'Jackson',
        email:'r721@gmail.com'
    }
];

*/

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.get('/',function(req,res)
{
    db.users.find(function(err,docs)
    {
        console.log(docs);
        res.render('index',{
            title:'Customers',
            users:docs
        });
    });
    
});

app.post('/users/add',function(req,res)
{
    req.checkBody('first_name','Fisrtname is Required').notEmpty();
    req.checkBody('last_name','Lastname is Required').notEmpty();
    req.checkBody('email','email is Required').notEmpty();

    const errors=req.validationErrors();

    if(errors)
    {
        db.users.find(function(err,users){
        res.render('index',{
            title:'Customers',
            users:users,
            errors:errors
        });
    });
       // console.log('errors');
    }
    else
    {
        const newuser={
            first_name:req.body.first_name,
            last_name:req.body.last_name,
            email:req.body.email
        };

        db.users.insert(newuser,function(err,result)
        {
            if(err)
            {
                console.log(err);
            }

            res.redirect("/");
        });
       // console.log('SUCCESS');
        //console.log(newuser);

    }
    
});

app.delete('/users/delete/:id',function(req,res)
{
    
    db.users.remove({_id:ObjectId(req.params.id)},function(err,result)
    {
        if(err)
        {
            console.log(err);
        }
        res.redirect('/');
    });
    
    console.log(req.params.id);
});
port=3000;
app.listen(port,function()
{
    console.log("listening on"+port);
});