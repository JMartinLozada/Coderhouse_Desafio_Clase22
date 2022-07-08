const socket = io(); 

const user = new normalizr.schema.Entity('user');
const authorSchema = new normalizr.schema.Entity('authorMnsj', {author: user});
const mensajeSchema = new normalizr.schema.Entity('mensaje', {
  mensaje: [authorSchema]
});

const enviarMensaje = () => {
  const nombre = document.getElementById("nombre").value;
  const apellido = document.getElementById("apellido").value; 
  const email = document.getElementById("email").value; 
  const edad = document.getElementById("edad").value; 
  const alias = document.getElementById("alias").value; 
  const text = document.getElementById("text").value; 
  const avatar = document.getElementById("avatar").value; 

  const fecha = new Date();
  const objFecha = {
      dia: fecha.getDate(),
      mes: fecha.getMonth() + 1,
      anio: fecha.getFullYear(),
      hs: fecha.getHours(),
      min: fecha.getMinutes()
  }
const date = `[${objFecha.dia}/${objFecha.mes}/${objFecha.anio} ${objFecha.hs}:${objFecha.min}]`;  
  
  const mensaje = {
    author: {
      id: email,
      nombre: nombre,
      apellido: apellido,
      edad: edad,
      alias: alias,
      avatar: avatar,
    },
    text: text,
    date: date
  };                   

  socket.emit('new_message', mensaje);                
  document.getElementById("author").value="";
  document.getElementById("text").value="";
  return false;                                       
}

const renderCompresion = (mensajeNorm) => {

  const mensajeDenorm = normalizr.denormalize(mensajeNorm.result, mensajeSchema, mensajeNorm.entities)
  let compresion = 0;
  
  //Evita la division por 0
  if(mensajeNorm.result){
    let valorNorm = JSON.stringify(mensajeNorm).length;
    let valorDenorm = JSON.stringify(mensajeDenorm).length;
    compresion = ((valorDenorm / valorNorm) * 100).toFixed(2);
  }

  fetch('/templateCompresion.hbs')
    .then((res) => res.text())
    .then((data) => {
      const templateChat = Handlebars.compile(data);
      const htmlChat = templateChat({ compresion: compresion });
      document.getElementById('id_del_div_compresion').innerHTML = htmlChat;
    })

}

const renderMensaje = (mensajeNorm) => {
  
  const mensajeDenorm = normalizr.denormalize(mensajeNorm.result, mensajeSchema, mensajeNorm.entities)

  fetch('/templateMensajes.hbs')
  .then((res) => res.text())
  .then((data) => {
  const templateChat = Handlebars.compile(data);
  const htmlChat = templateChat({ mnsj: mensajeDenorm.mensaje});
  document.getElementById('id_del_div_chat').innerHTML = htmlChat;
  })

}

socket.on('new_event', ( mensaje) => {

  renderCompresion(mensaje);
  renderMensaje( mensaje);
});