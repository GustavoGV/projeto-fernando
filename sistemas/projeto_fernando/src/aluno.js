import mongoose from 'mongoose'
import { strict } from 'assert';
import { ServerResponse } from 'http';
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
    sockids: Array,
    frota: Array,
    promotores: Number,
    distribuidores: Number,
    comissao: String,
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
    somapropuni: Object,
    modificador: String,
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
    balanco_patrimonial: {
        caixa: Number,
        estoque: Number,
        contas_a_receber60: Number,
        contas_a_receber120: Number,
        maquinas: Number, 
        depreciacao_maquinas: Number,
        veiculos: Number,
        depreciacao_veiculos: Number,
        tributos_a_pagar_anterior: Number,
        tributos_a_pagar_atual: Number,
        emprestimos: Number,
        capial: Number,
        lucros_acumulados: Number

    },
    dre: {
        receita: Number,
        csp: Number,
        estoque_inicial: Number,
        custo_prestacao_servico: Number,
        custo_estocagem: Number,
        custo_troca_insumos: Number,
        hora_extra: Number,
        capacidade_n_utilizada: Number,
        margem_bruta: Number,
        despesas_administrativas: Number,
        salario_promotores: Number,
        comissao: Number,
        propaganda_institucional: Number,
        propaganda_unitaria: Number,
        depreciacao_de_maquinas: Number,
        encargos_financiamento: Number,
        salario_frota: Number,
        manutencao_frota: Number,
        depreciacao_de_veiculos: Number,
        frota_terceirizada: Number,
        despesas_operacionais_n_planejadas: Number,
        pas: Number,
        pesquisas: Number,
        tributos: Number,
        servicos: [String, Number, Number, Number],
        preco_medio: Number,
        atendimentos: Number,
        insumos_em_estoque: Number,
        distribuidores: Number,
    },
    fluxo_de_caixa: {
        saldo_anterior: Number,
        faturamento: Number,
        contas_a_receber: Number,
        contas_a_receber_recebidas: Number,
        custo_de_servico_prestado: Number,
        emprestimos_contratados: Number,
        emprestimos_pagos: Number,
        veiculos_vendidos: Number,
        depreciacao_de_veiculos: Number,
        depreciacao_de_maquinas: Number,
        veiculos_comprados: Number,
        tributos: Number,
        promotores: Number,
        propaganda: Number,
        pesquisas: Number,
        pas: Number,
        uso_frota: Number,
        despesas_operacionais_n_planejadas: Number,
        despesas_administrativas: Number,
        encargos_financiamento: Number,
        maquinas: Number,
        distribuidores: Number
    },
    pes_p: Object,
    participacao_modelos: Array,
    deci: Array,
    last_change: Object
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
    total_participacao_modelos: Number,
    total_pas: Number,
    oferta_mercado: Number,
    total_distribuidores: Number,
    turno: Number,
    CBG_news: Object,
    iniciado: Number,
    finalizado: Number


})

const UsuarioSchema = new Schema({

    cpf: String,
    nome: String,
    senha: String,
    login: String,
    telefone: String,
    email: String,
    instancia: String,
    sockid: String,
    cooperativa: String


})


const Usuario = mongoose.model('usuario', UsuarioSchema) //pessoa fisica
const Aluno = mongoose.model('aluno', UserSchema) //pessoa JURIDICA
const Data = mongoose.model('data', DataSchema) //INSTANCIA
let estrutura  = [Aluno, Data, Usuario]
export default estrutura

