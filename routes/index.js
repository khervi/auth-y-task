const express = require('express');
const router = express.Router();
const User = require('../db').User;//traemos nuestro modelo de mongoose
const Task = require('../db').Task;
const ensureNotLoggedIn = require('connect-ensure-login').ensureNotLoggedIn;
// express middleware que intercepta un request y verifica si hay un usuario, si hay pasa, 
//sino redirecciona
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

/* GET home page.
* Esta ruta hace render del app principal, con el input para crear tarea
* y el listado de las tareas pendientes, es una ruta protegida por lo tanto requiere loguearse
* */
router.get('/', ensureLoggedIn('/auth/login'), function (req, res, next) {
    res.render('index', {title: 'Todo List App', 
    user: req.user
    });
});
router.get('/task', function (req, res, next) {
    Task.find({}).then(result => {
    res.render('task', {title: 'LISTA DE TAREAS',task:(result)//task:task.description
    });
})
    //tenemos varios tareas registrados en la base de datos nos devolvería un json
});

router.post('/task', function (req, res, next) {
    // obtiene los parametros del body
    const {description}=req.body;
    //buscamos si existe una tarea
    Task.find({description:description}).then(result => {
        
        if(result.length>0){
            //res.redirect('/');
            console.log("existe una tarea igual");
            res.redirect("/task")
        }else{ 
           // {User.populate(tasks, {path: "user"},function(err, tasks))}
                const task=new Task({description});
            //user.task.push({ name: description });----->parachancar a un array en doc de mongoose dice
            //var subdoc = parent.children[0];
            //console.log(subdoc) // { _id: '501d86090d371bab2c0341c5', name: description }
            //subdoc.isNew; // true

/*save(function (err) {
  if (err) return handleError(err)
  console.log('Success!');
});*/User.populate(task, {path: "user"},function(err, task){
    console.log("aca esta la relacion--->"+task);
})
            //user.task[0].description= req.body.description;
                console.log("aqui estoy ---> "+description),
        task.save().then(function(result,task){User.populate(task, {path: "user"},function(err, task){
            console.log("aca esta la relacion 2 --->"+task);
        })
           console.log("paso result....."+result);
                                        })    
            }
            res.redirect("/task");   
  })
    //taski.task[0].description=description; 
    // if (req.body || req.body)
   /* User.find({description: [{task:description}]}).then(results => {
    if(results){
        console.log("entro")
    }else{
        const tarea = new Task({description});
        tarea.save();
    }
})*/
console.log(req.body)
 
})

module.exports = router;
