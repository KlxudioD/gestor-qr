const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('publico'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'evista'));

// Conexión a MongoDB Atlas
mongoose.connect('mongodb+srv://formuser:claudio1990@cluster0.yg1v1bx.mongodb.net/formulariosDB?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});



// Esquema del formulario
const Registro = mongoose.model('Registro', {
  numero_registro: String,
  tipo_alojamiento: String,
  nombre_comercial: String,
  region: String,
  rut_empresa: String,
  razon_social: String,
  direccion: String,
  email: String,
  telefono: String,
  estado_registro: String
});

// Ruta para mostrar el formulario
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'publico', 'index.html'));
});

// Ruta para guardar datos y mostrar ficha
app.post('/submit', async (req, res) => {
  const count = await Registro.countDocuments();
  const numeroRegistro = `ST-${1000 + count + 1}`; // N° registro automático

  const nuevoRegistro = new Registro({ ...req.body, numero_registro: numeroRegistro });
  await nuevoRegistro.save();

  const urlFicha = `${req.protocol}://${req.get('host')}/ficha/${nuevoRegistro._id}`;
  const qr = await QRCode.toDataURL(urlFicha);

  res.render('ficha', { datos: nuevoRegistro, qr });
});

// Ruta para ver una ficha por ID
app.get('/ficha/:id', async (req, res) => {
  const datos = await Registro.findById(req.params.id);
  if (!datos) return res.send('No se encontró el registro.');

  const urlFicha = `${req.protocol}://${req.get('host')}/ficha/${req.params.id}`;
  const qr = await QRCode.toDataURL(urlFicha);

  res.render('ficha', { datos, qr });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
