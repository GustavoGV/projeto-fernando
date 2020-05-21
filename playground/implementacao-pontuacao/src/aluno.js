import mongoose from 'mongoose'
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    cooperativa: String,
    senha: String,
    instancia: String,
    turno: Number,
    backup: Number,
    taokeys: Number,
    divida: Array,
    sockid: String,
    frota: Array,
    promotores: Number,
    distribuidores: Number,
    comissao: Number,
    pas: Number,
    pas1: Number, //PAS em construção (faltando 1 turno para serem finalizados)
    pas2: Number, //PAS em construção (faltando 2 turno para serem finalizados)
    ativo: Number, //Se o player esta habilitado para participar do faturamento
    npesquisas: Number, //num de pesquisas realizadas
    faturamento: Number, //faturamento obtido no turno
    propaganda: Number,
    propagandauni: Number,
    scoremod: Number, //auxilio para calculo de faturamento por diferencaod e tipo de serviço (top, med, low)
    scorepreco: Array, //auxilia calculo de faturamento referente ao preco de venda
    scorepro: Number,
    temporario: Number, // 0 ou 1 fala se é o Schema temporario ou o oficial
        147:Array, //nessa array (com 6 de length) sendo que   
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
        369:Array,
    balanco_patrimonial: Object,
    dre: Object,
    fluxo_de_caixa: Object,
    cronograma: Object,
    pesquisas_realizadas: Object
});

const DataSchema = new Schema({
    ativo: Number,
    sockid: String,
    login_adm: String,
    senha_adm: String,
    instancia: String,
    senha_instancia: String,
    modelos_oferecidos: Array,
    participacao_modelos: Array, //array com length de 21 (= index) e cada elemento representa qnt do faturamento global acabou sendo alocado para cada serviço (participaçao desse serviço no faturamento global)
    total_pas: Number,
    oferta_mercado: Number,
    total_distribuidores: Number,
    turno: Number,
    CBG_news: Object


})

const Aluno = mongoose.model('aluno', UserSchema)
const Data = mongoose.model('data', DataSchema)
let estrutura  = [Aluno, Data]
export default estrutura