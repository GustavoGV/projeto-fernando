import mongoose from 'mongoose'
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    cooperativa: String,
    senha: String,
    turno: Number,
    taokeys: Number,
    divida: Array,
    sockid: String,
    frota: Array,
    promotores: Number,
    distribuidores: Number,
    comissao: Number,
    pas: Number,
    pas1: Number,
    pas2: Number,
    ativo: Number,
    faturamento: Number,
    propaganda: Number,
    propagandauni: Number,
    scoremod: Number,
    scorepreco: Array,
    scorepro: Number,
        147:Array,
        148:Array,
        149:Array,
        157:Array,
        158:Array,
        159:Array,
        257:Array,
        258:Array,
        259:Array,
        267:Array,
        268:Array,
        269:Array,
        347:Array,
        348:Array,
        349:Array,
        357:Array,
        358:Array,
        359:Array,
        367:Array,
        368:Array,
        369:Array
});

const DataSchema = new Schema({
    modelos_oferecidos: Array,
    total_pas: Number,
    oferta_mercado: Number,
    total_distribuidores: Number


})

const Aluno = mongoose.model('aluno', UserSchema)
const Data = mongoose.model('data', DataSchema)
let estrutura  = [Aluno, Data]
export default estrutura