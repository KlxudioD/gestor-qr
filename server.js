const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const path = require('path');

const app = express();

// Middleware para procesar formularios
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta 'publico'
app.use(express.static(path.join(__dirname, 'publico')));

// Configurar EJS para renderizar vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'evista'));

// Conexión a MongoDB Atlas
mongoose.connect(
  'mongodb+srv://formuser:claudio1990@cluster0.yg1v1bx.mongodb.net/formulariosDB?retryWrites=true&w=majority&appName=Cluster0',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

// Esquema y modelo para los registros
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

// Ruta raíz: sirve portada.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'publico', 'portada.html'));
});

// Ruta para guardar datos del formulario y mostrar ficha con QR
app.post('/submit', async (req, res) => {
  try {
    const count = await Registro.countDocuments();
    const numeroRegistro = `ST-${1000 + count + 1}`; // Número de registro automático

    const nuevoRegistro = new Registro({ ...req.body, numero_registro: numeroRegistro });
    await nuevoRegistro.save();

    const urlFicha = `${req.protocol}://${req.get('host')}/ficha/${nuevoRegistro._id}?viaQr=true`;
    const qr = await QRCode.toDataURL(urlFicha);

    res.render('ficha', { datos: nuevoRegistro, qr });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al guardar el registro.');
  }
});

// Ruta para mostrar ficha por ID
app.get('/ficha/:id', async (req, res) => {
  try {
    const datos = await Registro.findById(req.params.id);
    if (!datos) return res.status(404).send('No se encontró el registro.');

    const viaQr = req.query.viaQr === 'true';
    const urlFicha = `${req.protocol}://${req.get('host')}/ficha/${req.params.id}`;
    const qr = await QRCode.toDataURL(urlFicha);

    res.render('ficha', { datos, qr });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al buscar el registro.');
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
