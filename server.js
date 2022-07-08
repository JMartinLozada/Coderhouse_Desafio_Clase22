const express = require('express');
const norm = require('normalizr')

let modulo = require('./ContenedorMnsj.js');
const contenedorMnsj = new modulo.Contenedor('./filesystem/mensajes.txt');

const {faker} = require('@faker-js/faker');

const { defaultConfiguration } = require('express/lib/application');
const { Server: HttpServer } = require('http');       
const { Server: SocketServer } = require('socket.io');

let producto = [];
let messages = [], mensj = [];

const app = express();
app.use(express.static('public')); 

const httpServer = new HttpServer(app);             
const socketServer = new SocketServer(httpServer); 

//********* PRODUCTOS RANDOM ************/
const {engine} = require('express-handlebars');
app.use(express.urlencoded({extended: true}));

app.set('view engine', 'hbs');
app.set('views', './views');

const randomProducts = () => {
    const title = faker.commerce.product();
    const price = faker.commerce.price();
    const thumbnail = faker.image.imageUrl(640, 480, title, true);
    return {
        title: title,
        price: price,
        thumbnail: thumbnail
    }
}

app.engine(
    'hbs',
    engine({
        extname: '.hbs'
    })
);

app.get('/api/productos-test', (req, res) => {
    producto = [];
    for (let index = 0; index < 5; index++) {
        producto.push(randomProducts());        
    }
    res.render('vista', {producto});
});

//***************************************** */

//****** ESQUEMAS DE NORMALIZER ********//
const user = new norm.schema.Entity('user');
const authorSchema = new norm.schema.Entity('authorMnsj', {
  author: user
});
const mensajeSchema = new norm.schema.Entity('mensaje', {
    mensaje: [authorSchema]
});
//*************************************//

socketServer.on('connection', (socket) => {

    async function init() {
        mensj = await contenedorMnsj.getAll();
        messages = norm.normalize(mensj, mensajeSchema);

        socket.emit('new_event', messages);
    }
    init();

    socket.on('new_message', (mensaje) => {

        async function ejecutarSaveShowMnsjs() {
            await contenedorMnsj.save(mensaje);
            const mensj = await contenedorMnsj.getAll();
            messages = norm.normalize(mensj, mensajeSchema);
            socketServer.sockets.emit('new_event', messages);
        }
        ejecutarSaveShowMnsjs();
    });
});

httpServer.listen(8080, () => {
  console.log('Estoy escuchando en el puerto 8080');
});
