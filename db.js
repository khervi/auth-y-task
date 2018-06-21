const mongoose = require("mongoose");

function initialize() {
    mongoose.connect('mongodb://localhost/todo_app');
    return mongoose.connection;
}

const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const UserSchema = new Schema({
    username: {type: String, required: true, unique: true},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    password: {type: String, required: true},
    task:{type:String,}
});
const taskSchema = new Schema({
    description:{type: String, required:true},
    user: { type: Schema.Types.ObjectId, ref: "User" }     
})

// método creado para verificar que el password en texto plano haga match con el password hash que tenemos guardado en mongo
UserSchema.methods.checkPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

// método para asignar un password, internamente lo hasheamos y recien asignamos al usuario
UserSchema.methods.setPassword = function (value) {
    this.password = bcrypt.hashSync(value, 12);
};
//metodo para la descripcion de las tareas 
//taskSchema={};

const User = mongoose.model("User", UserSchema);
const Task = mongoose.model("Task",taskSchema);

module.exports = {
    User,
    initialize,
    Task
};