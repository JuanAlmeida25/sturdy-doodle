// 1. Importación de módulos
// npm install dotenv cors mongoose express mongodb

require('dotenv').config(); //carga las variables del archivo .env al objeto process.env
const cors = require('cors'); // Importamos CORS
const express = require('express'); // Importamos express
const mongoose = require('mongoose'); // Importamos mongoose

const app = express();
const PORT = process.env.PORT || 3000; // Definimos el puerto: usamos el del archivo .env o el 3000 por defecto
app.use(cors());

// 2. MIDDLEWARES
// Permite que nuestra API reciba e interprete datos en formato JSON en el cuerpo de las peticiones
app.use(express.json())
app.use(express.static('public')); // En la carpeta 'public' irá el HTML

// 3. CONEXIÓN A LA BASE DE DATOS mongo
// Usamos process.env para NO exponer credenciales en el código fuente
const DB_URI = process.env.MONGO_URI;

mongoose.connect(DB_URI)
  .then(() => console.log("Conectado"))
  .catch(err => {
    console.error('Error de Conexión critico',err.message);
    process.exit(1);
  });

const estudianteSchema = new mongoose.Schema({
  nombre:{type: String, required: [true, 'El nombre es obligatorio']},
  apellido:{type: String, required: [true, 'El apellido es obligatorio']},
  email:{type: String, required: true, unique: true, lowercase: true},
  edad:{type: Number, min: 5},
  curso:{type: String, default: 'General'},
  fechaInscripcion:{type: Date, default: Date.now}
});

// Creamos el modelo 'Estudiante' que interactuará con la colección 'estudiantes'
const Estudiante = mongoose.model('Estudiante', estudianteSchema);

// 5. RUTAS DEL CRUD (Endpoints)

/**
 * [CREATE] - POST /api/estudiantes
 * Propósito: Registrar un nuevo alumno
 */
app.post('/api/estudiantes', async (req, res) => {
  try{
    const nuevoEstudiante = new Estudiante(req.body);
    const guardado = await nuevoEstudiante.save();
    res.status(201).json(guardado);
  } catch (error){
    res.status(400).json({error: "No se puede encontrar al estudiante", detalle: error.message});
  }
});

/**
 * [READ] - GET /api/estudiantes
 * Propósito: Listar todos los estudiantes registrados
 */
app.get('/api/estudiantes/', async (req, res) => {
  try{
    const estudiantes = await Estudiante.find();
    res.status(200).json(estudiantes); //200 Ok
  }catch (error){
    res.status(500).json({error: "Error al obtener datos"});
  }
});

app.get('/api/estudiantes/:id', async (req, res) => {
    try {
        const estudiante = await Estudiante.findById(req.params.id);
        if (!estudiante) return res.status(404).json({ mensaje: "Estudiante no encontrado" });
        res.json(estudiante);
    } catch (error) {
        res.status(400).json({ error: "ID no válido" });
    }
});

/**
 * [UPDATE] - PUT /api/estudiantes/:id
 * Propósito: Modificar datos de un estudiante existente por su ID
 */
app.put('/api/estudiantes/:id', async (req, res) => {
    try {
        const actualizado = await Estudiante.findByIdAndUpdate(
            req.params.id,
            req.body,
            { returnDocument: 'after', //'new' devuelve el objeto ya cambiado
              runValidators: true } //Obliga a que los cambios cumplan con el Schema
        );
        if (!actualizado) return res.status(404).json({ mensaje: "No se encontró el estudiante" });
        res.json(actualizado);
    } catch (error) {
        res.status(400).json({ error: "Error al actualizar", detalle: error.message });
    }
});

/**
 * [DELETE] - DELETE /api/estudiantes/:id
 * Propósito: Eliminar un registro de forma permanente
 */
app.delete('/api/estudiantes/:id', async (req, res) => {
    try {
        const eliminado = await Estudiante.findByIdAndDelete(req.params.id);
        if (!eliminado) return res.status(404).json({ mensaje: "ID no encontrado" });
        res.json({ mensaje: "Estudiante eliminado correctamente" });
    } catch (error) {
        res.status(400).json({ error: "Error al eliminar" });
    }
});

// 6. INICIO DEL SERVIDOR
app.listen(PORT, () => {
  console.log(`servidor listo en http:localhost:${PORT}`);
  console.log('Presione ctrl + C para detener el proceso');
})