const fs = require('fs');

class Contenedor{

    constructor(nombreArchivo){
        this.nombreArchivo = nombreArchivo;
        this.id = 'mensaje';
    }

    async save(objeto) {
        try {
            objeto.id = await this.assignId();
            const data = await fs.promises.readFile(this.nombreArchivo);
            const dataObj = JSON.parse(data);

            if (dataObj.id === this.id) {
                dataObj['mensaje'].push(objeto);
                await fs.promises.writeFile(this.nombreArchivo, JSON.stringify(dataObj, null, 2));
                return (this.id);
            } else {
                let obj = {
                    id: this.id,
                    mensaje: [objeto]
                }
                await fs.promises.writeFile(this.nombreArchivo, JSON.stringify(obj, null, 2));
            }

        } catch (error) {
            console.log(`Problema en save(): ${error}`);
        }
    }

    async assignId() {
        try {
            let id = 1, dataId;
            const dataObj = JSON.parse(await fs.promises.readFile(this.nombreArchivo));
            if (dataObj.id === this.id) {
                for (; ;) {
                    dataId = dataObj['mensaje'].find(dataObj => dataObj.id === id);
                    if (dataId) {
                        id++;
                    } else {
                        return id;
                    }
                }
            } else {
                return id;
            }
        } catch (error) {
            console.log(error)
        }
    }

    async getAll(){
        try {
            const dataObj = JSON.parse(await fs.promises.readFile(this.nombreArchivo));

            return dataObj;
        } catch (error) {
            console.log(`Problema en getAll(): ${error}`);
            
        }
    }

}

module.exports.Contenedor = Contenedor;