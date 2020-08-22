import express from 'express'
import http from 'http'
import socketio from 'socket.io'
import estrutura from './src/aluno.js'
const Aluno = estrutura[0]
const Data = estrutura[1]
const Usuario = estrutura[2] //login individual
import mongoose from 'mongoose'
//import { readFile } from 'fs'

mongoose.connect('mongodb://localhost/aluno_teste')
mongoose.connection
    .once('open', () => console.log('Conexao com MongoDB (banco de dados) foi estabelecida com sucesso'))
    .on('error', (error) => {
        console.warn('Falha ao se conectar com o banco de dados. Motivo: ', error)
    })
//mongoose.set('useFindAndModify', false);

const app = express()
//const appadm = express()
const server = http.createServer(app) //http.createServer(app)
//const serveradm = http.createServer(appadm)
const sockets = socketio(server)
//const socketsadm = socketio(serveradm)

//let pesquisas = []
let index = [
"147",
"148",
"149",
"157",
"158",
"159",
"257",
"258",
"259",
"267",
"268",
"269",
"347",
"348",
"349",
"357",
"358",
"359",
"367",
"368",
"369"]


app.use(express.static('public'))

try{
sockets.on('connection', (socket) => { 
    console.log(` <=> Cooperativa ON. socket.id: ${socket.id}`)

    socket.on('disconnect', () => {
        console.log(` <=> Cooperativa OFF. socket.id: ${socket.id}`)
    })
    socket.on('limpar-aluno', () => {
        mongoose.connection.collections.alunos.drop()
    })
    socket.on('limpar-data', () => {
        mongoose.connection.collections.datas.drop()
    })
    socket.on('limpar-usuario', () => {
        mongoose.connection.collections.usuarios.drop()
    })
    socket.on('teste', (t) => {console.log('teste OK: (' + t +') id:'+ socket.id)
    })
    socket.on('login-client', (creden) => {
            Aluno.findOne({sockid: socket.id, temporario: 1}) // se n achar retorna Null e se vc tentar fazer essa pesquisa com um String sendo q no Schema ta como Number vai ir pro Catch ou vai pro Catch tb se n conseguir se conectar com o MongoDB
            .then((ll) => {
                if(ll !== null){
                    console.log('>>usuario ja conectado');
                    socket.emit('feedback', ['warning','AGUARDE UM MOMENTO ' + ll.cooperativa])
                    socket.emit('recarregar') 
                }
                else{
                    Usuario.findOne({ login: creden.login, senha: creden.senha })
                        .then((u) => {
                            if(u !== null){
                                if(u.cooperativa !== 'provisorio'){
                                    Aluno.findOne({ cooperativa: u.cooperativa, instancia: u.instancia, temporario: 1 })
                                            .then((usert) => {
                                                if(usert !== null){
                                                Data.findOne({instancia: usert.instancia}) //filtro para apenas liberar o login se o turno estiver ATIVO aqui se necessário
                                                    .then((check2) => {
                                                        if(check2.ativo == 1){ 
                                                            Aluno.findOne({cooperativa: usert.cooperativa, temporario: 0, instancia: usert.instancia})
                                                                .then((userdef) => {
                                                                    usert.last_change = {prop1: userdef.last_change.prop1, prop2: userdef.last_change.prop2 ,serv1: userdef.last_change.serv1, serv2: userdef.last_change.serv2, insu1: userdef.last_change.insu1, insu2: userdef.last_change.insu2, insu2i: userdef.last_change.insu2i, insu1i: userdef.last_change.insu1i, prop1: userdef.last_change.prop1, prop2: userdef.last_change.prop2}
                                                                    usert.deci = userdef.deci
                                                                    usert.set('npesquisas', userdef.npesquisas)
                                                                    usert.set('turno', userdef.turno)
                                                                    usert.set('propaganda', userdef.propaganda)
                                                                    usert.set('propagandauni', userdef.propagandauni)
                                                                    usert.set('taokeys', userdef.taokeys)
                                                                    usert.set('comissao', userdef.comissao)
                                                                    usert.set('pas', userdef.pas)
                                                                    usert.set('pas1', userdef.pas1)
                                                                    usert.set('pas2', userdef.pas2)
                                                                    usert.set('distribuidores', userdef.distribuidores)
                                                                    usert.set('promotores', userdef.promotores)
                                                                    usert.set('divida', [userdef["divida"][0],userdef["divida"][1],userdef["divida"][2]])

                                                                    usert.balanco_patrimonial = {
                                                                        caixa: userdef.balanco_patrimonial.caixa,
                                                                        estoque: userdef.balanco_patrimonial.estoque,
                                                                        contas_a_receber60: userdef.balanco_patrimonial.contas_a_receber60,
                                                                        contas_a_receber120: userdef.balanco_patrimonial.contas_a_receber120,
                                                                        maquinas: userdef.balanco_patrimonial.maquinas,
                                                                        depreciacao_maquinas: userdef.balanco_patrimonial.depreciacao_maquinas,
                                                                        veiculos: userdef.balanco_patrimonial.veiculos,
                                                                        depreciacao_veiculos: userdef.balanco_patrimonial.depreciacao_veiculos,
                                                                        tributos_a_pagar_anterior: userdef.balanco_patrimonial.tributos_a_pagar_anterior,
                                                                        tributos_a_pagar_atual: userdef.balanco_patrimonial.tributos_a_pagar_atual,
                                                                        emprestimos: userdef.balanco_patrimonial.emprestimos,
                                                                        capial: userdef.balanco_patrimonial.capial,
                                                                        lucros_acumulados: userdef.balanco_patrimonial.lucros_acumulados
                                                                    }
                                                                    usert.dre = {
                                                                        receita: userdef.dre.receita,
                                                                        csp: userdef.dre.csp,
                                                                        estoque_inicial: userdef.dre.estoque_inicial,
                                                                        custo_prestacao_servico: userdef.dre.custo_prestacao_servico,
                                                                        custo_estocagem: userdef.dre.custo_estocagem,
                                                                        custo_troca_insumos: userdef.dre.custo_troca_insumos,
                                                                        hora_extra: userdef.dre.hora_extra,
                                                                        capacidade_n_utilizada: userdef.dre.capacidade_n_utilizada,
                                                                        margem_bruta: userdef.dre.margem_bruta,
                                                                        despesas_administrativas: userdef.dre.despesas_administrativas,
                                                                        salario_promotores: userdef.dre.salario_promotores,
                                                                        comissao: userdef.dre.comissao,
                                                                        propaganda_institucional: userdef.dre.propaganda_institucional,
                                                                        propaganda_unitaria: userdef.dre.propaganda_unitaria,
                                                                        depreciacao_de_maquinas: userdef.dre.depreciacao_de_maquinas,
                                                                        encargos_financiamento: userdef.dre.encargos_financiamento,
                                                                        salario_frota: userdef.dre.salario_frota,
                                                                        manutencao_frota: userdef.dre.manutencao_frota,
                                                                        depreciacao_de_veiculos: userdef.dre.depreciacao_de_veiculos,
                                                                        frota_terceirizada: userdef.dre.frota_terceirizada,
                                                                        despesas_operacionais_n_planejadas: userdef.dre.despesas_operacionais_n_planejadas,
                                                                        pas: userdef.dre.pas,
                                                                        pesquisas: userdef.dre.pesquisas,
                                                                        tributos: userdef.dre.tributos,
                                                                        servicos: [userdef.dre.servicos[0],userdef.dre.servicos[1],userdef.dre.servicos[2],userdef.dre.servicos[3]],
                                                                        preco_medio: userdef.dre.preco_medio,
                                                                        atendimentos: userdef.dre.atendimentos,
                                                                        insumos_em_estoque: userdef.dre.insumos_em_estoque,
                                                                        distribuidores: userdef.dre.distribuidores
                                            
                                                                    }
                                                                    usert.fluxo_de_caixa = {
                                                                        saldo_anterior: userdef.fluxo_de_caixa.saldo_anterior,
                                                                        faturamento: userdef.fluxo_de_caixa.faturamento,
                                                                        contas_a_receber: userdef.fluxo_de_caixa.contas_a_receber,
                                                                        contas_a_receber_recebidas: userdef.fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                                                                        custo_de_servico_prestado: userdef.fluxo_de_caixa.custo_de_servico_prestado,
                                                                        emprestimos_contratados: userdef.fluxo_de_caixa.emprestimos_contratados,
                                                                        emprestimos_pagos: userdef.fluxo_de_caixa.emprestimos_pagos,
                                                                        veiculos_vendidos: userdef.fluxo_de_caixa.veiculos_vendidos,
                                                                        depreciacao_de_veiculos: userdef.fluxo_de_caixa.depreciacao_de_veiculos,
                                                                        depreciacao_de_maquinas: userdef.fluxo_de_caixa.depreciacao_de_maquinas,
                                                                        veiculos_comprados: userdef.fluxo_de_caixa.veiculos_comprados,
                                                                        tributos: userdef.fluxo_de_caixa.tributos,
                                                                        promotores: userdef.fluxo_de_caixa.promotores,
                                                                        propaganda: userdef.fluxo_de_caixa.propaganda,
                                                                        pesquisas: userdef.fluxo_de_caixa.pesquisas,
                                                                        pas: userdef.fluxo_de_caixa.pas,
                                                                        uso_frota: userdef.fluxo_de_caixa.uso_frota,
                                                                        despesas_operacionais_n_planejadas: userdef.fluxo_de_caixa.despesas_operacionais_n_planejadas,
                                                                        despesas_administrativas: userdef.fluxo_de_caixa.despesas_administrativas,
                                                                        encargos_financiamento: userdef.fluxo_de_caixa.encargos_financiamento,
                                                                        maquinas: userdef.fluxo_de_caixa.maquinas,
                                                                        distribuidores: userdef.fluxo_de_caixa.distribuidores
                                                                    }
                                                                    usert.somapropuni = {tipo1: userdef.somapropuni.tipo1, inv1: userdef.somapropuni.inv1, tipo2: userdef.somapropuni.tipo2, inv2: userdef.somapropuni.inv2}
                                                                    usert.pes_p = {
                                                                        modelos_oferecidos: userdef.pes_p.modelos_oferecidos,
                                                                        total_pas: userdef.pes_p.total_pas,
                                                                        total_participacao_modelos: userdef.pes_p.total_participacao_modelos,
                                                                        total_distribuidores: userdef.pes_p.total_distribuidores
                                                                    }
                                                                    usert.participacao_modelos = userdef.participacao_modelos

                                                                    for(let s = 0; s < index.length; s++){
                                                                        let serv = index[s]
                                                                        usert.set(serv, [userdef[serv][0], userdef[serv][1], userdef[serv][2], userdef[serv][3], userdef[serv][4], userdef[serv][5], userdef[serv][6], userdef[serv][7]])
                                                                    }

                                                                    usert.sockid = socket.id;
                                                                    usert.modificador = u.nome
                                                                    usert.save()
                                                                        .then(() => {
                                                                            console.log('>>login efetuado com sucesso')
                                                                            socket.emit('feedback', ['success', 'Login aprovado para: ' + creden.login]) 
                                                                            socket.emit('login-client-aprovado')
                                                                        
                                                                        })
                                                                        .catch((err) => {socket.emit('feedback', ['danger','falha ao salvar os dados no servidor -> ' + err]);console.log(err)})
                                     
                                            })
                              
                                        }
                                        else{
                                            socket.emit('feedback', ['warning','o turno atual ainda nao foi inicializado pelo administrador'])
                                        }        
                                    })
                                    .catch((errr) => {console.log(errr + ' <=> Falha na comunicacao com o Banco de dados n 403.0 ' + socket.id)})       
                            
                                }
                                else{
                                    socket.emit('feedback', ['danger','Nenhuma cooperativa encontrada (entre em contato com o suporte tecnico)'])
                                }
                            })
                                        
                                }
                                else{
                                    socket.emit('feedback', ['danger', 'Essa conta ainda nao foi vinculada com nenhuma Cooperativa (duvidas: sac@desafiosdegestao.com.br)'])    
                                }
                            }
                            else{
                                socket.emit('feedback', ['danger', 'Credenciais invalidas'])
                            }
                        })
                        .catch((err) => {console.log(err + ' <=> Falha na comunicacao com o Banco de dados n 403.1 ' + socket.id)})
                        }
            })
            .catch(() => {console.log('falha na comunicacao com o Banco de dados n 504 ' +socket.id)})

                       
    }) //falta teste
    socket.on('vincular-pessoa', (inf) => {
        if(inf.senha_mestra == 'senha-mestra'){
            Usuario.findOne({login: inf.login})
                .then((u) => {
                    if(u !== null){
                    u.cooperativa = inf.cooperativa
                    u.instancia = inf.instancia
                    u.save()
                        .then(() => {
                            socket.emit('feedback', ['success', 'vinculacao de ' + u.login + ' com ' + u.cooperativa + ' e ' + u.instancia + ' com sucesso'])
                        })
                    }
                    else{
                        socket.emit('feedback', ['danger', 'login nao encontrado'])
                    }
                })
        }
        else{
            socket.emit('feedback', ['danger', 'senha-mestra incorreta'])
        }
    }) //new falta testar
    socket.on('register-client', (creden) => {
        console.log(creden)
        let erro = []
        function formatCheck(c) {
            let a = 0
            if(c.cpf.length > 10){a=a+1}
            else{erro.push('cpf invalido')}
            if(c.login.length > 0){a=a+1}
            else{erro.push('login invalido')}
            if(c.email.length > 3){a=a+1}
            else{erro.push('email invalido')}
            if(c.telefone.length > 7){a=a+1}
            else{erro.push('telefone invalido')}
            if(c.senha.length > 0){a=a+1}
            else{erro.push('senha invalida')}
            if(c.nome.length > 0){a=a+1}
            else{erro.push('nome invalido')}

            return 'fino'

            if(a == 6){return 'fino'}
            else{return erro}
        }
        Aluno.findOne({sockid: socket.id, temporario: 1}) // se n achar retorna Null e se vc tentar fazer essa pesquisa com um String sendo q no Schema ta como Number vai ir pro Catch ou vai pro Catch tb se n conseguir se conectar com o MongoDB
            .then((ll) => {
                if(ll !== null){
                    console.log('>>usuario ja conectado')
                    socket.emit('feedback', ['warning','voce ja esta conectado com: ' + ll.cooperativa])
                }
                else{             
                    Usuario.findOne({login: creden.login})
                        .then((userx) => { 
                            if(userx !== null){
                                console.log('>>registro negado: esse nome de login ja esta sendo usado');
                                socket.emit('feedback', ['danger', 'esse nome de login ja esta sendo usado'])}
                            else{
                                
                                if(formatCheck(creden) == 'fino'){
                                    let jogador = new Usuario({login: creden.login, senha: creden.senha, email: creden.email, cpf: creden.cpf, telefone: creden.telefone, nome: creden.nome, cooperativa: 'provisorio', instancia: 'provisorio'})
                                        jogador.save()
                                            .then(() => {socket.emit('feedback', ['success', 'registro realizado com sucesso para ' + creden.login])})
                                            .catch((wrr) => {console.log(wrr)})
                                }
                                
                                else{
                                    socket.emit('feedback', ['danger', 'falha na tentativa de registro: ' + String(erro)])
                                }
                            }
                        }) 
                } 
            })
            .catch((err) => {console.log(err+'. id:' + socket.id)})
    }) //falta concertar checagem de dados recebidos...
    socket.on('register-cooperativa', (creden) => {
        Aluno.findOne({sockid: socket.id, temporario: 1}) // se n achar retorna Null e se vc tentar fazer essa pesquisa com um String sendo q no Schema ta como Number vai ir pro Catch ou vai pro Catch tb se n conseguir se conectar com o MongoDB
            .then((ll) => {
                if(ll !== null){
                    console.log('>>usuario ja conectado')
                    socket.emit('feedback', ['warning','voce ja esta conectado com: ' + ll.cooperativa])
                }
                else{
                    Data.findOne({instancia: creden[2], senha_instancia: creden[3]})
                        .then((inst) => {
                            if(inst !== null && inst.turno == 1){

                            
        Aluno.findOne({cooperativa: creden[0], instancia: creden[2]})
            .then((userx) => {
                if(userx !== null){
                    console.log('>>registro negado: já existe cooperativa com este nome');
                    socket.emit('feedback', ['danger', 'ja existe uma cooperativa com esse nome na instancia selecionada'])}
                else{
                    let jogador = new Aluno({ sockid: socket.id, backup: 0, temporario: 1, instancia: creden[2], last_change: {serv1: '147', serv2: 0, prop1: 0, prop2: 0, insu1: 0, insu2: 0, insu1i: 985, insu2i: 0, prop1: 0, prop2: 0}, npesquisas: 1, turno: 1, scoremod: 0, scorepreco: [0,0], propaganda: 0, propagandauni: 1, faturamento: 0, ativo: 1, taokeys: 1872000, divida: [0,0,0], comissao: '5%', frota: [10,0,0,0,0,0,0,0,0,0,0,0], cooperativa: creden[0], pas: 15, pas1: 0, pas2: 0, distribuidores: 25, promotores: 20, senha: creden[1], 
                        147:[985,1,288,600,300,0,0,0],
                        159:[0,0,396,0,0,0,0,0],
                        149:[0,0,360,0,0,0,0,0],
                        148:[0,0,324,0,0,0,0,0],
                        158:[0,0,360,0,0,0,0,0],
                        157:[0,0,324,0,0,0,0,0],
                        257:[0,0,396,0,0,0,0,0],
                        258:[0,0,432,0,0,0,0,0],
                        259:[0,0,468,0,0,0,0,0],
                        267:[0,0,432,0,0,0,0,0],
                        268:[0,0,468,0,0,0,0,0],
                        269:[0,0,504,0,0,0,0,0],
                        347:[0,0,432,0,0,0,0,0],
                        348:[0,0,468,0,0,0,0,0],
                        349:[0,0,504,0,0,0,0,0],
                        357:[0,0,468,0,0,0,0,0],
                        358:[0,0,504,0,0,0,0,0],
                        359:[0,0,540,0,0,0,0,0],
                        367:[0,0,504,0,0,0,0,0],
                        368:[0,0,540,0,0,0,0,0],
                        369:[0,0,576,0,0,0,0,0],
                        balanco_patrimonial: {
                            caixa: 1872000,
                            estoque: 283680,
                            contas_a_receber60: 2683845,
                            contas_a_receber120: 1405464,
                            maquinas: 17280000,
                            depreciacao_maquinas: 1152000,
                            veiculos: 576000,
                            depreciacao_veiculos: 144000,
                            tributos_a_pagar_anterior: 913221,
                            tributos_a_pagar_atual: 0,
                            emprestimos: 288000,
                            capial: 18720000,
                            lucros_acumulados: 0
                        },
                        dre: {
                            receita: 0,
                            csp: 0,
                            estoque_inicial: 283680,
                            custo_prestacao_servico: 0,
                            custo_estocagem: 0,
                            custo_troca_insumos: 0,
                            hora_extra: 0,
                            capacidade_n_utilizada: 0,
                            margem_bruta: 0,
                            despesas_administrativas: 0,
                            salario_promotores: 0,
                            comissao: 0,
                            propaganda_institucional: 0,
                            propaganda_unitaria: 0,
                            depreciacao_de_maquinas: 0,
                            encargos_financiamento: 0,
                            salario_frota: 0,
                            manutencao_frota: 0,
                            depreciacao_de_veiculos: 0,
                            frota_terceirizada: 0,
                            despesas_operacionais_n_planejadas: 0,
                            pas: 0,
                            pesquisas: 0,
                            tributos: 0,
                            servicos: ['147',288,0,0],
                            preco_medio: 0,
                            atendimentos: 0,
                            insumos_em_estoque: 985,
                            distribuidores: 0

                        },
                        fluxo_de_caixa: {
                            saldo_anterior: 1872000,
                            faturamento: 0,
                            contas_a_receber: 0,
                            contas_a_receber_recebidas: 0, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                            custo_de_servico_prestado: 0,
                            emprestimos_contratados: 0,
                            emprestimos_pagos: 0,
                            veiculos_vendidos: 0,
                            depreciacao_de_veiculos: 0,
                            depreciacao_de_maquinas: 0,
                            veiculos_comprados: 0,
                            tributos: 0,
                            promotores: 0,
                            propaganda: 0,
                            pesquisas: 0,
                            pas: 0,
                            uso_frota: 0,
                            despesas_operacionais_n_planejadas: 0,
                            despesas_administrativas: 0,
                            encargos_financiamento: 0,
                            maquinas: 0,
                            distribuidores: 0
                        },
                        somapropuni: {tipo1: '147', inv1: 0, tipo2: 0, inv2: 0},
                        pes_p: {
                        modelos_oferecidos: 0,
                        total_pas: 0,
                        total_participacao_modelos: 0,
                        total_distribuidores: 0
                        },
                        participacao_modelos: [],
                        deci: []
                    });
                        jogador.save()
                            .then(Aluno.find({ cooperativa: creden[0], temporario: 1, instancia: creden[2]}))
                            .then((user) => { 
                                if(user !== null){
                                    //console.log('caralho')
                                    let jogadorR = new Aluno({ sockid: "11994729653", backup: 0, temporario: 0, last_change: {serv1: '147', serv2: 0, prop1: 0, prop2: 0, insu1: 0, insu2: 0, insu1i: 985, insu2i: 0, prop1: 0, prop2: 0}, instancia: creden[2], npesquisas: 1, turno: 1, scoremod: 0, scorepreco: [0,0], propaganda: 0, propagandauni: 1, faturamento: 0, ativo: 1, taokeys: 1872000, divida: [0,0,0], comissao: '5%', frota: [10,0,0,0,0,0,0,0,0,0,0,0], cooperativa: creden[0], pas: 15, pas1: 0, pas2: 0, distribuidores: 25, promotores: 20, senha: creden[1], 
                                    147:[985,1,288,600,300,0,0,0],
                                    159:[0,0,396,0,0,0,0,0],
                                    149:[0,0,360,0,0,0,0,0],
                                    148:[0,0,324,0,0,0,0,0],
                                    158:[0,0,360,0,0,0,0,0],
                                    157:[0,0,324,0,0,0,0,0],
                                    257:[0,0,396,0,0,0,0,0],
                                    258:[0,0,432,0,0,0,0,0],
                                    259:[0,0,468,0,0,0,0,0],
                                    267:[0,0,432,0,0,0,0,0],
                                    268:[0,0,468,0,0,0,0,0],
                                    269:[0,0,504,0,0,0,0,0],
                                    347:[0,0,432,0,0,0,0,0],
                                    348:[0,0,468,0,0,0,0,0],
                                    349:[0,0,504,0,0,0,0,0],
                                    357:[0,0,468,0,0,0,0,0],
                                    358:[0,0,504,0,0,0,0,0],
                                    359:[0,0,540,0,0,0,0,0],
                                    367:[0,0,504,0,0,0,0,0],
                                    368:[0,0,540,0,0,0,0,0],
                                    369:[0,0,576,0,0,0,0,0],
                                    balanco_patrimonial: {
                                        caixa: 1872000,
                                        estoque: 283680,
                                        contas_a_receber60: 2683845,
                                        contas_a_receber120: 1405464,
                                        maquinas: 17280000,
                                        depreciacao_maquinas: 1152000,
                                        veiculos: 576000,
                                        depreciacao_veiculos: 144000,
                                        tributos_a_pagar_anterior: 913221,
                                        tributos_a_pagar_atual: 0,
                                        emprestimos: 288000,
                                        capial: 18720000,
                                        lucros_acumulados: 0
                                    },
                                    dre: {
                                        receita: 0,
                                        csp: 0,
                                        estoque_inicial: 283680,
                                        custo_prestacao_servico: 0,
                                        custo_estocagem: 0,
                                        custo_troca_insumos: 0,
                                        hora_extra: 0,
                                        capacidade_n_utilizada: 0,
                                        margem_bruta: 0,
                                        despesas_administrativas: 0,
                                        salario_promotores: 0,
                                        comissao: 0,
                                        propaganda_institucional: 0,
                                        propaganda_unitaria: 0,
                                        depreciacao_de_maquinas: 0,
                                        encargos_financiamento: 0,
                                        salario_frota: 0,
                                        manutencao_frota: 0,
                                        depreciacao_de_veiculos: 0,
                                        frota_terceirizada: 0,
                                        despesas_operacionais_n_planejadas: 0,
                                        pas: 0,
                                        pesquisas: 0,
                                        tributos: 0,
                                        servicos: ['147',288,0,0],
                                        preco_medio: 0,
                                        atendimentos: 0,
                                        insumos_em_estoque: 985,
                                        distribuidores: 0
            
            
                                    },
                                    fluxo_de_caixa: {
                                        saldo_anterior: 1872000,
                                        faturamento: 0,
                                        contas_a_receber: 0,
                                        contas_a_receber_recebidas: 0, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                                        custo_de_servico_prestado: 0,
                                        emprestimos_contratados: 0,
                                        emprestimos_pagos: 0,
                                        veiculos_vendidos: 0,
                                        depreciacao_de_veiculos: 0,
                                        depreciacao_de_maquinas: 0,
                                        veiculos_comprados: 0,
                                        tributos: 0,
                                        promotores: 0,
                                        propaganda: 0,
                                        pesquisas: 0,
                                        pas: 0,
                                        uso_frota: 0,
                                        despesas_operacionais_n_planejadas: 0,
                                        despesas_administrativas: 0,
                                        encargos_financiamento: 0,
                                        maquinas: 0,
                                        distribuidores: 0
                                    
                                    },
                                    somapropuni: {tipo1: '147', inv1: 0, tipo2: 0, inv2: 0},
                                    pes_p: {
                                        modelos_oferecidos: 0,
                                        total_pas: 0,
                                        total_participacao_modelos: 0,
                                        total_distribuidores: 0
                                        },
                                    participacao_modelos: [],
                                    deci: []
                                    
                                    });
                                    jogadorR.save()
                                        .then(() => {
                                            console.log('>>login aprovado')
                                            socket.emit('feedback', ['success','>> Login aprovado para: ' + creden[0]+'.']) 
                                            //socket.emit('register-client-aprovado')
                                        })
                                        .catch((err) => {console.log(err)})

                                }
                                else{
                                    console.log('>>falha ao registrar: ' + creden[0]+'.')
                                    socket.emit('feedback', ['danger','>> Ocorreu uma falha no processo de registro da cooperativa: ' +creden[0]+'.']) 
                                    }
                            })

                            .catch((wrr) => {console.log(wrr)})
                            

                }

            }) 
        
        }
        else{
            console.log('>>registro negado')
            socket.emit('feedback', ['danger', 'combinação de nome da sessão e senha da sessão invalida'])}
    })
        } })
            .catch((err) => {console.log(err+'. id:' + socket.id)})
    }) //falta realizar um registro de PESSOA FISICA e linkar a conta da cooperativa
    socket.on('trocar-servico', (dados) => {
        console.log(dados)
        let velho = dados[0];
        let novo = dados[1];
        let qnt = Number(dados[2]);

        if(qnt && Number.isInteger(qnt)){ 
        if(qnt > 0){
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                    
                    if(novo !== velho){
                    
                    if(userx[velho][0] >= qnt){
                        if(userx[novo][1] == 1){
                            let pass = 0
                        if(userx.last_change.serv1 == velho){
                            if(userx.last_change.insu1 !== 0){
                                pass = 0
                            }
                            else{
                                pass = 1
                            }
                        }
                        if(userx.last_change.serv2 == velho){
                            if(userx.last_change.insu2 !== 0){
                                pass = 0
                            }
                            else{
                                pass = 1
                            }
                        }
                        if(pass == 1){
                        if(userx[novo][2] - userx[velho][2] > 0){
                            if(userx['taokeys'] >= qnt*30 + qnt*(userx[novo][2] - userx[velho][2])){
                            let datetime = new Date().toLocaleString('pt-BR').toLocaleString('pt-BR');
                            userx.deci.push({data: datetime, acao: 'Troca de '+qnt+' insumos de ' + velho + ' para ' + novo, autor: userx.modificador})
                            /*
                            if(userx.last_change.serv1 == novo && (userx[userx.last_change.serv1][0] - userx.last_change.insu1) < qnt){
                            userx.last_change = {
                                serv1: userx.last_change.serv1,
                                serv2: userx.last_change.serv2,
                                insu1: userx.last_change.insu1 - (qnt - (userx[userx.last_change.serv1][0] - userx.last_change.insu1)),
                                insu2: userx.last_change.insu2,
                                volume1: userx.last_change.volume1,
                                volume2: userx.last_change.volume2,
                                prop1: userx.last_change.prop1,
                                prop2: userx.last_change.prop2
                            }
                            }
                            if(userx.last_change.serv2 == novo && (userx[userx.last_change.serv2][0] - userx.last_change.insu2) < qnt){
                                userx.last_change = {
                                    serv1: userx.last_change.serv1,
                                    serv2: userx.last_change.serv2,
                                    insu1: userx.last_change.insu1,
                                    insu2: userx.last_change.insu2 - (qnt - (userx[userx.last_change.serv2][0] - userx.last_change.insu2)),
                                    volume1: userx.last_change.volume1,
                                    volume2: userx.last_change.volume2,
                                    prop1: userx.last_change.prop1,
                                    prop2: userx.last_change.prop2
                                }
                            }
                            */

                            userx.balanco_patrimonial = {
                                caixa: userx.balanco_patrimonial.caixa - qnt*30 - (userx[novo][2] - userx[velho][2])*qnt,
                                estoque: userx.balanco_patrimonial.estoque + (userx[novo][2] - userx[velho][2])*qnt,
                                contas_a_receber60: userx.balanco_patrimonial.contas_a_receber60,
                                contas_a_receber120: userx.balanco_patrimonial.contas_a_receber120,
                                maquinas: userx.balanco_patrimonial.maquinas,
                                depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_maquinas,
                                veiculos: userx.balanco_patrimonial.veiculos,
                                depreciacao_veiculos: userx.balanco_patrimonial.depreciacao_veiculos,
                                tributos_a_pagar_anterior: userx.balanco_patrimonial.tributos_a_pagar_anterior,
                                tributos_a_pagar_atual: userx.balanco_patrimonial.tributos_a_pagar_atual,
                                emprestimos: userx.balanco_patrimonial.emprestimos,
                                capial: userx.balanco_patrimonial.capial,
                                lucros_acumulados: userx.balanco_patrimonial.lucros_acumulados - qnt*30
                            }
                            userx.dre = {
                                receita: userx.dre.receita,
                                csp: userx.dre.csp,
                                estoque_inicial: userx.dre.estoque_inicial,
                                custo_prestacao_servico: userx.dre.custo_prestacao_servico,
                                custo_estocagem: userx.dre.custo_estocagem,
                                custo_troca_insumos: userx.dre.custo_troca_insumos + qnt*30 + (userx[novo][2] - userx[velho][2])*qnt,
                                hora_extra: userx.dre.hora_extra,
                                capacidade_n_utilizada: userx.dre.capacidade_n_utilizada,
                                margem_bruta: userx.dre.margem_bruta,
                                despesas_administrativas: userx.dre.despesas_administrativas,
                                salario_promotores: userx.dre.salario_promotores,
                                comissao: userx.dre.comissao,
                                propaganda_institucional: userx.dre.propaganda_institucional,
                                propaganda_unitaria: userx.dre.propaganda_unitaria,
                                depreciacao_de_maquinas: userx.dre.depreciacao_de_maquinas,
                                encargos_financiamento: userx.dre.encargos_financiamento,
                                salario_frota: userx.dre.salario_frota,
                                manutencao_frota: userx.dre.manutencao_frota,
                                depreciacao_de_veiculos: userx.dre.depreciacao_de_veiculos,
                                frota_terceirizada: userx.dre.frota_terceirizada,
                                despesas_operacionais_n_planejadas: userx.dre.despesas_operacionais_n_planejadas,
                                pas: userx.dre.pas,
                                pesquisas: userx.dre.pesquisas,
                                tributos: userx.dre.tributos,
                                servicos: [userx.dre.servicos[0], userx.dre.servicos[1], userx.dre.servicos[2], userx.dre.servicos[3]],
                                preco_medio: userx.dre.preco_medio,
                                atendimentos: userx.dre.atendimentos,
                                insumos_em_estoque: userx.dre.insumos_em_estoque,
                                distribuidores: userx.dre.distribuidores
    
                            }
                            userx.fluxo_de_caixa = {
                                saldo_anterior: userx.fluxo_de_caixa.saldo_anterior,
                                faturamento: userx.fluxo_de_caixa.faturamento,
                                contas_a_receber: userx.fluxo_de_caixa.contas_a_receber,
                                contas_a_receber_recebidas: userx.fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                                custo_de_servico_prestado: userx.fluxo_de_caixa.custo_de_servico_prestado + qnt*30 + (userx[novo][2] - userx[velho][2])*qnt,
                                emprestimos_contratados: userx.fluxo_de_caixa.emprestimos_contratados,
                                emprestimos_pagos: userx.fluxo_de_caixa.emprestimos_pagos,
                                veiculos_vendidos: userx.fluxo_de_caixa.veiculos_vendidos,
                                depreciacao_de_veiculos: userx.fluxo_de_caixa.depreciacao_de_veiculos,
                                depreciacao_de_maquinas: userx.fluxo_de_caixa.depreciacao_de_maquinas,
                                veiculos_comprados: userx.fluxo_de_caixa.veiculos_comprados,
                                tributos: userx.fluxo_de_caixa.tributos,
                                promotores: userx.fluxo_de_caixa.promotores,
                                propaganda: userx.fluxo_de_caixa.propaganda,
                                pesquisas: userx.fluxo_de_caixa.pesquisas,
                                pas: userx.fluxo_de_caixa.pas,
                                uso_frota: userx.fluxo_de_caixa.uso_frota,
                                despesas_operacionais_n_planejadas: userx.fluxo_de_caixa.despesas_operacionais_n_planejadas,
                                despesas_administrativas: userx.fluxo_de_caixa.despesas_administrativas,
                                encargos_financiamento: userx.fluxo_de_caixa.encargos_financiamento,
                                maquinas: userx.fluxo_de_caixa.maquinas,
                                distribuidores: userx.fluxo_de_caixa.distribuidores
                            }
                            if(userx.somapropuni.tipo1 == velho){
                                userx.somapropuni = {tipo1: userx.somapropuni.tipo1, inv1: userx.somapropuni.inv1, tipo2: userx.somapropuni.tipo2, inv2: userx.somapropuni.inv2}     
                            }
                            if(userx.somapropuni.tipo2 == velho){
                                userx.somapropuni = {tipo1: userx.somapropuni.tipo1, inv1: userx.somapropuni.inv1, tipo2: userx.somapropuni.tipo2, inv2: userx.somapropuni.inv2}     
                            }
                            userx.somapropuni = {tipo1: userx.somapropuni.tipo1, inv1: userx.somapropuni.inv1, tipo2: userx.somapropuni.tipo2, inv2: userx.somapropuni.inv2}     
                        let insu_velho = Number(userx[velho][0]) - Number(qnt)
                        let array_dados_velho = [insu_velho,1,userx[velho][2], userx[velho][3], userx[velho][4], userx[velho][5], userx[velho][6], userx[velho][7]];
                        let insu_novo = Number(userx[novo][0]) + Number(qnt)
                        if(insu_novo < 1){
                            insu_novo = 0
                        }
                        if(insu_velho < 1){
                            insu_velho = 0
                        }
                        let array_dados_novo
                            if(userx[novo][4] == 0 && userx[novo][3] !== 0){
                                array_dados_novo = [insu_novo,1,userx[novo][2], userx[novo][3], 1, userx[novo][5], userx[novo][6], userx[novo][7]]
                            }
                            else if(userx[novo][4] == 0 && userx[novo][3] == 0){
                                array_dados_novo = [insu_novo,1,userx[novo][2], 800, 1, userx[novo][5], userx[novo][6], userx[novo][7]]
                            }
                            else if(userx[novo][4] !== 0 && userx[novo][3] == 0){
                                array_dados_novo = [insu_novo,1,userx[novo][2], 800, userx[novo][4], userx[novo][5], userx[novo][6], userx[novo][7]]
                            }
                            else{
                                array_dados_novo = [insu_novo,1,userx[novo][2], userx[novo][3], userx[novo][4], userx[novo][5], userx[novo][6], userx[novo][7]]
                            }
                        
                        userx.set(velho, array_dados_velho)
                        userx.set(novo, array_dados_novo)
                        userx.taokeys = userx.taokeys - qnt*30 - (userx[novo][2] - userx[velho][2])*qnt 
                        console.log("13: " + users[i].taokeys)
                        userx.save()
                            .then(() => Aluno.findOne({ _id: userx._id, temporario: 1}))                 
                            .then((user) => {
                                //console.log(userx[velho][0] + ' <----userx(Schema trabalhado aqui)')
                                //console.log(user[velho][0] + ' <=====user(recem pesquisado)')
                                if(user.taokeys == userx.taokeys){
                                socket.emit('feedback', ['success', qnt + ' insumos transferidos do serviço: '+ velho +' com sucesso para o serviço: ' + novo])
                                function propuni(tipo) {
                                    if(user.somapropuni.tipo1 == tipo){
                                        return user.somapropuni.inv1
                                    }
                                    else if(user.somapropuni.tipo2 == tipo){
                                        return user.somapropuni.inv2
                                    }
                                    else{return 0}
                                }
                                function insumosi(s) {
                                    if(s == user.last_change.serv1){
                                        return user.last_change.insu1i
                                    }
                                    else if(s == user.last_change.serv2){
                                        return user.last_change.insu2i
                                    }
                                    else{
                                        return 0
                                    }
                                }
                                socket.emit('update', [
                                                                        [...user["147"],"147",propuni("147"),insumosi("147")],
                                    [...user["148"],"148",propuni("148"),insumosi("148")],
                                    [...user["149"],"149",propuni("149"),insumosi("149")],
                                    [...user["157"],"157",propuni("157"),insumosi("157")],
                                    [...user["158"],"158",propuni("158"),insumosi("158")],
                                    [...user["159"],"159",propuni("159"),insumosi("159")],
                                    [...user["257"],"257",propuni("257"),insumosi("257")],
                                    [...user["258"],"258",propuni("258"),insumosi("258")],
                                    [...user["259"],"259",propuni("259"),insumosi("259")],
                                    [...user["267"],"267",propuni("267"),insumosi("267")],
                                    [...user["268"],"268",propuni("268"),insumosi("268")],
                                    [...user["269"],"269",propuni("269"),insumosi("269")],
                                    [...user["347"],"347",propuni("347"),insumosi("347")],
                                    [...user["348"],"348",propuni("348"),insumosi("348")],
                                    [...user["349"],"349",propuni("349"),insumosi("349")],
                                    [...user["357"],"357",propuni("357"),insumosi("357")],
                                    [...user["358"],"358",propuni("358"),insumosi("358")],
                                    [...user["359"],"359",propuni("359"),insumosi("359")],
                                    [...user["367"],"367",propuni("367"),insumosi("367")],
                                    [...user["368"],"368",propuni("368"),insumosi("368")],
                                    [...user["369"],"369",propuni("369"),insumosi("369")],                                    user["taokeys"],
                                    user["frota"],
                                    user["promotores"],
                                    user["comissao"],
                                    user["distribuidores"],
                                    user["pas"],
                                    user["propaganda"],
                                    user["propagandauni"],
                                    (user["divida"][0]+user["divida"][1]+user["divida"][2]),
                                    user["turno"]]);
        
                                    }                  
                                })
                            .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})
                            }
                            else{socket.emit('feedback', ['warning','a cooperativa não possue caixa o suficiente para realizar essa operação'])}
                        }
                        else{
                            let datetime = new Date().toLocaleString('pt-BR').toLocaleString('pt-BR');
                            userx.deci.push({data: datetime, acao: 'Troca de '+qnt+' insumos de ' + velho + ' para ' + novo, autor: userx.modificador})
                           /*
                            if(userx.last_change.serv1 == novo && (userx[userx.last_change.serv1][0] - userx.last_change.insu1) < qnt){
                                console.log('(qnt - (userx[userx.last_change.serv1][0] - userx.last_change.insu1)): '+(qnt - (userx[userx.last_change.serv1][0] - userx.last_change.insu1)))
                                userx.last_change = {
                                    serv1: userx.last_change.serv1,
                                    serv2: userx.last_change.serv2,
                                    insu1: userx.last_change.insu1 - (qnt - (userx[userx.last_change.serv1][0] - userx.last_change.insu1)),
                                    insu2: userx.last_change.insu2,
                                    volume1: userx.last_change.volume1,
                                    volume2: userx.last_change.volume2,
                                    prop1: userx.last_change.prop1,
                                    prop2: userx.last_change.prop2
                                }
                                }
                                if(userx.last_change.serv2 == novo && (userx[userx.last_change.serv2][0] - userx.last_change.insu2) < qnt){
                                    console.log('(qnt - (userx[userx.last_change.serv2][0] - userx.last_change.insu2)): '+(qnt - (userx[userx.last_change.serv2][0] - userx.last_change.insu2)))
                                    userx.last_change = {
                                        serv1: userx.last_change.serv1,
                                        serv2: userx.last_change.serv2,
                                        insu1: userx.last_change.insu1,
                                        insu2: userx.last_change.insu2 - (qnt - (userx[userx.last_change.serv2][0] - userx.last_change.insu2)),
                                        volume1: userx.last_change.volume1,
                                        volume2: userx.last_change.volume2,
                                        prop1: userx.last_change.prop1,
                                        prop2: userx.last_change.prop2
                                    }
                                }
                                */
                                userx.balanco_patrimonial = {
                                    caixa: userx.balanco_patrimonial.caixa - qnt*30,
                                    estoque: userx.balanco_patrimonial.estoque + (userx[novo][2] - userx[velho][2])*qnt,
                                    contas_a_receber60: userx.balanco_patrimonial.contas_a_receber60,
                                    contas_a_receber120: userx.balanco_patrimonial.contas_a_receber120,
                                    maquinas: userx.balanco_patrimonial.maquinas,
                                    depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_maquinas,
                                    veiculos: userx.balanco_patrimonial.veiculos,
                                    depreciacao_veiculos: userx.balanco_patrimonial.depreciacao_veiculos,
                                    tributos_a_pagar_anterior: userx.balanco_patrimonial.tributos_a_pagar_anterior,
                                    tributos_a_pagar_atual: userx.balanco_patrimonial.tributos_a_pagar_atual,
                                    emprestimos: userx.balanco_patrimonial.emprestimos,
                                    capial: userx.balanco_patrimonial.capial,
                                    lucros_acumulados: userx.balanco_patrimonial.lucros_acumulados - qnt*30 + (userx[novo][2] - userx[velho][2])*qnt
                                }
                                userx.dre = {
                                    receita: userx.dre.receita,
                                    csp: userx.dre.csp,
                                    estoque_inicial: userx.dre.estoque_inicial,
                                    custo_prestacao_servico: userx.dre.custo_prestacao_servico,
                                    custo_estocagem: userx.dre.custo_estocagem,
                                    custo_troca_insumos: userx.dre.custo_troca_insumos + qnt*30,
                                    hora_extra: userx.dre.hora_extra,
                                    capacidade_n_utilizada: userx.dre.capacidade_n_utilizada,
                                    margem_bruta: userx.dre.margem_bruta,
                                    despesas_administrativas: userx.dre.despesas_administrativas,
                                    salario_promotores: userx.dre.salario_promotores,
                                    comissao: userx.dre.comissao,
                                    propaganda_institucional: userx.dre.propaganda_institucional,
                                    propaganda_unitaria: userx.dre.propaganda_unitaria,
                                    depreciacao_de_maquinas: userx.dre.depreciacao_de_maquinas,
                                    encargos_financiamento: userx.dre.encargos_financiamento,
                                    salario_frota: userx.dre.salario_frota,
                                    manutencao_frota: userx.dre.manutencao_frota,
                                    depreciacao_de_veiculos: userx.dre.depreciacao_de_veiculos,
                                    frota_terceirizada: userx.dre.frota_terceirizada,
                                    despesas_operacionais_n_planejadas: userx.dre.despesas_operacionais_n_planejadas,
                                    pas: userx.dre.pas,
                                    pesquisas: userx.dre.pesquisas,
                                    tributos: userx.dre.tributos,
                                    servicos: [userx.dre.servicos[0], userx.dre.servicos[1], userx.dre.servicos[2], userx.dre.servicos[3]],
                                    preco_medio: userx.dre.preco_medio,
                                    atendimentos: userx.dre.atendimentos,
                                    insumos_em_estoque: userx.dre.insumos_em_estoque,
                                    distribuidores: userx.dre.distribuidores
        
                                }
                                userx.fluxo_de_caixa = {
                                    saldo_anterior: userx.fluxo_de_caixa.saldo_anterior,
                                    faturamento: userx.fluxo_de_caixa.faturamento,
                                    contas_a_receber: userx.fluxo_de_caixa.contas_a_receber,
                                    contas_a_receber_recebidas: userx.fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                                    custo_de_servico_prestado: userx.fluxo_de_caixa.custo_de_servico_prestado + qnt*30,
                                    emprestimos_contratados: userx.fluxo_de_caixa.emprestimos_contratados,
                                    emprestimos_pagos: userx.fluxo_de_caixa.emprestimos_pagos,
                                    veiculos_vendidos: userx.fluxo_de_caixa.veiculos_vendidos,
                                    depreciacao_de_veiculos: userx.fluxo_de_caixa.depreciacao_de_veiculos,
                                    depreciacao_de_maquinas: userx.fluxo_de_caixa.depreciacao_de_maquinas,
                                    veiculos_comprados: userx.fluxo_de_caixa.veiculos_comprados,
                                    tributos: userx.fluxo_de_caixa.tributos,
                                    promotores: userx.fluxo_de_caixa.promotores,
                                    propaganda: userx.fluxo_de_caixa.propaganda,
                                    pesquisas: userx.fluxo_de_caixa.pesquisas,
                                    pas: userx.fluxo_de_caixa.pas,
                                    uso_frota: userx.fluxo_de_caixa.uso_frota,
                                    despesas_operacionais_n_planejadas: userx.fluxo_de_caixa.despesas_operacionais_n_planejadas,
                                    despesas_administrativas: userx.fluxo_de_caixa.despesas_administrativas,
                                    encargos_financiamento: userx.fluxo_de_caixa.encargos_financiamento,
                                    maquinas: userx.fluxo_de_caixa.maquinas,
                                    distribuidores: userx.fluxo_de_caixa.distribuidores
                                }
                               
                            let insu_velho = Number(userx[velho][0]) - Number(qnt)
                            let array_dados_velho = [insu_velho,1,userx[velho][2], userx[velho][3], userx[velho][4], userx[velho][5], userx[velho][6], userx[velho][7]];
                            let insu_novo = Number(userx[novo][0]) + Number(qnt)
                            let array_dados_novo
                                if(userx[novo][4] == 0 && userx[novo][3] !== 0){
                                    array_dados_novo = [insu_novo,1,userx[novo][2], userx[novo][3], 1, userx[novo][5], userx[novo][6], userx[novo][7]]
                                }
                                else if(userx[novo][4] == 0 && userx[novo][3] == 0){
                                    array_dados_novo = [insu_novo,1,userx[novo][2], 800, 1, userx[novo][5], userx[novo][6], userx[novo][7]]
                                }
                                else if(userx[novo][4] !== 0 && userx[novo][3] == 0){
                                    array_dados_novo = [insu_novo,1,userx[novo][2], 800, userx[novo][4], userx[novo][5], userx[novo][6], userx[novo][7]]
                                }
                                else{
                                    array_dados_novo = [insu_novo,1,userx[novo][2], userx[novo][3], userx[novo][4], userx[novo][5], userx[novo][6], userx[novo][7]]
                                }
                            
                            userx.set(velho, array_dados_velho)
                            userx.set(novo, array_dados_novo)
                            userx.taokeys = userx.taokeys - qnt*30 - Math.abs(userx[novo][2] - userx[velho][2])*qnt 
                            console.log("14: " + users[i].taokeys)
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id, temporario: 1}))                 
                                .then((user) => {
                                    //console.log(userx[velho][0] + ' <----userx(Schema trabalhado aqui)')
                                    //console.log(user[velho][0] + ' <=====user(recem pesquisado)')
                                    if(user.taokeys == userx.taokeys){
                                    socket.emit('feedback', ['success', qnt + ' insumos transferidos do serviço: '+ velho +' com sucesso para o serviço: ' + novo])
                                    function propuni(tipo) {
                                        if(user.somapropuni.tipo1 == tipo){
                                            return user.somapropuni.inv1
                                        }
                                        else if(user.somapropuni.tipo2 == tipo){
                                            return user.somapropuni.inv2
                                        }
                                        else{return 0}
                                    }
                                    function insumosi(s) {
                                        if(s == user.last_change.serv1){
                                            return user.last_change.insu1i
                                        }
                                        else if(s == user.last_change.serv2){
                                            return user.last_change.insu2i
                                        }
                                        else{
                                            return 0
                                        }
                                    }
                                    socket.emit('update', [
                                                                        [...user["147"],"147",propuni("147"),insumosi("147")],
                                    [...user["148"],"148",propuni("148"),insumosi("148")],
                                    [...user["149"],"149",propuni("149"),insumosi("149")],
                                    [...user["157"],"157",propuni("157"),insumosi("157")],
                                    [...user["158"],"158",propuni("158"),insumosi("158")],
                                    [...user["159"],"159",propuni("159"),insumosi("159")],
                                    [...user["257"],"257",propuni("257"),insumosi("257")],
                                    [...user["258"],"258",propuni("258"),insumosi("258")],
                                    [...user["259"],"259",propuni("259"),insumosi("259")],
                                    [...user["267"],"267",propuni("267"),insumosi("267")],
                                    [...user["268"],"268",propuni("268"),insumosi("268")],
                                    [...user["269"],"269",propuni("269"),insumosi("269")],
                                    [...user["347"],"347",propuni("347"),insumosi("347")],
                                    [...user["348"],"348",propuni("348"),insumosi("348")],
                                    [...user["349"],"349",propuni("349"),insumosi("349")],
                                    [...user["357"],"357",propuni("357"),insumosi("357")],
                                    [...user["358"],"358",propuni("358"),insumosi("358")],
                                    [...user["359"],"359",propuni("359"),insumosi("359")],
                                    [...user["367"],"367",propuni("367"),insumosi("367")],
                                    [...user["368"],"368",propuni("368"),insumosi("368")],
                                    [...user["369"],"369",propuni("369"),insumosi("369")],                                    user["taokeys"],
                                    user["frota"],
                                    user["promotores"],
                                    user["comissao"],
                                    user["distribuidores"],
                                    user["pas"],
                                    user["propaganda"],
                                    user["propagandauni"],
                                    (user["divida"][0]+user["divida"][1]+user["divida"][2]),
                                    user["turno"]]);
            
                                        }                  
                                    })
                                .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})

                            }
                        }
                        else{
                            socket.emit('feedback', ['warning','Não é possível realizar essa transferencia enquanto a ordem de compra de ' + velho +' for maior que zero'])   
                        }
                    }
                    else{socket.emit('feedback', ['warning','voce nao pode transferir insumos para um servico que nao esta ativo'])}
                    }
                    else{
                        if(false){
                            socket.emit('feedback', ['warning','Falta caixa']) 
                        }
                        else{
                            socket.emit('feedback', ['warning', 'Sua cooperativa não possue essa quantidade de insumos em estoque desse serviço.'])
                        }
                    }
                
                
                }
                else{socket.emit('feedback', ['warning','voce nao pode trocar insumos de um serviço para ele mesmo'])}
                }
                else{
                    socket.emit('feedback', ['danger','É necessário estar logado para puxar os dados da simulação'])
                }
            
            })
        }
        else{
            socket.emit('feedback', ['danger', 'apenas numeros positivos sao aceitos nesse campo'])
        }
    }
    else{
        socket.emit('feedback',['warning','Valor Inválido'])
    }
    }) 
    socket.on('substituir-servico', (dados) => {
        let velho = dados[0];
        let novo = dados[1];
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                    if(userx[velho][1] == 1 && userx[novo][1] !== 3){
                    if(userx[novo][1] !== 1){
                    if(true){
                        if(userx[novo][2] - userx[velho][2] > 0 && userx['taokeys'] >= userx[velho][0]*30 + userx[velho][0]*(userx[novo][2] - userx[velho][2])){

                            let datetime = new Date().toLocaleString('pt-BR').toLocaleString('pt-BR');
                            userx.deci.push({data: datetime, acao: 'Substituição do serviço ' + velho + ' pelo ' + novo, autor: userx.modificador})
                        if(userx.last_change.serv1 == velho){
                            //userx.last_change.serv1 = novo
                            userx.last_change = {
                                serv1: novo,
                                serv2: userx.last_change.serv2,
                                insu1: userx.last_change.insu1,
                                insu2: userx.last_change.insu2,
                                insu1i: userx.last_change.insu1i,
                                insu2i: userx.last_change.insu2i,
                                prop1: userx.last_change.prop1,
                                prop2: userx.last_change.prop2
                            }
                            //userx.last_change.insu1 = Number(userx[velho][0])
                        }
                        if(userx.last_change.serv2 == velho){
                            //userx.last_change.serv2 = novo
                            userx.last_change = {
                                serv1: userx.last_change.serv1,
                                serv2: novo,
                                insu1: userx.last_change.insu1,
                                insu2: userx.last_change.insu2,
                                insu1i: userx.last_change.insu1i,
                                insu2i: userx.last_change.insu2i,
                                prop1: userx.last_change.prop1,
                                prop2: userx.last_change.prop2
                            }
                            //userx.last_change.insu2 = Number(userx[velho][0])
                        }
                        if(userx.somapropuni.tipo1 == velho){
                            userx.somapropuni = {tipo1: novo, inv1: userx.somapropuni.inv1, tipo2: userx.somapropuni.tipo2, inv2: userx.somapropuni.inv2}
                        }
                        if(userx.somapropuni.tipo2 == velho){
                            userx.somapropuni = {tipo1: userx.somapropuni.tipo1, inv1: userx.somapropuni.inv1, tipo2: novo, inv2: userx.somapropuni.inv2}
                        }
                        userx.balanco_patrimonial = {
                            caixa: userx.balanco_patrimonial.caixa - userx[velho][0]*30 - (userx[novo][2] - userx[velho][2])*userx[velho][0],
                            estoque: userx.balanco_patrimonial.estoque + (userx[novo][2] - userx[velho][2])*userx[velho][0],
                            contas_a_receber60: userx.balanco_patrimonial.contas_a_receber60,
                            contas_a_receber120: userx.balanco_patrimonial.contas_a_receber120,
                            maquinas: userx.balanco_patrimonial.maquinas,
                            depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_maquinas,
                            veiculos: userx.balanco_patrimonial.veiculos,
                            depreciacao_veiculos: userx.balanco_patrimonial.depreciacao_veiculos,
                            tributos_a_pagar_anterior: userx.balanco_patrimonial.tributos_a_pagar_anterior,
                            tributos_a_pagar_atual: userx.balanco_patrimonial.tributos_a_pagar_atual,
                            emprestimos: userx.balanco_patrimonial.emprestimos,
                            capial: userx.balanco_patrimonial.capial,
                            lucros_acumulados: userx.balanco_patrimonial.lucros_acumulados - userx[velho][0]*30
                        }
                        userx.dre = {
                            receita: userx.dre.receita,
                            csp: userx.dre.csp,
                            estoque_inicial: userx.dre.estoque_inicial,
                            custo_prestacao_servico: userx.dre.custo_prestacao_servico,
                            custo_estocagem: userx.dre.custo_estocagem,
                            custo_troca_insumos: userx.dre.custo_troca_insumos + userx[velho][0]*30 + (userx[novo][2] - userx[velho][2])*userx[velho][0],
                            hora_extra: userx.dre.hora_extra,
                            capacidade_n_utilizada: userx.dre.capacidade_n_utilizada,
                            margem_bruta: userx.dre.margem_bruta,
                            despesas_administrativas: userx.dre.despesas_administrativas,
                            salario_promotores: userx.dre.salario_promotores,
                            comissao: userx.dre.comissao,
                            propaganda_institucional: userx.dre.propaganda_institucional,
                            propaganda_unitaria: userx.dre.propaganda_unitaria,
                            depreciacao_de_maquinas: userx.dre.depreciacao_de_maquinas,
                            encargos_financiamento: userx.dre.encargos_financiamento,
                            salario_frota: userx.dre.salario_frota,
                            manutencao_frota: userx.dre.manutencao_frota,
                            depreciacao_de_veiculos: userx.dre.depreciacao_de_veiculos,
                            frota_terceirizada: userx.dre.frota_terceirizada,
                            despesas_operacionais_n_planejadas: userx.dre.despesas_operacionais_n_planejadas,
                            pas: userx.dre.pas,
                            pesquisas: userx.dre.pesquisas,
                            tributos: userx.dre.tributos,
                            servicos: [userx.dre.servicos[0], userx.dre.servicos[1], userx.dre.servicos[2], userx.dre.servicos[3]],
                            preco_medio: userx.dre.preco_medio,
                            atendimentos: userx.dre.atendimentos,
                            insumos_em_estoque: userx.dre.insumos_em_estoque,
                            distribuidores: userx.dre.distribuidores

                        }
                        userx.fluxo_de_caixa = {
                            saldo_anterior: userx.fluxo_de_caixa.saldo_anterior,
                            faturamento: userx.fluxo_de_caixa.faturamento,
                            contas_a_receber: userx.fluxo_de_caixa.contas_a_receber,
                            contas_a_receber_recebidas: userx.fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                            custo_de_servico_prestado: userx.fluxo_de_caixa.custo_de_servico_prestado + userx[velho][0]*30 + (userx[novo][2] - userx[velho][2])*userx[velho][0],
                            emprestimos_contratados: userx.fluxo_de_caixa.emprestimos_contratados,
                            emprestimos_pagos: userx.fluxo_de_caixa.emprestimos_pagos,
                            veiculos_vendidos: userx.fluxo_de_caixa.veiculos_vendidos,
                            depreciacao_de_veiculos: userx.fluxo_de_caixa.depreciacao_de_veiculos,
                            depreciacao_de_maquinas: userx.fluxo_de_caixa.depreciacao_de_maquinas,
                            veiculos_comprados: userx.fluxo_de_caixa.veiculos_comprados,
                            tributos: userx.fluxo_de_caixa.tributos,
                            promotores: userx.fluxo_de_caixa.promotores,
                            propaganda: userx.fluxo_de_caixa.propaganda,
                            pesquisas: userx.fluxo_de_caixa.pesquisas,
                            pas: userx.fluxo_de_caixa.pas,
                            uso_frota: userx.fluxo_de_caixa.uso_frota,
                            despesas_operacionais_n_planejadas: userx.fluxo_de_caixa.despesas_operacionais_n_planejadas,
                            despesas_administrativas: userx.fluxo_de_caixa.despesas_administrativas,
                            encargos_financiamento: userx.fluxo_de_caixa.encargos_financiamento,
                            maquinas: userx.fluxo_de_caixa.maquinas,
                            distribuidores: userx.fluxo_de_caixa.distribuidores
                        }
                        let array_dados_velho = [0,2,userx[velho][2], userx[velho][3], userx[velho][4], userx[velho][5], userx[velho][6], userx[velho][7]];
                        let insu_novo = Math.floor(Number(userx[novo][0]) + Number(userx[velho][0]))
                        let array_dados_novo
                            if(userx[novo][4] == 0 && userx[novo][3] !== 0){
                                array_dados_novo = [insu_novo,1,userx[novo][2], userx[novo][3], 1, userx[novo][5], userx[novo][6], userx[novo][7]]
                            }
                            else if(userx[novo][4] == 0 && userx[novo][3] == 0){
                                array_dados_novo = [insu_novo,1,userx[novo][2], 800, 1, userx[novo][5], userx[novo][6], userx[novo][7]]
                            }
                            else if(userx[novo][4] !== 0 && userx[novo][3] == 0){
                                array_dados_novo = [insu_novo,1,userx[novo][2], 800, userx[novo][4], userx[novo][5], userx[novo][6], userx[novo][7]]
                            }
                            else{
                                array_dados_novo = [insu_novo,1,userx[novo][2], userx[novo][3], userx[novo][4], userx[novo][5], userx[novo][6], userx[novo][7]]
                            }
                        userx.taokeys = userx.taokeys - userx[velho][0]*30 - Math.abs(userx[novo][2] - userx[velho][2])*userx[velho][0]
                        console.log("16: " + users[i].taokeys)
                        userx.set(velho, array_dados_velho)
                        userx.set(novo, array_dados_novo)
                        //userx.taokeys = userx.taokeys - userx[velho][0]*30
                        userx.save()
                            .then(() => Aluno.findOne({ _id: userx._id, temporario: 1}))                 
                            .then((user) => {
                                //console.log(userx[velho][0] + ' <----userx(Schema trabalhado aqui)')
                                //console.log(user[velho][0] + ' <=====user(recem pesquisado)')
                                if(user.taokeys == userx.taokeys){
                                    socket.emit('feedback', ['success','voce substituiu o serviço '+ velho +' pelo: '+ novo +' com sucesso'])
                                    function propuni(tipo) {
                                        if(user.somapropuni.tipo1 == tipo){
                                            return user.somapropuni.inv1
                                        }
                                        else if(user.somapropuni.tipo2 == tipo){
                                            return user.somapropuni.inv2
                                        }
                                        else{return 0}
                                    }
                                    function insumosi(s) {
                                        if(s == user.last_change.serv1){
                                            return user.last_change.insu1i
                                        }
                                        else if(s == user.last_change.serv2){
                                            return user.last_change.insu2i
                                        }
                                        else{
                                            return 0
                                        }
                                    }
                                    socket.emit('update', [
                                                                        [...user["147"],"147",propuni("147"),insumosi("147")],
                                    [...user["148"],"148",propuni("148"),insumosi("148")],
                                    [...user["149"],"149",propuni("149"),insumosi("149")],
                                    [...user["157"],"157",propuni("157"),insumosi("157")],
                                    [...user["158"],"158",propuni("158"),insumosi("158")],
                                    [...user["159"],"159",propuni("159"),insumosi("159")],
                                    [...user["257"],"257",propuni("257"),insumosi("257")],
                                    [...user["258"],"258",propuni("258"),insumosi("258")],
                                    [...user["259"],"259",propuni("259"),insumosi("259")],
                                    [...user["267"],"267",propuni("267"),insumosi("267")],
                                    [...user["268"],"268",propuni("268"),insumosi("268")],
                                    [...user["269"],"269",propuni("269"),insumosi("269")],
                                    [...user["347"],"347",propuni("347"),insumosi("347")],
                                    [...user["348"],"348",propuni("348"),insumosi("348")],
                                    [...user["349"],"349",propuni("349"),insumosi("349")],
                                    [...user["357"],"357",propuni("357"),insumosi("357")],
                                    [...user["358"],"358",propuni("358"),insumosi("358")],
                                    [...user["359"],"359",propuni("359"),insumosi("359")],
                                    [...user["367"],"367",propuni("367"),insumosi("367")],
                                    [...user["368"],"368",propuni("368"),insumosi("368")],
                                    [...user["369"],"369",propuni("369"),insumosi("369")],                                    user["taokeys"],
                                    user["frota"],
                                    user["promotores"],
                                    user["comissao"],
                                    user["distribuidores"],
                                    user["pas"],
                                    user["propaganda"],
                                    user["propagandauni"],
                                    (user["divida"][0]+user["divida"][1]+user["divida"][2]),
                                    user["turno"]]);
        
                                    }                  
                                })
                            .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})
                    }
                    else{
                        let datetime = new Date().toLocaleString('pt-BR').toLocaleString('pt-BR');
                        userx.deci.push({data: datetime, acao: 'Substituição do serviço ' + velho + ' pelo ' + novo, autor: userx.modificador})
                        
                        if(userx.last_change.serv1 == velho){
                            //userx.last_change.serv1 = novo
                            userx.last_change = {
                                serv1: novo,
                                serv2: userx.last_change.serv2,
                                insu1: userx.last_change.insu1,
                                insu2: userx.last_change.insu2,
                                insu1i: userx.last_change.insu1i,
                                insu2i: userx.last_change.insu2i,
                                prop1: userx.last_change.prop1,
                                prop2: userx.last_change.prop2
                            }
                            //userx.last_change.insu1 = Number(userx[velho][0])
                        }
                        if(userx.last_change.serv2 == velho){
                            //userx.last_change.serv2 = novo
                            userx.last_change = {
                                serv1: userx.last_change.serv1,
                                serv2: novo,
                                insu1: userx.last_change.insu1,
                                insu2: userx.last_change.insu2,
                                insu1i: userx.last_change.insu1i,
                                insu2i: userx.last_change.insu2i,
                                prop1: userx.last_change.prop1,
                                prop2: userx.last_change.prop2
                            }
                            //userx.last_change.insu2 = Number(userx[velho][0])
                        }

                        userx.balanco_patrimonial = {
                            caixa: userx.balanco_patrimonial.caixa - userx[velho][0]*30,
                            estoque: userx.balanco_patrimonial.estoque + (userx[novo][2] - userx[velho][2])*userx[velho][0],
                            contas_a_receber60: userx.balanco_patrimonial.contas_a_receber60,
                            contas_a_receber120: userx.balanco_patrimonial.contas_a_receber120,
                            maquinas: userx.balanco_patrimonial.maquinas,
                            depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_maquinas,
                            veiculos: userx.balanco_patrimonial.veiculos,
                            depreciacao_veiculos: userx.balanco_patrimonial.depreciacao_veiculos,
                            tributos_a_pagar_anterior: userx.balanco_patrimonial.tributos_a_pagar_anterior,
                            tributos_a_pagar_atual: userx.balanco_patrimonial.tributos_a_pagar_atual,
                            emprestimos: userx.balanco_patrimonial.emprestimos,
                            capial: userx.balanco_patrimonial.capial,
                            lucros_acumulados: userx.balanco_patrimonial.lucros_acumulados - userx[velho][0]*30 + (userx[novo][2] - userx[velho][2])*userx[velho][0]
                        }
                        userx.dre = {
                            receita: userx.dre.receita,
                            csp: userx.dre.csp,
                            estoque_inicial: userx.dre.estoque_inicial,
                            custo_prestacao_servico: userx.dre.custo_prestacao_servico,
                            custo_estocagem: userx.dre.custo_estocagem,
                            custo_troca_insumos: userx.dre.custo_troca_insumos + userx[velho][0]*30,
                            hora_extra: userx.dre.hora_extra,
                            capacidade_n_utilizada: userx.dre.capacidade_n_utilizada,
                            margem_bruta: userx.dre.margem_bruta,
                            despesas_administrativas: userx.dre.despesas_administrativas,
                            salario_promotores: userx.dre.salario_promotores,
                            comissao: userx.dre.comissao,
                            propaganda_institucional: userx.dre.propaganda_institucional,
                            propaganda_unitaria: userx.dre.propaganda_unitaria,
                            depreciacao_de_maquinas: userx.dre.depreciacao_de_maquinas,
                            encargos_financiamento: userx.dre.encargos_financiamento,
                            salario_frota: userx.dre.salario_frota,
                            manutencao_frota: userx.dre.manutencao_frota,
                            depreciacao_de_veiculos: userx.dre.depreciacao_de_veiculos,
                            frota_terceirizada: userx.dre.frota_terceirizada,
                            despesas_operacionais_n_planejadas: userx.dre.despesas_operacionais_n_planejadas,
                            pas: userx.dre.pas,
                            pesquisas: userx.dre.pesquisas,
                            tributos: userx.dre.tributos,
                            servicos: [userx.dre.servicos[0], userx.dre.servicos[1], userx.dre.servicos[2], userx.dre.servicos[3]],
                            preco_medio: userx.dre.preco_medio,
                            atendimentos: userx.dre.atendimentos,
                            insumos_em_estoque: userx.dre.insumos_em_estoque,
                            distribuidores: userx.dre.distribuidores

                        }
                        userx.fluxo_de_caixa = {
                            saldo_anterior: userx.fluxo_de_caixa.saldo_anterior,
                            faturamento: userx.fluxo_de_caixa.faturamento,
                            contas_a_receber: userx.fluxo_de_caixa.contas_a_receber,
                            contas_a_receber_recebidas: userx.fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                            custo_de_servico_prestado: userx.fluxo_de_caixa.custo_de_servico_prestado + userx[velho][0]*30,
                            emprestimos_contratados: userx.fluxo_de_caixa.emprestimos_contratados,
                            emprestimos_pagos: userx.fluxo_de_caixa.emprestimos_pagos,
                            veiculos_vendidos: userx.fluxo_de_caixa.veiculos_vendidos,
                            depreciacao_de_veiculos: userx.fluxo_de_caixa.depreciacao_de_veiculos,
                            depreciacao_de_maquinas: userx.fluxo_de_caixa.depreciacao_de_maquinas,
                            veiculos_comprados: userx.fluxo_de_caixa.veiculos_comprados,
                            tributos: userx.fluxo_de_caixa.tributos,
                            promotores: userx.fluxo_de_caixa.promotores,
                            propaganda: userx.fluxo_de_caixa.propaganda,
                            pesquisas: userx.fluxo_de_caixa.pesquisas,
                            pas: userx.fluxo_de_caixa.pas,
                            uso_frota: userx.fluxo_de_caixa.uso_frota,
                            despesas_operacionais_n_planejadas: userx.fluxo_de_caixa.despesas_operacionais_n_planejadas,
                            despesas_administrativas: userx.fluxo_de_caixa.despesas_administrativas,
                            encargos_financiamento: userx.fluxo_de_caixa.encargos_financiamento,
                            maquinas: userx.fluxo_de_caixa.maquinas,
                            distribuidores: userx.fluxo_de_caixa.distribuidores
                        }
                        
                        let array_dados_velho = [0,2,userx[velho][2], userx[velho][3], userx[velho][4], userx[velho][5], userx[velho][6], userx[velho][7]];
                        let insu_novo = Number(userx[novo][0]) + Number(userx[velho][0])
                        let array_dados_novo
                            if(userx[novo][4] == 0 && userx[novo][3] !== 0){
                                array_dados_novo = [insu_novo,1,userx[novo][2], userx[novo][3], 1, userx[novo][5], userx[novo][6], userx[novo][7]]
                            }
                            else if(userx[novo][4] == 0 && userx[novo][3] == 0){
                                array_dados_novo = [insu_novo,1,userx[novo][2], 800, 1, userx[novo][5], userx[novo][6], userx[novo][7]]
                            }
                            else if(userx[novo][4] !== 0 && userx[novo][3] == 0){
                                array_dados_novo = [insu_novo,1,userx[novo][2], 800, userx[novo][4], userx[novo][5], userx[novo][6], userx[novo][7]]
                            }
                            else{
                                array_dados_novo = [insu_novo,1,userx[novo][2], userx[novo][3], userx[novo][4], userx[novo][5], userx[novo][6], userx[novo][7]]
                            }
                        userx.taokeys = userx.taokeys - userx[velho][0]*30 - Math.abs(userx[novo][2] - userx[velho][2])*userx[velho][0]
                        userx.set(velho, array_dados_velho)
                        userx.set(novo, array_dados_novo)
                        //userx.taokeys = userx.taokeys - userx[velho][0]*30
                        userx.save()
                            .then(() => Aluno.findOne({ _id: userx._id, temporario: 1}))                 
                            .then((user) => {
                                //console.log(userx[velho][0] + ' <----userx(Schema trabalhado aqui)')
                                //console.log(user[velho][0] + ' <=====user(recem pesquisado)')
                                if(user.taokeys == userx.taokeys){
                                    function propuni(tipo) {
                                        if(user.somapropuni.tipo1 == tipo){
                                            return user.somapropuni.inv1
                                        }
                                        else if(user.somapropuni.tipo2 == tipo){
                                            return user.somapropuni.inv2
                                        }
                                        else{return 0}
                                    }
                                    function insumosi(s) {
                                        if(s == user.last_change.serv1){
                                            return user.last_change.insu1i
                                        }
                                        else if(s == user.last_change.serv2){
                                            return user.last_change.insu2i
                                        }
                                        else{
                                            return 0
                                        }
                                    }
                                    socket.emit('update', [
                                                                        [...user["147"],"147",propuni("147"),insumosi("147")],
                                    [...user["148"],"148",propuni("148"),insumosi("148")],
                                    [...user["149"],"149",propuni("149"),insumosi("149")],
                                    [...user["157"],"157",propuni("157"),insumosi("157")],
                                    [...user["158"],"158",propuni("158"),insumosi("158")],
                                    [...user["159"],"159",propuni("159"),insumosi("159")],
                                    [...user["257"],"257",propuni("257"),insumosi("257")],
                                    [...user["258"],"258",propuni("258"),insumosi("258")],
                                    [...user["259"],"259",propuni("259"),insumosi("259")],
                                    [...user["267"],"267",propuni("267"),insumosi("267")],
                                    [...user["268"],"268",propuni("268"),insumosi("268")],
                                    [...user["269"],"269",propuni("269"),insumosi("269")],
                                    [...user["347"],"347",propuni("347"),insumosi("347")],
                                    [...user["348"],"348",propuni("348"),insumosi("348")],
                                    [...user["349"],"349",propuni("349"),insumosi("349")],
                                    [...user["357"],"357",propuni("357"),insumosi("357")],
                                    [...user["358"],"358",propuni("358"),insumosi("358")],
                                    [...user["359"],"359",propuni("359"),insumosi("359")],
                                    [...user["367"],"367",propuni("367"),insumosi("367")],
                                    [...user["368"],"368",propuni("368"),insumosi("368")],
                                    [...user["369"],"369",propuni("369"),insumosi("369")],                                    user["taokeys"],
                                    user["frota"],
                                    user["promotores"],
                                    user["comissao"],
                                    user["distribuidores"],
                                    user["pas"],
                                    user["propaganda"],
                                    user["propagandauni"],
                                    (user["divida"][0]+user["divida"][1]+user["divida"][2]),
                                    user["turno"]]);
        
                                    }                  
                                })
                            .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})
                    }

                    if(userx[novo][2] - userx[velho][2] > 0 && userx['taokeys'] < userx[velho][0]*30 + userx[velho][0]*(userx[novo][2] - userx[velho][2])){
                        socket.emit('feedback', ['warning', 'falta caixa para realizar essa operacao'])
                    }
                    }
                }
                else{
                    socket.emit('feedback', ['warning','voce nao pode substituir um serviço por outro que ja esta ativado'])
                }
                }
                else{
                    if(userx[velho][1] == 1){
                        socket.emit('feedback', ['warning','voce nao pode substituir um serviço por outro que foi cancelado no turno anterior, espere o proximo turno para reativa-lo'])
                    }
                    else{
                        socket.emit('feedback', ['warning','voce nao pode substituir um serviço que nao esta ativo por outro'])
                    }
                }
                }
                else{
                    socket.emit('feedback', ['danger','É necessário estar logado para puxar os dados da simulação'])
                }
            
            })
    })
    socket.on('encerrar-servico', (tipo) => {
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                    if(userx[tipo][0] == 0 && userx[tipo][1] == 1){
                        let b = 0;
                        for(let i = 0; i < 21; i++){
                            if(userx[index[i]][1] !== 1){
                                b = b + 1 //passivel de otimizacao
                            }   
                        }
                        if(b == 20){
                            socket.emit('feedback', ['warning','voce precisa sempre ter pelo menos um servico ativo durante o turno (ative outro para desativar esse)'])
                        }
                        else{
                            let datetime = new Date().toLocaleString('pt-BR').toLocaleString('pt-BR');
                            userx.deci.push({data: datetime, acao: 'Encerrou o serviço ' + tipo, autor: userx.modificador})
                            if(userx.last_change.serv1 == tipo){
                                //userx.last_change.serv1 = 0
                                userx.last_change = {
                                    serv1: 0,
                                    serv2: userx.last_change.serv2,
                                    insu1: userx.last_change.insu1,
                                    insu2: userx.last_change.insu2,
                                    insu1i: userx.last_change.insu1i,
                                    insu2i: userx.last_change.insu2i,
                                    prop1: userx.last_change.prop1,
                                    prop2: userx.last_change.prop2
                                }
                                //userx.last_change.insu1 = Number(userx[velho][0])
                            }
                            if(userx.last_change.serv2 == tipo){
                                //userx.last_change.serv2 = 0
                                userx.last_change = {
                                    serv1: userx.last_change.serv1,
                                    serv2: 0,
                                    insu1: userx.last_change.insu1,
                                    insu2: userx.last_change.insu2,
                                    insu1i: userx.last_change.insu1i,
                                    insu2i: userx.last_change.insu2i,
                                    prop1: userx.last_change.prop1,
                                    prop2: userx.last_change.prop2
                                }
                                //userx.last_change.insu2 = Number(userx[velho][0])
                            }
                        let array_dados = [0, 2, userx[tipo][2], userx[tipo][3], userx[tipo][4], userx[tipo][5], userx[tipo][6], userx[tipo][7]]
                        userx.set(tipo, array_dados) 
                        userx.save()
                            .then(() => Aluno.findOne({ _id: userx._id, temporario: 1}))                 
                            .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        socket.emit('feedback', ['success', tipo + ' encerrado com sucesso e ficara indisponivel durante o proximo turno'])
                                        function propuni(tipo) {
                                            if(user.somapropuni.tipo1 == tipo){
                                                return user.somapropuni.inv1
                                            }
                                            else if(user.somapropuni.tipo2 == tipo){
                                                return user.somapropuni.inv2
                                            }
                                            else{return 0}
                                        }
                                        function insumosi(s) {
                                            if(s == user.last_change.serv1){
                                                return user.last_change.insu1i
                                            }
                                            else if(s == user.last_change.serv2){
                                                return user.last_change.insu2i
                                            }
                                            else{
                                                return 0
                                            }
                                        }
                                        socket.emit('update', [
                                                                        [...user["147"],"147",propuni("147"),insumosi("147")],
                                    [...user["148"],"148",propuni("148"),insumosi("148")],
                                    [...user["149"],"149",propuni("149"),insumosi("149")],
                                    [...user["157"],"157",propuni("157"),insumosi("157")],
                                    [...user["158"],"158",propuni("158"),insumosi("158")],
                                    [...user["159"],"159",propuni("159"),insumosi("159")],
                                    [...user["257"],"257",propuni("257"),insumosi("257")],
                                    [...user["258"],"258",propuni("258"),insumosi("258")],
                                    [...user["259"],"259",propuni("259"),insumosi("259")],
                                    [...user["267"],"267",propuni("267"),insumosi("267")],
                                    [...user["268"],"268",propuni("268"),insumosi("268")],
                                    [...user["269"],"269",propuni("269"),insumosi("269")],
                                    [...user["347"],"347",propuni("347"),insumosi("347")],
                                    [...user["348"],"348",propuni("348"),insumosi("348")],
                                    [...user["349"],"349",propuni("349"),insumosi("349")],
                                    [...user["357"],"357",propuni("357"),insumosi("357")],
                                    [...user["358"],"358",propuni("358"),insumosi("358")],
                                    [...user["359"],"359",propuni("359"),insumosi("359")],
                                    [...user["367"],"367",propuni("367"),insumosi("367")],
                                    [...user["368"],"368",propuni("368"),insumosi("368")],
                                    [...user["369"],"369",propuni("369"),insumosi("369")],                                    user["taokeys"],
                                    user["frota"],
                                    user["promotores"],
                                    user["comissao"],
                                    user["distribuidores"],
                                    user["pas"],
                                    user["propaganda"],
                                    user["propagandauni"],
                                    (user["divida"][0]+user["divida"][1]+user["divida"][2]),
                                    user["turno"]]);
        
                                    }                  
                                })
                        .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})
                            }
                    }
                    else if(userx[tipo][0] == 0 && userx[tipo][1] == 2){
                        socket.emit('feedback', ['warning','servico ja esta em processo de cancelamento'])
                    }
                    else if(userx[tipo][0] == 0 && userx[tipo][1] == 0){
                        socket.emit('feedback', ['warning','esse servico ja esta inativo'])
                    }
                    else if(userx[tipo][0] == 0 && userx[tipo][1] == 3){
                        socket.emit('feedback', ['warning','esse servico ja esta fechado'])
                    }
                    else{
                        socket.emit('feedback', ['warning', 'voce nao pode ter insumos de um servico para encerra-lo'])
                    }
                }
                else{
                    socket.emit('feedback', ['danger','É necessário estar logado para puxar os dados da simulação'])
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    }) 
    socket.on('alterar-volume', (dados) => {
        let tipo = dados[0];
        let volume = Number(dados[1]);
        //let ttt;
      
        if(volume && Number.isInteger(volume)){ 
        
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                //ttt = userx;
                if(userx !== null){
                    if(userx[tipo][1] == 1){
                        if(volume > 0){
                            let datetime = new Date().toLocaleString('pt-BR').toLocaleString('pt-BR');
                            userx.deci.push({data: datetime, acao: 'Alteração do volume planejado do serviço '+ tipo +' para ' +volume, autor: userx.modificador})
                        
                            let array_dados = [userx[tipo][0], userx[tipo][1], userx[tipo][2], userx[tipo][3], volume, userx[tipo][5], userx[tipo][6], userx[tipo][7]]
                            userx.set(tipo, array_dados) 
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id, temporario: 1}))                 
                                .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        socket.emit('feedback', ['success', 'volume de vendas planejado do serviço: ' + tipo + ' alterado para ' + volume + ' com sucesso'])
                                        function propuni(tipo) {
                                            if(user.somapropuni.tipo1 == tipo){
                                                return user.somapropuni.inv1
                                            }
                                            else if(user.somapropuni.tipo2 == tipo){
                                                return user.somapropuni.inv2
                                            }
                                            else{return 0}
                                        }
                                        function insumosi(s) {
                                            if(s == user.last_change.serv1){
                                                return user.last_change.insu1i
                                            }
                                            else if(s == user.last_change.serv2){
                                                return user.last_change.insu2i
                                            }
                                            else{
                                                return 0
                                            }
                                        }
                                        socket.emit('update', [
                                                                        [...user["147"],"147",propuni("147"),insumosi("147")],
                                    [...user["148"],"148",propuni("148"),insumosi("148")],
                                    [...user["149"],"149",propuni("149"),insumosi("149")],
                                    [...user["157"],"157",propuni("157"),insumosi("157")],
                                    [...user["158"],"158",propuni("158"),insumosi("158")],
                                    [...user["159"],"159",propuni("159"),insumosi("159")],
                                    [...user["257"],"257",propuni("257"),insumosi("257")],
                                    [...user["258"],"258",propuni("258"),insumosi("258")],
                                    [...user["259"],"259",propuni("259"),insumosi("259")],
                                    [...user["267"],"267",propuni("267"),insumosi("267")],
                                    [...user["268"],"268",propuni("268"),insumosi("268")],
                                    [...user["269"],"269",propuni("269"),insumosi("269")],
                                    [...user["347"],"347",propuni("347"),insumosi("347")],
                                    [...user["348"],"348",propuni("348"),insumosi("348")],
                                    [...user["349"],"349",propuni("349"),insumosi("349")],
                                    [...user["357"],"357",propuni("357"),insumosi("357")],
                                    [...user["358"],"358",propuni("358"),insumosi("358")],
                                    [...user["359"],"359",propuni("359"),insumosi("359")],
                                    [...user["367"],"367",propuni("367"),insumosi("367")],
                                    [...user["368"],"368",propuni("368"),insumosi("368")],
                                    [...user["369"],"369",propuni("369"),insumosi("369")],                                    user["taokeys"],
                                    user["frota"],
                                    user["promotores"],
                                    user["comissao"],
                                    user["distribuidores"],
                                    user["pas"],
                                    user["propaganda"],
                                    user["propagandauni"],
                                    (user["divida"][0]+user["divida"][1]+user["divida"][2]),
                                    user["turno"]]);
        
                                    }                  
                                })
                        .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})
                          
                    }
                    else{socket.emit('feedback', ['warning','o volume de vendas so aceita valores positivos'])}
                    
                
                }
                else{socket.emit('feedback', ['warning','voce nao pode alterar o preco de venda enquanto o servico estiver em processo de encerramento'])}
            }
                else{
                    socket.emit('feedback', ['danger', 'voce precisa estar logado para puxar o state atual da simulação'])
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})     
        }
        else{
            socket.emit('feedback',['warning','Valor Inválido'])
        }
    }) 
    socket.on('salvar', () => {
        //console.log('inicio-salvamento'
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((usert) => {
                if(usert !== null){
                Data.findOne({instancia: usert.instancia})
                    .then((check) => {
                        if(check.ativo == 1){
                Aluno.findOne({cooperativa: usert.cooperativa, instancia: usert.instancia, temporario: 0})
                    .then((userdef) => {
                        userdef.last_change = {serv1: usert.last_change.serv1, serv2: usert.last_change.serv2, insu1: usert.last_change.insu1, insu2: usert.last_change.insu2, insu2i: usert.last_change.insu2i, insu1i: usert.last_change.insu1i, prop1: usert.last_change.prop1, prop2: usert.last_change.prop2}
                        userdef.deci = usert.deci
                        userdef.set('npesquisas', usert.npesquisas)
                        userdef.set('turno', usert.turno)
                        userdef.set('propaganda', usert.propaganda)
                        userdef.set('propagandauni', usert.propagandauni)
                        userdef.set('taokeys', usert.taokeys)
                        userdef.set('comissao', usert.comissao)
                        //console.log('PASt: ' + usert.pas)
                        userdef.set('pas', usert.pas)
                        userdef.set('pas1', usert.pas1)
                        userdef.set('pas2', usert.pas2)
                        userdef.set('distribuidores', usert.distribuidores)
                        userdef.set('promotores', usert.promotores)
                        userdef.set('divida', [usert["divida"][0],usert["divida"][1],usert["divida"][2]])
                        userdef.set('frota', [usert.frota[0],usert.frota[1],usert.frota[2],usert.frota[3],usert.frota[4],usert.frota[5],usert.frota[6],usert.frota[7],usert.frota[8],usert.frota[9],usert.frota[10],usert.frota[11]])
                        //console.log(index)
                        userdef.balanco_patrimonial = {
                            caixa: usert.balanco_patrimonial.caixa,
                            estoque: usert.balanco_patrimonial.estoque,
                            contas_a_receber60: usert.balanco_patrimonial.contas_a_receber60,
                            contas_a_receber120: usert.balanco_patrimonial.contas_a_receber120,
                            maquinas: usert.balanco_patrimonial.maquinas,
                            depreciacao_maquinas: usert.balanco_patrimonial.depreciacao_maquinas,
                            veiculos: usert.balanco_patrimonial.veiculos,
                            depreciacao_veiculos: usert.balanco_patrimonial.depreciacao_veiculos,
                            tributos_a_pagar_anterior: usert.balanco_patrimonial.tributos_a_pagar_anterior,
                            tributos_a_pagar_atual: usert.balanco_patrimonial.tributos_a_pagar_atual,
                            emprestimos: usert.balanco_patrimonial.emprestimos,
                            capial: usert.balanco_patrimonial.capial,
                            lucros_acumulados: usert.balanco_patrimonial.lucros_acumulados
                        }
                        userdef.dre = {
                            receita: usert.dre.receita,
                            csp: usert.dre.csp,
                            estoque_inicial: usert.dre.estoque_inicial,
                            custo_prestacao_servico: usert.dre.custo_prestacao_servico,
                            custo_estocagem: usert.dre.custo_estocagem,
                            custo_troca_insumos: usert.dre.custo_troca_insumos,
                            hora_extra: usert.dre.hora_extra,
                            capacidade_n_utilizada: usert.dre.capacidade_n_utilizada,
                            margem_bruta: usert.dre.margem_bruta,
                            despesas_administrativas: usert.dre.despesas_administrativas,
                            salario_promotores: usert.dre.salario_promotores,
                            comissao: usert.dre.comissao,
                            propaganda_institucional: usert.dre.propaganda_institucional,
                            propaganda_unitaria: usert.dre.propaganda_unitaria,
                            depreciacao_de_maquinas: usert.dre.depreciacao_de_maquinas,
                            encargos_financiamento: usert.dre.encargos_financiamento,
                            salario_frota: usert.dre.salario_frota,
                            manutencao_frota: usert.dre.manutencao_frota,
                            depreciacao_de_veiculos: usert.dre.depreciacao_de_veiculos,
                            frota_terceirizada: usert.dre.frota_terceirizada,
                            despesas_operacionais_n_planejadas: usert.dre.despesas_operacionais_n_planejadas,
                            pas: usert.dre.pas,
                            pesquisas: usert.dre.pesquisas,
                            tributos: usert.dre.tributos,
                            servicos: [usert.dre.servicos[0], usert.dre.servicos[1], usert.dre.servicos[2], usert.dre.servicos[3]],
                            preco_medio: usert.dre.preco_medio,
                            atendimentos: usert.dre.atendimentos,
                            insumos_em_estoque: usert.dre.insumos_em_estoque,
                            distribuidores: usert.dre.distribuidores

                        }
                        userdef.fluxo_de_caixa = {
                            saldo_anterior: usert.fluxo_de_caixa.saldo_anterior,
                            faturamento: usert.fluxo_de_caixa.faturamento,
                            contas_a_receber: usert.fluxo_de_caixa.contas_a_receber,
                            contas_a_receber_recebidas: usert.fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                            custo_de_servico_prestado: usert.fluxo_de_caixa.custo_de_servico_prestado,
                            emprestimos_contratados: usert.fluxo_de_caixa.emprestimos_contratados,
                            emprestimos_pagos: usert.fluxo_de_caixa.emprestimos_pagos,
                            veiculos_vendidos: usert.fluxo_de_caixa.veiculos_vendidos,
                            depreciacao_de_veiculos: usert.fluxo_de_caixa.depreciacao_de_veiculos,
                            depreciacao_de_maquinas: usert.fluxo_de_caixa.depreciacao_de_maquinas,
                            veiculos_comprados: usert.fluxo_de_caixa.veiculos_comprados,
                            tributos: usert.fluxo_de_caixa.tributos,
                            promotores: usert.fluxo_de_caixa.promotores,
                            propaganda: usert.fluxo_de_caixa.propaganda,
                            pesquisas: usert.fluxo_de_caixa.pesquisas,
                            pas: usert.fluxo_de_caixa.pas,
                            uso_frota: usert.fluxo_de_caixa.uso_frota,
                            despesas_operacionais_n_planejadas: usert.fluxo_de_caixa.despesas_operacionais_n_planejadas,
                            despesas_administrativas: usert.fluxo_de_caixa.despesas_administrativas,
                            encargos_financiamento: usert.fluxo_de_caixa.encargos_financiamento,
                            maquinas: usert.fluxo_de_caixa.maquinas,
                            distribuidores: usert.fluxo_de_caixa.distribuidores
                        }
                        userdef.somapropuni = {tipo1: usert.somapropuni.tipo1, inv1: usert.somapropuni.inv1, tipo2: usert.somapropuni.tipo2, inv2: usert.somapropuni.inv2}
                        userdef.pes_p = {
                                modelos_oferecidos: usert.pes_p.modelos_oferecidos,
                                total_pas: usert.pes_p.total_pas,
                                total_participacao_modelos: usert.pes_p.total_participacao_modelos,
                                total_distribuidores: usert.pes_p.total_distribuidores
                                
                        }
                        userdef.participacao_modelos = usert.participacao_modelos
                        for(let s = 0; s < index.length; s++){
                            //console.log(index[s])
                            let serv = index[s]
                            userdef.set(serv, [usert[serv][0], usert[serv][1], usert[serv][2], usert[serv][3], usert[serv][4], usert[serv][5], usert[serv][6], usert[serv][7]])
                        }
                        userdef.modificador = usert.modificador
                        userdef.save()
                            .then(() => {
                                socket.emit('feedback', ['success','Os dados foram salvos com sucesso'])
                            })
                            .catch((err) => {socket.emit('feedback', ['danger','falha ao salvar os dados no servidor: ' + err]);console.log(err)})
                        


                    })
                }
                else{socket.emit('feedback', ['danger','você só pode salvar uma jogada quando o moderador iniciar oficialmente o turno'])}
                })
            }
            else{
                socket.emit('feedback', ['danger','É necessário estar logado para puxar os dados da simulação'])
            }
            })
    }) //OKK falta teste
    socket.on('resetar', () => {
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((usert) => {
                if(usert !== null){
                Aluno.findOne({cooperativa: usert.cooperativa, instancia: usert.instancia, temporario: 0})
                    .then((userdef) => {
                        usert.last_change = {prop1: userdef.last_change.prop1, prop2: userdef.last_change.prop2 ,serv1: userdef.last_change.serv1, serv2: userdef.last_change.serv2, insu1: userdef.last_change.insu1, insu2: userdef.last_change.insu2, insu2i: userdef.last_change.insu2i, insu1i: userdef.last_change.insu1i}
                        usert.deci = userdef.deci
                        usert.set('npesquisas', userdef.npesquisas)
                        usert.set('turno', userdef.turno)
                        usert.set('propaganda', userdef.propaganda)
                        usert.set('propagandauni', userdef.propagandauni)
                        usert.set('taokeys', userdef.taokeys)
                        usert.set('comissao', userdef.comissao)
                        //console.log('PASt: ' + usert.pas)
                        usert.set('pas', userdef.pas)
                        usert.set('pas1', userdef.pas1)
                        usert.set('pas2', userdef.pas2)
                        usert.set('distribuidores', userdef.distribuidores)
                        usert.set('promotores', userdef.promotores)
                        usert.set('divida', [userdef["divida"][0],userdef["divida"][1],userdef["divida"][2]])
                        usert.set('somapropuni', {tipo1: userdef.somapropuni.tipo1, inv1: userdef.somapropuni.inv1, tipo2: userdef.somapropuni.tipo2, inv2: userdef.somapropuni.inv2})
                        //console.log(index)
                        usert.balanco_patrimonial = {
                            caixa: userdef.balanco_patrimonial.caixa,
                            estoque: userdef.balanco_patrimonial.estoque,
                            contas_a_receber60: userdef.balanco_patrimonial.contas_a_receber60,
                            contas_a_receber120: userdef.balanco_patrimonial.contas_a_receber120,
                            maquinas: userdef.balanco_patrimonial.maquinas,
                            depreciacao_maquinas: userdef.balanco_patrimonial.depreciacao_maquinas,
                            veiculos: userdef.balanco_patrimonial.veiculos,
                            depreciacao_veiculos: userdef.balanco_patrimonial.depreciacao_veiculos,
                            tributos_a_pagar_anterior: userdef.balanco_patrimonial.tributos_a_pagar_anterior,
                            tributos_a_pagar_atual: userdef.balanco_patrimonial.tributos_a_pagar_atual,
                            emprestimos: userdef.balanco_patrimonial.emprestimos,
                            capial: userdef.balanco_patrimonial.capial,
                            lucros_acumulados: userdef.balanco_patrimonial.lucros_acumulados
                        }
                        usert.dre = {
                            receita: userdef.dre.receita,
                            csp: userdef.dre.csp,
                            estoque_inicial: userdef.dre.estoque_inicial,
                            custo_prestacao_servico: userdef.dre.custo_prestacao_servico,
                            custo_estocagem: userdef.dre.custo_estocagem,
                            custo_troca_insumos: userdef.dre.custo_troca_insumos,
                            hora_extra: userdef.dre.hora_extra,
                            capacidade_n_utilizada: userdef.dre.capacidade_n_utilizada,
                            margem_bruta: userdef.dre.margem_bruta,
                            despesas_administrativas: userdef.dre.despesas_administrativas,
                            salario_promotores: userdef.dre.salario_promotores,
                            comissao: userdef.dre.comissao,
                            propaganda_institucional: userdef.dre.propaganda_institucional,
                            propaganda_unitaria: userdef.dre.propaganda_unitaria,
                            depreciacao_de_maquinas: userdef.dre.depreciacao_de_maquinas,
                            encargos_financiamento: userdef.dre.encargos_financiamento,
                            salario_frota: userdef.dre.salario_frota,
                            manutencao_frota: userdef.dre.manutencao_frota,
                            depreciacao_de_veiculos: userdef.dre.depreciacao_de_veiculos,
                            frota_terceirizada: userdef.dre.frota_terceirizada,
                            despesas_operacionais_n_planejadas: userdef.dre.despesas_operacionais_n_planejadas,
                            pas: userdef.dre.pas,
                            pesquisas: userdef.dre.pesquisas,
                            tributos: userdef.dre.tributos,
                            servicos: [userdef.dre.servicos[0],userdef.dre.servicos[1],userdef.dre.servicos[2],userdef.dre.servicos[3]],
                            preco_medio: userdef.dre.preco_medio,
                            atendimentos: userdef.dre.atendimentos,
                            insumos_em_estoque: userdef.dre.insumos_em_estoque,
                            distribuidores: userdef.dre.distribuidores

                        }
                        usert.fluxo_de_caixa = {
                            saldo_anterior: userdef.fluxo_de_caixa.saldo_anterior,
                            faturamento: userdef.fluxo_de_caixa.faturamento,
                            contas_a_receber: userdef.fluxo_de_caixa.contas_a_receber,
                            contas_a_receber_recebidas: userdef.fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                            custo_de_servico_prestado: userdef.fluxo_de_caixa.custo_de_servico_prestado,
                            emprestimos_contratados: userdef.fluxo_de_caixa.emprestimos_contratados,
                            emprestimos_pagos: userdef.fluxo_de_caixa.emprestimos_pagos,
                            veiculos_vendidos: userdef.fluxo_de_caixa.veiculos_vendidos,
                            depreciacao_de_veiculos: userdef.fluxo_de_caixa.depreciacao_de_veiculos,
                            depreciacao_de_maquinas: userdef.fluxo_de_caixa.depreciacao_de_maquinas,
                            veiculos_comprados: userdef.fluxo_de_caixa.veiculos_comprados,
                            tributos: userdef.fluxo_de_caixa.tributos,
                            promotores: userdef.fluxo_de_caixa.promotores,
                            propaganda: userdef.fluxo_de_caixa.propaganda,
                            pesquisas: userdef.fluxo_de_caixa.pesquisas,
                            pas: userdef.fluxo_de_caixa.pas,
                            uso_frota: userdef.fluxo_de_caixa.uso_frota,
                            despesas_operacionais_n_planejadas: userdef.fluxo_de_caixa.despesas_operacionais_n_planejadas,
                            despesas_administrativas: userdef.fluxo_de_caixa.despesas_administrativas,
                            encargos_financiamento: userdef.fluxo_de_caixa.encargos_financiamento,
                            maquinas: userdef.fluxo_de_caixa.maquinas,
                            distribuidores: userdef.fluxo_de_caixa.distribuidores
                        }
                        usert.somapropuni = {tipo1: userdef.somapropuni.tipo1, inv1: userdef.somapropuni.inv1, tipo2: userdef.somapropuni.tipo2, inv2: userdef.somapropuni.inv2}
                        usert.pes_p = {
                                modelos_oferecidos: userdef.pes_p.modelos_oferecidos,
                                total_pas: userdef.pes_p.total_pas,
                                total_participacao_modelos: userdef.pes_p.total_participacao_modelos,
                                total_distribuidores: userdef.pes_p.total_distribuidores
                                
                        }
                        usert.participacao_modelos = userdef.participacao_modelos

                        
                        for(let s = 0; s < index.length; s++){
                            //console.log(index[s])
                            let serv = index[s]
                            usert.set(serv, [userdef[serv][0], userdef[serv][1], userdef[serv][2], userdef[serv][3], userdef[serv][4], userdef[serv][5], userdef[serv][6], userdef[serv][7]])
                        }
                        usert.set('frota', [userdef.frota[0],userdef.frota[1],userdef.frota[2],userdef.frota[3],userdef.frota[4],userdef.frota[5],userdef.frota[6],userdef.frota[7],userdef.frota[8],userdef.frota[9],userdef.frota[10],userdef.frota[11]])
                        
                        usert.save()
                            .then(() => {
                                socket.emit('feedback', ['success','A jogada foi resetada com sucesso'])
                                Aluno.find({ cooperativa: userdef.cooperativa, backup: 1, instancia: userdef.instancia})
                                    .then((peps) => {    
                                    Aluno.findOne({ cooperativa: userdef.cooperativa, temporario: 1, instancia: userdef.instancia})           
                                    .then((atual) => {
                                        let arr = []
                                        for(let i = 0; i < peps.length; i++){
                                            for(let ii = 0; ii < peps[i].deci.length;ii++){
                                                arr.push(peps[i].deci[ii])
                                            }
                                        }
                                        for(let k = 0; k < atual.deci.length;k++){
                                            arr.push(atual.deci[k])
                                        }
                                        function getUnique(arry, comp) {

                                            // store the comparison  values in array
                                        const unique =  arry.map(e => e[comp])
                        
                                          // store the indexes of the unique objects
                                            .map((e, i, final) => final.indexOf(e) === i && i)
                        
                                          // eliminate the false indexes & return unique objects
                                            .filter((e) => arry[e]).map(e => arry[e]);
                        
                                            return unique;
                                        }
                                        
                                        let respp = getUnique(arr,'acao')
                                        socket.emit('deci', respp);
                                         //console.log(arr)        
                                         //socket.emit('feedback', ['warning', pes.participacao_modelos + pes.pes_p.total_distribuidores])    
                                    })
                                    .catch((err) => {console.log(err)})
                                    }) 
                                    .catch((err) => {console.log(err)})
                                    Aluno.findOne({sockid: socket.id, temporario: 1})
                                    .then((userx) => {
                                        if(userx !== null){
                                                
                                                //console.log(userx.turno)
                                                //console.log(Number(turno))
                                                    
                                                        Aluno.findOne({ cooperativa: userx.cooperativa, backup: 0, instancia: userx.instancia, temporario: 1 })
                                                            .then((balancos) => {
                                                                //console.log(balancos)
                                                                if(balancos !== null){
                                                                    function resp(b) {
                                                                        let w = 0
                                                                        for(let i = 0; i < index.length; i++){
                                                                            if(b[index[i]][1] == 1){
                                                                                w = w + Math.round(Number(b[index[i]][0]))
                                                                            }
                                                                        }
                                                                        return w
                                                                    }
                                                                    function checar4(t) {
                                                                        if(t !== null && t !== undefined){
                                                                            return t[4]
                                                                        }
                                                                        else{
                                                                            return 0
                                                                        }
                                                                    }
                                                                    function checar3(t) {
                                                                        if(t !== null && t !== undefined){
                                                                            return t[3]
                                                                        }
                                                                        else{
                                                                            return 0
                                                                        }
                                                                    }
                                                                //console.log('puxando-balancos <<ATUAL (RESP: ' + resp(balancos))
                                                                let somapes = 0
                                                                if(balancos.pes_p.modelos_oferecidos == 1){
                                                                    somapes = somapes + 2160
                                                                }
                                                                if(balancos.pes_p.total_pas == 1){
                                                                    somapes = somapes + 2160
                                                                }
                                                                if(balancos.pes_p.total_participacao_modelos == 1){
                                                                    somapes = somapes + 2160
                                                                }
                                                                if(balancos.pes_p.total_distribuidores == 1){
                                                                    somapes = somapes + 2160
                                                                }
                                                                socket.emit('balancos', { 
                                                                    balanco_patrimonial: balancos.balanco_patrimonial,
                                                                    turno: balancos.turno,
                                                                    dre: balancos.dre,
                                                                    fluxo: balancos.fluxo_de_caixa,
                                                                    total_n_utilizado: resp(balancos),
                                                                    planejado: {pesquisas: somapes,propagandai: balancos.propaganda,comissao: balancos.comissao,insu2i: balancos.last_change.insu2i,insu1i: balancos.last_change.insu1i,prop1: balancos.last_change.prop1, prop2: balancos.last_change.prop2, serv1: balancos.last_change.serv1, serv2: balancos.last_change.serv2, emprestimo: balancos.divida[0]+balancos.divida[1]+balancos.divida[2],frota: balancos.frota[0]+balancos.frota[1]+balancos.frota[2]+balancos.frota[3]+balancos.frota[4]+balancos.frota[5]+balancos.frota[6]+balancos.frota[7]+balancos.frota[8]+balancos.frota[9]+balancos.frota[10]+balancos.frota[11], pas: balancos.pas, distribuidores: balancos.distribuidores, promotores: balancos.promotores, last_change: balancos.last_change, volume1: checar4(balancos[balancos.last_change.serv1]), volume2: checar4(balancos[balancos.last_change.serv2]), preco1: checar3(balancos[balancos.last_change.serv1]), preco2: checar3(balancos[balancos.last_change.serv2])},
                                                                    servs: {
                                                                        
                                                                            147:balancos['147'],
                                                                            148:balancos['148'],
                                                                            149:balancos['149'],
                                                                            157:balancos['157'],
                                                                            158:balancos['158'],
                                                                            159:balancos['159'],
                                                                            257:balancos['257'],
                                                                            258:balancos['258'],
                                                                            259:balancos['259'],
                                                                            267:balancos['267'],
                                                                            268:balancos['268'],
                                                                            269:balancos['269'],
                                                                            347:balancos['347'],
                                                                            348:balancos['348'],
                                                                            349:balancos['349'],
                                                                            357:balancos['357'],
                                                                            358:balancos['358'],
                                                                            359:balancos['359'],
                                                                            367:balancos['367'],
                                                                            368:balancos['368'],
                                                                            369:balancos['369']
                                                                    }
                                                                 });
                                                                }
                                                                else{
                                                                    console.log('puts atual')
                                                                }            
                                                            })
                                                            .catch((err) => {console.log(err)})
                                                        
                                                    
                        
                                                  
                        
                                    }
                                        else{
                                            socket.emit('feedback', ['danger','É preciso estar logado para puxar o state atual da simulação.'])
                                        }
                                    })
                                    .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
                                function propuni(tipo) {
                                    if(usert.somapropuni.tipo1 == tipo){
                                        return usert.somapropuni.inv1
                                    }
                                    else if(usert.somapropuni.tipo2 == tipo){
                                        return usert.somapropuni.inv2
                                    }
                                    else{return 0}
                                }
                                function insumosi(s) {
                                    if(s == usert.last_change.serv1){
                                        return usert.last_change.insu1i
                                    }
                                    else if(s == usert.last_change.serv2){
                                        return usert.last_change.insu2i
                                    }
                                    else{
                                        return 0
                                    }
                                }
                                socket.emit('update', [
                                    [...usert["147"],"147",propuni("147"),insumosi("147")],
                                    [...usert["148"],"148",propuni("148"),insumosi("148")],
                                    [...usert["149"],"149",propuni("149"),insumosi("149")],
                                    [...usert["157"],"157",propuni("157"),insumosi("157")],
                                    [...usert["158"],"158",propuni("158"),insumosi("158")],
                                    [...usert["159"],"159",propuni("159"),insumosi("159")],
                                    [...usert["257"],"257",propuni("257"),insumosi("257")],
                                    [...usert["258"],"258",propuni("258"),insumosi("258")],
                                    [...usert["259"],"259",propuni("259"),insumosi("259")],
                                    [...usert["267"],"267",propuni("267"),insumosi("267")],
                                    [...usert["268"],"268",propuni("268"),insumosi("268")],
                                    [...usert["269"],"269",propuni("269"),insumosi("269")],
                                    [...usert["347"],"347",propuni("347"),insumosi("347")],
                                    [...usert["348"],"348",propuni("348"),insumosi("348")],
                                    [...usert["349"],"349",propuni("349"),insumosi("349")],
                                    [...usert["357"],"357",propuni("357"),insumosi("357")],
                                    [...usert["358"],"358",propuni("358"),insumosi("358")],
                                    [...usert["359"],"359",propuni("359"),insumosi("359")],
                                    [...usert["367"],"367",propuni("367"),insumosi("367")],
                                    [...usert["368"],"368",propuni("368"),insumosi("368")],
                                    [...usert["369"],"369",propuni("369"),insumosi("369")],
                                    usert["taokeys"],
                                    usert["frota"],
                                    usert["promotores"],
                                    usert["comissao"],
                                    usert["distribuidores"],
                                    usert["pas"],
                                    usert["propaganda"],
                                    usert["propagandauni"],
                                    (usert["divida"][0]+usert["divida"][1]+usert["divida"][2]),
                                    usert["turno"]]);
                                socket.emit('resetado')
                            })
                            .catch((err) => {socket.emit('feedback', ['danger','falha ao salvar os dados no servidor']);console.log(err)})
                        


                    })
                
                
            }
            else{
                socket.emit('feedback', ['danger','É necessário estar logado para puxar os dados da simulação'])
            }
            })
    }) //tb re-manda os balancos e decisoes para tornar a aplicacao mais responsiva
    socket.on('aumentar-frota', (dados) => {
        let qnt = Number(dados)
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                        if(qnt > 0 && userx.taokeys){
                            let datetime = new Date().toLocaleString('pt-BR').toLocaleString('pt-BR');
                            userx.deci.push({data: datetime, acao: 'Compra de ' +qnt + ' veículos', autor: userx.modificador})
                        
                            userx.balanco_patrimonial = {
                                caixa: userx.balanco_patrimonial.caixa - qnt*57600,
                                estoque: userx.balanco_patrimonial.estoque,
                                contas_a_receber60: userx.balanco_patrimonial.contas_a_receber60,
                                contas_a_receber120: userx.balanco_patrimonial.contas_a_receber120,
                                maquinas: userx.balanco_patrimonial.maquinas,
                                depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_maquinas,
                                veiculos: userx.balanco_patrimonial.veiculos + qnt*57600,
                                depreciacao_veiculos: userx.balanco_patrimonial.depreciacao_veiculos,
                                tributos_a_pagar_anterior: userx.balanco_patrimonial.tributos_a_pagar_anterior,
                                tributos_a_pagar_atual: userx.balanco_patrimonial.tributos_a_pagar_atual,
                                emprestimos: userx.balanco_patrimonial.emprestimos,
                                capial: userx.balanco_patrimonial.capial,
                                lucros_acumulados: userx.balanco_patrimonial.lucros_acumulados
                            }
                            userx.fluxo_de_caixa = {
                                saldo_anterior: userx.fluxo_de_caixa.saldo_anterior,
                                faturamento: userx.fluxo_de_caixa.faturamento,
                                contas_a_receber: userx.fluxo_de_caixa.contas_a_receber,
                                contas_a_receber_recebidas: userx.fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                                custo_de_servico_prestado: userx.fluxo_de_caixa.custo_de_servico_prestado,
                                emprestimos_contratados: userx.fluxo_de_caixa.emprestimos_contratados,
                                emprestimos_pagos: userx.fluxo_de_caixa.emprestimos_pagos,
                                veiculos_vendidos: userx.fluxo_de_caixa.veiculos_vendidos,
                                depreciacao_de_veiculos: userx.fluxo_de_caixa.depreciacao_de_veiculos,
                                depreciacao_de_maquinas: userx.fluxo_de_caixa.depreciacao_de_maquinas,
                                veiculos_comprados: userx.fluxo_de_caixa.veiculos_comprados + qnt*57600,
                                tributos: userx.fluxo_de_caixa.tributos,
                                promotores: userx.fluxo_de_caixa.promotores,
                                propaganda: userx.fluxo_de_caixa.propaganda,
                                pesquisas: userx.fluxo_de_caixa.pesquisas,
                                pas: userx.fluxo_de_caixa.pas,
                                uso_frota: userx.fluxo_de_caixa.uso_frota,
                                despesas_operacionais_n_planejadas: userx.fluxo_de_caixa.despesas_operacionais_n_planejadas,
                                despesas_administrativas: userx.fluxo_de_caixa.despesas_administrativas,
                                encargos_financiamento: userx.fluxo_de_caixa.encargos_financiamento,
                                maquinas: userx.fluxo_de_caixa.maquinas,
                                distribuidores: userx.fluxo_de_caixa.distribuidores
                            } 
                            let novaf = userx['frota'][0] + qnt
                            let array_dados = [novaf, userx['frota'][1], userx['frota'][2], userx['frota'][3], userx['frota'][4], userx['frota'][5], userx['frota'][6], userx['frota'][7], userx['frota'][8], userx['frota'][9], userx['frota'][10], userx['frota'][11], userx['frota'][12], userx['frota'][13], userx['frota'][14], userx['frota'][15], userx['frota'][16], userx['frota'][17], userx['frota'][18], userx['frota'][19], userx['frota'][20], userx['frota'][21], userx['frota'][22], userx['frota'][23]]
                            userx.taokeys = userx.taokeys - 57600*Number(dados)
                            userx.set('frota', array_dados) 
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id, temporario: 1}))                 
                                .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        function propuni(tipo) {
                                            if(user.somapropuni.tipo1 == tipo){
                                                return user.somapropuni.inv1
                                            }
                                            else if(user.somapropuni.tipo2 == tipo){
                                                return user.somapropuni.inv2
                                            }
                                            else{return 0}
                                        }
                                        function insumosi(s) {
                                            if(s == user.last_change.serv1){
                                                return user.last_change.insu1i
                                            }
                                            else if(s == user.last_change.serv2){
                                                return user.last_change.insu2i
                                            }
                                            else{
                                                return 0
                                            }
                                        }
                                        socket.emit('update', [
                                                                        [...user["147"],"147",propuni("147"),insumosi("147")],
                                    [...user["148"],"148",propuni("148"),insumosi("148")],
                                    [...user["149"],"149",propuni("149"),insumosi("149")],
                                    [...user["157"],"157",propuni("157"),insumosi("157")],
                                    [...user["158"],"158",propuni("158"),insumosi("158")],
                                    [...user["159"],"159",propuni("159"),insumosi("159")],
                                    [...user["257"],"257",propuni("257"),insumosi("257")],
                                    [...user["258"],"258",propuni("258"),insumosi("258")],
                                    [...user["259"],"259",propuni("259"),insumosi("259")],
                                    [...user["267"],"267",propuni("267"),insumosi("267")],
                                    [...user["268"],"268",propuni("268"),insumosi("268")],
                                    [...user["269"],"269",propuni("269"),insumosi("269")],
                                    [...user["347"],"347",propuni("347"),insumosi("347")],
                                    [...user["348"],"348",propuni("348"),insumosi("348")],
                                    [...user["349"],"349",propuni("349"),insumosi("349")],
                                    [...user["357"],"357",propuni("357"),insumosi("357")],
                                    [...user["358"],"358",propuni("358"),insumosi("358")],
                                    [...user["359"],"359",propuni("359"),insumosi("359")],
                                    [...user["367"],"367",propuni("367"),insumosi("367")],
                                    [...user["368"],"368",propuni("368"),insumosi("368")],
                                    [...user["369"],"369",propuni("369"),insumosi("369")],                                    user["taokeys"],
                                    user["frota"],
                                    user["promotores"],
                                    user["comissao"],
                                    user["distribuidores"],
                                    user["pas"],
                                    user["propaganda"],
                                    user["propagandauni"],
                                    (user["divida"][0]+user["divida"][1]+user["divida"][2]),
                                    user["turno"]]);
                                    }                  
                                })
                        .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})
                          
                    }
                    else if(qnt > 0 && userx.taokeys < qnt*57600){
                        socket.emit('feedback', ['warning','falta caixa'])
                    }
                    else{socket.emit('feedback', ['warning','apenas valores positivos'])}
                    
                
             
            }
                else{
                    socket.emit('feedback', ['danger','É necessário estar logado para puxar os dados da simulação'])
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    }) 
    socket.on('vender-frota', (dados) => {
        let qnt = Number(dados)
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                        if(qnt > 0){
                            let soma_f = 0
                            for(let i = 0; i < userx.frota.length; i++){
                                if(userx.frota[i] > 0){
                                    soma_f = soma_f + userx.frota[i]
                                }
                            }
                            console.log(soma_f)
                            if(soma_f >= qnt){
                                let falta = qnt
                                for(let k = 11; k >= 0; k--){
                                    let retirada = 0
                                    if(userx.frota[k] > 0){
                                        if(userx.frota[k] > falta){
                                            retirada = falta
                                            userx.taokeys = userx.taokeys + retirada*(57600/12)*(12-k)
                                            let datetime = new Date().toLocaleString('pt-BR').toLocaleString('pt-BR');
                                            userx.deci.push({data: datetime, acao: 'Venda de '+qnt +' veículos', autor: userx.modificador})
                        
                                            userx.balanco_patrimonial = {
                                                caixa: userx.balanco_patrimonial.caixa + userx.frota[k]*(57600/12)*(12-k),
                                                estoque: userx.balanco_patrimonial.estoque,
                                                contas_a_receber60: userx.balanco_patrimonial.contas_a_receber60,
                                                contas_a_receber120: userx.balanco_patrimonial.contas_a_receber120,
                                                maquinas: userx.balanco_patrimonial.maquinas,
                                                depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_maquinas,
                                                veiculos: userx.balanco_patrimonial.veiculos - qnt*57600,
                                                depreciacao_veiculos: userx.balanco_patrimonial.depreciacao_veiculos + userx.frota[k]*(57600/12)*(k),
                                                tributos_a_pagar_anterior: userx.balanco_patrimonial.tributos_a_pagar_anterior,
                                                tributos_a_pagar_atual: userx.balanco_patrimonial.tributos_a_pagar_atual,
                                                emprestimos: userx.balanco_patrimonial.emprestimos,
                                                capial: userx.balanco_patrimonial.capial,
                                                lucros_acumulados: userx.balanco_patrimonial.lucros_acumulados + userx.frota[k]*(57600/12)*(12-k)
                                            }
                                            userx.fluxo_de_caixa = {
                                                saldo_anterior: userx.fluxo_de_caixa.saldo_anterior,
                                                faturamento: userx.fluxo_de_caixa.faturamento,
                                                contas_a_receber: userx.fluxo_de_caixa.contas_a_receber,
                                                contas_a_receber_recebidas: userx.fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                                                custo_de_servico_prestado: userx.fluxo_de_caixa.custo_de_servico_prestado,
                                                emprestimos_contratados: userx.fluxo_de_caixa.emprestimos_contratados,
                                                emprestimos_pagos: userx.fluxo_de_caixa.emprestimos_pagos,
                                                veiculos_vendidos: userx.fluxo_de_caixa.veiculos_vendidos + qnt*57600,
                                                depreciacao_de_veiculos: userx.fluxo_de_caixa.depreciacao_de_veiculos,
                                                depreciacao_de_maquinas: userx.fluxo_de_caixa.depreciacao_de_maquinas,
                                                veiculos_comprados: userx.fluxo_de_caixa.veiculos_comprados,
                                                tributos: userx.fluxo_de_caixa.tributos,
                                                promotores: userx.fluxo_de_caixa.promotores,
                                                propaganda: userx.fluxo_de_caixa.propaganda,
                                                pesquisas: userx.fluxo_de_caixa.pesquisas,
                                                pas: userx.fluxo_de_caixa.pas,
                                                uso_frota: userx.fluxo_de_caixa.uso_frota,
                                                despesas_operacionais_n_planejadas: userx.fluxo_de_caixa.despesas_operacionais_n_planejadas,
                                                despesas_administrativas: userx.fluxo_de_caixa.despesas_administrativas,
                                                encargos_financiamento: userx.fluxo_de_caixa.encargos_financiamento,
                                                maquinas: userx.fluxo_de_caixa.maquinas,
                                                distribuidores: userx.fluxo_de_caixa.distribuidores
                                            }
                                            let array = [userx.frota[0],userx.frota[1],userx.frota[2],userx.frota[3],userx.frota[4],userx.frota[5],userx.frota[6],userx.frota[7],userx.frota[8],userx.frota[9],userx.frota[10],userx.frota[11]]
                                            array[k] = userx.frota[k] - retirada;
                                            userx.set('frota', array)
                                            
                                            //userx.set('frota', [userx.frota[0],userx.frota[1],userx.frota[2],userx.frota[3],userx.frota[4],userx.frota[5],])
                                            break 
                                        }
                                        else{
                                            retirada = userx.frota[k]
                                            falta = falta - userx.frota[k]
                                            let array = [userx.frota[0],userx.frota[1],userx.frota[2],userx.frota[3],userx.frota[4],userx.frota[5],userx.frota[6],userx.frota[7],userx.frota[8],userx.frota[9],userx.frota[10],userx.frota[11]]
                                            array[k] = 0
                                            userx.set('frota', array)
                                            userx.taokeys = userx.taokeys + retirada*(57600/12)*(12-k)
                                            let datetime = new Date().toLocaleString('pt-BR').toLocaleString('pt-BR');
                                            userx.deci.push({data: datetime, acao: 'Venda de '+qnt +' veículos', autor: userx.modificador})
                        
                                            userx.balanco_patrimonial = {
                                            caixa: userx.balanco_patrimonial.caixa + userx.frota[k]*(57600/12)*(12-k),
                                            estoque: userx.balanco_patrimonial.estoque,
                                            contas_a_receber60: userx.balanco_patrimonial.contas_a_receber60,
                                            contas_a_receber120: userx.balanco_patrimonial.contas_a_receber120,
                                            maquinas: userx.balanco_patrimonial.maquinas,
                                            depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_maquinas,
                                            veiculos: userx.balanco_patrimonial.veiculos - qnt*57600,
                                            depreciacao_veiculos: userx.balanco_patrimonial.depreciacao_veiculos + userx.frota[k]*(57600/12)*(k),
                                            tributos_a_pagar_anterior: userx.balanco_patrimonial.tributos_a_pagar_anterior,
                                            tributos_a_pagar_atual: userx.balanco_patrimonial.tributos_a_pagar_atual,
                                            emprestimos: userx.balanco_patrimonial.emprestimos,
                                            capial: userx.balanco_patrimonial.capial,
                                            lucros_acumulados: userx.balanco_patrimonial.lucros_acumulados
                                            }
                                            
                                            userx.fluxo_de_caixa = {
                                                saldo_anterior: userx.fluxo_de_caixa.saldo_anterior,
                                                faturamento: userx.fluxo_de_caixa.faturamento,
                                                contas_a_receber: userx.fluxo_de_caixa.contas_a_receber,
                                                contas_a_receber_recebidas: userx.fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                                                custo_de_servico_prestado: userx.fluxo_de_caixa.custo_de_servico_prestado,
                                                emprestimos_contratados: userx.fluxo_de_caixa.emprestimos_contratados,
                                                emprestimos_pagos: userx.fluxo_de_caixa.emprestimos_pagos,
                                                veiculos_vendidos: userx.fluxo_de_caixa.veiculos_vendidos + userx.frota[k]*(57600/12)*(k),
                                                depreciacao_de_veiculos: userx.fluxo_de_caixa.depreciacao_de_veiculos,
                                                depreciacao_de_maquinas: userx.fluxo_de_caixa.depreciacao_de_maquinas,
                                                veiculos_comprados: userx.fluxo_de_caixa.veiculos_comprados,
                                                tributos: userx.fluxo_de_caixa.tributos,
                                                promotores: userx.fluxo_de_caixa.promotores,
                                                propaganda: userx.fluxo_de_caixa.propaganda,
                                                pesquisas: userx.fluxo_de_caixa.pesquisas,
                                                pas: userx.fluxo_de_caixa.pas,
                                                uso_frota: userx.fluxo_de_caixa.uso_frota,
                                                despesas_operacionais_n_planejadas: userx.fluxo_de_caixa.despesas_operacionais_n_planejadas,
                                                despesas_administrativas: userx.fluxo_de_caixa.despesas_administrativas,
                                                encargos_financiamento: userx.fluxo_de_caixa.encargos_financiamento,
                                                maquinas: userx.fluxo_de_caixa.maquinas,
                                                distribuidores: userx.fluxo_de_caixa.distribuidores
                                            }

                                        }
                                       
                                    }
                                }
                            
                        
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id, temporario: 1}))                 
                                .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        function propuni(tipo) {
                                            if(user.somapropuni.tipo1 == tipo){
                                                return user.somapropuni.inv1
                                            }
                                            else if(user.somapropuni.tipo2 == tipo){
                                                return user.somapropuni.inv2
                                            }
                                            else{return 0}
                                        }
                                        function insumosi(s) {
                                            if(s == user.last_change.serv1){
                                                return user.last_change.insu1i
                                            }
                                            else if(s == user.last_change.serv2){
                                                return user.last_change.insu2i
                                            }
                                            else{
                                                return 0
                                            }
                                        }
                                        socket.emit('update', [
                                                                        [...user["147"],"147",propuni("147"),insumosi("147")],
                                    [...user["148"],"148",propuni("148"),insumosi("148")],
                                    [...user["149"],"149",propuni("149"),insumosi("149")],
                                    [...user["157"],"157",propuni("157"),insumosi("157")],
                                    [...user["158"],"158",propuni("158"),insumosi("158")],
                                    [...user["159"],"159",propuni("159"),insumosi("159")],
                                    [...user["257"],"257",propuni("257"),insumosi("257")],
                                    [...user["258"],"258",propuni("258"),insumosi("258")],
                                    [...user["259"],"259",propuni("259"),insumosi("259")],
                                    [...user["267"],"267",propuni("267"),insumosi("267")],
                                    [...user["268"],"268",propuni("268"),insumosi("268")],
                                    [...user["269"],"269",propuni("269"),insumosi("269")],
                                    [...user["347"],"347",propuni("347"),insumosi("347")],
                                    [...user["348"],"348",propuni("348"),insumosi("348")],
                                    [...user["349"],"349",propuni("349"),insumosi("349")],
                                    [...user["357"],"357",propuni("357"),insumosi("357")],
                                    [...user["358"],"358",propuni("358"),insumosi("358")],
                                    [...user["359"],"359",propuni("359"),insumosi("359")],
                                    [...user["367"],"367",propuni("367"),insumosi("367")],
                                    [...user["368"],"368",propuni("368"),insumosi("368")],
                                    [...user["369"],"369",propuni("369"),insumosi("369")],                                    user["taokeys"],
                                    user["frota"],
                                    user["promotores"],
                                    user["comissao"],
                                    user["distribuidores"],
                                    user["pas"],
                                    user["propaganda"],
                                    user["propagandauni"],
                                    (user["divida"][0]+user["divida"][1]+user["divida"][2]),
                                    user["turno"]]);
                                    }                  
                                })
                        .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})
                            }
                            else{socket.emit('feedback', ['warning','Valor de veiculos inválido'])}
                          
                    }
                    else{socket.emit('feedback', ['warning','apenas valores positivos'])}
                    
                
             
            }
                else{
                    socket.emit('feedback', ['danger','É necessário estar logado para puxar os dados da simulação'])
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    })
    socket.on('checar-frota', () => {
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                    let resp = userx['frota']
                    socket.emit('feedback', ['success', 'Situação da sua frota: ' +resp])         
            }
                else{
                    socket.emit('feedback', ['danger', 'voce precisa estar logado para puxar o state atual da simulação'])
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    }) 
    socket.on('puxar-state', () => {
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                    function propuni(tipo) {
                        if(userx.somapropuni.tipo1 == tipo){
                            return userx.somapropuni.inv1
                        }
                        else if(userx.somapropuni.tipo2 == tipo){
                            return userx.somapropuni.inv2
                        }
                        else{return 0}
                    }
                    function insumosi(s) {
                                            if(userx.last_change.serv1 == s){
                                                return userx.last_change.insu1i
                                            }
                                            else if(userx.last_change.serv2 == s){
                                                return userx.last_change.insu2i
                                            }
                                            else{
                                                return 0
                                            }
                                        }
                                        socket.emit('update', [
                                    [...userx["147"],"147",propuni("147"),insumosi("147")],
                                    [...userx["148"],"148",propuni("148"),insumosi("148")],
                                    [...userx["149"],"149",propuni("149"),insumosi("149")],
                                    [...userx["157"],"157",propuni("157"),insumosi("157")],
                                    [...userx["158"],"158",propuni("158"),insumosi("158")],
                                    [...userx["159"],"159",propuni("159"),insumosi("159")],
                                    [...userx["257"],"257",propuni("257"),insumosi("257")],
                                    [...userx["258"],"258",propuni("258"),insumosi("258")],
                                    [...userx["259"],"259",propuni("259"),insumosi("259")],
                                    [...userx["267"],"267",propuni("267"),insumosi("267")],
                                    [...userx["268"],"268",propuni("268"),insumosi("268")],
                                    [...userx["269"],"269",propuni("269"),insumosi("269")],
                                    [...userx["347"],"347",propuni("347"),insumosi("347")],
                                    [...userx["348"],"348",propuni("348"),insumosi("348")],
                                    [...userx["349"],"349",propuni("349"),insumosi("349")],
                                    [...userx["357"],"357",propuni("357"),insumosi("357")],
                                    [...userx["358"],"358",propuni("358"),insumosi("358")],
                                    [...userx["359"],"359",propuni("359"),insumosi("359")],
                                    [...userx["367"],"367",propuni("367"),insumosi("367")],
                                    [...userx["368"],"368",propuni("368"),insumosi("368")],
                                    [...userx["369"],"369",propuni("369"),insumosi("369")],
                                    userx["taokeys"],
                                    userx["frota"],
                                    userx["promotores"],
                                    userx["comissao"],
                                    userx["distribuidores"],
                                    userx["pas"],
                                    userx["propaganda"],
                                    userx["propagandauni"],
                                    (userx["divida"][0]+userx["divida"][1]+userx["divida"][2]),
                                    userx["turno"]]);
                }
                else{
                    socket.emit('feedback', ['danger','É necessário estar logado para puxar os dados da simulação'])
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    }) 
    socket.on('alterar-preco', (dados) => {
        let tipo = dados[0];
        let preco = Number(dados[1]);
        if(preco && Number.isInteger(preco)){ 
            
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                    if(userx[tipo][1] == 1){
                        if(preco > 0 && preco <= 9999){
                            let datetime = new Date().toLocaleString('pt-BR').toLocaleString('pt-BR');
                            userx.deci.push({data: datetime, acao: 'Alteração de preço de venda do serviço '+ tipo+' para ' + preco, autor: userx.modificador})
                        
                            let array_dados = [userx[tipo][0], userx[tipo][1], userx[tipo][2], preco, userx[tipo][4], userx[tipo][5], userx[tipo][6], userx[tipo][7]]
                            userx.set(tipo, array_dados) 
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id, temporario: 1}))                 
                                .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        socket.emit('feedback', ['success', 'preço do serviço: ' + tipo + ' alterado para: ' + preco + ' com sucesso'])
                                        function propuni(tipo) {
                                            if(user.somapropuni.tipo1 == tipo){
                                                return user.somapropuni.inv1
                                            }
                                            else if(user.somapropuni.tipo2 == tipo){
                                                return user.somapropuni.inv2
                                            }
                                            else{return 0}
                                        }
                                        function insumosi(s) {
                                            if(s == user.last_change.serv1){
                                                return user.last_change.insu1i
                                            }
                                            else if(s == user.last_change.serv2){
                                                return user.last_change.insu2i
                                            }
                                            else{
                                                return 0
                                            }
                                        }
                                        socket.emit('update', [
                                                                        [...user["147"],"147",propuni("147"),insumosi("147")],
                                    [...user["148"],"148",propuni("148"),insumosi("148")],
                                    [...user["149"],"149",propuni("149"),insumosi("149")],
                                    [...user["157"],"157",propuni("157"),insumosi("157")],
                                    [...user["158"],"158",propuni("158"),insumosi("158")],
                                    [...user["159"],"159",propuni("159"),insumosi("159")],
                                    [...user["257"],"257",propuni("257"),insumosi("257")],
                                    [...user["258"],"258",propuni("258"),insumosi("258")],
                                    [...user["259"],"259",propuni("259"),insumosi("259")],
                                    [...user["267"],"267",propuni("267"),insumosi("267")],
                                    [...user["268"],"268",propuni("268"),insumosi("268")],
                                    [...user["269"],"269",propuni("269"),insumosi("269")],
                                    [...user["347"],"347",propuni("347"),insumosi("347")],
                                    [...user["348"],"348",propuni("348"),insumosi("348")],
                                    [...user["349"],"349",propuni("349"),insumosi("349")],
                                    [...user["357"],"357",propuni("357"),insumosi("357")],
                                    [...user["358"],"358",propuni("358"),insumosi("358")],
                                    [...user["359"],"359",propuni("359"),insumosi("359")],
                                    [...user["367"],"367",propuni("367"),insumosi("367")],
                                    [...user["368"],"368",propuni("368"),insumosi("368")],
                                    [...user["369"],"369",propuni("369"),insumosi("369")],                                    user["taokeys"],
                                    user["frota"],
                                    user["promotores"],
                                    user["comissao"],
                                    user["distribuidores"],
                                    user["pas"],
                                    user["propaganda"],
                                    user["propagandauni"],
                                    (user["divida"][0]+user["divida"][1]+user["divida"][2]),
                                    user["turno"]]);
        
                                    }                  
                                })
                        .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})

                    }
                    else{socket.emit('feedback', ['warning','Esse valor é impraticavel no mercado'])}
                }
                else if(userx[tipo][0] == 0 && userx[tipo][1] == 2){
                    socket.emit('feedback', ['warning','voce nao pode alterar o preco de venda unitario enquanto o servico esta em processo de encerramento'])
                }
                else if(userx[tipo][0] == 0 && userx[tipo][1] == 3){
                    socket.emit('feedback', ['warning','voce nao pode alterar o preco de venda unitario de um servico desativado'])
                }
                else{
                    socket.emit('feedback', ['warning','voce nao pode ter insumos de um servico para encerra-lo'])
                }
             
            }
                else{
                    socket.emit('feedback', ['danger','É necessário estar logado para puxar os dados da simulação'])
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
        }
        else{
            socket.emit('feedback',['warning','Valor Inválido (X-'+preco+')'])
        }
    }) 
    socket.on('promotores', (dados) => {
        let qnt = Number(dados)
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                        if(qnt > 0){
                            let novaf = qnt
                            let datetime = new Date().toLocaleString('pt-BR').toLocaleString('pt-BR');
                            userx.deci.push({data: datetime, acao: 'Alteração na quantiadade de contratações promotores para' + qnt, autor: userx.modificador})
                        
                            userx.set('promotores', novaf) 
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id, temporario: 1}))                 
                                .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        function propuni(tipo) {
                                            if(user.somapropuni.tipo1 == tipo){
                                                return user.somapropuni.inv1
                                            }
                                            else if(user.somapropuni.tipo2 == tipo){
                                                return user.somapropuni.inv2
                                            }
                                            else{return 0}
                                        }
                                        function insumosi(s) {
                                            if(s == user.last_change.serv1){
                                                return user.last_change.insu1i
                                            }
                                            else if(s == user.last_change.serv2){
                                                return user.last_change.insu2i
                                            }
                                            else{
                                                return 0
                                            }
                                        }
                                        socket.emit('update', [
                                                                        [...user["147"],"147",propuni("147"),insumosi("147")],
                                    [...user["148"],"148",propuni("148"),insumosi("148")],
                                    [...user["149"],"149",propuni("149"),insumosi("149")],
                                    [...user["157"],"157",propuni("157"),insumosi("157")],
                                    [...user["158"],"158",propuni("158"),insumosi("158")],
                                    [...user["159"],"159",propuni("159"),insumosi("159")],
                                    [...user["257"],"257",propuni("257"),insumosi("257")],
                                    [...user["258"],"258",propuni("258"),insumosi("258")],
                                    [...user["259"],"259",propuni("259"),insumosi("259")],
                                    [...user["267"],"267",propuni("267"),insumosi("267")],
                                    [...user["268"],"268",propuni("268"),insumosi("268")],
                                    [...user["269"],"269",propuni("269"),insumosi("269")],
                                    [...user["347"],"347",propuni("347"),insumosi("347")],
                                    [...user["348"],"348",propuni("348"),insumosi("348")],
                                    [...user["349"],"349",propuni("349"),insumosi("349")],
                                    [...user["357"],"357",propuni("357"),insumosi("357")],
                                    [...user["358"],"358",propuni("358"),insumosi("358")],
                                    [...user["359"],"359",propuni("359"),insumosi("359")],
                                    [...user["367"],"367",propuni("367"),insumosi("367")],
                                    [...user["368"],"368",propuni("368"),insumosi("368")],
                                    [...user["369"],"369",propuni("369"),insumosi("369")],                                    user["taokeys"],
                                    user["frota"],
                                    user["promotores"],
                                    user["comissao"],
                                    user["distribuidores"],
                                    user["pas"],
                                    user["propaganda"],
                                    user["propagandauni"],
                                    (user["divida"][0]+user["divida"][1]+user["divida"][2]),
                                    user["turno"]]);
        
                                    }                  
                                })
                        .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})
                          
                    }
                    else if(qnt > 0 && userx.taokeys < qnt*57600){
                        socket.emit('feedback', ['warning','falta caixa'])
                    }
                    else{socket.emit('feedback', ['warning','apenas valores positivos'])}
                    
                
             
            }
                else{
                    socket.emit('feedback', ['danger','É necessário estar logado para puxar os dados da simulação'])
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    }) 
    socket.on('diminuir-promotores', (dados) => {
        let qnt = Number(dados)
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                        if(qnt > 0 && userx['promotores'] >= qnt){
                            let novaf = userx['promotores'] - qnt
                            let datetime = new Date().toLocaleString('pt-BR');
                            userx.deci.push({data: datetime, acao: 'Demissão de '+qnt +' promotores', autor: userx.modificador})
                        
                            userx.set('promotores', novaf) 
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id, temporario: 1}))                 
                                .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        function propuni(tipo) {
                                            if(user.somapropuni.tipo1 == tipo){
                                                return user.somapropuni.inv1
                                            }
                                            else if(user.somapropuni.tipo2 == tipo){
                                                return user.somapropuni.inv2
                                            }
                                            else{return 0}
                                        }
                                        function insumosi(s) {
                                            if(s == user.last_change.serv1){
                                                return user.last_change.insu1i
                                            }
                                            else if(s == user.last_change.serv2){
                                                return user.last_change.insu2i
                                            }
                                            else{
                                                return 0
                                            }
                                        }
                                        socket.emit('update', [
                                                                        [...user["147"],"147",propuni("147"),insumosi("147")],
                                    [...user["148"],"148",propuni("148"),insumosi("148")],
                                    [...user["149"],"149",propuni("149"),insumosi("149")],
                                    [...user["157"],"157",propuni("157"),insumosi("157")],
                                    [...user["158"],"158",propuni("158"),insumosi("158")],
                                    [...user["159"],"159",propuni("159"),insumosi("159")],
                                    [...user["257"],"257",propuni("257"),insumosi("257")],
                                    [...user["258"],"258",propuni("258"),insumosi("258")],
                                    [...user["259"],"259",propuni("259"),insumosi("259")],
                                    [...user["267"],"267",propuni("267"),insumosi("267")],
                                    [...user["268"],"268",propuni("268"),insumosi("268")],
                                    [...user["269"],"269",propuni("269"),insumosi("269")],
                                    [...user["347"],"347",propuni("347"),insumosi("347")],
                                    [...user["348"],"348",propuni("348"),insumosi("348")],
                                    [...user["349"],"349",propuni("349"),insumosi("349")],
                                    [...user["357"],"357",propuni("357"),insumosi("357")],
                                    [...user["358"],"358",propuni("358"),insumosi("358")],
                                    [...user["359"],"359",propuni("359"),insumosi("359")],
                                    [...user["367"],"367",propuni("367"),insumosi("367")],
                                    [...user["368"],"368",propuni("368"),insumosi("368")],
                                    [...user["369"],"369",propuni("369"),insumosi("369")],                                    user["taokeys"],
                                    user["frota"],
                                    user["promotores"],
                                    user["comissao"],
                                    user["distribuidores"],
                                    user["pas"],
                                    user["propaganda"],
                                    user["propagandauni"],
                                    (user["divida"][0]+user["divida"][1]+user["divida"][2]),
                                    user["turno"]]);
                                    }                  
                                })
                        .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})
                          
                    }
                    else if(qnt > 0 && userx.taokeys < qnt*57600){
                        socket.emit('feedback', ['warning', 'falta caixa'])
                    }
                    else{socket.emit('feedback', ['warning', 'apenas valores positivos'])}
                    
                
             
            }
                else{
                    socket.emit('feedback', ['danger','É necessário estar logado para puxar os dados da simulação'])
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    }) 
    socket.on('emprestimo', (dados) => {
        let qnt = Number(dados)
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                        if(qnt > 0){
                            userx.balanco_patrimonial = {
                                caixa: userx.balanco_patrimonial.caixa + qnt,
                                estoque: userx.balanco_patrimonial.estoque,
                                contas_a_receber60: userx.balanco_patrimonial.contas_a_receber60,
                                contas_a_receber120: userx.balanco_patrimonial.contas_a_receber120,
                                maquinas: userx.balanco_patrimonial.maquinas,
                                depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_maquinas,
                                veiculos: userx.balanco_patrimonial.veiculos,
                                depreciacao_veiculos: userx.balanco_patrimonial.depreciacao_veiculos,
                                tributos_a_pagar_anterior: userx.balanco_patrimonial.tributos_a_pagar_anterior,
                                tributos_a_pagar_atual: userx.balanco_patrimonial.tributos_a_pagar_atual,
                                emprestimos: userx.balanco_patrimonial.emprestimos + qnt,
                                capial: userx.balanco_patrimonial.capial,
                                lucros_acumulados: userx.balanco_patrimonial.lucros_acumulados
                            }
                            /*
                            userx.fluxo_de_caixa = {

                                lucro_bruto: userx.dre.receita - userx.dre.cmv, //ok
                                contas_a_receber: userx.balanco_patrimonial.ativo.circulante.contas_a_receber,
                                contas_a_receber_recebidas: userx.fluxo_de_caixa.contas_a_receber_recebidas, //ok
                                despesas: userx.fluxo_de_caixa.despesas,//ok
                                fluxo_operacional: 0, //ok
                                fluxo_financeiro: userx.fluxo_de_caixa.fluxo_financeiro + qnt, // entra + emprestimos tomados e entra - empréstimos pagos 
                                fluxo_investimento: userx.fluxo_de_caixa.fluxo_investimento, // entra negativo tds as compras de VEICULOS e entra positivo todo o valor da venda de veiculos
                                fluxo: 0
                            
                            }
                            */
                            userx.set('divida', [(qnt+userx['divida'][0]), userx['divida'][1], userx['divida'][2]]) 
                            userx.taokeys = userx.taokeys + qnt
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id, temporario: 1}))                 
                                .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        function propuni(tipo) {
                                            if(user.somapropuni.tipo1 == tipo){
                                                return user.somapropuni.inv1
                                            }
                                            else if(user.somapropuni.tipo2 == tipo){
                                                return user.somapropuni.inv2
                                            }
                                            else{return 0}
                                        }
                                        function insumosi(s) {
                                            if(s == user.last_change.serv1){
                                                return user.last_change.insu1i
                                            }
                                            else if(s == user.last_change.serv2){
                                                return user.last_change.insu2i
                                            }
                                            else{
                                                return 0
                                            }
                                        }
                                        socket.emit('update', [
                                                                        [...user["147"],"147",propuni("147"),insumosi("147")],
                                    [...user["148"],"148",propuni("148"),insumosi("148")],
                                    [...user["149"],"149",propuni("149"),insumosi("149")],
                                    [...user["157"],"157",propuni("157"),insumosi("157")],
                                    [...user["158"],"158",propuni("158"),insumosi("158")],
                                    [...user["159"],"159",propuni("159"),insumosi("159")],
                                    [...user["257"],"257",propuni("257"),insumosi("257")],
                                    [...user["258"],"258",propuni("258"),insumosi("258")],
                                    [...user["259"],"259",propuni("259"),insumosi("259")],
                                    [...user["267"],"267",propuni("267"),insumosi("267")],
                                    [...user["268"],"268",propuni("268"),insumosi("268")],
                                    [...user["269"],"269",propuni("269"),insumosi("269")],
                                    [...user["347"],"347",propuni("347"),insumosi("347")],
                                    [...user["348"],"348",propuni("348"),insumosi("348")],
                                    [...user["349"],"349",propuni("349"),insumosi("349")],
                                    [...user["357"],"357",propuni("357"),insumosi("357")],
                                    [...user["358"],"358",propuni("358"),insumosi("358")],
                                    [...user["359"],"359",propuni("359"),insumosi("359")],
                                    [...user["367"],"367",propuni("367"),insumosi("367")],
                                    [...user["368"],"368",propuni("368"),insumosi("368")],
                                    [...user["369"],"369",propuni("369"),insumosi("369")],                                    user["taokeys"],
                                    user["frota"],
                                    user["promotores"],
                                    user["comissao"],
                                    user["distribuidores"],
                                    user["pas"],
                                    user["propaganda"],
                                    user["propagandauni"],
                                    (user["divida"][0]+user["divida"][1]+user["divida"][2]),
                                    user["turno"]]);
                                    }                  
                                })
                        .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})  
                    }
                    else{socket.emit('feedback', ['warning','apenas valores positivos'])}
            }
                else{
                    socket.emit('feedback', ['danger', 'voce precisa estar logado para puxar o state atual da simulação'])
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    }) 
    socket.on('quitar-divida', (ee) => {
        console.log(ee)
        //let qnt = Number(dados)
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                    if(userx.taokeys >= (userx['divida'][0] + userx['divida'][1] + userx['divida'][2])){
                        userx.balanco_patrimonial = {
                            caixa: userx.balanco_patrimonial.caixa - (userx['divida'][0] + userx['divida'][1] + userx['divida'][2]),
                            estoque: userx.balanco_patrimonial.estoque,
                            contas_a_receber60: userx.balanco_patrimonial.contas_a_receber60,
                            contas_a_receber120: userx.balanco_patrimonial.contas_a_receber120,
                            maquinas: userx.balanco_patrimonial.maquinas,
                            depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_maquinas,
                            veiculos: userx.balanco_patrimonial.veiculos,
                            depreciacao_veiculos: userx.balanco_patrimonial.depreciacao_veiculos,
                            tributos_a_pagar_anterior: userx.balanco_patrimonial.tributos_a_pagar_anterior,
                            tributos_a_pagar_atual: userx.balanco_patrimonial.tributos_a_pagar_atual,
                            emprestimos: userx.balanco_patrimonial.emprestimos - (userx['divida'][0] + userx['divida'][1] + userx['divida'][2]),
                            capial: userx.balanco_patrimonial.capial,
                            lucros_acumulados: userx.balanco_patrimonial.lucros_acumulados
                        }
                        userx.fluxo_de_caixa = {
                            saldo_anterior: userx.fluxo_de_caixa.saldo_anterior,
                            faturamento: userx.fluxo_de_caixa.faturamento,
                            contas_a_receber: userx.fluxo_de_caixa.contas_a_receber,
                            contas_a_receber_recebidas: userx.fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                            custo_de_servico_prestado: userx.fluxo_de_caixa.custo_de_servico_prestado,
                            emprestimos_contratados: userx.fluxo_de_caixa.emprestimos_contratados,
                            emprestimos_pagos: userx.fluxo_de_caixa.emprestimos_pagos + (userx['divida'][0] + userx['divida'][1] + userx['divida'][2]),
                            veiculos_vendidos: userx.fluxo_de_caixa.veiculos_vendidos,
                            depreciacao_de_veiculos: userx.fluxo_de_caixa.depreciacao_de_veiculos,
                            depreciacao_de_maquinas: userx.fluxo_de_caixa.depreciacao_de_maquinas,
                            veiculos_comprados: userx.fluxo_de_caixa.veiculos_comprados,
                            tributos: userx.fluxo_de_caixa.tributos,
                            promotores: userx.fluxo_de_caixa.promotores,
                            propaganda: userx.fluxo_de_caixa.propaganda,
                            pesquisas: userx.fluxo_de_caixa.pesquisas,
                            pas: userx.fluxo_de_caixa.pas,
                            uso_frota: userx.fluxo_de_caixa.uso_frota,
                            despesas_operacionais_n_planejadas: userx.fluxo_de_caixa.despesas_operacionais_n_planejadas,
                            despesas_administrativas: userx.fluxo_de_caixa.despesas_administrativas,
                            encargos_financiamento: userx.fluxo_de_caixa.encargos_financiamento,
                            maquinas: userx.fluxo_de_caixa.maquinas,
                            distribuidores: userx.fluxo_de_caixa.distribuidores
                        }
                        userx.taokeys = userx.taokeys - (userx['divida'][0] + userx['divida'][1] + userx['divida'][2])
                        userx.set('divida', [0,0,0])
    
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id, temporario: 1}))                 
                                .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        function propuni(tipo) {
                                            if(user.somapropuni.tipo1 == tipo){
                                                return user.somapropuni.inv1
                                            }
                                            else if(user.somapropuni.tipo2 == tipo){
                                                return user.somapropuni.inv2
                                            }
                                            else{return 0}
                                        }
                                        function insumosi(s) {
                                            if(s == user.last_change.serv1){
                                                return user.last_change.insu1i
                                            }
                                            else if(s == user.last_change.serv2){
                                                return user.last_change.insu2i
                                            }
                                            else{
                                                return 0
                                            }
                                        }
                                        socket.emit('update', [
                                                                        [...user["147"],"147",propuni("147"),insumosi("147")],
                                    [...user["148"],"148",propuni("148"),insumosi("148")],
                                    [...user["149"],"149",propuni("149"),insumosi("149")],
                                    [...user["157"],"157",propuni("157"),insumosi("157")],
                                    [...user["158"],"158",propuni("158"),insumosi("158")],
                                    [...user["159"],"159",propuni("159"),insumosi("159")],
                                    [...user["257"],"257",propuni("257"),insumosi("257")],
                                    [...user["258"],"258",propuni("258"),insumosi("258")],
                                    [...user["259"],"259",propuni("259"),insumosi("259")],
                                    [...user["267"],"267",propuni("267"),insumosi("267")],
                                    [...user["268"],"268",propuni("268"),insumosi("268")],
                                    [...user["269"],"269",propuni("269"),insumosi("269")],
                                    [...user["347"],"347",propuni("347"),insumosi("347")],
                                    [...user["348"],"348",propuni("348"),insumosi("348")],
                                    [...user["349"],"349",propuni("349"),insumosi("349")],
                                    [...user["357"],"357",propuni("357"),insumosi("357")],
                                    [...user["358"],"358",propuni("358"),insumosi("358")],
                                    [...user["359"],"359",propuni("359"),insumosi("359")],
                                    [...user["367"],"367",propuni("367"),insumosi("367")],
                                    [...user["368"],"368",propuni("368"),insumosi("368")],
                                    [...user["369"],"369",propuni("369"),insumosi("369")],                                    user["taokeys"],
                                    user["frota"],
                                    user["promotores"],
                                    user["comissao"],
                                    user["distribuidores"],
                                    user["pas"],
                                    user["propaganda"],
                                    user["propagandauni"],
                                    (user["divida"][0]+user["divida"][1]+user["divida"][2]),
                                    user["turno"]]);
                                    }                  
                                })
                        .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})
                          
                            }
                            else{
                                socket.emit('feedback', ['warning','voce nao tem caixa para quitar a sua divida no momento'])
                            }
                    
                
             
            }
                else{
                    socket.emit('feedback', ['danger', 'voce precisa estar logado para puxar o state atual da simulação'])
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    }) 
    socket.on('aumentar-distribuidores', (dados) => {
        let qnt = Number(dados)
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                        if(qnt > 0){
                            let novaf = userx['distribuidores'] + qnt
                            let datetime = new Date().toLocaleString('pt-BR');
                            userx.deci.push({data: datetime, acao: 'Contratação de '+qnt +' distribuidores', autor: userx.modificador})
                        
                            userx.set('distribuidores', novaf) 
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id, temporario: 1}))                 
                                .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        function propuni(tipo) {
                                            if(user.somapropuni.tipo1 == tipo){
                                                return user.somapropuni.inv1
                                            }
                                            else if(user.somapropuni.tipo2 == tipo){
                                                return user.somapropuni.inv2
                                            }
                                            else{return 0}
                                        }
                                        function insumosi(s) {
                                            if(s == user.last_change.serv1){
                                                return user.last_change.insu1i
                                            }
                                            else if(s == user.last_change.serv2){
                                                return user.last_change.insu2i
                                            }
                                            else{
                                                return 0
                                            }
                                        }
                                        socket.emit('update', [
                                                                        [...user["147"],"147",propuni("147"),insumosi("147")],
                                    [...user["148"],"148",propuni("148"),insumosi("148")],
                                    [...user["149"],"149",propuni("149"),insumosi("149")],
                                    [...user["157"],"157",propuni("157"),insumosi("157")],
                                    [...user["158"],"158",propuni("158"),insumosi("158")],
                                    [...user["159"],"159",propuni("159"),insumosi("159")],
                                    [...user["257"],"257",propuni("257"),insumosi("257")],
                                    [...user["258"],"258",propuni("258"),insumosi("258")],
                                    [...user["259"],"259",propuni("259"),insumosi("259")],
                                    [...user["267"],"267",propuni("267"),insumosi("267")],
                                    [...user["268"],"268",propuni("268"),insumosi("268")],
                                    [...user["269"],"269",propuni("269"),insumosi("269")],
                                    [...user["347"],"347",propuni("347"),insumosi("347")],
                                    [...user["348"],"348",propuni("348"),insumosi("348")],
                                    [...user["349"],"349",propuni("349"),insumosi("349")],
                                    [...user["357"],"357",propuni("357"),insumosi("357")],
                                    [...user["358"],"358",propuni("358"),insumosi("358")],
                                    [...user["359"],"359",propuni("359"),insumosi("359")],
                                    [...user["367"],"367",propuni("367"),insumosi("367")],
                                    [...user["368"],"368",propuni("368"),insumosi("368")],
                                    [...user["369"],"369",propuni("369"),insumosi("369")],                                    user["taokeys"],
                                    user["frota"],
                                    user["promotores"],
                                    user["comissao"],
                                    user["distribuidores"],
                                    user["pas"],
                                    user["propaganda"],
                                    user["propagandauni"],
                                    (user["divida"][0]+user["divida"][1]+user["divida"][2]),
                                    user["turno"]]);
        
                                    }                  
                                })
                        .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})
                          
                    }
                    else if(qnt > 0 && userx.taokeys < qnt*57600){
                        socket.emit('feedback', ['warning','falta caixa'])
                    }
                    else{socket.emit('feedback', ['warning','apenas valores positivos'])}
                    
                
             
            }
                else{
                    socket.emit('feedback', ['danger','É necessário estar logado para puxar os dados da simulação'])
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    }) 
    socket.on('diminuir-distribuidores', (dados) => {
        let qnt = Number(dados)
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                        if(qnt > 0 && userx['distribuidores'] >= qnt){
                            let novaf = userx['distribuidores'] - qnt
                            let datetime = new Date().toLocaleString('pt-BR');
                            userx.deci.push({data: datetime, acao: 'Demissão de '+qnt +' distribuidores', autor: userx.modificador})
                        
                            userx.set('distribuidores', novaf) 
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id, temporario: 1}))                 
                                .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        function propuni(tipo) {
                                            if(user.somapropuni.tipo1 == tipo){
                                                return user.somapropuni.inv1
                                            }
                                            else if(user.somapropuni.tipo2 == tipo){
                                                return user.somapropuni.inv2
                                            }
                                            else{return 0}
                                        }
                                        function insumosi(s) {
                                            if(s == user.last_change.serv1){
                                                return user.last_change.insu1i
                                            }
                                            else if(s == user.last_change.serv2){
                                                return user.last_change.insu2i
                                            }
                                            else{
                                                return 0
                                            }
                                        }
                                        socket.emit('update', [
                                                                        [...user["147"],"147",propuni("147"),insumosi("147")],
                                    [...user["148"],"148",propuni("148"),insumosi("148")],
                                    [...user["149"],"149",propuni("149"),insumosi("149")],
                                    [...user["157"],"157",propuni("157"),insumosi("157")],
                                    [...user["158"],"158",propuni("158"),insumosi("158")],
                                    [...user["159"],"159",propuni("159"),insumosi("159")],
                                    [...user["257"],"257",propuni("257"),insumosi("257")],
                                    [...user["258"],"258",propuni("258"),insumosi("258")],
                                    [...user["259"],"259",propuni("259"),insumosi("259")],
                                    [...user["267"],"267",propuni("267"),insumosi("267")],
                                    [...user["268"],"268",propuni("268"),insumosi("268")],
                                    [...user["269"],"269",propuni("269"),insumosi("269")],
                                    [...user["347"],"347",propuni("347"),insumosi("347")],
                                    [...user["348"],"348",propuni("348"),insumosi("348")],
                                    [...user["349"],"349",propuni("349"),insumosi("349")],
                                    [...user["357"],"357",propuni("357"),insumosi("357")],
                                    [...user["358"],"358",propuni("358"),insumosi("358")],
                                    [...user["359"],"359",propuni("359"),insumosi("359")],
                                    [...user["367"],"367",propuni("367"),insumosi("367")],
                                    [...user["368"],"368",propuni("368"),insumosi("368")],
                                    [...user["369"],"369",propuni("369"),insumosi("369")],                                    user["taokeys"],
                                    user["frota"],
                                    user["promotores"],
                                    user["comissao"],
                                    user["distribuidores"],
                                    user["pas"],
                                    user["propaganda"],
                                    user["propagandauni"],
                                    (user["divida"][0]+user["divida"][1]+user["divida"][2]),
                                    user["turno"]]);
        
                                    }                  
                                })
                        .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})
                          
                    }
                    else{socket.emit('feedback', ['warning', 'apenas valores positivos'])}
                    
                
             
            }
                else{
                    socket.emit('feedback', ['danger','É necessário estar logado para puxar os dados da simulação'])
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    })
    socket.on('diminuir-pas', (dados) => {
        let qnt = Math.round(Number(dados))
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                        if(qnt > 0 && userx['pas'] >= qnt){
                            let novaf = Math.round((-1)*qnt)
                            socket.emit('feedback', ['success', 'Ordem de desativação de PAS realizada para ' + qnt +' postos (serão desativados após 2 turnos)'])
                            let datetime = new Date().toLocaleString('pt-BR');
                            userx.deci.push({data: datetime, acao: 'Diminuição de '+qnt +' unidades de P.A.S.', autor: userx.modificador})
                        
                            userx.set('pas2', novaf) 
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id, temporario: 1}))                 
                                .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        function propuni(tipo) {
                                            if(user.somapropuni.tipo1 == tipo){
                                                return user.somapropuni.inv1
                                            }
                                            else if(user.somapropuni.tipo2 == tipo){
                                                return user.somapropuni.inv2
                                            }
                                            else{return 0}
                                        }
                                        function insumosi(s) {
                                            if(s == user.last_change.serv1){
                                                return user.last_change.insu1i
                                            }
                                            else if(s == user.last_change.serv2){
                                                return user.last_change.insu2i
                                            }
                                            else{
                                                return 0
                                            }
                                        }
                                        socket.emit('update', [
                                                                        [...user["147"],"147",propuni("147"),insumosi("147")],
                                    [...user["148"],"148",propuni("148"),insumosi("148")],
                                    [...user["149"],"149",propuni("149"),insumosi("149")],
                                    [...user["157"],"157",propuni("157"),insumosi("157")],
                                    [...user["158"],"158",propuni("158"),insumosi("158")],
                                    [...user["159"],"159",propuni("159"),insumosi("159")],
                                    [...user["257"],"257",propuni("257"),insumosi("257")],
                                    [...user["258"],"258",propuni("258"),insumosi("258")],
                                    [...user["259"],"259",propuni("259"),insumosi("259")],
                                    [...user["267"],"267",propuni("267"),insumosi("267")],
                                    [...user["268"],"268",propuni("268"),insumosi("268")],
                                    [...user["269"],"269",propuni("269"),insumosi("269")],
                                    [...user["347"],"347",propuni("347"),insumosi("347")],
                                    [...user["348"],"348",propuni("348"),insumosi("348")],
                                    [...user["349"],"349",propuni("349"),insumosi("349")],
                                    [...user["357"],"357",propuni("357"),insumosi("357")],
                                    [...user["358"],"358",propuni("358"),insumosi("358")],
                                    [...user["359"],"359",propuni("359"),insumosi("359")],
                                    [...user["367"],"367",propuni("367"),insumosi("367")],
                                    [...user["368"],"368",propuni("368"),insumosi("368")],
                                    [...user["369"],"369",propuni("369"),insumosi("369")],                                    user["taokeys"],
                                    user["frota"],
                                    user["promotores"],
                                    user["comissao"],
                                    user["distribuidores"],
                                    user["pas"],
                                    user["propaganda"],
                                    user["propagandauni"],
                                    (user["divida"][0]+user["divida"][1]+user["divida"][2]),
                                    user["turno"]]);
        
                                    }                  
                                })
                        .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})
                          
                    }
                    else{socket.emit('feedback', ['warning','apenas valores positivos'])}
                    
                
             
            }
                else{
                    socket.emit('feedback', ['danger', 'voce precisa estar logado para puxar o state atual da simulação'])
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    })
    socket.on('aumentar-pas', (dados) => {
        let qnt = Number(dados)
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                        if(qnt > 0){
                            let novaf = Math.round(qnt)
                            let datetime = new Date().toLocaleString('pt-BR');
                            userx.deci.push({data: datetime, acao: 'Aumento de '+qnt +' unidades de P.A.S.', autor: userx.modificador})
                        
                            userx.set('pas2', novaf) 
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id, temporario: 1}))                 
                                .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        socket.emit('feedback', ['success', 'ordem de aquisição de PAS realizada para ' + qnt +' postos (entraram em atividade após 2 turnos)'])
                                        function propuni(tipo) {
                                            if(user.somapropuni.tipo1 == tipo){
                                                return user.somapropuni.inv1
                                            }
                                            else if(user.somapropuni.tipo2 == tipo){
                                                return user.somapropuni.inv2
                                            }
                                            else{return 0}
                                        }
                                        function insumosi(s) {
                                            if(s == user.last_change.serv1){
                                                return user.last_change.insu1i
                                            }
                                            else if(s == user.last_change.serv2){
                                                return user.last_change.insu2i
                                            }
                                            else{
                                                return 0
                                            }
                                        }
                                        socket.emit('update', [
                                    [...user["147"],"147",propuni("147"),insumosi("147")],
                                    [...user["148"],"148",propuni("148"),insumosi("148")],
                                    [...user["149"],"149",propuni("149"),insumosi("149")],
                                    [...user["157"],"157",propuni("157"),insumosi("157")],
                                    [...user["158"],"158",propuni("158"),insumosi("158")],
                                    [...user["159"],"159",propuni("159"),insumosi("159")],
                                    [...user["257"],"257",propuni("257"),insumosi("257")],
                                    [...user["258"],"258",propuni("258"),insumosi("258")],
                                    [...user["259"],"259",propuni("259"),insumosi("259")],
                                    [...user["267"],"267",propuni("267"),insumosi("267")],
                                    [...user["268"],"268",propuni("268"),insumosi("268")],
                                    [...user["269"],"269",propuni("269"),insumosi("269")],
                                    [...user["347"],"347",propuni("347"),insumosi("347")],
                                    [...user["348"],"348",propuni("348"),insumosi("348")],
                                    [...user["349"],"349",propuni("349"),insumosi("349")],
                                    [...user["357"],"357",propuni("357"),insumosi("357")],
                                    [...user["358"],"358",propuni("358"),insumosi("358")],
                                    [...user["359"],"359",propuni("359"),insumosi("359")],
                                    [...user["367"],"367",propuni("367"),insumosi("367")],
                                    [...user["368"],"368",propuni("368"),insumosi("368")],
                                    [...user["369"],"369",propuni("369"),insumosi("369")],                                    user["taokeys"],
                                    user["frota"],
                                    user["promotores"],
                                    user["comissao"],
                                    user["distribuidores"],
                                    user["pas"],
                                    user["propaganda"],
                                    user["propagandauni"],
                                    (user["divida"][0]+user["divida"][1]+user["divida"][2]),
                                    user["turno"]]);
        
                                    }                  
                                })
                        .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})
                          
                    }
                    else{socket.emit('feedback', ['warning','apenas valores positivos'])}
                    
                
             
            }
                else{
                    socket.emit('feedback', ['danger','É necessário estar logado para puxar os dados da simulação'])
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    }) 
    socket.on('propaganda-unitaria', (dados) => { //fazer igual a compra de insumos esse investimento em prop uni...
        let tipo = dados[0]
        let qnt = Number(dados[1])
        
        
        if(qnt && Number.isInteger(qnt)){ 
            
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                        if(qnt > 0){
                            let datetime = new Date().toLocaleString('pt-BR');
                            userx.deci.push({data: datetime, acao: 'Investimento em propaganda no serviço '+tipo +' no valor de ' + qnt, autor: userx.modificador})
                            
                            if(userx.last_change.serv1 == tipo){
                                
                                userx.last_change = {
                                    serv1: userx.last_change.serv1,
                                    serv2: userx.last_change.serv2,
                                    insu1: userx.last_change.insu1,
                                    insu2: userx.last_change.insu2,
                                    insu2i: userx.last_change.insu2i,
                                    insu1i: userx.last_change.insu1i,
                                    prop1: qnt,
                                    prop2: userx.last_change.prop2

                                }
                            }
                            if(userx.last_change.serv2 == tipo){
                                userx.last_change = {
                                    serv1: userx.last_change.serv1,
                                    serv2: userx.last_change.serv2,
                                    insu1: userx.last_change.insu1,
                                    insu2: userx.last_change.insu2,
                                    insu2i: userx.last_change.insu2i,
                                    insu1i: userx.last_change.insu1i,
                                    prop1: userx.last_change.prop1,
                                    prop2: qnt

                                }
                            }
                            
                            //
                            userx.balanco_patrimonial = {
                                caixa: userx.balanco_patrimonial.caixa - qnt,
                                estoque: userx.balanco_patrimonial.estoque,
                                contas_a_receber60: userx.balanco_patrimonial.contas_a_receber60,
                                contas_a_receber120: userx.balanco_patrimonial.contas_a_receber120,
                                maquinas: userx.balanco_patrimonial.maquinas,
                                depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_maquinas,
                                veiculos: userx.balanco_patrimonial.veiculos,
                                depreciacao_veiculos: userx.balanco_patrimonial.depreciacao_veiculos,
                                tributos_a_pagar_anterior: userx.balanco_patrimonial.tributos_a_pagar_anterior,
                                tributos_a_pagar_atual: userx.balanco_patrimonial.tributos_a_pagar_atual,
                                emprestimos: userx.balanco_patrimonial.emprestimos,
                                capial: userx.balanco_patrimonial.capial,
                                lucros_acumulados: userx.balanco_patrimonial.lucros_acumulados - qnt
                            }
                            userx.dre = {
                                receita: userx.dre.receita,
                                csp: userx.dre.csp,
                                estoque_inicial: userx.dre.estoque_inicial,
                                custo_prestacao_servico: userx.dre.custo_prestacao_servico,
                                custo_estocagem: userx.dre.custo_estocagem,
                                custo_troca_insumos: userx.dre.custo_troca_insumos,
                                hora_extra: userx.dre.hora_extra,
                                capacidade_n_utilizada: userx.dre.capacidade_n_utilizada,
                                margem_bruta: userx.dre.margem_bruta,
                                despesas_administrativas: userx.dre.despesas_administrativas,
                                salario_promotores: userx.dre.salario_promotores,
                                comissao: userx.dre.comissao,
                                propaganda_institucional: userx.dre.propaganda_institucional,
                                propaganda_unitaria: userx.dre.propaganda_unitaria + qnt,
                                depreciacao_de_maquinas: userx.dre.depreciacao_de_maquinas,
                                encargos_financiamento: userx.dre.encargos_financiamento,
                                salario_frota: userx.dre.salario_frota,
                                manutencao_frota: userx.dre.manutencao_frota,
                                depreciacao_de_veiculos: userx.dre.depreciacao_de_veiculos,
                                frota_terceirizada: userx.dre.frota_terceirizada,
                                despesas_operacionais_n_planejadas: userx.dre.despesas_operacionais_n_planejadas,
                                pas: userx.dre.pas,
                                pesquisas: userx.dre.pesquisas,
                                tributos: userx.dre.tributos,
                                servicos: [userx.dre.servicos[0], userx.dre.servicos[1], userx.dre.servicos[2], userx.dre.servicos[3]],
                                preco_medio: userx.dre.preco_medio,
                                atendimentos: userx.dre.atendimentos,
                                insumos_em_estoque: userx.dre.insumos_em_estoque,
                                distribuidores: userx.dre.distribuidores
    
                            }
                            userx.fluxo_de_caixa = {
                                saldo_anterior: userx.fluxo_de_caixa.saldo_anterior,
                                faturamento: userx.fluxo_de_caixa.faturamento,
                                contas_a_receber: userx.fluxo_de_caixa.contas_a_receber,
                                contas_a_receber_recebidas: userx.fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                                custo_de_servico_prestado: userx.fluxo_de_caixa.custo_de_servico_prestado,
                                emprestimos_contratados: userx.fluxo_de_caixa.emprestimos_contratados,
                                emprestimos_pagos: userx.fluxo_de_caixa.emprestimos_pagos,
                                veiculos_vendidos: userx.fluxo_de_caixa.veiculos_vendidos,
                                depreciacao_de_veiculos: userx.fluxo_de_caixa.depreciacao_de_veiculos,
                                depreciacao_de_maquinas: userx.fluxo_de_caixa.depreciacao_de_maquinas,
                                veiculos_comprados: userx.fluxo_de_caixa.veiculos_comprados,
                                tributos: userx.fluxo_de_caixa.tributos,
                                promotores: userx.fluxo_de_caixa.promotores,
                                propaganda: userx.fluxo_de_caixa.propaganda + qnt,
                                pesquisas: userx.fluxo_de_caixa.pesquisas,
                                pas: userx.fluxo_de_caixa.pas,
                                uso_frota: userx.fluxo_de_caixa.uso_frota,
                                despesas_operacionais_n_planejadas: userx.fluxo_de_caixa.despesas_operacionais_n_planejadas,
                                despesas_administrativas: userx.fluxo_de_caixa.despesas_administrativas,
                                encargos_financiamento: userx.fluxo_de_caixa.encargos_financiamento,
                                maquinas: userx.fluxo_de_caixa.maquinas,
                                distribuidores: userx.fluxo_de_caixa.distribuidores
                            }
                            //if(Number(userx.somapropuni.inv1) > 0 && Number(userx.somapropuni.inv2 > 0)){
                                if(tipo == userx.somapropuni.tipo1){
                                    userx.set('somapropuni', {
                                        tipo1: userx.somapropuni.tipo1, inv1: qnt,
                                        tipo2: userx.somapropuni.tipo2, inv2: userx.somapropuni.inv2
                                    })
                                }
                                if(tipo == userx.somapropuni.tipo2){
                                    userx.set('somapropuni', {
                                        tipo1: userx.somapropuni.tipo1, inv1: userx.somapropuni.inv1,
                                        tipo2: userx.somapropuni.tipo2, inv2: qnt
                                    })
                                
                                }
                                if(tipo !== userx.somapropuni.tipo1 && tipo !== userx.somapropuni.tipo2){
                                    let ativos = []
                                    for(let i = 0; i < index.length; i++){
                                        if(userx[index[i]][1] == 1){
                                            ativos.push(index[i])
                                        }
                                    }
                                    let c1 = 0
                                    let c2 = 0
                                    for(let i = 0; i < ativos.length; i++){
                                        if(userx.somapropuni.tipo1 !== ativos[i]){
                                            c1 = c1 + 1
                                            if(c1 == ativos.length){
                                                userx.set('somapropuni', {
                                                    tipo1: tipo, inv1: qnt,
                                                    tipo2: userx.somapropuni.tipo2, inv2: userx.somapropuni.inv2
                                                })
                                            }
                                        }
                                        if(userx.somapropuni.tipo2 !== ativos[i]){
                                            c2 = c2 + 1
                                            if(c2 == ativos.length && c1 !== ativos.length){
                                                userx.set('somapropuni', {
                                                    tipo1: userx.somapropuni.tipo1, inv1: userx.somapropuni.inv1,
                                                    tipo2: tipo, inv2: qnt
                                                })
                                            }
                                        }
                                    }
                                }
                            
                            let novaf = Number(userx['propagandauni']) + qnt
                            userx.taokeys = userx.taokeys - qnt
                            userx.set('propagandauni', novaf) 
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id, temporario: 1}))                 
                                .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        socket.emit('feedback', ['success', 'investimento em propaganda unitária, no valor de:  '+ qnt +', relizado com sucesso'])
                                        function propuni(tipo) {
                                            if(user.somapropuni.tipo1 == tipo){
                                                return user.somapropuni.inv1
                                            }
                                            else if(user.somapropuni.tipo2 == tipo){
                                                return user.somapropuni.inv2
                                            }
                                            else{return 0}
                                        }
                                        function insumosi(s) {
                                            if(s == user.last_change.serv1){
                                                return user.last_change.insu1i
                                            }
                                            else if(s == user.last_change.serv2){
                                                return user.last_change.insu2i
                                            }
                                            else{
                                                return 0
                                            }
                                        }
                                        socket.emit('update', [
                                                                        [...user["147"],"147",propuni("147"),insumosi("147")],
                                    [...user["148"],"148",propuni("148"),insumosi("148")],
                                    [...user["149"],"149",propuni("149"),insumosi("149")],
                                    [...user["157"],"157",propuni("157"),insumosi("157")],
                                    [...user["158"],"158",propuni("158"),insumosi("158")],
                                    [...user["159"],"159",propuni("159"),insumosi("159")],
                                    [...user["257"],"257",propuni("257"),insumosi("257")],
                                    [...user["258"],"258",propuni("258"),insumosi("258")],
                                    [...user["259"],"259",propuni("259"),insumosi("259")],
                                    [...user["267"],"267",propuni("267"),insumosi("267")],
                                    [...user["268"],"268",propuni("268"),insumosi("268")],
                                    [...user["269"],"269",propuni("269"),insumosi("269")],
                                    [...user["347"],"347",propuni("347"),insumosi("347")],
                                    [...user["348"],"348",propuni("348"),insumosi("348")],
                                    [...user["349"],"349",propuni("349"),insumosi("349")],
                                    [...user["357"],"357",propuni("357"),insumosi("357")],
                                    [...user["358"],"358",propuni("358"),insumosi("358")],
                                    [...user["359"],"359",propuni("359"),insumosi("359")],
                                    [...user["367"],"367",propuni("367"),insumosi("367")],
                                    [...user["368"],"368",propuni("368"),insumosi("368")],
                                    [...user["369"],"369",propuni("369"),insumosi("369")],                                    user["taokeys"],
                                    user["frota"],
                                    user["promotores"],
                                    user["comissao"],
                                    user["distribuidores"],
                                    user["pas"],
                                    user["propaganda"],
                                    user["propagandauni"],
                                    (user["divida"][0]+user["divida"][1]+user["divida"][2]),
                                    user["turno"]]);
        
                                    }                  
                                })
                        .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})
                       
                    }
                    else{
                        if(userx.taokeys >= qnt){socket.emit('feedback', ['warning','Apenas valores positivos'])}
                        else{socket.emit('feedback', ['warning','Falta caixa'])}
                }
                    
                
             
            }
                else{
                    socket.emit('feedback', ['danger','É necessário estar logado para puxar os dados da simulação'])
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
        }
        else{
            socket.emit('feedback',['warning','Valor Inválido'])
        }
    })
    socket.on('aumentar-propaganda', (dados) => {
       
        let qnt = Number(dados)
        if(qnt && Number.isInteger){ 
           
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                        if(qnt > 0){
                            let datetime = new Date().toLocaleString('pt-BR');
                            userx.deci.push({data: datetime, acao: 'Investimento em propaganda institucional no valor de ' + qnt, autor: userx.modificador})
                        
                            userx.balanco_patrimonial = {
                                caixa: userx.balanco_patrimonial.caixa - qnt + userx['propaganda'],
                                estoque: userx.balanco_patrimonial.estoque,
                                contas_a_receber60: userx.balanco_patrimonial.contas_a_receber60,
                                contas_a_receber120: userx.balanco_patrimonial.contas_a_receber120,
                                maquinas: userx.balanco_patrimonial.maquinas,
                                depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_maquinas,
                                veiculos: userx.balanco_patrimonial.veiculos,
                                depreciacao_veiculos: userx.balanco_patrimonial.depreciacao_veiculos,
                                tributos_a_pagar_anterior: userx.balanco_patrimonial.tributos_a_pagar_anterior,
                                tributos_a_pagar_atual: userx.balanco_patrimonial.tributos_a_pagar_atual,
                                emprestimos: userx.balanco_patrimonial.emprestimos,
                                capial: userx.balanco_patrimonial.capial,
                                lucros_acumulados: userx.balanco_patrimonial.lucros_acumulados - qnt + userx['propaganda']
                            }
                            userx.dre = {
                                receita: userx.dre.receita,
                                csp: userx.dre.csp,
                                estoque_inicial: userx.dre.estoque_inicial,
                                custo_prestacao_servico: userx.dre.custo_prestacao_servico,
                                custo_estocagem: userx.dre.custo_estocagem,
                                custo_troca_insumos: userx.dre.custo_troca_insumos,
                                hora_extra: userx.dre.hora_extra,
                                capacidade_n_utilizada: userx.dre.capacidade_n_utilizada,
                                margem_bruta: userx.dre.margem_bruta,
                                despesas_administrativas: userx.dre.despesas_administrativas,
                                salario_promotores: userx.dre.salario_promotores,
                                comissao: userx.dre.comissao,
                                propaganda_institucional: userx.dre.propaganda_institucional + qnt - userx['propaganda'],
                                propaganda_unitaria: userx.dre.propaganda_unitaria,
                                depreciacao_de_maquinas: userx.dre.depreciacao_de_maquinas,
                                encargos_financiamento: userx.dre.encargos_financiamento,
                                salario_frota: userx.dre.salario_frota,
                                manutencao_frota: userx.dre.manutencao_frota,
                                depreciacao_de_veiculos: userx.dre.depreciacao_de_veiculos,
                                frota_terceirizada: userx.dre.frota_terceirizada,
                                despesas_operacionais_n_planejadas: userx.dre.despesas_operacionais_n_planejadas,
                                pas: userx.dre.pas,
                                pesquisas: userx.dre.pesquisas,
                                tributos: userx.dre.tributos,
                                servicos: [userx.dre.servicos[0], userx.dre.servicos[1], userx.dre.servicos[2], userx.dre.servicos[3]],
                                preco_medio: userx.dre.preco_medio,
                                atendimentos: userx.dre.atendimentos,
                                insumos_em_estoque: userx.dre.insumos_em_estoque,
                                distribuidores: userx.dre.distribuidores
    
                            }
                            userx.fluxo_de_caixa = {
                                saldo_anterior: userx.fluxo_de_caixa.saldo_anterior,
                                faturamento: userx.fluxo_de_caixa.faturamento,
                                contas_a_receber: userx.fluxo_de_caixa.contas_a_receber,
                                contas_a_receber_recebidas: userx.fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                                custo_de_servico_prestado: userx.fluxo_de_caixa.custo_de_servico_prestado,
                                emprestimos_contratados: userx.fluxo_de_caixa.emprestimos_contratados,
                                emprestimos_pagos: userx.fluxo_de_caixa.emprestimos_pagos,
                                veiculos_vendidos: userx.fluxo_de_caixa.veiculos_vendidos,
                                depreciacao_de_veiculos: userx.fluxo_de_caixa.depreciacao_de_veiculos,
                                depreciacao_de_maquinas: userx.fluxo_de_caixa.depreciacao_de_maquinas,
                                veiculos_comprados: userx.fluxo_de_caixa.veiculos_comprados,
                                tributos: userx.fluxo_de_caixa.tributos,
                                promotores: userx.fluxo_de_caixa.promotores,
                                propaganda: userx.fluxo_de_caixa.propaganda + qnt - userx['propaganda'],
                                pesquisas: userx.fluxo_de_caixa.pesquisas,
                                pas: userx.fluxo_de_caixa.pas,
                                uso_frota: userx.fluxo_de_caixa.uso_frota,
                                despesas_operacionais_n_planejadas: userx.fluxo_de_caixa.despesas_operacionais_n_planejadas,
                                despesas_administrativas: userx.fluxo_de_caixa.despesas_administrativas,
                                encargos_financiamento: userx.fluxo_de_caixa.encargos_financiamento,
                                maquinas: userx.fluxo_de_caixa.maquinas,
                                distribuidores: userx.fluxo_de_caixa.distribuidores
                            }
                            
                            let novaf = qnt
                            userx.taokeys = userx.taokeys - qnt + userx['propaganda']
                            userx.set('propaganda', novaf) 
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id, temporario: 1}))                 
                                .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        function propuni(tipo) {
                                            if(user.somapropuni.tipo1 == tipo){
                                                return user.somapropuni.inv1
                                            }
                                            else if(user.somapropuni.tipo2 == tipo){
                                                return user.somapropuni.inv2
                                            }
                                            else{return 0}
                                        }
                                        function insumosi(s) {
                                            if(s == user.last_change.serv1){
                                                return user.last_change.insu1i
                                            }
                                            else if(s == user.last_change.serv2){
                                                return user.last_change.insu2i
                                            }
                                            else{
                                                return 0
                                            }
                                        }
                                        socket.emit('update', [
                                    [...user["147"],"147",propuni("147"),insumosi("147")],
                                    [...user["148"],"148",propuni("148"),insumosi("148")],
                                    [...user["149"],"149",propuni("149"),insumosi("149")],
                                    [...user["157"],"157",propuni("157"),insumosi("157")],
                                    [...user["158"],"158",propuni("158"),insumosi("158")],
                                    [...user["159"],"159",propuni("159"),insumosi("159")],
                                    [...user["257"],"257",propuni("257"),insumosi("257")],
                                    [...user["258"],"258",propuni("258"),insumosi("258")],
                                    [...user["259"],"259",propuni("259"),insumosi("259")],
                                    [...user["267"],"267",propuni("267"),insumosi("267")],
                                    [...user["268"],"268",propuni("268"),insumosi("268")],
                                    [...user["269"],"269",propuni("269"),insumosi("269")],
                                    [...user["347"],"347",propuni("347"),insumosi("347")],
                                    [...user["348"],"348",propuni("348"),insumosi("348")],
                                    [...user["349"],"349",propuni("349"),insumosi("349")],
                                    [...user["357"],"357",propuni("357"),insumosi("357")],
                                    [...user["358"],"358",propuni("358"),insumosi("358")],
                                    [...user["359"],"359",propuni("359"),insumosi("359")],
                                    [...user["367"],"367",propuni("367"),insumosi("367")],
                                    [...user["368"],"368",propuni("368"),insumosi("368")],
                                    [...user["369"],"369",propuni("369"),insumosi("369")],
                                    user["taokeys"],
                                    user["frota"],
                                    user["promotores"],
                                    user["comissao"],
                                    user["distribuidores"],
                                    user["pas"],
                                    user["propaganda"],
                                    user["propagandauni"],
                                    (user["divida"][0]+user["divida"][1]+user["divida"][2]),
                                    user["turno"]]);
        
                                    }                  
                                })
                        .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})
                          
                    }
                    else{
                        if(userx.taokeys < qnt){
                            socket.emit('feedback', ['warning','Falta caixa'])
                        }
                        else{
                            socket.emit('feedback', ['warning','Apenas valores positivos'])
                        }
                    }
                    
                
             
            }
                else{
                    socket.emit('feedback', ['danger', 'voce precisa estar logado para puxar o state atual da simulação'])
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
        }
        else{
            socket.emit('feedback',['warning', 'Valor Inválido'])
        }
    }) 
    socket.on('checar-pas', () => {
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                    let resp = [userx['pas1'], userx['pas2']]
                    socket.emit('feedback', ['success', 'Situação dos seus postos avançados de servilo: '+resp])  
            }
                else{
                    socket.emit('feedback', ['danger', 'voce precisa estar logado para puxar o state atual da simulação'])
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    }) 
    socket.on('comissao', (dados) => {
        let qnt  = 0
        if(dados !== null){
            qnt = Number(dados.replace(",", "."))
        }
        else{
            qnt = 0
        }
        
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                            if(qnt < 100){
                            if(qnt%0.5 == 0 && qnt !== 0){
                            let datetime = new Date().toLocaleString('pt-BR');
                            userx.deci.push({data: datetime, acao: 'Comissão alterada para ' + qnt+'%', autor: userx.modificador})
                        
                            userx.set('comissao', qnt+'%')
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id, temporario: 1}))                 
                                .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        function propuni(tipo) {
                                            if(user.somapropuni.tipo1 == tipo){
                                                return user.somapropuni.inv1
                                            }
                                            else if(user.somapropuni.tipo2 == tipo){
                                                return user.somapropuni.inv2
                                            }
                                            else{return 0}
                                        }
                                        function insumosi(s) {
                                            if(s == user.last_change.serv1){
                                                return user.last_change.insu1i
                                            }
                                            else if(s == user.last_change.serv2){
                                                return user.last_change.insu2i
                                            }
                                            else{
                                                return 0
                                            }
                                        }
                                        socket.emit('update', [
                                                                        [...user["147"],"147",propuni("147"),insumosi("147")],
                                    [...user["148"],"148",propuni("148"),insumosi("148")],
                                    [...user["149"],"149",propuni("149"),insumosi("149")],
                                    [...user["157"],"157",propuni("157"),insumosi("157")],
                                    [...user["158"],"158",propuni("158"),insumosi("158")],
                                    [...user["159"],"159",propuni("159"),insumosi("159")],
                                    [...user["257"],"257",propuni("257"),insumosi("257")],
                                    [...user["258"],"258",propuni("258"),insumosi("258")],
                                    [...user["259"],"259",propuni("259"),insumosi("259")],
                                    [...user["267"],"267",propuni("267"),insumosi("267")],
                                    [...user["268"],"268",propuni("268"),insumosi("268")],
                                    [...user["269"],"269",propuni("269"),insumosi("269")],
                                    [...user["347"],"347",propuni("347"),insumosi("347")],
                                    [...user["348"],"348",propuni("348"),insumosi("348")],
                                    [...user["349"],"349",propuni("349"),insumosi("349")],
                                    [...user["357"],"357",propuni("357"),insumosi("357")],
                                    [...user["358"],"358",propuni("358"),insumosi("358")],
                                    [...user["359"],"359",propuni("359"),insumosi("359")],
                                    [...user["367"],"367",propuni("367"),insumosi("367")],
                                    [...user["368"],"368",propuni("368"),insumosi("368")],
                                    [...user["369"],"369",propuni("369"),insumosi("369")],                                    user["taokeys"],
                                    user["frota"],
                                    user["promotores"],
                                    user["comissao"],
                                    user["distribuidores"],
                                    user["pas"],
                                    user["propaganda"],
                                    user["propagandauni"],
                                    (user["divida"][0]+user["divida"][1]+user["divida"][2]),
                                    user["turno"]]);
        
                                    }                  
                                })
                        .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})
                          
                    }
                    
                    else{socket.emit('feedback', ['warning','Apenas valores inteiros ou terminados com ".5"'])}
                    
                    }

                    else{socket.emit('feedback', ['warning','Impossivel atribuir uma comissão maior que a receita'])}
                    
                    
                    
                
             
            }
                else{
                    socket.emit('feedback', ['danger','É necessário estar logado para puxar os dados da simulação'])
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    }) 
    socket.on('ativar-servico', (tipo) => {
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                    function check_1_servico_ativo() {
                        let count = 0
                        for(let s = 0; s < index.length; s++){
                            if(userx[index[s]][1] == 1){
                                count = count + 1
                            }
                        }
                        if(count == 1){
                            return true
                        }
                        else if(count == 0){
                            return true
                        }
                        else{
                            return false
                        }
                    }
                    if(userx[tipo][1] !== 3 && check_1_servico_ativo()){
                        let datetime = new Date().toLocaleString('pt-BR');
                        userx.deci.push({data: datetime, acao: 'Ativação do serviço '+tipo, autor: userx.modificador})
                            
                        if(userx.last_change.serv1 == 0){
                            userx.last_change = {
                                serv1: tipo,
                                serv2: userx.last_change.serv2,
                                insu1: userx.last_change.insu1,
                                insu2: userx.last_change.insu2,
                                insu1i: userx.last_change.insu1i,
                                insu2i: userx.last_change.insu2i,
                                prop1: userx.last_change.prop1,
                                prop2: userx.last_change.prop2
                            }
                            
                        }
                        if(userx.last_change.serv2 == 0){
                            userx.last_change = {
                                serv1: userx.last_change.serv1,
                                serv2: tipo,
                                insu1: userx.last_change.insu1,
                                insu2: userx.last_change.insu2,
                                insu1i: userx.last_change.insu1i,
                                insu2i: userx.last_change.insu2i,
                                prop1: userx.last_change.prop1,
                                prop2: userx.last_change.prop2
                            }
                        }
                        let array_dados = [0, 1, userx[tipo][2], userx[tipo][3], userx[tipo][4], userx[tipo][5], userx[tipo][6], userx[tipo][7]]
                        userx.set(tipo, array_dados) 
                        userx.save()
                            .then(() => Aluno.findOne({ _id: userx._id, temporario: 1}))                 
                            .then((user) => {
                               // console.log(userx[tipo][1] + ' <----userx(Schema trabalhado aqui)')
                               // console.log(user[tipo][1] + ' <=====user(recem pesquisado)')
                                    if(user.taokeys == userx.taokeys){
                                        function propuni(tipo) {
                                            if(user.somapropuni.tipo1 == tipo){
                                                return user.somapropuni.inv1
                                            }
                                            else if(user.somapropuni.tipo2 == tipo){
                                                return user.somapropuni.inv2
                                            }
                                            else{return 0}
                                        }
                                        function insumosi(s) {
                                            if(s == user.last_change.serv1){
                                                return user.last_change.insu1i
                                            }
                                            else if(s == user.last_change.serv2){
                                                return user.last_change.insu2i
                                            }
                                            else{
                                                return 0
                                            }
                                        }
                                        
                                    
                                        
                                        socket.emit('update', [
                                    [...user["147"],"147",propuni("147"),insumosi("147")],
                                    [...user["148"],"148",propuni("148"),insumosi("148")],
                                    [...user["149"],"149",propuni("149"),insumosi("149")],
                                    [...user["157"],"157",propuni("157"),insumosi("157")],
                                    [...user["158"],"158",propuni("158"),insumosi("158")],
                                    [...user["159"],"159",propuni("159"),insumosi("159")],
                                    [...user["257"],"257",propuni("257"),insumosi("257")],
                                    [...user["258"],"258",propuni("258"),insumosi("258")],
                                    [...user["259"],"259",propuni("259"),insumosi("259")],
                                    [...user["267"],"267",propuni("267"),insumosi("267")],
                                    [...user["268"],"268",propuni("268"),insumosi("268")],
                                    [...user["269"],"269",propuni("269"),insumosi("269")],
                                    [...user["347"],"347",propuni("347"),insumosi("347")],
                                    [...user["348"],"348",propuni("348"),insumosi("348")],
                                    [...user["349"],"349",propuni("349"),insumosi("349")],
                                    [...user["357"],"357",propuni("357"),insumosi("357")],
                                    [...user["358"],"358",propuni("358"),insumosi("358")],
                                    [...user["359"],"359",propuni("359"),insumosi("359")],
                                    [...user["367"],"367",propuni("367"),insumosi("367")],
                                    [...user["368"],"368",propuni("368"),insumosi("368")],
                                    [...user["369"],"369",propuni("369"),insumosi("369")],                                    user["taokeys"],
                                    user["frota"],
                                    user["promotores"],
                                    user["comissao"],
                                    user["distribuidores"],
                                    user["pas"],
                                    user["propaganda"],
                                    user["propagandauni"],
                                    (user["divida"][0]+user["divida"][1]+user["divida"][2]),
                                    user["turno"]]);
        
                                    }
                                    else{socket.emit('feedback', ['danger', 'Falha ao atunteticar operacao'])}                  
                                })
                        .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})

                    }
                    else{
                        if(userx[tipo][1] == 3){
                        socket.emit('feedback', ['warning', 'Esse servico esta indisponivel para ativação nesse turno'])
                        }
                        else{
                            socket.emit('feedback', ['warning', 'Apenas é permitido ter 2 SERVICOS simultaneos ATIVOS'])
                        }
                    }

                }
                else{
                    socket.emit('feedback', ['danger','É necessário estar logado para puxar os dados da simulação'])
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    }) 
    socket.on('comprar-servico', (dados) => {
        let tipo = dados[0];
        let iqnti = Number(dados[1])
        if(iqnti || iqnti == 0){ 
            let qnti = iqnti
            //console.log(' typeof qnti: '+typeof qnti)
            //console.log('qnti '+qnti)
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => { 
                    if(userx !== null){
                        if(qnti > 0 && Number.isInteger(qnti)){ 
                       
                        if(userx[tipo][1] !== 2){
                            if(userx[tipo][1] !== 3 && userx[tipo][1] !== 0){
                                if(qnti){ 
                                if(userx.last_change.serv1 == tipo){
                                    console.log('amem ' + tipo)
                                    console.log('amem ' + tipo + ' Number(userx.last_change.insu1): ' + Number(userx.last_change.insu1))
                                    console.log('amem ' + tipo + ' Number(userx[tipo][0]): ' + Number(userx[tipo][0]))
                                    userx.set(tipo, [Number(userx[tipo][0])-Number(userx.last_change.insu1), 1, userx[tipo][2], userx[tipo][3], userx[tipo][4], userx[tipo][5], userx[tipo][6], userx[tipo][7]])
                                    userx.balanco_patrimonial = {
                                        caixa: userx.balanco_patrimonial.caixa + userx.last_change.insu1*userx[tipo][2],
                                        estoque: userx.balanco_patrimonial.estoque - userx.last_change.insu1*userx[tipo][2],
                                        contas_a_receber60: userx.balanco_patrimonial.contas_a_receber60,
                                        contas_a_receber120: userx.balanco_patrimonial.contas_a_receber120,
                                        maquinas: userx.balanco_patrimonial.maquinas,
                                        depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_maquinas,
                                        veiculos: userx.balanco_patrimonial.veiculos,
                                        depreciacao_veiculos: userx.balanco_patrimonial.depreciacao_veiculos,
                                        tributos_a_pagar_anterior: userx.balanco_patrimonial.tributos_a_pagar_anterior,
                                        tributos_a_pagar_atual: userx.balanco_patrimonial.tributos_a_pagar_atual,
                                        emprestimos: userx.balanco_patrimonial.emprestimos,
                                        capial: userx.balanco_patrimonial.capial,
                                        lucros_acumulados: userx.balanco_patrimonial.lucros_acumulados
                                    }
                                    userx.taokeys = userx.taokeys + userx.last_change.insu1*userx[tipo][2]
                                    userx.last_change = {
                                        serv1: userx.last_change.serv1,
                                        serv2: userx.last_change.serv2,
                                        insu1: qnti,
                                        insu2: userx.last_change.insu2,
                                        insu1i: userx.last_change.insu1i,
                                        insu2i: userx.last_change.insu2i,
                                        prop1: userx.last_change.prop1,
                                        prop2: userx.last_change.prop2
                                    }
                                    //userx.last_change.insu1 = qnti
                                    
                                }
                                if(userx.last_change.serv2 == tipo){
                                    console.log('amem ' + tipo + ' Number(userx.last_change.insu2): ' + Number(userx.last_change.insu2))
                                    console.log('amem ' + tipo + ' Number(userx[tipo][0]): ' + Number(userx[tipo][0]))
                                    userx.set(tipo, [Number(userx[tipo][0])-Number(userx.last_change.insu2), 1, userx[tipo][2], userx[tipo][3], userx[tipo][4], userx[tipo][5], userx[tipo][6], userx[tipo][7]])
                                    userx.balanco_patrimonial = {
                                        caixa: userx.balanco_patrimonial.caixa + userx.last_change.insu2*userx[tipo][2],
                                        estoque: userx.balanco_patrimonial.estoque - userx.last_change.insu2*userx[tipo][2],
                                        contas_a_receber60: userx.balanco_patrimonial.contas_a_receber60,
                                        contas_a_receber120: userx.balanco_patrimonial.contas_a_receber120,
                                        maquinas: userx.balanco_patrimonial.maquinas,
                                        depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_maquinas,
                                        veiculos: userx.balanco_patrimonial.veiculos,
                                        depreciacao_veiculos: userx.balanco_patrimonial.depreciacao_veiculos,
                                        tributos_a_pagar_anterior: userx.balanco_patrimonial.tributos_a_pagar_anterior,
                                        tributos_a_pagar_atual: userx.balanco_patrimonial.tributos_a_pagar_atual,
                                        emprestimos: userx.balanco_patrimonial.emprestimos,
                                        capial: userx.balanco_patrimonial.capial,
                                        lucros_acumulados: userx.balanco_patrimonial.lucros_acumulados
                                    }
                                    //userx.last_change.insu2 = qnti
                                    userx.taokeys = userx.taokeys + userx.last_change.insu2*userx[tipo][2]
                                    userx.last_change = {
                                        serv1: userx.last_change.serv1,
                                        serv2: userx.last_change.serv2,
                                        insu1: userx.last_change.insu1,
                                        insu2: qnti,
                                        insu1i: userx.last_change.insu1i,
                                        insu2i: userx.last_change.insu2i,
                                        prop1: userx.last_change.prop1,
                                        prop2: userx.last_change.prop2
                                    }
                                    
                                }//esses dois if fazem que a ultima decisao de compra de insumo que seja considerada apenas
                                let datetime = new Date().toLocaleString('pt-BR');
                                userx.deci.push({data: datetime, acao: 'Alteração na ordem de compra de insumos do serviço '+tipo + ' para '+ qnti, autor: userx.modificador})
                            
                            userx.balanco_patrimonial = {
                                caixa: userx.balanco_patrimonial.caixa - qnti*userx[tipo][2],
                                estoque: userx.balanco_patrimonial.estoque + qnti*userx[tipo][2],
                                contas_a_receber60: userx.balanco_patrimonial.contas_a_receber60,
                                contas_a_receber120: userx.balanco_patrimonial.contas_a_receber120,
                                maquinas: userx.balanco_patrimonial.maquinas,
                                depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_maquinas,
                                veiculos: userx.balanco_patrimonial.veiculos,
                                depreciacao_veiculos: userx.balanco_patrimonial.depreciacao_veiculos,
                                tributos_a_pagar_anterior: userx.balanco_patrimonial.tributos_a_pagar_anterior,
                                tributos_a_pagar_atual: userx.balanco_patrimonial.tributos_a_pagar_atual,
                                emprestimos: userx.balanco_patrimonial.emprestimos,
                                capial: userx.balanco_patrimonial.capial,
                                lucros_acumulados: userx.balanco_patrimonial.lucros_acumulados
                            }
                            
                            
                           let soma_insu = Number(userx[tipo][0]) + Number(qnti)
                           let array_dados
                            if(userx[tipo][3] == 0 && userx[tipo][4] !== 0){
                                array_dados = [soma_insu, 1, userx[tipo][2], 800, userx[tipo][4], userx[tipo][5], userx[tipo][6], userx[tipo][7]]
                            }
                            else if(userx[tipo][3] == 0 && userx[tipo][4] == 0){
                                array_dados = [soma_insu, 1, userx[tipo][2], 800, 1, userx[tipo][5], userx[tipo][6], userx[tipo][7]]
                            }
                            else if(userx[tipo][3] !== 0 && userx[tipo][4] == 0){
                                array_dados = [soma_insu, 1, userx[tipo][2], userx[tipo][3], 1, userx[tipo][5], userx[tipo][6], userx[tipo][7]]
                            }
                            else{
                                array_dados = [soma_insu, 1, userx[tipo][2], userx[tipo][3], userx[tipo][4], userx[tipo][5], userx[tipo][6], userx[tipo][7]]
                            }
                        
                           userx.set(tipo, array_dados)
                           userx.taokeys = userx.taokeys - qnti*userx[tipo][2]
                           userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id, temporario: 1}))                 
                                .then((user) => {
                                 
                                    if(user.taokeys == userx.taokeys){
                                        socket.emit('feedback', ['success', 'Ordem de compra de insumos do serviço '+tipo+' alterado para ' + qnti])
                                        function propuni(tipo) {
                                            if(user.somapropuni.tipo1 == tipo){
                                                return user.somapropuni.inv1
                                            }
                                            else if(user.somapropuni.tipo2 == tipo){
                                                return user.somapropuni.inv2
                                            }
                                            else{return 0}
                                        }
                                        function insumosi(s) {
                                            if(s == user.last_change.serv1){
                                                return user.last_change.insu1i
                                            }
                                            else if(s == user.last_change.serv2){
                                                return user.last_change.insu2i
                                            }
                                            else{
                                                return 0
                                            }
                                        }
                                        socket.emit('update', [
                                                                        [...user["147"],"147",propuni("147"),insumosi("147")],
                                    [...user["148"],"148",propuni("148"),insumosi("148")],
                                    [...user["149"],"149",propuni("149"),insumosi("149")],
                                    [...user["157"],"157",propuni("157"),insumosi("157")],
                                    [...user["158"],"158",propuni("158"),insumosi("158")],
                                    [...user["159"],"159",propuni("159"),insumosi("159")],
                                    [...user["257"],"257",propuni("257"),insumosi("257")],
                                    [...user["258"],"258",propuni("258"),insumosi("258")],
                                    [...user["259"],"259",propuni("259"),insumosi("259")],
                                    [...user["267"],"267",propuni("267"),insumosi("267")],
                                    [...user["268"],"268",propuni("268"),insumosi("268")],
                                    [...user["269"],"269",propuni("269"),insumosi("269")],
                                    [...user["347"],"347",propuni("347"),insumosi("347")],
                                    [...user["348"],"348",propuni("348"),insumosi("348")],
                                    [...user["349"],"349",propuni("349"),insumosi("349")],
                                    [...user["357"],"357",propuni("357"),insumosi("357")],
                                    [...user["358"],"358",propuni("358"),insumosi("358")],
                                    [...user["359"],"359",propuni("359"),insumosi("359")],
                                    [...user["367"],"367",propuni("367"),insumosi("367")],
                                    [...user["368"],"368",propuni("368"),insumosi("368")],
                                    [...user["369"],"369",propuni("369"),insumosi("369")],                                    user["taokeys"],
                                    user["frota"],
                                    user["promotores"],
                                    user["comissao"],
                                    user["distribuidores"],
                                    user["pas"],
                                    user["propaganda"],
                                    user["propagandauni"],
                                    (user["divida"][0]+user["divida"][1]+user["divida"][2]),
                                    user["turno"]]);
                
                                            }                  
                                        })
                                .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})
                                    
                                    }
                                    else{
                                        socket.emit('feedback', ['danger', 'Valor inválido'])
                                    }
                                }
                                    else{
                                        socket.emit('feedback', ['warning', 'Esse servico nao esta ativado'])
                                    }
                            }
                            else if(userx['taokeys'] >= qnti*userx[tipo][2] && userx[tipo][1] == 2){
                                socket.emit('feedback', ['warning','Esse servico esta em espera'])
                            }
                        else{
                            socket.emit('feedback', ['warning','Falta caixa']);
                            //console.log('hlu')
                    }
                     }
                     else{
                         if(Number.isInteger(qnti)){
                        if(userx.last_change.serv1 == tipo){
                            console.log('amem ' + tipo + ' Number(userx.last_change.insu1): ' + Number(userx.last_change.insu1))
                            console.log('amem ' + tipo + ' Number(userx[tipo][0]): ' + Number(userx[tipo][0]))
                            userx.set(tipo, [Number(userx[tipo][0])-Number(userx.last_change.insu1), 1, userx[tipo][2], userx[tipo][3], userx[tipo][4], userx[tipo][5], userx[tipo][6], userx[tipo][7]])
                            userx.balanco_patrimonial = {
                                caixa: userx.balanco_patrimonial.caixa + userx.last_change.insu1*userx[tipo][2],
                                estoque: userx.balanco_patrimonial.estoque - userx.last_change.insu1*userx[tipo][2],
                                contas_a_receber60: userx.balanco_patrimonial.contas_a_receber60,
                                contas_a_receber120: userx.balanco_patrimonial.contas_a_receber120,
                                maquinas: userx.balanco_patrimonial.maquinas,
                                depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_maquinas,
                                veiculos: userx.balanco_patrimonial.veiculos,
                                depreciacao_veiculos: userx.balanco_patrimonial.depreciacao_veiculos,
                                tributos_a_pagar_anterior: userx.balanco_patrimonial.tributos_a_pagar_anterior,
                                tributos_a_pagar_atual: userx.balanco_patrimonial.tributos_a_pagar_atual,
                                emprestimos: userx.balanco_patrimonial.emprestimos,
                                capial: userx.balanco_patrimonial.capial,
                                lucros_acumulados: userx.balanco_patrimonial.lucros_acumulados
                            }
                            userx.taokeys = userx.taokeys + userx.last_change.insu1*userx[tipo][2]
                            userx.last_change = {
                                serv1: userx.last_change.serv1,
                                serv2: userx.last_change.serv2,
                                insu1: qnti,
                                insu2: userx.last_change.insu2,
                                insu1i: userx.last_change.insu1i,
                                insu2i: userx.last_change.insu2i,
                                prop1: userx.last_change.prop1,
                                prop2: userx.last_change.prop2
                                
                            }
                            //userx.last_change.insu1 = qnti
                            
                        }
                        if(userx.last_change.serv2 == tipo){
                            console.log('amem ' + tipo + ' Number(userx.last_change.insu2): ' + Number(userx.last_change.insu2))
                            console.log('amem ' + tipo + ' Number(userx[tipo][0]): ' + Number(userx[tipo][0]))
                            userx.set(tipo, [Number(userx[tipo][0])-Number(userx.last_change.insu2), 1, userx[tipo][2], userx[tipo][3], userx[tipo][4], userx[tipo][5], userx[tipo][6], userx[tipo][7]])
                            userx.balanco_patrimonial = {
                                caixa: userx.balanco_patrimonial.caixa + userx.last_change.insu2*userx[tipo][2],
                                estoque: userx.balanco_patrimonial.estoque - userx.last_change.insu2*userx[tipo][2],
                                contas_a_receber60: userx.balanco_patrimonial.contas_a_receber60,
                                contas_a_receber120: userx.balanco_patrimonial.contas_a_receber120,
                                maquinas: userx.balanco_patrimonial.maquinas,
                                depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_maquinas,
                                veiculos: userx.balanco_patrimonial.veiculos,
                                depreciacao_veiculos: userx.balanco_patrimonial.depreciacao_veiculos,
                                tributos_a_pagar_anterior: userx.balanco_patrimonial.tributos_a_pagar_anterior,
                                tributos_a_pagar_atual: userx.balanco_patrimonial.tributos_a_pagar_atual,
                                emprestimos: userx.balanco_patrimonial.emprestimos,
                                capial: userx.balanco_patrimonial.capial,
                                lucros_acumulados: userx.balanco_patrimonial.lucros_acumulados
                            }
                            //userx.last_change.insu2 = qnti
                            userx.taokeys = userx.taokeys + userx.last_change.insu2*userx[tipo][2]
                            userx.last_change = {
                                serv1: userx.last_change.serv1,
                                serv2: userx.last_change.serv2,
                                insu1: userx.last_change.insu1,
                                insu2: qnti,
                                insu1i: userx.last_change.insu1i,
                                insu2i: userx.last_change.insu2i,
                                prop1: userx.last_change.prop1,
                                prop2: userx.last_change.prop2
                            }
                            
                        }//esses dois if fazem que a ultima decisao de compra de insumo que seja considerada apenas
                        let datetime = new Date().toLocaleString('pt-BR');
                        userx.deci.push({data: datetime, acao: 'Alteração na ordem de compra de insumos do serviço '+tipo + ' para '+ qnti, autor: userx.modificador})
                        
                        userx.save()
                        .then(() => Aluno.findOne({ _id: userx._id, temporario: 1}))                 
                        .then((user) => {
                         
                            if(user.taokeys == userx.taokeys){
                                socket.emit('feedback', ['success', 'Ordem de compra de insumos para o serviço ' + tipo + ' alterada para ' + qnti])
                                function propuni(tipo) {
                                    if(user.somapropuni.tipo1 == tipo){
                                        return user.somapropuni.inv1
                                    }
                                    else if(user.somapropuni.tipo2 == tipo){
                                        return user.somapropuni.inv2
                                    }
                                    else{return 0}
                                }
                                function insumosi(s) {
                                    if(user.last_change.serv1 == s){
                                        return user.last_change.insu1i
                                    }
                                    else if(user.last_change.serv2 == s){
                                        return user.last_change.insu2i
                                    }
                                    else{
                                        return 0
                                    }
                                }
                                socket.emit('update', [
                            [...user["147"],"147",propuni("147"),insumosi("147")],
                            [...user["148"],"148",propuni("148"),insumosi("148")],
                            [...user["149"],"149",propuni("149"),insumosi("149")],
                            [...user["157"],"157",propuni("157"),insumosi("157")],
                            [...user["158"],"158",propuni("158"),insumosi("158")],
                            [...user["159"],"159",propuni("159"),insumosi("159")],
                            [...user["257"],"257",propuni("257"),insumosi("257")],
                            [...user["258"],"258",propuni("258"),insumosi("258")],
                            [...user["259"],"259",propuni("259"),insumosi("259")],
                            [...user["267"],"267",propuni("267"),insumosi("267")],
                            [...user["268"],"268",propuni("268"),insumosi("268")],
                            [...user["269"],"269",propuni("269"),insumosi("269")],
                            [...user["347"],"347",propuni("347"),insumosi("347")],
                            [...user["348"],"348",propuni("348"),insumosi("348")],
                            [...user["349"],"349",propuni("349"),insumosi("349")],
                            [...user["357"],"357",propuni("357"),insumosi("357")],
                            [...user["358"],"358",propuni("358"),insumosi("358")],
                            [...user["359"],"359",propuni("359"),insumosi("359")],
                            [...user["367"],"367",propuni("367"),insumosi("367")],
                            [...user["368"],"368",propuni("368"),insumosi("368")],
                            [...user["369"],"369",propuni("369"),insumosi("369")],
                            user["taokeys"],
                            user["frota"],
                            user["promotores"],
                            user["comissao"],
                            user["distribuidores"],
                            user["pas"],
                            user["propaganda"],
                            user["propagandauni"],
                            (user["divida"][0]+user["divida"][1]+user["divida"][2]),
                            user["turno"]]);
        
                                    }                  
                                })
                        .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})
                        //socket.emit('feedback', ['success','Ordem de compra de insumos do serviço '+tipo+' alterado para 0'])
                     }
                     else{
                         socket.emit('feedback',['warning','Valor Inválido'])
                     }
                    }
                    //console.log(user.taokeys)
                    }
                    else{
                        socket.emit('feedback', ['danger','É necessário estar logado para puxar os dados da simulação'])
                    }
            }) 
            .catch((err) => { console.log('falha na comunicacao com o banco de dados para o ' +socket.id+ " - " + err)})
        }
        else{
            socket.emit('feedback', ['warning','Valor Inválido'])
        }
    })
    socket.on('pesquisar-pas', () => {
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => { 
                    if(userx !== null){
                        if(userx.pes_p.total_pas == 0){
                        if(true){
                            let datetime = new Date().toLocaleString('pt-BR');
                            userx.deci.push({data: datetime, acao: 'Contratou pesquisa de P.A.S. para o turno ' +userx.turno, autor: userx.modificador})
                        
                        userx.balanco_patrimonial = {
                            caixa: userx.balanco_patrimonial.caixa - 2160,
                            estoque: userx.balanco_patrimonial.estoque,
                            contas_a_receber60: userx.balanco_patrimonial.contas_a_receber60,
                            contas_a_receber120: userx.balanco_patrimonial.contas_a_receber120,
                            maquinas: userx.balanco_patrimonial.maquinas,
                            depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_maquinas,
                            veiculos: userx.balanco_patrimonial.veiculos,
                            depreciacao_veiculos: userx.balanco_patrimonial.depreciacao_veiculos,
                            tributos_a_pagar_anterior: userx.balanco_patrimonial.tributos_a_pagar_anterior,
                            tributos_a_pagar_atual: userx.balanco_patrimonial.tributos_a_pagar_atual,
                            emprestimos: userx.balanco_patrimonial.emprestimos,
                            capial: userx.balanco_patrimonial.capial,
                            lucros_acumulados: userx.balanco_patrimonial.lucros_acumulados - 2160
                        }
                        userx.dre = {
                            receita: userx.dre.receita,
                            csp: userx.dre.csp,
                            estoque_inicial: userx.dre.estoque_inicial,
                            custo_prestacao_servico: userx.dre.custo_prestacao_servico,
                            custo_estocagem: userx.dre.custo_estocagem,
                            custo_troca_insumos: userx.dre.custo_troca_insumos,
                            hora_extra: userx.dre.hora_extra,
                            capacidade_n_utilizada: userx.dre.capacidade_n_utilizada,
                            margem_bruta: userx.dre.margem_bruta,
                            despesas_administrativas: userx.dre.despesas_administrativas,
                            salario_promotores: userx.dre.salario_promotores,
                            comissao: userx.dre.comissao,
                            propaganda_institucional: userx.dre.propaganda_institucional,
                            propaganda_unitaria: userx.dre.propaganda_unitaria,
                            depreciacao_de_maquinas: userx.dre.depreciacao_de_maquinas,
                            encargos_financiamento: userx.dre.encargos_financiamento,
                            salario_frota: userx.dre.salario_frota,
                            manutencao_frota: userx.dre.manutencao_frota,
                            depreciacao_de_veiculos: userx.dre.depreciacao_de_veiculos,
                            frota_terceirizada: userx.dre.frota_terceirizada,
                            despesas_operacionais_n_planejadas: userx.dre.despesas_operacionais_n_planejadas,
                            pas: userx.dre.pas,
                            pesquisas: userx.dre.pesquisas + 2160,
                            tributos: userx.dre.tributos,
                            servicos: [userx.dre.servicos[0], userx.dre.servicos[1], userx.dre.servicos[2], userx.dre.servicos[3]],
                            preco_medio: userx.dre.preco_medio,
                            atendimentos: userx.dre.atendimentos,
                            insumos_em_estoque: userx.dre.insumos_em_estoque,
                            distribuidores: userx.dre.distribuidores

                        }
                        userx.fluxo_de_caixa = {
                            saldo_anterior: userx.fluxo_de_caixa.saldo_anterior,
                            faturamento: userx.fluxo_de_caixa.faturamento,
                            contas_a_receber: userx.fluxo_de_caixa.contas_a_receber,
                            contas_a_receber_recebidas: userx.fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                            custo_de_servico_prestado: userx.fluxo_de_caixa.custo_de_servico_prestado,
                            emprestimos_contratados: userx.fluxo_de_caixa.emprestimos_contratados,
                            emprestimos_pagos: userx.fluxo_de_caixa.emprestimos_pagos,
                            veiculos_vendidos: userx.fluxo_de_caixa.veiculos_vendidos,
                            depreciacao_de_veiculos: userx.fluxo_de_caixa.depreciacao_de_veiculos,
                            depreciacao_de_maquinas: userx.fluxo_de_caixa.depreciacao_de_maquinas,
                            veiculos_comprados: userx.fluxo_de_caixa.veiculos_comprados,
                            tributos: userx.fluxo_de_caixa.tributos,
                            promotores: userx.fluxo_de_caixa.promotores,
                            propaganda: userx.fluxo_de_caixa.propaganda,
                            pesquisas: userx.fluxo_de_caixa.pesquisas + 2160,
                            pas: userx.fluxo_de_caixa.pas,
                            uso_frota: userx.fluxo_de_caixa.uso_frota,
                            despesas_operacionais_n_planejadas: userx.fluxo_de_caixa.despesas_operacionais_n_planejadas,
                            despesas_administrativas: userx.fluxo_de_caixa.despesas_administrativas,
                            encargos_financiamento: userx.fluxo_de_caixa.encargos_financiamento,
                            maquinas: userx.fluxo_de_caixa.maquinas,
                            distribuidores: userx.fluxo_de_caixa.distribuidores
                        }
                    
                           userx.taokeys = userx.taokeys - 2160
                           userx['npesquisas'] = userx['npesquisas'] + 1
                           userx.pes_p = {
                                modelos_oferecidos: userx.pes_p.modelos_oferecidos,
                                total_pas: 1,
                                total_participacao_modelos: userx.pes_p.total_participacao_modelos,
                                total_distribuidores: userx.pes_p.total_distribuidores
                           } 
                           //console.log(user.taokeys)
                           userx.save()
                            .then(() => {
                                Data.findOne({ativo: 1, instancia: userx.instancia})
                                    .then((dados) => {
                                        if(dados !== null){
                                        socket.emit('feedback', ['success', '>> Encomenda de pesquisa de PAS realizada com sucesso.'])
                                        //socket.emit('resposta-pesquisa', 'Ultima encomenda: Total P.A.S.')
                                        function propuni(tipo) {
                                            if(userx.somapropuni.tipo1 == tipo){
                                                return userx.somapropuni.inv1
                                            }
                                            else if(userx.somapropuni.tipo2 == tipo){
                                                return userx.somapropuni.inv2
                                            }
                                            else{return 0}
                                        }
                                        function insumosi(s) {
                                            if(userx.last_change.serv1 == s){
                                                return userx.last_change.insu1i
                                            }
                                            else if(userx.last_change.serv2 == s){
                                                return userx.last_change.insu2i
                                            }
                                            else{
                                                return 0
                                            }
                                        }
                                        socket.emit('update', [
                                    [...userx["147"],"147",propuni("147"),insumosi("147")],
                                    [...userx["148"],"148",propuni("148"),insumosi("148")],
                                    [...userx["149"],"149",propuni("149"),insumosi("149")],
                                    [...userx["157"],"157",propuni("157"),insumosi("157")],
                                    [...userx["158"],"158",propuni("158"),insumosi("158")],
                                    [...userx["159"],"159",propuni("159"),insumosi("159")],
                                    [...userx["257"],"257",propuni("257"),insumosi("257")],
                                    [...userx["258"],"258",propuni("258"),insumosi("258")],
                                    [...userx["259"],"259",propuni("259"),insumosi("259")],
                                    [...userx["267"],"267",propuni("267"),insumosi("267")],
                                    [...userx["268"],"268",propuni("268"),insumosi("268")],
                                    [...userx["269"],"269",propuni("269"),insumosi("269")],
                                    [...userx["347"],"347",propuni("347"),insumosi("347")],
                                    [...userx["348"],"348",propuni("348"),insumosi("348")],
                                    [...userx["349"],"349",propuni("349"),insumosi("349")],
                                    [...userx["357"],"357",propuni("357"),insumosi("357")],
                                    [...userx["358"],"358",propuni("358"),insumosi("358")],
                                    [...userx["359"],"359",propuni("359"),insumosi("359")],
                                    [...userx["367"],"367",propuni("367"),insumosi("367")],
                                    [...userx["368"],"368",propuni("368"),insumosi("368")],
                                    [...userx["369"],"369",propuni("369"),insumosi("369")],
                                    userx["taokeys"],
                                    userx["frota"],
                                    userx["promotores"],
                                    userx["comissao"],
                                    userx["distribuidores"],
                                    userx["pas"],
                                    userx["propaganda"],
                                    userx["propagandauni"],
                                    (userx["divida"][0]+userx["divida"][1]+userx["divida"][2]),
                                    userx["turno"]]);
                                    }
                                    else{
                                        socket.emit('feedback', ['danger','>> Voce nao pode realizar pesquisas ate que o administrador inicie o turno.'])
                                    }
                                    })
                                    .catch((err) => {console.log(err)})

                            })
                            .catch((err) => {console.log('falha em salvar transacao por pesquisa n 307' + err)})
                            }

                        else{
                            socket.emit('feedback', ['warning','falta caixa']);
                            //console.log('hlu')
                    }
                    //console.log(user.taokeys)
                    }
                    else{
                        socket.emit('feedback', ['warning', '>> Sua cooperativa ja encomendou essa pesquisa.'])
                    }
                    }
                    else{
                        socket.emit('feedback', ['danger','É necessário estar logado para puxar os dados da simulação'])

                    }
            }) 
            .catch(() => { console.log('falha na comunicacao com o banco de dados para o ' +socket.id)
    })
    }) 
    socket.on('pesquisar-distribuidores', () => {
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => { 
                    if(userx !== null){
                        if(userx.pes_p.total_distribuidores == 0){
                        
                        
                        if(true){
                            let datetime = new Date().toLocaleString('pt-BR');
                            userx.deci.push({data: datetime, acao: 'Contratou pesquisa de total de distribuidores para o turno ' +userx.turno, autor: userx.modificador})
                        
                            userx.balanco_patrimonial = {
                                caixa: userx.balanco_patrimonial.caixa - 2160,
                                estoque: userx.balanco_patrimonial.estoque,
                                contas_a_receber60: userx.balanco_patrimonial.contas_a_receber60,
                                contas_a_receber120: userx.balanco_patrimonial.contas_a_receber120,
                                maquinas: userx.balanco_patrimonial.maquinas,
                                depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_maquinas,
                                veiculos: userx.balanco_patrimonial.veiculos,
                                depreciacao_veiculos: userx.balanco_patrimonial.depreciacao_veiculos,
                                tributos_a_pagar_anterior: userx.balanco_patrimonial.tributos_a_pagar_anterior,
                                tributos_a_pagar_atual: userx.balanco_patrimonial.tributos_a_pagar_atual,
                                emprestimos: userx.balanco_patrimonial.emprestimos,
                                capial: userx.balanco_patrimonial.capial,
                                lucros_acumulados: userx.balanco_patrimonial.lucros_acumulados - 2160
                            }
                            userx.dre = {
                                receita: userx.dre.receita,
                                csp: userx.dre.csp,
                                estoque_inicial: userx.dre.estoque_inicial,
                                custo_prestacao_servico: userx.dre.custo_prestacao_servico,
                                custo_estocagem: userx.dre.custo_estocagem,
                                custo_troca_insumos: userx.dre.custo_troca_insumos,
                                hora_extra: userx.dre.hora_extra,
                                capacidade_n_utilizada: userx.dre.capacidade_n_utilizada,
                                margem_bruta: userx.dre.margem_bruta,
                                despesas_administrativas: userx.dre.despesas_administrativas,
                                salario_promotores: userx.dre.salario_promotores,
                                comissao: userx.dre.comissao,
                                propaganda_institucional: userx.dre.propaganda_institucional,
                                propaganda_unitaria: userx.dre.propaganda_unitaria,
                                depreciacao_de_maquinas: userx.dre.depreciacao_de_maquinas,
                                encargos_financiamento: userx.dre.encargos_financiamento,
                                salario_frota: userx.dre.salario_frota,
                                manutencao_frota: userx.dre.manutencao_frota,
                                depreciacao_de_veiculos: userx.dre.depreciacao_de_veiculos,
                                frota_terceirizada: userx.dre.frota_terceirizada,
                                despesas_operacionais_n_planejadas: userx.dre.despesas_operacionais_n_planejadas,
                                pas: userx.dre.pas,
                                pesquisas: userx.dre.pesquisas + 2160,
                                tributos: userx.dre.tributos,
                                servicos: [userx.dre.servicos[0], userx.dre.servicos[1], userx.dre.servicos[2], userx.dre.servicos[3]],
                                preco_medio: userx.dre.preco_medio,
                                atendimentos: userx.dre.atendimentos,
                                insumos_em_estoque: userx.dre.insumos_em_estoque,
                                distribuidores: userx.dre.distribuidores
    
                            }
                            userx.fluxo_de_caixa = {
                                saldo_anterior: userx.fluxo_de_caixa.saldo_anterior,
                                faturamento: userx.fluxo_de_caixa.faturamento,
                                contas_a_receber: userx.fluxo_de_caixa.contas_a_receber,
                                contas_a_receber_recebidas: userx.fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                                custo_de_servico_prestado: userx.fluxo_de_caixa.custo_de_servico_prestado,
                                emprestimos_contratados: userx.fluxo_de_caixa.emprestimos_contratados,
                                emprestimos_pagos: userx.fluxo_de_caixa.emprestimos_pagos,
                                veiculos_vendidos: userx.fluxo_de_caixa.veiculos_vendidos,
                                depreciacao_de_veiculos: userx.fluxo_de_caixa.depreciacao_de_veiculos,
                                depreciacao_de_maquinas: userx.fluxo_de_caixa.depreciacao_de_maquinas,
                                veiculos_comprados: userx.fluxo_de_caixa.veiculos_comprados,
                                tributos: userx.fluxo_de_caixa.tributos,
                                promotores: userx.fluxo_de_caixa.promotores,
                                propaganda: userx.fluxo_de_caixa.propaganda,
                                pesquisas: userx.fluxo_de_caixa.pesquisas + 2160,
                                pas: userx.fluxo_de_caixa.pas,
                                uso_frota: userx.fluxo_de_caixa.uso_frota,
                                despesas_operacionais_n_planejadas: userx.fluxo_de_caixa.despesas_operacionais_n_planejadas,
                                despesas_administrativas: userx.fluxo_de_caixa.despesas_administrativas,
                                encargos_financiamento: userx.fluxo_de_caixa.encargos_financiamento,
                                maquinas: userx.fluxo_de_caixa.maquinas,
                                distribuidores: userx.fluxo_de_caixa.distribuidores
                            }
                           //console.log(user.taokeys + " <====")
                           userx.taokeys = userx.taokeys - 2160
                           userx['npesquisas'] = userx['npesquisas'] + 1
                           userx.pes_p = {
                            modelos_oferecidos: userx.pes_p.modelos_oferecidos,
                            total_pas: userx.pes_p.total_pas,
                            total_participacao_modelos: userx.pes_p.total_participacao_modelos,
                            total_distribuidores: 1
                            }  
                           //console.log(user.taokeys)
                           userx.save()
                            .then(() => {
                                Data.findOne({ativo: 1, instancia: userx.instancia})
                                    .then((dados) => {
                                        if(dados !== null){
                                        socket.emit('feedback', ['success', '>> Encomenda de pesquisa de DISTRIBUIDORES realizada com sucesso.'])
                                        //socket.emit('resposta-pesquisa', 'Ultima encomenda: Distribuidores')
                                        function propuni(tipo) {
                                            if(userx.somapropuni.tipo1 == tipo){
                                                return userx.somapropuni.inv1
                                            }
                                            else if(userx.somapropuni.tipo2 == tipo){
                                                return userx.somapropuni.inv2
                                            }
                                            else{return 0}
                                        }
                                        function insumosi(s) {
                                            if(userx.last_change.serv1 == s){
                                                return userx.last_change.insu1i
                                            }
                                            else if(userx.last_change.serv2 == s){
                                                return userx.last_change.insu2i
                                            }
                                            else{
                                                return 0
                                            }
                                        }
                                        socket.emit('update', [
                                    [...userx["147"],"147",propuni("147"),insumosi("147")],
                                    [...userx["148"],"148",propuni("148"),insumosi("148")],
                                    [...userx["149"],"149",propuni("149"),insumosi("149")],
                                    [...userx["157"],"157",propuni("157"),insumosi("157")],
                                    [...userx["158"],"158",propuni("158"),insumosi("158")],
                                    [...userx["159"],"159",propuni("159"),insumosi("159")],
                                    [...userx["257"],"257",propuni("257"),insumosi("257")],
                                    [...userx["258"],"258",propuni("258"),insumosi("258")],
                                    [...userx["259"],"259",propuni("259"),insumosi("259")],
                                    [...userx["267"],"267",propuni("267"),insumosi("267")],
                                    [...userx["268"],"268",propuni("268"),insumosi("268")],
                                    [...userx["269"],"269",propuni("269"),insumosi("269")],
                                    [...userx["347"],"347",propuni("347"),insumosi("347")],
                                    [...userx["348"],"348",propuni("348"),insumosi("348")],
                                    [...userx["349"],"349",propuni("349"),insumosi("349")],
                                    [...userx["357"],"357",propuni("357"),insumosi("357")],
                                    [...userx["358"],"358",propuni("358"),insumosi("358")],
                                    [...userx["359"],"359",propuni("359"),insumosi("359")],
                                    [...userx["367"],"367",propuni("367"),insumosi("367")],
                                    [...userx["368"],"368",propuni("368"),insumosi("368")],
                                    [...userx["369"],"369",propuni("369"),insumosi("369")],
                                    userx["taokeys"],
                                    userx["frota"],
                                    userx["promotores"],
                                    userx["comissao"],
                                    userx["distribuidores"],
                                    userx["pas"],
                                    userx["propaganda"],
                                    userx["propagandauni"],
                                    (userx["divida"][0]+userx["divida"][1]+userx["divida"][2]),
                                    userx["turno"]]);
                                        }
                else{
                    socket.emit('feedback', ['danger', 'Espere o inicio do turno para realizar essa ação'])
                }
                                    })

                            })
                            .catch((err) => {console.log('falha em salvar transacao por pesquisa n 307' + err)})
                            }

                        else{
                            socket.emit('feedback', ['warning','falta caixa']);
                            //console.log('hlu')
                    }
                    //console.log(user.taokeys)
                    }
                    else{
                        socket.emit('feedback', ['warning', '>> Essa pesquisa ja foi encomendada.'])
                    }
                    }
                    else{
                        socket.emit('feedback', ['danger','É necessário estar logado para puxar os dados da simulação'])

                    }
            }) 
            .catch(() => { console.log('falha na comunicacao com o banco de dados para o ' +socket.id)
    })
    }) 
    socket.on('pesquisar-participacao-servicos', () => {
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => { 
                    if(userx !== null){
                        
                        //console.log(user.taokeys + ' ccccccccccccccc');
                        if(userx.pes_p.total_participacao_modelos !== 1){
                            let datetime = new Date().toLocaleString('pt-BR');
                            userx.deci.push({data: datetime, acao: 'Contratou pesquisa de participação da concorrência para o turno '+ userx.turno, autor: userx.modificador})
                        
                 
                            userx.balanco_patrimonial = {
                                caixa: userx.balanco_patrimonial.caixa - 10800,
                                estoque: userx.balanco_patrimonial.estoque,
                                contas_a_receber60: userx.balanco_patrimonial.contas_a_receber60,
                                contas_a_receber120: userx.balanco_patrimonial.contas_a_receber120,
                                maquinas: userx.balanco_patrimonial.maquinas,
                                depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_maquinas,
                                veiculos: userx.balanco_patrimonial.veiculos,
                                depreciacao_veiculos: userx.balanco_patrimonial.depreciacao_veiculos,
                                tributos_a_pagar_anterior: userx.balanco_patrimonial.tributos_a_pagar_anterior,
                                tributos_a_pagar_atual: userx.balanco_patrimonial.tributos_a_pagar_atual,
                                emprestimos: userx.balanco_patrimonial.emprestimos,
                                capial: userx.balanco_patrimonial.capial,
                                lucros_acumulados: userx.balanco_patrimonial.lucros_acumulados - 10800
                            }
                            userx.dre = {
                                receita: userx.dre.receita,
                                csp: userx.dre.csp,
                                estoque_inicial: userx.dre.estoque_inicial,
                                custo_prestacao_servico: userx.dre.custo_prestacao_servico,
                                custo_estocagem: userx.dre.custo_estocagem,
                                custo_troca_insumos: userx.dre.custo_troca_insumos,
                                hora_extra: userx.dre.hora_extra,
                                capacidade_n_utilizada: userx.dre.capacidade_n_utilizada,
                                margem_bruta: userx.dre.margem_bruta,
                                despesas_administrativas: userx.dre.despesas_administrativas,
                                salario_promotores: userx.dre.salario_promotores,
                                comissao: userx.dre.comissao,
                                propaganda_institucional: userx.dre.propaganda_institucional,
                                propaganda_unitaria: userx.dre.propaganda_unitaria,
                                depreciacao_de_maquinas: userx.dre.depreciacao_de_maquinas,
                                encargos_financiamento: userx.dre.encargos_financiamento,
                                salario_frota: userx.dre.salario_frota,
                                manutencao_frota: userx.dre.manutencao_frota,
                                depreciacao_de_veiculos: userx.dre.depreciacao_de_veiculos,
                                frota_terceirizada: userx.dre.frota_terceirizada,
                                despesas_operacionais_n_planejadas: userx.dre.despesas_operacionais_n_planejadas,
                                pas: userx.dre.pas,
                                pesquisas: userx.dre.pesquisas + 10800,
                                tributos: userx.dre.tributos,
                                servicos: [userx.dre.servicos[0], userx.dre.servicos[1], userx.dre.servicos[2], userx.dre.servicos[3]],
                                preco_medio: userx.dre.preco_medio,
                                atendimentos: userx.dre.atendimentos,
                                insumos_em_estoque: userx.dre.insumos_em_estoque,
                                distribuidores: userx.dre.distribuidores
    
                            }
                            userx.fluxo_de_caixa = {
                                saldo_anterior: userx.fluxo_de_caixa.saldo_anterior,
                                faturamento: userx.fluxo_de_caixa.faturamento,
                                contas_a_receber: userx.fluxo_de_caixa.contas_a_receber,
                                contas_a_receber_recebidas: userx.fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                                custo_de_servico_prestado: userx.fluxo_de_caixa.custo_de_servico_prestado,
                                emprestimos_contratados: userx.fluxo_de_caixa.emprestimos_contratados,
                                emprestimos_pagos: userx.fluxo_de_caixa.emprestimos_pagos,
                                veiculos_vendidos: userx.fluxo_de_caixa.veiculos_vendidos,
                                depreciacao_de_veiculos: userx.fluxo_de_caixa.depreciacao_de_veiculos,
                                depreciacao_de_maquinas: userx.fluxo_de_caixa.depreciacao_de_maquinas,
                                veiculos_comprados: userx.fluxo_de_caixa.veiculos_comprados,
                                tributos: userx.fluxo_de_caixa.tributos,
                                promotores: userx.fluxo_de_caixa.promotores,
                                propaganda: userx.fluxo_de_caixa.propaganda,
                                pesquisas: userx.fluxo_de_caixa.pesquisas + 10800,
                                pas: userx.fluxo_de_caixa.pas,
                                uso_frota: userx.fluxo_de_caixa.uso_frota,
                                despesas_operacionais_n_planejadas: userx.fluxo_de_caixa.despesas_operacionais_n_planejadas,
                                despesas_administrativas: userx.fluxo_de_caixa.despesas_administrativas,
                                encargos_financiamento: userx.fluxo_de_caixa.encargos_financiamento,
                                maquinas: userx.fluxo_de_caixa.maquinas,
                                distribuidores: userx.fluxo_de_caixa.distribuidores
                            }
                           
                        
                           userx.taokeys = userx.taokeys - 10800
                           userx['npesquisas'] = userx['npesquisas'] + 1
                           //userx.pes_p.total_participacao_modelos = 1
                           userx.pes_p = {
                            modelos_oferecidos: userx.pes_p.modelos_oferecidos,
                            total_pas: userx.pes_p.total_pas,
                            total_participacao_modelos: 1,
                            total_distribuidores: userx.pes_p.total_distribuidores
                       }
                           
                           
                           //console.log(user.taokeys)
                           userx.save()
                            .then(() => {
                                socket.emit('feedback', ['success', '>> Encomenda de pesquisa de PARTICIPAÇÃO DE SERVIÇOS realizada com sucesso.'])
                                        function propuni(tipo) {
                                            if(userx.somapropuni.tipo1 == tipo){
                                                return userx.somapropuni.inv1
                                            }
                                            else if(userx.somapropuni.tipo2 == tipo){
                                                return userx.somapropuni.inv2
                                            }
                                            else{return 0}
                                        }
                                        function insumosi(s) {
                                            if(userx.last_change.serv1 == s){
                                                return userx.last_change.insu1i
                                            }
                                            else if(userx.last_change.serv2 == s){
                                                return userx.last_change.insu2i
                                            }
                                            else{
                                                return 0
                                            }
                                        }
                                        socket.emit('update', [
                                    [...userx["147"],"147",propuni("147"),insumosi("147")],
                                    [...userx["148"],"148",propuni("148"),insumosi("148")],
                                    [...userx["149"],"149",propuni("149"),insumosi("149")],
                                    [...userx["157"],"157",propuni("157"),insumosi("157")],
                                    [...userx["158"],"158",propuni("158"),insumosi("158")],
                                    [...userx["159"],"159",propuni("159"),insumosi("159")],
                                    [...userx["257"],"257",propuni("257"),insumosi("257")],
                                    [...userx["258"],"258",propuni("258"),insumosi("258")],
                                    [...userx["259"],"259",propuni("259"),insumosi("259")],
                                    [...userx["267"],"267",propuni("267"),insumosi("267")],
                                    [...userx["268"],"268",propuni("268"),insumosi("268")],
                                    [...userx["269"],"269",propuni("269"),insumosi("269")],
                                    [...userx["347"],"347",propuni("347"),insumosi("347")],
                                    [...userx["348"],"348",propuni("348"),insumosi("348")],
                                    [...userx["349"],"349",propuni("349"),insumosi("349")],
                                    [...userx["357"],"357",propuni("357"),insumosi("357")],
                                    [...userx["358"],"358",propuni("358"),insumosi("358")],
                                    [...userx["359"],"359",propuni("359"),insumosi("359")],
                                    [...userx["367"],"367",propuni("367"),insumosi("367")],
                                    [...userx["368"],"368",propuni("368"),insumosi("368")],
                                    [...userx["369"],"369",propuni("369"),insumosi("369")],
                                    userx["taokeys"],
                                    userx["frota"],
                                    userx["promotores"],
                                    userx["comissao"],
                                    userx["distribuidores"],
                                    userx["pas"],
                                    userx["propaganda"],
                                    userx["propagandauni"],
                                    (userx["divida"][0]+userx["divida"][1]+userx["divida"][2]),
                                    userx["turno"]]);
            
                                    

                            })
                            .catch((err) => {console.log('falha em salvar transacao por pesquisa n 307' + err)})
                            
                            
                            
                           
                            
                        } 
                        else{
                            if(userx.pes_p.total_participacao_modelos !== 1){
                                socket.emit('feedback', ['warning','Falta caixa']);
                            }
                            else{
                                socket.emit('feedback', ['warning','Essa pesquisa ja foi contratada.']);
                            }
                            //console.log('hlu')
                    }
                    //console.log(user.taokeys)
                    }
                    else{
                        socket.emit('feedback', ['danger','É necessário estar logado para puxar os dados da simulação'])

                    }
            }) 
            .catch((err) => { console.log('falha na comunicacao com o banco de dados para o ' +socket.id + ' ps: ' + err)
    })
    }) 
    socket.on('pesquisar-servicos-oferecidos-concorrencia', () => {
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => { 
                    if(userx !== null){
                        if(userx.pes_p.modelos_oferecidos == 0){
                        //console.log(user.taokeys + ' ccccccccccccccc');
                        if(true){
                            let datetime = new Date().toLocaleString('pt-BR');
                            userx.deci.push({data: datetime, acao: 'Contratou pesquisa dos serviços oferecidos pelo mercado para o turno ' +userx.turno, autor: userx.modificador})
                        
                            userx.balanco_patrimonial = {
                                caixa: userx.balanco_patrimonial.caixa - 2160,
                                estoque: userx.balanco_patrimonial.estoque,
                                contas_a_receber60: userx.balanco_patrimonial.contas_a_receber60,
                                contas_a_receber120: userx.balanco_patrimonial.contas_a_receber120,
                                maquinas: userx.balanco_patrimonial.maquinas,
                                depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_maquinas,
                                veiculos: userx.balanco_patrimonial.veiculos,
                                depreciacao_veiculos: userx.balanco_patrimonial.depreciacao_veiculos,
                                tributos_a_pagar_anterior: userx.balanco_patrimonial.tributos_a_pagar_anterior,
                                tributos_a_pagar_atual: userx.balanco_patrimonial.tributos_a_pagar_atual,
                                emprestimos: userx.balanco_patrimonial.emprestimos,
                                capial: userx.balanco_patrimonial.capial,
                                lucros_acumulados: userx.balanco_patrimonial.lucros_acumulados - 2160
                            }
                            userx.dre = {
                                receita: userx.dre.receita,
                                csp: userx.dre.csp,
                                estoque_inicial: userx.dre.estoque_inicial,
                                custo_prestacao_servico: userx.dre.custo_prestacao_servico,
                                custo_estocagem: userx.dre.custo_estocagem,
                                custo_troca_insumos: userx.dre.custo_troca_insumos,
                                hora_extra: userx.dre.hora_extra,
                                capacidade_n_utilizada: userx.dre.capacidade_n_utilizada,
                                margem_bruta: userx.dre.margem_bruta,
                                despesas_administrativas: userx.dre.despesas_administrativas,
                                salario_promotores: userx.dre.salario_promotores,
                                comissao: userx.dre.comissao,
                                propaganda_institucional: userx.dre.propaganda_institucional,
                                propaganda_unitaria: userx.dre.propaganda_unitaria,
                                depreciacao_de_maquinas: userx.dre.depreciacao_de_maquinas,
                                encargos_financiamento: userx.dre.encargos_financiamento,
                                salario_frota: userx.dre.salario_frota,
                                manutencao_frota: userx.dre.manutencao_frota,
                                depreciacao_de_veiculos: userx.dre.depreciacao_de_veiculos,
                                frota_terceirizada: userx.dre.frota_terceirizada,
                                despesas_operacionais_n_planejadas: userx.dre.despesas_operacionais_n_planejadas,
                                pas: userx.dre.pas,
                                pesquisas: userx.dre.pesquisas + 2160,
                                tributos: userx.dre.tributos,
                                servicos: [userx.dre.servicos[0], userx.dre.servicos[1], userx.dre.servicos[2], userx.dre.servicos[3]],
                                preco_medio: userx.dre.preco_medio,
                                atendimentos: userx.dre.atendimentos,
                                insumos_em_estoque: userx.dre.insumos_em_estoque,
                                distribuidores: userx.dre.distribuidores
    
                            }
                            userx.fluxo_de_caixa = {
                                saldo_anterior: userx.fluxo_de_caixa.saldo_anterior,
                                faturamento: userx.fluxo_de_caixa.faturamento,
                                contas_a_receber: userx.fluxo_de_caixa.contas_a_receber,
                                contas_a_receber_recebidas: userx.fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                                custo_de_servico_prestado: userx.fluxo_de_caixa.custo_de_servico_prestado,
                                emprestimos_contratados: userx.fluxo_de_caixa.emprestimos_contratados,
                                emprestimos_pagos: userx.fluxo_de_caixa.emprestimos_pagos,
                                veiculos_vendidos: userx.fluxo_de_caixa.veiculos_vendidos,
                                depreciacao_de_veiculos: userx.fluxo_de_caixa.depreciacao_de_veiculos,
                                depreciacao_de_maquinas: userx.fluxo_de_caixa.depreciacao_de_maquinas,
                                veiculos_comprados: userx.fluxo_de_caixa.veiculos_comprados,
                                tributos: userx.fluxo_de_caixa.tributos,
                                promotores: userx.fluxo_de_caixa.promotores,
                                propaganda: userx.fluxo_de_caixa.propaganda,
                                pesquisas: userx.fluxo_de_caixa.pesquisas + 2160,
                                pas: userx.fluxo_de_caixa.pas,
                                uso_frota: userx.fluxo_de_caixa.uso_frota,
                                despesas_operacionais_n_planejadas: userx.fluxo_de_caixa.despesas_operacionais_n_planejadas,
                                despesas_administrativas: userx.fluxo_de_caixa.despesas_administrativas,
                                encargos_financiamento: userx.fluxo_de_caixa.encargos_financiamento,
                                maquinas: userx.fluxo_de_caixa.maquinas,
                                distribuidores: userx.fluxo_de_caixa.distribuidores
                            }
                           //console.log(user.taokeys + " <====")
                           userx.taokeys = userx.taokeys - 2160
                           userx['npesquisas'] = userx['npesquisas'] + 1
                           userx.pes_p = {
                            modelos_oferecidos: 1,
                            total_pas: userx.pes_p.total_pas,
                            total_participacao_modelos: userx.pes_p.total_participacao_modelos,
                            total_distribuidores: userx.pes_p.total_distribuidores
                       }  
                           //console.log(user.taokeys)
                           userx.save()
                            .then(() => {
                                socket.emit('feedback', ['success', '>> Encomenda de pesquisa de SERVIÇOS OFERECIDOS NO MERCADO realizada com sucesso.'])
                                //socket.emit('resposta-pesquisa', 'Ultima encomenda: Modelos no Mercado')
                                        function propuni(tipo) {
                                            if(userx.somapropuni.tipo1 == tipo){
                                                return userx.somapropuni.inv1
                                            }
                                            else if(userx.somapropuni.tipo2 == tipo){
                                                return userx.somapropuni.inv2
                                            }
                                            else{return 0}
                                        }
                                        function insumosi(s) {
                                            if(userx.last_change.serv1 == s){
                                                return userx.last_change.insu1i
                                            }
                                            else if(userx.last_change.serv2 == s){
                                                return userx.last_change.insu2i
                                            }
                                            else{
                                                return 0
                                            }
                                        }
                                        socket.emit('update', [
                                    [...userx["147"],"147",propuni("147"),insumosi("147")],
                                    [...userx["148"],"148",propuni("148"),insumosi("148")],
                                    [...userx["149"],"149",propuni("149"),insumosi("149")],
                                    [...userx["157"],"157",propuni("157"),insumosi("157")],
                                    [...userx["158"],"158",propuni("158"),insumosi("158")],
                                    [...userx["159"],"159",propuni("159"),insumosi("159")],
                                    [...userx["257"],"257",propuni("257"),insumosi("257")],
                                    [...userx["258"],"258",propuni("258"),insumosi("258")],
                                    [...userx["259"],"259",propuni("259"),insumosi("259")],
                                    [...userx["267"],"267",propuni("267"),insumosi("267")],
                                    [...userx["268"],"268",propuni("268"),insumosi("268")],
                                    [...userx["269"],"269",propuni("269"),insumosi("269")],
                                    [...userx["347"],"347",propuni("347"),insumosi("347")],
                                    [...userx["348"],"348",propuni("348"),insumosi("348")],
                                    [...userx["349"],"349",propuni("349"),insumosi("349")],
                                    [...userx["357"],"357",propuni("357"),insumosi("357")],
                                    [...userx["358"],"358",propuni("358"),insumosi("358")],
                                    [...userx["359"],"359",propuni("359"),insumosi("359")],
                                    [...userx["367"],"367",propuni("367"),insumosi("367")],
                                    [...userx["368"],"368",propuni("368"),insumosi("368")],
                                    [...userx["369"],"369",propuni("369"),insumosi("369")],
                                    userx["taokeys"],
                                    userx["frota"],
                                    userx["promotores"],
                                    userx["comissao"],
                                    userx["distribuidores"],
                                    userx["pas"],
                                    userx["propaganda"],
                                    userx["propagandauni"],
                                    (userx["divida"][0]+userx["divida"][1]+userx["divida"][2]),
                                    userx["turno"]]);
            
            
                                    })

                            
                            .catch((err) => {console.log('falha em salvar transacao por pesquisa n 307' + err)})
                            }

                        else{
                            socket.emit('feedback', ['warning','falta caixa']);
                            //console.log('hlu')
                    }
                    //console.log(user.taokeys)
                    }
                    else{
                        socket.emit('feedback', ['warning', '>> Essa pesquisa ja foi encomendada.'])
                    }
                    }
                    else{
                        socket.emit('feedback',['danger','É necessário estar logado para puxar os dados da simulação'])
                    }
            }) 
            .catch((err) => { console.log('falha na comunicacao com o banco de dados para o ' + socket.id + ' ps: ' + err)
    })
    }) 
    socket.on('pesquisar-teste-entre-2', (input) => {
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => { 
                    if(userx !== null && input.length == 2){
                        let redun
                        function checkR(r) {
                            if(r[0] == null || r[1] == null){
                                return false
                            }
                            else{
                                return true
                            }
                        }
                        //console.log(user.taokeys + ' ccccccccccccccc');
                        if(input.length == 2 && checkR(input)){
                            let datetime = new Date().toLocaleString('pt-BR').toLocaleString('pt-BR');
                            userx.deci.push({data: datetime, acao: 'Contratou pesquisa de teste entre tipos de serviço para ' +input[0] +' e ' + input[1] +' referente ao turno '+ userx.turno, autor: userx.modificador})
                        
                            function sem_redundancia() {
                                for(let ff = 0; ff < userx.participacao_modelos.length; ff++){
                                    

                                    
                                    if(userx.participacao_modelos[ff][0] == input[0] && userx.participacao_modelos[ff][1] == input[1]){
                                        redun = input[0]+'; '+input[1]
                                        return false
                                    }
                                    if(userx.participacao_modelos[ff][0] == input[1] && userx.participacao_modelos[ff][1] == input[0]){
                                        redun = input[0]+'; '+input[1]
                                        return false
                                    }
                                    
                                    
                                        
                            }
                            return true
                            }
                            if(sem_redundancia()){
                            userx.balanco_patrimonial = {
                                caixa: userx.balanco_patrimonial.caixa - 14400,
                                estoque: userx.balanco_patrimonial.estoque,
                                contas_a_receber60: userx.balanco_patrimonial.contas_a_receber60,
                                contas_a_receber120: userx.balanco_patrimonial.contas_a_receber120,
                                maquinas: userx.balanco_patrimonial.maquinas,
                                depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_maquinas,
                                veiculos: userx.balanco_patrimonial.veiculos,
                                depreciacao_veiculos: userx.balanco_patrimonial.depreciacao_veiculos,
                                tributos_a_pagar_anterior: userx.balanco_patrimonial.tributos_a_pagar_anterior,
                                tributos_a_pagar_atual: userx.balanco_patrimonial.tributos_a_pagar_atual,
                                emprestimos: userx.balanco_patrimonial.emprestimos,
                                capial: userx.balanco_patrimonial.capial,
                                lucros_acumulados: userx.balanco_patrimonial.lucros_acumulados - 14400
                            }
                            userx.dre = {
                                receita: userx.dre.receita,
                                csp: userx.dre.csp,
                                estoque_inicial: userx.dre.estoque_inicial,
                                custo_prestacao_servico: userx.dre.custo_prestacao_servico,
                                custo_estocagem: userx.dre.custo_estocagem,
                                custo_troca_insumos: userx.dre.custo_troca_insumos,
                                hora_extra: userx.dre.hora_extra,
                                capacidade_n_utilizada: userx.dre.capacidade_n_utilizada,
                                margem_bruta: userx.dre.margem_bruta,
                                despesas_administrativas: userx.dre.despesas_administrativas,
                                salario_promotores: userx.dre.salario_promotores,
                                comissao: userx.dre.comissao,
                                propaganda_institucional: userx.dre.propaganda_institucional,
                                propaganda_unitaria: userx.dre.propaganda_unitaria,
                                depreciacao_de_maquinas: userx.dre.depreciacao_de_maquinas,
                                encargos_financiamento: userx.dre.encargos_financiamento,
                                salario_frota: userx.dre.salario_frota,
                                manutencao_frota: userx.dre.manutencao_frota,
                                depreciacao_de_veiculos: userx.dre.depreciacao_de_veiculos,
                                frota_terceirizada: userx.dre.frota_terceirizada,
                                despesas_operacionais_n_planejadas: userx.dre.despesas_operacionais_n_planejadas,
                                pas: userx.dre.pas,
                                pesquisas: userx.dre.pesquisas + 14400,
                                tributos: userx.dre.tributos,
                                servicos: [userx.dre.servicos[0], userx.dre.servicos[1], userx.dre.servicos[2], userx.dre.servicos[3]],
                                preco_medio: userx.dre.preco_medio,
                                atendimentos: userx.dre.atendimentos,
                                insumos_em_estoque: userx.dre.insumos_em_estoque,
                                distribuidores: userx.dre.distribuidores
    
                            }
                            userx.fluxo_de_caixa = {
                                saldo_anterior: userx.fluxo_de_caixa.saldo_anterior,
                                faturamento: userx.fluxo_de_caixa.faturamento,
                                contas_a_receber: userx.fluxo_de_caixa.contas_a_receber,
                                contas_a_receber_recebidas: userx.fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                                custo_de_servico_prestado: userx.fluxo_de_caixa.custo_de_servico_prestado,
                                emprestimos_contratados: userx.fluxo_de_caixa.emprestimos_contratados,
                                emprestimos_pagos: userx.fluxo_de_caixa.emprestimos_pagos,
                                veiculos_vendidos: userx.fluxo_de_caixa.veiculos_vendidos,
                                depreciacao_de_veiculos: userx.fluxo_de_caixa.depreciacao_de_veiculos,
                                depreciacao_de_maquinas: userx.fluxo_de_caixa.depreciacao_de_maquinas,
                                veiculos_comprados: userx.fluxo_de_caixa.veiculos_comprados,
                                tributos: userx.fluxo_de_caixa.tributos,
                                promotores: userx.fluxo_de_caixa.promotores,
                                propaganda: userx.fluxo_de_caixa.propaganda,
                                pesquisas: userx.fluxo_de_caixa.pesquisas + 14400,
                                pas: userx.fluxo_de_caixa.pas,
                                uso_frota: userx.fluxo_de_caixa.uso_frota,
                                despesas_operacionais_n_planejadas: userx.fluxo_de_caixa.despesas_operacionais_n_planejadas,
                                despesas_administrativas: userx.fluxo_de_caixa.despesas_administrativas,
                                encargos_financiamento: userx.fluxo_de_caixa.encargos_financiamento,
                                maquinas: userx.fluxo_de_caixa.maquinas,
                                distribuidores: userx.fluxo_de_caixa.distribuidores
                            }
                           
                        
                           userx.taokeys = userx.taokeys - 14400
                           userx['npesquisas'] = userx['npesquisas'] + 1
                           
                           
                            userx.participacao_modelos.push([index[0],input[1]])
                            //userx.pes_p.total_participacao_modelos = 1
                                
                                
                           
                           //console.log(user.taokeys)
                           userx.save()
                            .then(() => {
                                socket.emit('feedback', ['success', '>> Encomenda de pesquisa de PARTICIPAÇÃO DE SERVIÇOS realizada com sucesso.'])
                                        function propuni(tipo) {
                                            if(userx.somapropuni.tipo1 == tipo){
                                                return userx.somapropuni.inv1
                                            }
                                            else if(userx.somapropuni.tipo2 == tipo){
                                                return userx.somapropuni.inv2
                                            }
                                            else{return 0}
                                        }
                                        function insumosi(s) {
                                            if(userx.last_change.serv1 == s){
                                                return userx.last_change.insu1i
                                            }
                                            else if(userx.last_change.serv2 == s){
                                                return userx.last_change.insu2i
                                            }
                                            else{
                                                return 0
                                            }
                                        }
                                        socket.emit('update', [
                                    [...userx["147"],"147",propuni("147"),insumosi("147")],
                                    [...userx["148"],"148",propuni("148"),insumosi("148")],
                                    [...userx["149"],"149",propuni("149"),insumosi("149")],
                                    [...userx["157"],"157",propuni("157"),insumosi("157")],
                                    [...userx["158"],"158",propuni("158"),insumosi("158")],
                                    [...userx["159"],"159",propuni("159"),insumosi("159")],
                                    [...userx["257"],"257",propuni("257"),insumosi("257")],
                                    [...userx["258"],"258",propuni("258"),insumosi("258")],
                                    [...userx["259"],"259",propuni("259"),insumosi("259")],
                                    [...userx["267"],"267",propuni("267"),insumosi("267")],
                                    [...userx["268"],"268",propuni("268"),insumosi("268")],
                                    [...userx["269"],"269",propuni("269"),insumosi("269")],
                                    [...userx["347"],"347",propuni("347"),insumosi("347")],
                                    [...userx["348"],"348",propuni("348"),insumosi("348")],
                                    [...userx["349"],"349",propuni("349"),insumosi("349")],
                                    [...userx["357"],"357",propuni("357"),insumosi("357")],
                                    [...userx["358"],"358",propuni("358"),insumosi("358")],
                                    [...userx["359"],"359",propuni("359"),insumosi("359")],
                                    [...userx["367"],"367",propuni("367"),insumosi("367")],
                                    [...userx["368"],"368",propuni("368"),insumosi("368")],
                                    [...userx["369"],"369",propuni("369"),insumosi("369")],
                                    userx["taokeys"],
                                    userx["frota"],
                                    userx["promotores"],
                                    userx["comissao"],
                                    userx["distribuidores"],
                                    userx["pas"],
                                    userx["propaganda"],
                                    userx["propagandauni"],
                                    (userx["divida"][0]+userx["divida"][1]+userx["divida"][2]),
                                    userx["turno"]]);
            
                                    

                            })
                            .catch((err) => {console.log('falha em salvar transacao por pesquisa n 307' + err)})
                            
                            
                            
                            }
                            else{  
                                socket.emit('feedback', ['warning', '>> A pesquisa para ' + redun + ' ja foi realizada. (operação negada)'])

                            }
                        }
                        else{
                            socket.emit('feedback', ['warning','falta caixa']);
                            //console.log('hlu')
                    }
                    //console.log(user.taokeys)
                    }
                    else{
                        socket.emit('feedback', ['danger','É necessário estar logado para puxar os dados da simulação'])
                    }
            }) 
            .catch((err) => { console.log('falha na comunicacao com o banco de dados para o ' +socket.id + ' ps: ' + err)
    })
    })
    socket.on('puxar-balancos',  (turno) => {

        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                        
                        //console.log(userx.turno)
                        //console.log(Number(turno))
                            if(userx.turno !== Number(turno)){ //seria melhor ao registrar as instancias colocar como turno 1 na geração do JSON, mas fazer com cautela OKK
                                Aluno.findOne({ cooperativa: userx.cooperativa, backup: 1, instancia: userx.instancia, turno: turno })                 
                                    .then((balancos) => {
                                        if(balancos !== null){ 
                                            function resp(b) {
                                            let w = 0
                                            for(let i = 0; i < index.length; i++){
                                                if(b[index[i]][1] == 1){
                                                    w = w + Math.round(Number(b[index[i]][0]))
                                                }
                                            }
                                            return w
                                        }
                                        //console.log('puxando-balancos << BACKUP')
                                        
                                        socket.emit('balancos', { 
                                            balanco_patrimonial: balancos.balanco_patrimonial,
                                            dre: balancos.dre,
                                            turno: balancos.turno,
                                            fluxo: balancos.fluxo_de_caixa,
                                            total_n_utilizado: resp(balancos),
                                            planejado: 0
                                            
                                         });  
                                        
                                        } 
                                        else{
                                            console.log('puts')
                                        }         
                                    })
                                    .catch((err) => {console.log(err)})
                            }
                            else{
                                Aluno.findOne({ cooperativa: userx.cooperativa, backup: 0, instancia: userx.instancia, temporario: 1 })
                                    .then((balancos) => {
                                        //console.log(balancos)
                                        if(balancos !== null){
                                            function resp(b) {
                                                let w = 0
                                                for(let i = 0; i < index.length; i++){
                                                    if(b[index[i]][1] == 1){
                                                        w = w + Math.round(Number(b[index[i]][0]))
                                                    }
                                                }
                                                return w
                                            }
                                            function checar4(t) {
                                                if(t !== null && t !== undefined){
                                                    return t[4]
                                                }
                                                else{
                                                    return 0
                                                }
                                            }
                                            function checar3(t) {
                                                if(t !== null && t !== undefined){
                                                    return t[3]
                                                }
                                                else{
                                                    return 0
                                                }
                                            }
                                            let somapes = 0
                                                                if(balancos.pes_p.modelos_oferecidos == 1){
                                                                    somapes = somapes + 2160
                                                                }
                                                                if(balancos.pes_p.total_pas == 1){
                                                                    somapes = somapes + 2160
                                                                }
                                                                if(balancos.pes_p.total_participacao_modelos == 1){
                                                                    somapes = somapes + 2160
                                                                }
                                                                if(balancos.pes_p.total_distribuidores == 1){
                                                                    somapes = somapes + 2160
                                                                }
                                        console.log('puxando-balancos <<ATUAL /volume 1: ' + checar4(balancos[balancos.last_change.serv1])+ ' /insu1: ' + balancos.last_change.insu1 + ' /insu1i: ' + balancos.last_change.insu1i)
                                        socket.emit('balancos', { 
                                            balanco_patrimonial: balancos.balanco_patrimonial,
                                            dre: balancos.dre,
                                            turno: balancos.turno,
                                            fluxo: balancos.fluxo_de_caixa,
                                            total_n_utilizado: resp(balancos),
                                            planejado: {pesquisas: somapes,propagandai: balancos.propaganda,comissao: balancos.comissao,insu2i: balancos.last_change.insu2i,insu1: balancos.last_change.insu1,insu2: balancos.last_change.insu2,insu1i: balancos.last_change.insu1i,prop1: balancos.last_change.prop1, prop2: balancos.last_change.prop2, serv1: balancos.last_change.serv1, serv2: balancos.last_change.serv2, emprestimo: balancos.divida[0]+balancos.divida[1]+balancos.divida[2],frota: balancos.frota[0]+balancos.frota[1]+balancos.frota[2]+balancos.frota[3]+balancos.frota[4]+balancos.frota[5]+balancos.frota[6]+balancos.frota[7]+balancos.frota[8]+balancos.frota[9]+balancos.frota[10]+balancos.frota[11], pas: balancos.pas, distribuidores: balancos.distribuidores, promotores: balancos.promotores, last_change: balancos.last_change, volume1: checar4(balancos[balancos.last_change.serv1]), volume2: checar4(balancos[balancos.last_change.serv2]), preco1: checar3(balancos[balancos.last_change.serv1]), preco2: checar3(balancos[balancos.last_change.serv2])},
                                            servs: {
                                                
                                                    147:balancos['147'],
                                                    148:balancos['148'],
                                                    149:balancos['149'],
                                                    157:balancos['157'],
                                                    158:balancos['158'],
                                                    159:balancos['159'],
                                                    257:balancos['257'],
                                                    258:balancos['258'],
                                                    259:balancos['259'],
                                                    267:balancos['267'],
                                                    268:balancos['268'],
                                                    269:balancos['269'],
                                                    347:balancos['347'],
                                                    348:balancos['348'],
                                                    349:balancos['349'],
                                                    357:balancos['357'],
                                                    358:balancos['358'],
                                                    359:balancos['359'],
                                                    367:balancos['367'],
                                                    368:balancos['368'],
                                                    369:balancos['369']
                                            }
                                         });
                                        }
                                        else{
                                            console.log('puts atual')
                                        }            
                                    })
                                    .catch((err) => {console.log(err)})
                                
                            }

                          

            }
                else{
                    socket.emit('feedback', ['danger','É preciso estar logado para puxar o state atual da simulação.'])
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})

    })
    socket.on('puxar-bp-geral', () => {
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                        
                        //console.log(userx.turno)
                        //console.log(Number(turno))
                            if(userx.turno == 2 || userx.turno == 4){
                                Aluno.find({ backup: 1, instancia: userx.instancia, turno: userx.turno - 1 })                 
                                    .then((bps) => {
                                        if(bps.length !== 0){ 
                                            let resp = []
                                            for(let i = 0; i < bps.length; i++){
                                                resp.push({cooperativa: bps[i].cooperativa, balanco_patrimonial: bps[i].balanco_patrimonial, turno: bps[i].turno})
                                            }
                                            socket.emit('bp-geral', resp)
                                       
                                        
                                        } 
                                        else{
                                            console.log('puts deu 0 qnd foi puxar os bps do turno 2 ou 4...')
                                            socket.emit('bp-geral', ['vazio'])
                                        }         
                                    })
                                    .catch((err) => {console.log(err)})
                            }
                            

                          

            }
                else{
                    socket.emit('feedback', ['danger','É preciso estar logado para puxar o state atual da simulação.'])
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})

    })

    socket.on('puxar-pesquisas',  () => {
        console.log("FOOII")
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                             //seria melhor ao registrar as instancias colocar como turno 1 na geração do JSON, mas fazer com cautela OKK
                                Aluno.find({ cooperativa: userx.cooperativa, backup: 1, instancia: userx.instancia})                 
                                    .then((peps) => {
                                        let arr = []
                                        for(let i = 0; i < peps.length; i++){
                                            if(peps[i].pes_p.modelos_oferecidos !== 'vazio'){
                                                let resposta = 'Serviços:'
                                                peps[i].pes_p.modelos_oferecidos.map((serv,ind) => {
                                                    resposta = resposta + ' ' + serv + ' -'
                                                })
                                                arr.push({tipo: 'Modelos Oferecidos', resultado: resposta, bimestre: peps[i].turno})
                                            }
                                            if(peps[i].pes_p.total_participacao_modelos !== 'vazio'){
                                                arr.push({tipo: 'Participação da concorrência', resultado: peps[i].pes_p.total_participacao_modelos, bimestre: peps[i].turno})
                                            }
                                            if(peps[i].pes_p.total_pas !== 'vazio'){
                                                arr.push({tipo: 'Total de P.A.S.', resultado: peps[i].pes_p.total_pas, bimestre: peps[i].turno})
                                            }
                                            /*
                                            if(peps[i].pes_p.distribuidores !== 'vazio'){
                                                
                                            }
                                            */
                                            if(peps[i].participacao_modelos.length > 0){
                                                for(let ii = 0; ii < peps[i].participacao_modelos.length; ii++){//ex-> [index, resul]
                                                    arr.push({tipo: 'Teste entre dois tipos de serviço: ', resultado: 'Combinações: ' + peps[i].participacao_modelos[ii][0] + peps[i].participacao_modelos[ii][1], bimestre: peps[i].turno})
                                                }   
                                            }
                                            
                                        }
                                        socket.emit('pesquisas', arr);
                                         //console.log(arr)        
                                         //socket.emit('feedback', ['warning', pes.participacao_modelos + pes.pes_p.total_distribuidores])    
                                    })
                                    .catch((err) => {console.log(err)})
                            
                            
                                //socket.emit('feedback', ['danger', '>> Não é possível consultar pesquisas que ainda não foram efetuadas.'])
                            
                            

                          

            }
                else{
                    socket.emit('feedback', ['danger','É necessário estar logado para puxar os dados da simulação'])

                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})

    })
    socket.on('puxar-news',  () => {
        //console.log("FOOII")
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                             //seria melhor ao registrar as instancias colocar como turno 1 na geração do JSON, mas fazer com cautela OKK
                                if(userx.turno == 2 || userx.turno == 4){
                                Aluno.find({ backup: 1, instancia: userx.instancia, turno: userx.turno-1})                 
                                    .then((peps) => {
                                        //let arr = []
                                        //let part = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                                        let total_part = 0
                                        let precomedt = 0
                                        for(let i = 0; i < peps.length; i++){
                                                for(let h = 0; h < index.length; h++){
                                                    if(peps[i][index[h]][6] > 0){
                                                        total_part = total_part + peps[i][index[h]][6]
                                                    }
                                                }
                                                precomedt = precomedt + peps[i].dre.preco_medio
                                                
                    
                                            
                                        }
                                        let med = Math.round(total_part/peps.length)
                                        let pmed = Math.round(precomedt/peps.length)
                                        socket.emit('news', [{titulo: '>> Volume médio de prestação serviço por player (referente ao último bimestre)', info: med, bimestre: userx.turno},{titulo: '>> Preço médio de prestação de serviços (referentes ao ultimo bimestre)', info: pmed, bimestre: userx.turno}]);
                                        
                                         //console.log(arr)        
                                         //socket.emit('feedback', ['warning', pes.participacao_modelos + pes.pes_p.total_distribuidores])    
                                    })
                                    .catch((err) => {console.log(err)})
                                }
                                else{
                                    socket.emit('news',[{titulo: '>> Relevantes análises sobre o mercado', info: ' - Novos dados a cada 2 bimestres', bimestre: userx.turno}])
                                }
                            
                            
                                //socket.emit('feedback', ['danger', '>> Não é possível consultar pesquisas que ainda não foram efetuadas.'])
                            
                            

                          

            }
                else{
                    socket.emit('feedback', ['danger','É necessário estar logado para puxar os dados da simulação'])

                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})

    })
    socket.on('puxar-deci',  () => {
        //console.log("FOOII")
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                             //seria melhor ao registrar as instancias colocar como turno 1 na geração do JSON, mas fazer com cautela OKK
                                Aluno.find({ cooperativa: userx.cooperativa, backup: 1, instancia: userx.instancia})
                                    .then((peps) => {    
                                    Aluno.findOne({ cooperativa: userx.cooperativa, temporario: 1, instancia: userx.instancia})           
                                    .then((atual) => {
                                        let arr = []
                                        for(let i = 0; i < peps.length; i++){
                                            for(let ii = 0; ii < peps[i].deci.length;ii++){
                                                arr.push(peps[i].deci[ii])
                                            }
                                        }
                                        for(let k = 0; k < atual.deci.length;k++){
                                            arr.push(atual.deci[k])
                                        }
                                        
                                        
                                        function getUnique(arry, comp) {

                                            // store the comparison  values in array
                                        const unique =  arry.map(e => e[comp])
                        
                                          // store the indexes of the unique objects
                                            .map((e, i, final) => final.indexOf(e) === i && i)
                        
                                          // eliminate the false indexes & return unique objects
                                            .filter((e) => arry[e]).map(e => arry[e]);
                        
                                            return unique;
                                        }
                                        
                                        let respp = getUnique(arr,'acao')
                                        socket.emit('deci', respp);
                                         //console.log(arr)        
                                         //socket.emit('feedback', ['warning', pes.participacao_modelos + pes.pes_p.total_distribuidores])    
                                    })
                                    .catch((err) => {console.log(err)})
                                    }) 
                                    .catch((err) => {console.log(err)})
                            
                            
                                //socket.emit('feedback', ['danger', '>> Não é possível consultar pesquisas que ainda não foram efetuadas.'])
                            
                            

                          

            }
                else{
                    socket.emit('feedback', ['danger','>> É preciso estar logado para puxar o state atual da simulação.'])
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})

    })
    // SOCKETS AMD \/
    socket.on('registrar-nova-instancia', (creden) => {
                if(creden[4] == "senha-mestra"){
                    Data.findOne({instancia: creden[2]})
                        .then((ll) => {
                            if(ll !== null){
                                socket.emit('resposta-root', 'Ja existe uma instacia com esse nome (OPERACAO NEGADA)')
                                socket.emit('feedback', ['danger','Ja existe uma instancia com esse nome'])
                            }
                            else{
                                Data.findOne({login_adm: creden[0]})
                                    .then((userL) => {
                                        if(userL == null){
                                            let jogo = new Data({login_adm: creden[0], iniciado: 1, senha_adm: creden[1], instancia: creden[2], senha_instancia: creden[3], turno: 1, oferta_mercado: 18000000, ativo: 1})
                                            jogo.save()
                                                .then(() => {
                                                    console.log('>>> Instancia: ' + creden[2] + ' registrada com sucesso')    
                                                    socket.emit('resposta-root', 'instancia '+ creden[2]+ ' criada com sucesso')
                                                    //socket.emit('registro-instancia-completo', creden[0])
                                                })
                                                .catch((err) => {console.log(err)})
                                        }
                                        else{
                                            socket.emit('resposta-root', 'Ja existe ums instancia com esse LOGIN de administrador (OPERACAO NEGADA)')
                                            socket.emit('feedback', ['danger','Ja existe ums instancia com esse LOGIN de administrador'])
                                        }

                                    })
                            }
                        })
                }
                else{
                    socket.emit('resposta-root', 'senha mestra incorreta (OPERACAO NEGADA)')
                    socket.emit('feedback', ['danger','senha mestra incorreta'])}  
    })
    socket.on('login-adm', (creden) => {
        console.log(creden)
        Data.findOne({sockid: socket.id})
            .then((ll) => {
                if(ll !== null){socket.emit('feedback', ['danger','Voce ja esta conectado'])}
                else{
                    Data.findOne({login_adm: creden.login, senha_adm: creden.senha})
                        .then((adm) => {
                            if(adm !== null){
                                adm.sockid = socket.id
                                adm.save()
                                    .then(() => {
                                        Aluno.find({instancia: adm.instancia, temporario: 0})
                                            .then((cooperativas) => {
                                                console.log(`adm connected`)
                                                socket.emit('state-gloal', cooperativas)
                                            })
                                        socket.emit('feedback', ['success', 'Login aprovado para ' + adm.instancia])
                                    })
                                    .catch((err) => {
                                        console.log(err)
                                   })
                            }
                            else{socket.emit('feedback', ['danger', 'Instancia nao encontrada'])}
                        })
                        .catch((err) => {console.log(err + ' <=> Falha na comunicacao com o Banco de dados n 403 ' + socket.id)})
                        }
            })
            .catch(() => {console.log('falha na comunicacao com o Banco de dados n 504 ' +socket.id)})

                  

    })
    socket.on('set-demanda-global', (input) => {
        Data.findOne({sockid: socket.id})
            .then((ll) => {
                if(ll == null){
                    socket.emit('feedback', ['danger','Voce precisa estar logado para puxar o state atual da simulação'])
                }
                else{
                    if(ll.turno == 0){
                        ll.oferta_mercado = input
                        ll.save()
                            .then(() => {
                                console.log('Instancia: ' + ll.instancia + ' alterou sua demanda anual para: ' + ll.oferta_mercado)
                            })
                            .catch((err) => {console.log(err)})
                    }
                    else{
                        socket.emit('feedback', ['danger','Só é possivel alterar a demanda global antes de finalizar o primeiro turno'])
                    }
                }
            })
            .catch(() => {console.log('falha na comunicacao com o Banco de dados n 504 ' +socket.id)})

                  

    }) 
    socket.on('finalizar-turno', () => {
        Data.findOne({sockid: socket.id})
            .then((adm) => {
        if(adm !== null){
        if(adm.iniciado == 1){
        adm.finalizado = 1
        adm.iniciado = 0
        adm.ativo = 0; //congela a data base da instancia para os jogadores nao conseguirem altera-la enquanto o faturamento é efetuado
        adm.turno = adm.turno + 1 //contabilia a passagem de turno
        adm.save()
            .then(() => {
        Aluno.find({ativo: 1, temporario: 0, instancia: adm.instancia})
            .then((users) => {
                let soma = 0;
                let soma1 = 0;
                let soma2 = 0;
                let soma3 = 0;
                let scorex = 0;
                let scorey1 = 0;
                let scorey2 = 0;
                let soma5 = 0
                let soma6 = 0
                let soma7 = 0
                for(let i = 0; i < users.length; i++){
                    if(users[i].propaganda == 0){
                        users[i].propaganda = 1
                    }

                    let g = Number(users[i]['comissao'].slice(0,users[i]['comissao'].length-1))
                    soma = soma + users[i]['distribuidores']
                    soma1 = soma1 + users[i]['pas']
                    soma2 = soma2 + users[i]['promotores']
                    soma3 = soma3 + g

                    soma5 = soma5 + users[i]['propaganda']
                    soma6 = soma6 + users[i]['propagandauni']
                    soma7 = soma7 + users[i]['npesquisas']
                    //
                
                    let cc = 0
                    for(let r = 0; r < index.length; r++){

                        if(users[i][index[r]][4] > 0 && users[i][index[r]][1] == 1){
                            users[i]['scorepreco'][0] = users[i]['scorepreco'][0] + users[i][index[r]][4] //soma vendas planejadas
                            users[i]['scorepreco'][1] = users[i]['scorepreco'][1] + users[i][index[r]][4]*users[i][index[r]][3] //soma de -vendas planejadas vezes preço de venda( = faturamento planejado)- 
                          }

                        if(users[i][index[r]][1] == 1){
                            if(cc == 0){
                                cc = cc + 1
                                users[i].dre = {
                                    receita: users[i].dre.receita,
                                    csp: users[i].dre.csp,
                                    estoque_inicial: users[i].dre.estoque_inicial,
                                    custo_prestacao_servico: users[i].dre.custo_prestacao_servico,
                                    custo_estocagem: users[i].dre.custo_estocagem,
                                    custo_troca_insumos: users[i].dre.custo_troca_insumos,
                                    hora_extra: users[i].dre.hora_extra,
                                    capacidade_n_utilizada: users[i].dre.capacidade_n_utilizada,
                                    margem_bruta: users[i].dre.margem_bruta,
                                    despesas_administrativas: users[i].dre.despesas_administrativas,
                                    salario_promotores: users[i].dre.salario_promotores,
                                    comissao: users[i].dre.comissao,
                                    propaganda_institucional: users[i].dre.propaganda_institucional,
                                    propaganda_unitaria: users[i].dre.propaganda_unitaria,
                                    depreciacao_de_maquinas: users[i].dre.depreciacao_de_maquinas,
                                    encargos_financiamento: users[i].dre.encargos_financiamento,
                                    salario_frota: users[i].dre.salario_frota,
                                    manutencao_frota: users[i].dre.manutencao_frota,
                                    depreciacao_de_veiculos: users[i].dre.depreciacao_de_veiculos,
                                    frota_terceirizada: users[i].dre.frota_terceirizada,
                                    despesas_operacionais_n_planejadas: users[i].dre.despesas_operacionais_n_planejadas,
                                    pas: users[i].dre.pas,
                                    pesquisas: users[i].dre.pesquisas,
                                    tributos: users[i].dre.tributos,
                                    servicos: [index[r], users[i][index[r]][2], users[i].dre.servicos[2], users[i].dre.servicos[3]],//aqui!
                                    preco_medio: users[i].dre.preco_medio,
                                    atendimentos: users[i].dre.atendimentos,
                                    insumos_em_estoque: users[i].dre.insumos_em_estoque,
                                    distribuidores: users[i].dre.distribuidores
        
                                }
                            }
                            else{
                                users[i].dre = {
                                    receita: users[i].dre.receita,
                                    csp: users[i].dre.csp,
                                    estoque_inicial: users[i].dre.estoque_inicial,
                                    custo_prestacao_servico: users[i].dre.custo_prestacao_servico,
                                    custo_estocagem: users[i].dre.custo_estocagem,
                                    custo_troca_insumos: users[i].dre.custo_troca_insumos,
                                    hora_extra: users[i].dre.hora_extra,
                                    capacidade_n_utilizada: users[i].dre.capacidade_n_utilizada,
                                    margem_bruta: users[i].dre.margem_bruta,
                                    despesas_administrativas: users[i].dre.despesas_administrativas,
                                    salario_promotores: users[i].dre.salario_promotores,
                                    comissao: users[i].dre.comissao,
                                    propaganda_institucional: users[i].dre.propaganda_institucional,
                                    propaganda_unitaria: users[i].dre.propaganda_unitaria,
                                    depreciacao_de_maquinas: users[i].dre.depreciacao_de_maquinas,
                                    encargos_financiamento: users[i].dre.encargos_financiamento,
                                    salario_frota: users[i].dre.salario_frota,
                                    manutencao_frota: users[i].dre.manutencao_frota,
                                    depreciacao_de_veiculos: users[i].dre.depreciacao_de_veiculos,
                                    frota_terceirizada: users[i].dre.frota_terceirizada,
                                    despesas_operacionais_n_planejadas: users[i].dre.despesas_operacionais_n_planejadas,
                                    pas: users[i].dre.pas,
                                    pesquisas: users[i].dre.pesquisas,
                                    tributos: users[i].dre.tributos,
                                    servicos: [users[i].dre.servicos[0], users[i].dre.servicos[1], index[r], users[i][index[r]][2]],
                                    preco_medio: users[i].dre.preco_medio,
                                    atendimentos: users[i].dre.atendimentos,
                                    insumos_em_estoque: users[i].dre.insumos_em_estoque,
                                    distribuidores: users[i].dre.distribuidores
        
                                }

                            }
                            

                            if(index[r][0] == '1' || index[r][0] == 1){
                                users[i]['scoremod'] = users[i]['scoremod'] + 4
                            }
                            else if(index[r][0] == '2' || index[r][0] == 2){
                                users[i]['scoremod'] = users[i]['scoremod'] + 6
                            }
                            else{
                                users[i]['scoremod'] = users[i]['scoremod'] + 8
                            }
                        } 

                    }
                    
                }
                console.log('soma comiss: ' +soma3)
                for(let i = 0; i < users.length; i++){
                    scorex = scorex + users[i]['scoremod']
                    scorey1 = scorey1 + users[i]['scorepreco'][0]
                    scorey2 = scorey2 + users[i]['scorepreco'][1]
                    users[i].dre = {
                        receita: users[i].dre.receita,
                        csp: users[i].dre.csp,
                        estoque_inicial: users[i].dre.estoque_inicial,
                        custo_prestacao_servico: users[i].dre.custo_prestacao_servico,
                        custo_estocagem: users[i].dre.custo_estocagem,
                        custo_troca_insumos: users[i].dre.custo_troca_insumos,
                        hora_extra: users[i].dre.hora_extra,
                        capacidade_n_utilizada: users[i].dre.capacidade_n_utilizada,
                        margem_bruta: users[i].dre.margem_bruta,
                        despesas_administrativas: users[i].dre.despesas_administrativas,
                        salario_promotores: users[i].dre.salario_promotores,
                        comissao: users[i].dre.comissao,
                        propaganda_institucional: users[i].dre.propaganda_institucional,
                        propaganda_unitaria: users[i].dre.propaganda_unitaria,
                        depreciacao_de_maquinas: users[i].dre.depreciacao_de_maquinas,
                        encargos_financiamento: users[i].dre.encargos_financiamento,
                        salario_frota: users[i].dre.salario_frota,
                        manutencao_frota: users[i].dre.manutencao_frota,
                        depreciacao_de_veiculos: users[i].dre.depreciacao_de_veiculos,
                        frota_terceirizada: users[i].dre.frota_terceirizada,
                        despesas_operacionais_n_planejadas: users[i].dre.despesas_operacionais_n_planejadas,
                        pas: users[i].dre.pas,
                        pesquisas: users[i].dre.pesquisas,
                        tributos: users[i].dre.tributos,
                        servicos: [users[i].dre.servicos[0], users[i].dre.servicos[1], users[i].dre.servicos[2], users[i].dre.servicos[3]],//aqui!
                        preco_medio: (users[i]['scorepreco'][1]/users[i]['scorepreco'][0]),
                        atendimentos: users[i].dre.atendimentos,
                        insumos_em_estoque: users[i].dre.insumos_em_estoque,
                        distribuidores: users[i].dre.distribuidores

                    }
                }
                //console.log(scorey1 + ' <-- scorey1 - ' + scorey2 + ' <-- scorey2')
                let preco_medio = scorey2/scorey1; //continuar daqui o rateio do faturamento pelo preco unitario usando esse preco medio global
                let dist = 0;
                //console.log('|| ' + preco_medio + ' <-- PRECO MEDIO ||')

                for(let i = 0; i < users.length; i++){
                    console.log("1 (sem alteracoes): " + users[i].taokeys)
                    console.log("1 balan_caixa : " + users[i].balanco_patrimonial.caixa)
                    users[i].balanco_patrimonial = {
                        caixa: users[i].balanco_patrimonial.caixa,
                        estoque: users[i].balanco_patrimonial.estoque,
                        contas_a_receber60: users[i].balanco_patrimonial.contas_a_receber60,
                        contas_a_receber120: users[i].balanco_patrimonial.contas_a_receber120,
                        maquinas: users[i].balanco_patrimonial.maquinas,
                        depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_maquinas + 2880,
                        veiculos: users[i].balanco_patrimonial.veiculos,
                        depreciacao_veiculos: users[i].balanco_patrimonial.depreciacao_veiculos,//eh uma conta negativa no ativo
                        tributos_a_pagar_anterior: users[i].balanco_patrimonial.tributos_a_pagar_anterior,
                        tributos_a_pagar_atual: users[i].balanco_patrimonial.tributos_a_pagar_atual,
                        emprestimos: users[i].balanco_patrimonial.emprestimos,
                        capial: users[i].balanco_patrimonial.capial,
                        lucros_acumulados: users[i].balanco_patrimonial.lucros_acumulados
                    }
                    users[i].dre = {
                        receita: users[i].dre.receita,
                        csp: users[i].dre.csp,
                        estoque_inicial: users[i].dre.estoque_inicial,
                        custo_prestacao_servico: users[i].dre.custo_prestacao_servico,
                        custo_estocagem: users[i].dre.custo_estocagem,
                        custo_troca_insumos: users[i].dre.custo_troca_insumos,
                        hora_extra: users[i].dre.hora_extra,
                        capacidade_n_utilizada: users[i].dre.capacidade_n_utilizada,
                        margem_bruta: users[i].dre.margem_bruta,
                        despesas_administrativas: users[i].dre.despesas_administrativas,
                        salario_promotores: users[i].dre.salario_promotores,
                        comissao: users[i].dre.comissao,
                        propaganda_institucional: users[i].dre.propaganda_institucional,
                        propaganda_unitaria: users[i].dre.propaganda_unitaria,
                        depreciacao_de_maquinas: users[i].dre.depreciacao_de_maquinas + 2880,
                        encargos_financiamento: users[i].dre.encargos_financiamento,
                        salario_frota: users[i].dre.salario_frota,
                        manutencao_frota: users[i].dre.manutencao_frota,
                        depreciacao_de_veiculos: users[i].dre.depreciacao_de_veiculos,
                        frota_terceirizada: users[i].dre.frota_terceirizada,
                        despesas_operacionais_n_planejadas: users[i].dre.despesas_operacionais_n_planejadas,
                        pas: users[i].dre.pas,
                        pesquisas: users[i].dre.pesquisas,
                        tributos: users[i].dre.tributos,
                        servicos: [users[i].dre.servicos[0], users[i].dre.servicos[1], users[i].dre.servicos[2], users[i].dre.servicos[3]],
                        preco_medio: users[i].dre.preco_medio,
                        atendimentos: users[i].dre.atendimentos,
                        insumos_em_estoque: users[i].dre.insumos_em_estoque,
                        distribuidores: users[i].dre.distribuidores

                    }
                    users[i].fluxo_de_caixa = {
                        saldo_anterior: users[i].fluxo_de_caixa.saldo_anterior,
                        faturamento: users[i].fluxo_de_caixa.faturamento,
                        contas_a_receber: users[i].fluxo_de_caixa.contas_a_receber,
                        contas_a_receber_recebidas: users[i].fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                        custo_de_servico_prestado: users[i].fluxo_de_caixa.custo_de_servico_prestado,
                        emprestimos_contratados: users[i].fluxo_de_caixa.emprestimos_contratados,
                        emprestimos_pagos: users[i].fluxo_de_caixa.emprestimos_pagos,
                        veiculos_vendidos: users[i].fluxo_de_caixa.veiculos_vendidos,
                        depreciacao_de_veiculos: users[i].fluxo_de_caixa.depreciacao_de_veiculos,
                        depreciacao_de_maquinas: users[i].fluxo_de_caixa.depreciacao_de_maquinas + 2880,
                        veiculos_comprados: users[i].fluxo_de_caixa.veiculos_comprados,
                        tributos: users[i].fluxo_de_caixa.tributos,
                        promotores: users[i].fluxo_de_caixa.promotores,
                        propaganda: users[i].fluxo_de_caixa.propaganda,
                        pesquisas: users[i].fluxo_de_caixa.pesquisas,
                        pas: users[i].fluxo_de_caixa.pas,
                        uso_frota: users[i].fluxo_de_caixa.uso_frota,
                        despesas_operacionais_n_planejadas: users[i].fluxo_de_caixa.despesas_operacionais_n_planejadas,
                        despesas_administrativas: users[i].fluxo_de_caixa.despesas_administrativas,
                        encargos_financiamento: users[i].fluxo_de_caixa.encargos_financiamento,
                        maquinas: users[i].fluxo_de_caixa.maquinas,
                        distribuidores: users[i].fluxo_de_caixa.distribuidores
                    }


                    let media_user = users[i]['scorepreco'][1]/users[i]['scorepreco'][0]
                    dist = dist + Math.pow((preco_medio/media_user),2)
                    let somaF = 0
                    for(let f = 0; f < 12; f++){
                        somaF = somaF + users[i]['frota'][f]
                        if(users[i]['frota'][f] > 0){
                            users[i].taokeys = users[i].taokeys - users[i]['frota'][f]*10800
                            console.log("2 (- users[i]['frota'][f]*10800): " + users[i].taokeys)
                            users[i].balanco_patrimonial = {
                                caixa: users[i].balanco_patrimonial.caixa  - users[i]['frota'][f]*10800,
                                estoque: users[i].balanco_patrimonial.estoque,
                                contas_a_receber60: users[i].balanco_patrimonial.contas_a_receber60,
                                contas_a_receber120: users[i].balanco_patrimonial.contas_a_receber120,
                                maquinas: users[i].balanco_patrimonial.maquinas,
                                depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_maquinas,
                                veiculos: users[i].balanco_patrimonial.veiculos,
                                depreciacao_veiculos: users[i].balanco_patrimonial.depreciacao_veiculos + 2400*users[i]['frota'][f],//eh uma conta negativa no ativo
                                tributos_a_pagar_anterior: users[i].balanco_patrimonial.tributos_a_pagar_anterior,
                                tributos_a_pagar_atual: users[i].balanco_patrimonial.tributos_a_pagar_atual,
                                emprestimos: users[i].balanco_patrimonial.emprestimos,
                                capial: users[i].balanco_patrimonial.capial,
                                lucros_acumulados: users[i].balanco_patrimonial.lucros_acumulados - 2400*users[i]['frota'][f] - users[i]['frota'][f]*10800
                            }
                            users[i].dre = {
                                receita: users[i].dre.receita,
                                csp: users[i].dre.csp,
                                estoque_inicial: users[i].dre.estoque_inicial,
                                custo_prestacao_servico: users[i].dre.custo_prestacao_servico,
                                custo_estocagem: users[i].dre.custo_estocagem,
                                custo_troca_insumos: users[i].dre.custo_troca_insumos,
                                hora_extra: users[i].dre.hora_extra,
                                capacidade_n_utilizada: users[i].dre.capacidade_n_utilizada,
                                margem_bruta: users[i].dre.margem_bruta,
                                despesas_administrativas: users[i].dre.despesas_administrativas,
                                salario_promotores: users[i].dre.salario_promotores,
                                comissao: users[i].dre.comissao,
                                propaganda_institucional: users[i].dre.propaganda_institucional,
                                propaganda_unitaria: users[i].dre.propaganda_unitaria,
                                depreciacao_de_maquinas: users[i].dre.depreciacao_de_maquinas,
                                encargos_financiamento: users[i].dre.encargos_financiamento,
                                salario_frota: users[i].dre.salario_frota + users[i]['frota'][f]*4800,
                                manutencao_frota: users[i].dre.manutencao_frota + users[i]['frota'][f]*6000,
                                depreciacao_de_veiculos: users[i].dre.depreciacao_de_veiculos + 2400*users[i]['frota'][f],
                                frota_terceirizada: users[i].dre.frota_terceirizada,
                                despesas_operacionais_n_planejadas: users[i].dre.despesas_operacionais_n_planejadas,
                                pas: users[i].dre.pas,
                                pesquisas: users[i].dre.pesquisas,
                                tributos: users[i].dre.tributos,
                                servicos: [users[i].dre.servicos[0], users[i].dre.servicos[1], users[i].dre.servicos[2], users[i].dre.servicos[3]],
                                preco_medio: users[i].dre.preco_medio,
                                atendimentos: users[i].dre.atendimentos,
                                insumos_em_estoque: users[i].dre.insumos_em_estoque,
                                distribuidores: users[i].dre.distribuidores
    
                            }
                            users[i].fluxo_de_caixa = {
                                saldo_anterior: users[i].fluxo_de_caixa.saldo_anterior,
                                faturamento: users[i].fluxo_de_caixa.faturamento,
                                contas_a_receber: users[i].fluxo_de_caixa.contas_a_receber,
                                contas_a_receber_recebidas: users[i].fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                                custo_de_servico_prestado: users[i].fluxo_de_caixa.custo_de_servico_prestado + 10800*users[i]['frota'][f],
                                emprestimos_contratados: users[i].fluxo_de_caixa.emprestimos_contratados,
                                emprestimos_pagos: users[i].fluxo_de_caixa.emprestimos_pagos,
                                veiculos_vendidos: users[i].fluxo_de_caixa.veiculos_vendidos,
                                depreciacao_de_veiculos: users[i].fluxo_de_caixa.depreciacao_de_veiculos + 2400*users[i]['frota'][f],
                                depreciacao_de_maquinas: users[i].fluxo_de_caixa.depreciacao_de_maquinas,
                                veiculos_comprados: users[i].fluxo_de_caixa.veiculos_comprados,
                                tributos: users[i].fluxo_de_caixa.tributos,
                                promotores: users[i].fluxo_de_caixa.promotores,
                                propaganda: users[i].fluxo_de_caixa.propaganda,
                                pesquisas: users[i].fluxo_de_caixa.pesquisas,
                                pas: users[i].fluxo_de_caixa.pas,
                                uso_frota: users[i].fluxo_de_caixa.uso_frota,
                                despesas_operacionais_n_planejadas: users[i].fluxo_de_caixa.despesas_operacionais_n_planejadas,
                                despesas_administrativas: users[i].fluxo_de_caixa.despesas_administrativas,
                                encargos_financiamento: users[i].fluxo_de_caixa.encargos_financiamento,
                                maquinas: users[i].fluxo_de_caixa.maquinas,
                                distribuidores: users[i].fluxo_de_caixa.distribuidores
                            }
                            console.log("2 balan_caixa : " + users[i].balanco_patrimonial.caixa)
                        }
                        if(users[i]['frota'][f] > 0 && f == 11){
                            users[i].balanco_patrimonial = {
                                caixa: users[i].balanco_patrimonial.caixa,
                                estoque: users[i].balanco_patrimonial.estoque,
                                contas_a_receber60: users[i].balanco_patrimonial.contas_a_receber60,
                                contas_a_receber120: users[i].balanco_patrimonial.contas_a_receber120,
                                maquinas: users[i].balanco_patrimonial.maquinas,
                                depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_maquinas,
                                veiculos: users[i].balanco_patrimonial.veiculos - 57600*users[i]['frota'][f],
                                depreciacao_veiculos: users[i].balanco_patrimonial.depreciacao_veiculos - 57600*users[i]['frota'][f],
                                tributos_a_pagar_anterior: users[i].balanco_patrimonial.tributos_a_pagar_anterior,
                                tributos_a_pagar_atual: users[i].balanco_patrimonial.tributos_a_pagar_atual,
                                emprestimos: users[i].balanco_patrimonial.emprestimos,
                                capial: users[i].balanco_patrimonial.capial,
                                lucros_acumulados: users[i].balanco_patrimonial.lucros_acumulados
                            }
                        }
                    }
                    
                    users[i]['frota'].pop(); //depreciacao do veiculo! a cada turno apaga o ultimo elemento do array e adiciona um 0 no inicio, logo tds os elemtos q sobram avancam uma casa pra direita ou seja depreciam mais
                    users[i]['frota'].unshift(0);

                    for(let r = 0; r < index.length; r++){ //desconto no custo untario por ter experiencia no servico
                        if(users[i][index[r]][5] > 36000){ //problema (DANGER): qnd o simulador for contabilizar os SERVIÇOS prestados no futuro, apos a diminuição ocorrida apos os 36000 serviços prestados, o desconto na conta ESTOQUE sera menor do que o que realmente esta sendo retirado... (necessário encontrar um méio de contablizar corretamento)
                            let des = (users[i][index[r]][5] - users[i][index[r]][5]%36000)/36000
                            users[i].set(index[r], [users[i][index[r]][0], users[i][index[r]][1], (users[i][index[r]][2]*(Math.pow(0.9,des))), users[i][index[r]][3], users[i][index[r]][4], (users[i][index[r]][5] - des*36000), users[i][index[r]][6], users[i][index[r]][7]]) //Desconta 10% no custo unitario do serviço toda vez que o player obtem 36 mil ou mais vendas acumuladas.   
                        }
                    }
                }
                
                function sazonalidade(DemandaAnual) { //AJUSTAR VALORES!
                    if(adm.turno == 6){
                        console.log('||-=-=-=-=-=-=-=-=-=-=-||==> Game Over <==||-=-=-=-=-=-=-=-=-=-=-||')
                    }
                    if(adm.turno%6 == 0){
                        return DemandaAnual*0.25
                    }
                    else if(adm.turno%5 == 0){
                        return DemandaAnual*0.21
                    }
                    else if(adm.turno%4 == 0){    
                        return DemandaAnual*0.12
                    }
                    else if(adm.turno%3 == 0){
                        return DemandaAnual*0.12
                    }
                    else if(adm.turno%2 == 0){
                        return DemandaAnual*0.20
                    }
                    else if(adm.turno%1 == 0){
                        return DemandaAnual*0.10
                    }
                    else{
                        console.log('ERRO 666')
                        
                    }
                }

                let demanda = sazonalidade(adm['oferta_mercado'])

                for(let i = 0; i < users.length; i++){ 
                
                    let media_user = users[i]['scorepreco'][1]/users[i]['scorepreco'][0]
                    let scorepp = Math.pow((preco_medio/media_user),2)
                    let com = Number(users[i]['comissao'].slice(0,users[i]['comissao'].length-1))
                    //console.log('sua comiss: ' +Number(users[i]['comissao'].slice(0,users[i]['comissao'].length-1)))
                    users[i]['faturamento'] = (0.09*users[i]['distribuidores']/soma + 0.09*users[i]['pas']/soma1 + 0.07*users[i]['promotores']/soma2 + (0.06*com)/soma3 + 0.1*users[i]['propaganda']/soma5 + 0.12*users[i]['scoremod']/scorex + 0.3*(scorepp/dist) + 0.12*users[i]['propagandauni']/soma6 + 0.05*users[i]['npesquisas']/soma7)*demanda
                    console.log("Parcela de mercado conquistada para o player >>>" + users[i]['cooperativa'] + '<<<   || DISTRIBUIDORES (max 0.09) ==> ' + 0.09*users[i]['distribuidores']/soma + '<== || P.A.S. (max 0.09) ==>  ' + 0.09*users[i]['pas']/soma1 + '<== || PROMOTORES (max 0.07) ==> ' + 0.07*users[i]['promotores']/soma2 + '<== || COMISSAO (max 0.06) ==> ' + 0.06*com/soma3 + '<== || PROPAGANDA (max 0.10) ==> ' + 0.1*users[i]['propaganda']/soma5 + ' <== || QUALIDADE_DO_SERVICO (max 0.12) ==> ' + 0.12*users[i]['scoremod']/scorex + '<== || PRECO_DE_VENDA (max 0.30) ==> ' + 0.3*(scorepp/dist) + ' <== || PROPAGANDA_UNITARIA (max 0.12) ==> ' + 0.12*users[i]['propagandauni']/soma6 + '<== || NUMERO_DE_PESQUISAS (max 0.05) ==> ' + 0.05*users[i]['npesquisas']/soma7 + ' || |=|=|=| SOMA: ' + (0.05*users[i]['npesquisas']/soma7 + 0.12*users[i]['propagandauni']/soma6 + 0.3*(scorepp/dist) + 0.12*users[i]['scoremod']/scorex + 0.1*users[i]['propaganda']/soma5 + 0.06*(Number(users[i]['comissao'].slice(0,users[i]['comissao'].length-1)))/soma3 + 0.07*users[i]['promotores']/soma2 + 0.09*users[i]['pas']/soma1 + 0.09*users[i]['distribuidores']/soma) + ' |=|=|=|')
                    console.log((0.09*users[i]['distribuidores']/soma + 0.09*users[i]['pas']/soma1 + 0.07*users[i]['promotores']/soma2 + 0.06*com/soma3 + 0.1*users[i]['propaganda']/soma5 + 0.12*users[i]['scoremod']/scorex + 0.3*(scorepp/dist) + 0.12*users[i]['propagandauni']/soma6 + 0.05*users[i]['npesquisas']/soma7)*demanda)
                    //users[i]['faturamento'] = users[i]['faturamento']*0.95
                    //users[i]['faturamento']/users[i]['scorepreco'][1]  <-- qnts % vendeu do que foi planejado
                    //let base_trib = users[i]['faturamento'] - users[i]['promotores']*2160  - users[i]['pas']*2160 - users[i]['faturamento']*users[i]['comissao'] -720000 -50400
                    
                    //  -_-_-_-
                    //Apos a computacao do faturamento do player no codigo abaixo altera-se no Schema o lucro resultante desse faturamento levando em conta o faturamento planejado do player, como o professor instruiu \/
                    if(users[i].turno == 2){ 
                        users[i].taokeys = users[i].taokeys - users[i].balanco_patrimonial.tributos_a_pagar_anterior/2
                        console.log("3 (- users[i].balanco_patrimonial.tributos_a_pagar_anterior/2): " + users[i].taokeys)
                        users[i].balanco_patrimonial = {
                            caixa: users[i].balanco_patrimonial.caixa - users[i].balanco_patrimonial.tributos_a_pagar_anterior/2,
                            estoque: users[i].balanco_patrimonial.estoque,
                            contas_a_receber60: users[i].balanco_patrimonial.contas_a_receber60,
                            contas_a_receber120: users[i].balanco_patrimonial.contas_a_receber120,
                            maquinas: users[i].balanco_patrimonial.maquinas,
                            depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_maquinas,
                            veiculos: users[i].balanco_patrimonial.veiculos,
                            depreciacao_veiculos: users[i].balanco_patrimonial.depreciacao_veiculos,
                            tributos_a_pagar_anterior: users[i].balanco_patrimonial.tributos_a_pagar_anterior - users[i].balanco_patrimonial.tributos_a_pagar_anterior/2,
                            tributos_a_pagar_atual: users[i].balanco_patrimonial.tributos_a_pagar_atual,
                            emprestimos: users[i].balanco_patrimonial.emprestimos,
                            capial: users[i].balanco_patrimonial.capial,
                            lucros_acumulados: users[i].balanco_patrimonial.lucros_acumulados
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            csp: users[i].dre.csp,
                            estoque_inicial: users[i].dre.estoque_inicial,
                            custo_prestacao_servico: users[i].dre.custo_prestacao_servico,
                            custo_estocagem: users[i].dre.custo_estocagem,
                            custo_troca_insumos: users[i].dre.custo_troca_insumos,
                            hora_extra: users[i].dre.hora_extra,
                            capacidade_n_utilizada: users[i].dre.capacidade_n_utilizada,
                            margem_bruta: users[i].dre.margem_bruta,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            salario_promotores: users[i].dre.salario_promotores, //gambiarra
                            comissao: users[i].dre.comissao,
                            propaganda_institucional: users[i].dre.propaganda_institucional,
                            propaganda_unitaria: users[i].dre.propaganda_unitaria,
                            depreciacao_de_maquinas: users[i].dre.depreciacao_de_maquinas,
                            encargos_financiamento: users[i].dre.encargos_financiamento,
                            salario_frota: users[i].dre.salario_frota,
                            manutencao_frota: users[i].dre.manutencao_frota,
                            depreciacao_de_veiculos: users[i].dre.depreciacao_de_veiculos,
                            frota_terceirizada: users[i].dre.frota_terceirizada,
                            despesas_operacionais_n_planejadas: users[i].dre.despesas_operacionais_n_planejadas,
                            pas: users[i].dre.pas,
                            pesquisas: users[i].dre.pesquisas,
                            tributos: users[i].dre.tributos + users[i].balanco_patrimonial.tributos_a_pagar_anterior/2,
                            servicos: [users[i].dre.servicos[0], users[i].dre.servicos[1], users[i].dre.servicos[2], users[i].dre.servicos[3]],
                            preco_medio: users[i].dre.preco_medio,
                            atendimentos: users[i].dre.atendimentos,
                            insumos_em_estoque: users[i].dre.insumos_em_estoque,
                            distribuidores: users[i].dre.distribuidores //+ users[i]['distribuidores']*360
    
    
                        }
                        users[i].fluxo_de_caixa = {
                            saldo_anterior: users[i].fluxo_de_caixa.saldo_anterior,
                            faturamento: users[i].fluxo_de_caixa.faturamento,
                            contas_a_receber: users[i].fluxo_de_caixa.contas_a_receber,
                            contas_a_receber_recebidas: users[i].fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                            custo_de_servico_prestado: users[i].fluxo_de_caixa.custo_de_servico_prestado,
                            emprestimos_contratados: users[i].fluxo_de_caixa.emprestimos_contratados,
                            emprestimos_pagos: users[i].fluxo_de_caixa.emprestimos_pagos,
                            veiculos_vendidos: users[i].fluxo_de_caixa.veiculos_vendidos,
                            depreciacao_de_veiculos: users[i].fluxo_de_caixa.depreciacao_de_veiculos,
                            depreciacao_de_maquinas: users[i].fluxo_de_caixa.depreciacao_de_maquinas,
                            veiculos_comprados: users[i].fluxo_de_caixa.veiculos_comprados,
                            tributos: users[i].fluxo_de_caixa.tributos + users[i].balanco_patrimonial.tributos_a_pagar_anterior/2,
                            promotores: users[i].fluxo_de_caixa.promotores,
                            propaganda: users[i].fluxo_de_caixa.propaganda,
                            pesquisas: users[i].fluxo_de_caixa.pesquisas,
                            pas: users[i].fluxo_de_caixa.pas,
                            uso_frota: users[i].fluxo_de_caixa.uso_frota,
                            despesas_operacionais_n_planejadas: users[i].fluxo_de_caixa.despesas_operacionais_n_planejadas,
                            despesas_administrativas: users[i].fluxo_de_caixa.despesas_administrativas,
                            encargos_financiamento: users[i].fluxo_de_caixa.encargos_financiamento,
                            maquinas: users[i].fluxo_de_caixa.maquinas,
                            distribuidores: users[i].fluxo_de_caixa.distribuidores //+ users[i]['distribuidores']*360
                        }
                        console.log("3 balan_caixa : " + users[i].balanco_patrimonial.caixa)
                    }//PAGAMENTO DOS tributos e encargos do ano anterior
                    if(users[i].turno == 3){
                        users[i].taokeys = users[i].taokeys - users[i].balanco_patrimonial.tributos_a_pagar_anterior
                        console.log("4 (- users[i].balanco_patrimonial.tributos_a_pagar_anterior): " + users[i].taokeys)
                        users[i].balanco_patrimonial = {
                            caixa: users[i].balanco_patrimonial.caixa - users[i].balanco_patrimonial.tributos_a_pagar_anterior,
                            estoque: users[i].balanco_patrimonial.estoque,
                            contas_a_receber60: users[i].balanco_patrimonial.contas_a_receber60,
                            contas_a_receber120: users[i].balanco_patrimonial.contas_a_receber120,
                            maquinas: users[i].balanco_patrimonial.maquinas,
                            depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_maquinas,
                            veiculos: users[i].balanco_patrimonial.veiculos,
                            depreciacao_veiculos: users[i].balanco_patrimonial.depreciacao_veiculos,
                            tributos_a_pagar_anterior: users[i].balanco_patrimonial.tributos_a_pagar_anterior - users[i].balanco_patrimonial.tributos_a_pagar_anterior,
                            tributos_a_pagar_atual: users[i].balanco_patrimonial.tributos_a_pagar_atual,
                            emprestimos: users[i].balanco_patrimonial.emprestimos,
                            capial: users[i].balanco_patrimonial.capial,
                            lucros_acumulados: users[i].balanco_patrimonial.lucros_acumulados
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            csp: users[i].dre.csp,
                            estoque_inicial: users[i].dre.estoque_inicial,
                            custo_prestacao_servico: users[i].dre.custo_prestacao_servico,
                            custo_estocagem: users[i].dre.custo_estocagem,
                            custo_troca_insumos: users[i].dre.custo_troca_insumos,
                            hora_extra: users[i].dre.hora_extra,
                            capacidade_n_utilizada: users[i].dre.capacidade_n_utilizada,
                            margem_bruta: users[i].dre.margem_bruta,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            salario_promotores: users[i].dre.salario_promotores, //gambiarra
                            comissao: users[i].dre.comissao,
                            propaganda_institucional: users[i].dre.propaganda_institucional,
                            propaganda_unitaria: users[i].dre.propaganda_unitaria,
                            depreciacao_de_maquinas: users[i].dre.depreciacao_de_maquinas,
                            encargos_financiamento: users[i].dre.encargos_financiamento,
                            salario_frota: users[i].dre.salario_frota,
                            manutencao_frota: users[i].dre.manutencao_frota,
                            depreciacao_de_veiculos: users[i].dre.depreciacao_de_veiculos,
                            frota_terceirizada: users[i].dre.frota_terceirizada,
                            despesas_operacionais_n_planejadas: users[i].dre.despesas_operacionais_n_planejadas,
                            pas: users[i].dre.pas,
                            pesquisas: users[i].dre.pesquisas,
                            tributos: users[i].dre.tributos + users[i].balanco_patrimonial.tributos_a_pagar_anterior,
                            servicos: [users[i].dre.servicos[0], users[i].dre.servicos[1], users[i].dre.servicos[2], users[i].dre.servicos[3]],
                            preco_medio: users[i].dre.preco_medio,
                            atendimentos: users[i].dre.atendimentos,
                            insumos_em_estoque: users[i].dre.insumos_em_estoque,
                            distribuidores: users[i].dre.distribuidores //+ users[i]['distribuidores']*360
    
    
                        }
                        users[i].fluxo_de_caixa = {
                            saldo_anterior: users[i].fluxo_de_caixa.saldo_anterior,
                            faturamento: users[i].fluxo_de_caixa.faturamento,
                            contas_a_receber: users[i].fluxo_de_caixa.contas_a_receber,
                            contas_a_receber_recebidas: users[i].fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                            custo_de_servico_prestado: users[i].fluxo_de_caixa.custo_de_servico_prestado,
                            emprestimos_contratados: users[i].fluxo_de_caixa.emprestimos_contratados,
                            emprestimos_pagos: users[i].fluxo_de_caixa.emprestimos_pagos,
                            veiculos_vendidos: users[i].fluxo_de_caixa.veiculos_vendidos,
                            depreciacao_de_veiculos: users[i].fluxo_de_caixa.depreciacao_de_veiculos,
                            depreciacao_de_maquinas: users[i].fluxo_de_caixa.depreciacao_de_maquinas,
                            veiculos_comprados: users[i].fluxo_de_caixa.veiculos_comprados,
                            tributos: users[i].fluxo_de_caixa.tributos + users[i].balanco_patrimonial.tributos_a_pagar_anterior,
                            promotores: users[i].fluxo_de_caixa.promotores,
                            propaganda: users[i].fluxo_de_caixa.propaganda,
                            pesquisas: users[i].fluxo_de_caixa.pesquisas,
                            pas: users[i].fluxo_de_caixa.pas,
                            uso_frota: users[i].fluxo_de_caixa.uso_frota,
                            despesas_operacionais_n_planejadas: users[i].fluxo_de_caixa.despesas_operacionais_n_planejadas,
                            despesas_administrativas: users[i].fluxo_de_caixa.despesas_administrativas,
                            encargos_financiamento: users[i].fluxo_de_caixa.encargos_financiamento,
                            maquinas: users[i].fluxo_de_caixa.maquinas,
                            distribuidores: users[i].fluxo_de_caixa.distribuidores //+ users[i]['distribuidores']*360
                        }
                        console.log("4 balan_caixa : " + users[i].balanco_patrimonial.caixa)
                    }//segunda parcela /\
                    users[i].taokeys = users[i].taokeys + users[i].balanco_patrimonial.contas_a_receber60 - users[i]['faturamento']*0.08 - users[i]['promotores']*2160  - users[i]['pas']*2160 - users[i]['faturamento']*(Number(users[i]['comissao'].slice(0,users[i]['comissao'].length-1)*0.01)) -720000 -50400// apenas no CBG>> - users[i]['distribuidores']*360
                    console.log("5 (+ users[i].balanco_patrimonial.contas_a_receber60 - users[i]['faturamento']*0.08 - users[i]['promotores']*2160  - users[i]['pas']*2160 - users[i]['faturamento']*(Number(users[i]['comissao'].slice(0,users[i]['comissao'].length-1)*0.01)) -720000 -50400): " + users[i].taokeys)
                    users[i].balanco_patrimonial = {
                        caixa: users[i].balanco_patrimonial.caixa + users[i].balanco_patrimonial.contas_a_receber60 - users[i]['faturamento']*0.08 - users[i]['promotores']*2160  - users[i]['pas']*2160 - users[i]['faturamento']*(Number(users[i]['comissao'].slice(0,users[i]['comissao'].length-1)*0.01)) - 720000 -50400, //- users[i]['distribuidores']*360
                        estoque: users[i].balanco_patrimonial.estoque,
                        contas_a_receber60: users[i].balanco_patrimonial.contas_a_receber120,
                        contas_a_receber120: 0,
                        maquinas: users[i].balanco_patrimonial.maquinas,
                        depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_maquinas,
                        veiculos: users[i].balanco_patrimonial.veiculos,
                        depreciacao_veiculos: users[i].balanco_patrimonial.depreciacao_veiculos,
                        tributos_a_pagar_anterior: users[i].balanco_patrimonial.tributos_a_pagar_anterior,
                        tributos_a_pagar_atual: users[i].balanco_patrimonial.tributos_a_pagar_atual,
                        emprestimos: users[i].balanco_patrimonial.emprestimos,
                        capial: users[i].balanco_patrimonial.capial,
                        lucros_acumulados: users[i].balanco_patrimonial.lucros_acumulados - users[i]['faturamento']*0.08 - users[i]['promotores']*2160 - users[i]['pas']*2160 - users[i]['faturamento']*(Number(users[i]['comissao'].slice(0,users[i]['comissao'].length-1)*0.01)) - 720000 - 50400//>> - users[i]['distribuidores']*360
                    }
                    users[i].dre = {
                        receita: users[i].dre.receita,
                        csp: users[i].dre.csp,
                        estoque_inicial: users[i].dre.estoque_inicial,
                        custo_prestacao_servico: users[i].dre.custo_prestacao_servico,
                        custo_estocagem: users[i].dre.custo_estocagem,
                        custo_troca_insumos: users[i].dre.custo_troca_insumos,
                        hora_extra: users[i].dre.hora_extra,
                        capacidade_n_utilizada: users[i].dre.capacidade_n_utilizada,
                        margem_bruta: users[i].dre.margem_bruta,
                        despesas_administrativas: users[i].dre.despesas_administrativas + 720000,
                        salario_promotores: users[i].dre.salario_promotores + users[i]['promotores']*2160, //gambiarra
                        comissao: users[i].dre.comissao + users[i]['faturamento']*(Number(users[i]['comissao'].slice(0,users[i]['comissao'].length-1)*0.01)*0.01),
                        propaganda_institucional: users[i].dre.propaganda_institucional,
                        propaganda_unitaria: users[i].dre.propaganda_unitaria,
                        depreciacao_de_maquinas: users[i].dre.depreciacao_de_maquinas,
                        encargos_financiamento: users[i].dre.encargos_financiamento,
                        salario_frota: users[i].dre.salario_frota,
                        manutencao_frota: users[i].dre.manutencao_frota,
                        depreciacao_de_veiculos: users[i].dre.depreciacao_de_veiculos,
                        frota_terceirizada: users[i].dre.frota_terceirizada,
                        despesas_operacionais_n_planejadas: users[i].dre.despesas_operacionais_n_planejadas,
                        pas: users[i].dre.pas + users[i]['pas']*2160 + 50400,
                        pesquisas: users[i].dre.pesquisas,
                        tributos: users[i].dre.tributos + users[i]['faturamento']*0.08,
                        servicos: [users[i].dre.servicos[0], users[i].dre.servicos[1], users[i].dre.servicos[2], users[i].dre.servicos[3]],
                        preco_medio: users[i].dre.preco_medio,
                        atendimentos: users[i].dre.atendimentos,
                        insumos_em_estoque: users[i].dre.insumos_em_estoque,
                        distribuidores: users[i].dre.distribuidores //+ users[i]['distribuidores']*360


                    }
                    users[i].fluxo_de_caixa = {
                        saldo_anterior: users[i].fluxo_de_caixa.saldo_anterior,
                        faturamento: users[i].fluxo_de_caixa.faturamento + users[i]['faturamento'],
                        contas_a_receber: users[i].fluxo_de_caixa.contas_a_receber,
                        contas_a_receber_recebidas: users[i].fluxo_de_caixa.contas_a_receber_recebidas + users[i].balanco_patrimonial.contas_a_receber60, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                        custo_de_servico_prestado: users[i].fluxo_de_caixa.custo_de_servico_prestado,
                        emprestimos_contratados: users[i].fluxo_de_caixa.emprestimos_contratados,
                        emprestimos_pagos: users[i].fluxo_de_caixa.emprestimos_pagos,
                        veiculos_vendidos: users[i].fluxo_de_caixa.veiculos_vendidos,
                        depreciacao_de_veiculos: users[i].fluxo_de_caixa.depreciacao_de_veiculos,
                        depreciacao_de_maquinas: users[i].fluxo_de_caixa.depreciacao_de_maquinas,
                        veiculos_comprados: users[i].fluxo_de_caixa.veiculos_comprados,
                        tributos: users[i].fluxo_de_caixa.tributos,
                        promotores: users[i].fluxo_de_caixa.promotores + users[i]['promotores']*2160 + users[i]['faturamento']*(Number(users[i]['comissao'].slice(0,users[i]['comissao'].length-1)*0.01)),
                        propaganda: users[i].fluxo_de_caixa.propaganda,
                        pesquisas: users[i].fluxo_de_caixa.pesquisas,
                        pas: users[i].fluxo_de_caixa.pas + users[i]['pas']*2160 + 50400,
                        uso_frota: users[i].fluxo_de_caixa.uso_frota,
                        despesas_operacionais_n_planejadas: users[i].fluxo_de_caixa.despesas_operacionais_n_planejadas,
                        despesas_administrativas: users[i].fluxo_de_caixa.despesas_administrativas,
                        encargos_financiamento: users[i].fluxo_de_caixa.encargos_financiamento,
                        maquinas: users[i].fluxo_de_caixa.maquinas,
                        distribuidores: users[i].fluxo_de_caixa.distribuidores //+ users[i]['distribuidores']*360
                    }
                    console.log("5 balan_caixa : " + users[i].balanco_patrimonial.caixa)

                    

                    let uso_frota = 0;

                    for(let o = 0; o < index.length; o++){
                        
                        users[i].set(index[o],[users[i][index[o]][0], users[i][index[o]][1], users[i][index[o]][2], users[i][index[o]][3], users[i][index[o]][4], users[i][index[o]][5], 0, users[i][index[o]][7]])
                        if(users[i][index[o]][4] > 0){
                            
                            users[i].balanco_patrimonial = {
                                caixa: users[i].balanco_patrimonial.caixa,
                                estoque: users[i].balanco_patrimonial.estoque - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i][index[o]][4]*(users[i][index[o]][2]), //DANGER - ser houver acontecido o desconto de 10%
                                contas_a_receber60: (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i][index[o]][4]*(users[i][index[o]][3])*0.5 + users[i].balanco_patrimonial.contas_a_receber60,
                                contas_a_receber120: (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i][index[o]][4]*(users[i][index[o]][3])*0.5 + users[i].balanco_patrimonial.contas_a_receber120,
                                maquinas: users[i].balanco_patrimonial.maquinas,
                                depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_maquinas,
                                veiculos: users[i].balanco_patrimonial.veiculos,
                                depreciacao_veiculos: users[i].balanco_patrimonial.depreciacao_veiculos,
                                tributos_a_pagar_anterior: users[i].balanco_patrimonial.tributos_a_pagar_anterior,
                                tributos_a_pagar_atual: users[i].balanco_patrimonial.tributos_a_pagar_atual,
                                emprestimos: users[i].balanco_patrimonial.emprestimos,
                                capial: users[i].balanco_patrimonial.capial,
                                lucros_acumulados: users[i].balanco_patrimonial.lucros_acumulados - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i][index[o]][4]*(users[i][index[o]][2]) + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i][index[o]][4]*(users[i][index[o]][3])
                            }
                            users[i].dre = {
                                receita: users[i].dre.receita + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i][index[o]][4]*(users[i][index[o]][3]), 
                                csp: users[i].dre.csp + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i][index[o]][4]*(users[i][index[o]][2]), 
                                estoque_inicial: users[i].dre.estoque_inicial,
                                custo_prestacao_servico: users[i].dre.custo_prestacao_servico + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i][index[o]][4]*(users[i][index[o]][2]),
                                custo_estocagem: users[i].dre.custo_estocagem,
                                custo_troca_insumos: users[i].dre.custo_troca_insumos,
                                hora_extra: users[i].dre.hora_extra,
                                capacidade_n_utilizada: users[i].dre.capacidade_n_utilizada,
                                margem_bruta: users[i].dre.margem_bruta,
                                despesas_administrativas: users[i].dre.despesas_administrativas,
                                salario_promotores: users[i].dre.salario_promotores,
                                comissao: users[i].dre.comissao,
                                propaganda_institucional: users[i].dre.propaganda_institucional,
                                propaganda_unitaria: users[i].dre.propaganda_unitaria,
                                depreciacao_de_maquinas: users[i].dre.depreciacao_de_maquinas,
                                encargos_financiamento: users[i].dre.encargos_financiamento,
                                salario_frota: users[i].dre.salario_frota,
                                manutencao_frota: users[i].dre.manutencao_frota,
                                depreciacao_de_veiculos: users[i].dre.depreciacao_de_veiculos,
                                frota_terceirizada: users[i].dre.frota_terceirizada,
                                despesas_operacionais_n_planejadas: users[i].dre.despesas_operacionais_n_planejadas,
                                pas: users[i].dre.pas,
                                pesquisas: users[i].dre.pesquisas,
                                tributos: users[i].dre.tributos,
                                servicos: [users[i].dre.servicos[0],users[i].dre.servicos[1],users[i].dre.servicos[2],users[i].dre.servicos[3]],
                                preco_medio: users[i].dre.preco_medio,
                                atendimentos: users[i].dre.atendimentos,
                                insumos_em_estoque: users[i].dre.insumos_em_estoque// + (users[i][index[o]][0]*users[i][index[o]][2] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i][index[o]][4]*(users[i][index[o]][2]))
        

        
                            }
                            
                            users[i].fluxo_de_caixa = {
                                saldo_anterior: users[i].fluxo_de_caixa.saldo_anterior,
                                faturamento: users[i].fluxo_de_caixa.faturamento,
                                contas_a_receber: users[i].fluxo_de_caixa.contas_a_receber + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i][index[o]][4]*(users[i][index[o]][3]),
                                contas_a_receber_recebidas: users[i].fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                                custo_de_servico_prestado: users[i].fluxo_de_caixa.custo_de_servico_prestado,
                                emprestimos_contratados: users[i].fluxo_de_caixa.emprestimos_contratados,
                                emprestimos_pagos: users[i].fluxo_de_caixa.emprestimos_pagos,
                                veiculos_vendidos: users[i].fluxo_de_caixa.veiculos_vendidos,
                                depreciacao_de_veiculos: users[i].fluxo_de_caixa.depreciacao_de_veiculos,
                                depreciacao_de_maquinas: users[i].fluxo_de_caixa.depreciacao_de_maquinas,
                                veiculos_comprados: users[i].fluxo_de_caixa.veiculos_comprados,
                                tributos: users[i].fluxo_de_caixa.tributos,
                                promotores: users[i].fluxo_de_caixa.promotores,
                                propaganda: users[i].fluxo_de_caixa.propaganda,
                                pesquisas: users[i].fluxo_de_caixa.pesquisas,
                                pas: users[i].fluxo_de_caixa.pas,
                                uso_frota: users[i].fluxo_de_caixa.uso_frota,
                                despesas_operacionais_n_planejadas: users[i].fluxo_de_caixa.despesas_operacionais_n_planejadas,
                                despesas_administrativas: users[i].fluxo_de_caixa.despesas_administrativas,
                                encargos_financiamento: users[i].fluxo_de_caixa.encargos_financiamento,
                                maquinas: users[i].fluxo_de_caixa.maquinas,
                                distribuidores: users[i].fluxo_de_caixa.distribuidores
                            }


                            let array_insu = [(users[i][index[o]][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i][index[o]][4]), users[i][index[o]][1], users[i][index[o]][2], users[i][index[o]][3], users[i][index[o]][4],(users[i][index[o]][5] + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i][index[o]][4]), (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i][index[o]][4]*users[i][index[o]][3], 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i][index[o]][4]*(users[i][index[o]][3])]
                            users[i].dre = {
                                receita: users[i].dre.receita, 
                                csp: users[i].dre.csp, 
                                estoque_inicial: users[i].dre.estoque_inicial + users[i][index[o]][0]*users[i][index[o]][2],
                                custo_prestacao_servico: users[i].dre.custo_prestacao_servico,
                                custo_estocagem: users[i].dre.custo_estocagem,
                                custo_troca_insumos: users[i].dre.custo_troca_insumos,
                                hora_extra: users[i].dre.hora_extra,
                                capacidade_n_utilizada: users[i].dre.capacidade_n_utilizada,
                                margem_bruta: users[i].dre.margem_bruta,
                                despesas_administrativas: users[i].dre.despesas_administrativas,
                                salario_promotores: users[i].dre.salario_promotores,
                                comissao: users[i].dre.comissao,
                                propaganda_institucional: users[i].dre.propaganda_institucional,
                                propaganda_unitaria: users[i].dre.propaganda_unitaria,
                                depreciacao_de_maquinas: users[i].dre.depreciacao_de_maquinas,
                                encargos_financiamento: users[i].dre.encargos_financiamento,
                                salario_frota: users[i].dre.salario_frota,
                                manutencao_frota: users[i].dre.manutencao_frota,
                                depreciacao_de_veiculos: users[i].dre.depreciacao_de_veiculos,
                                frota_terceirizada: users[i].dre.frota_terceirizada,
                                despesas_operacionais_n_planejadas: users[i].dre.despesas_operacionais_n_planejadas,
                                pas: users[i].dre.pas,
                                pesquisas: users[i].dre.pesquisas,
                                tributos: users[i].dre.tributos,
                                servicos: [users[i].dre.servicos[0],users[i].dre.servicos[1],users[i].dre.servicos[2],users[i].dre.servicos[3]],
                                preco_medio: users[i].dre.preco_medio,
                                atendimentos: users[i].dre.atendimentos + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i][index[o]][4],
                                insumos_em_estoque: users[i].dre.insumos_em_estoque + users[i][index[o]][0]
        
        
                            } //CONTABILIZA os estoques inicias dos servicos e atendimentos realizados (para DRE)
                            //(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['147'][4]*users[i]['147'][3] => igual ao faturamento obtido pelo jogador nesse serviço especifico
                            
                            users[i].set(index[o], array_insu)
                            if(users[i].last_change.serv1 == index[o]){
                                if(users[i][index[o]][0] > 0){
                                users[i].last_change =  {
                                    prop1: users[i].last_change.prop1,
                                    prop2: users[i].last_change.prop2,
                                    serv1: users[i].last_change.serv1,
                                    serv2: users[i].last_change.serv2,
                                    insu1: users[i].last_change.insu1,
                                    insu2: users[i].last_change.insu2,
                                    insu2i: users[i].last_change.insu2i,
                                    insu1i: users[i][index[o]][0]
                                }
                                }
                                else{
                                    users[i].last_change =  {
                                        prop1: users[i].last_change.prop1,
                                        prop2: users[i].last_change.prop2,
                                        serv1: users[i].last_change.serv1,
                                        serv2: users[i].last_change.serv2,
                                        insu1: users[i].last_change.insu1,
                                        insu2: users[i].last_change.insu2,
                                        insu2i: users[i].last_change.insu2i,
                                        insu1i: 0
                                    }
                                }

                            }
                            if(users[i].last_change.serv2 == index[o]){
                                if(users[i][index[o]][0] > 0){
                                users[i].last_change =  {
                                    prop1: users[i].last_change.prop1,
                                    prop2: users[i].last_change.prop2,
                                    serv1: users[i].last_change.serv1,
                                    serv2: users[i].last_change.serv2,
                                    insu1: users[i].last_change.insu1,
                                    insu2: users[i].last_change.insu2,
                                    insu1i: users[i].last_change.insu1i,
                                    insu2i: users[i][index[o]][0]
                                }
                                }
                                else{
                                    users[i].last_change =  {
                                        prop1: users[i].last_change.prop1,
                                        prop2: users[i].last_change.prop2,
                                        serv1: users[i].last_change.serv1,
                                        serv2: users[i].last_change.serv2,
                                        insu1: users[i].last_change.insu1,
                                        insu2: users[i].last_change.insu2,
                                        insu1i: users[i].last_change.insu1i,
                                        insu2i: 0
                                    }
                                }

                            }
                            
                            
                            //users[i].balanco_patrimonial.contas_a_receber = users[i]['147'][7]
                            
                            //users[i][index[o]][0] = users[i]['147'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['147'][4]
                            if(users[i][index[o]][0] >= 0){
                                 
                                users[i].taokeys = users[i].taokeys - users[i][index[o]][0]*36
                                console.log("6 (- users[i][index[o]][0]*36): " + users[i].taokeys)
    

                                users[i].balanco_patrimonial = {
                                caixa: users[i].balanco_patrimonial.caixa - users[i][index[o]][0]*36,
                                estoque: users[i].balanco_patrimonial.estoque,
                                contas_a_receber60: users[i].balanco_patrimonial.contas_a_receber60,
                                contas_a_receber120: users[i].balanco_patrimonial.contas_a_receber120,
                                maquinas: users[i].balanco_patrimonial.maquinas,
                                depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_maquinas,
                                veiculos: users[i].balanco_patrimonial.veiculos,
                                depreciacao_veiculos: users[i].balanco_patrimonial.depreciacao_veiculos,
                                tributos_a_pagar_anterior: users[i].balanco_patrimonial.tributos_a_pagar_anterior,
                                tributos_a_pagar_atual: users[i].balanco_patrimonial.tributos_a_pagar_atual,
                                emprestimos: users[i].balanco_patrimonial.emprestimos,
                                capial: users[i].balanco_patrimonial.capial,
                                lucros_acumulados: users[i].balanco_patrimonial.lucros_acumulados - users[i][index[o]][0]*36
                            }
                                //tbb contabiliza os estoques nao utilizados na DRE \/
                                users[i].dre = {
                                    receita: users[i].dre.receita, 
                                    csp: users[i].dre.csp + users[i][index[o]][0]*36,
                                    estoque_inicial: users[i].dre.estoque_inicial,
                                    custo_prestacao_servico: users[i].dre.custo_prestacao_servico,
                                    custo_estocagem: users[i].dre.custo_estocagem + users[i][index[o]][0]*36,
                                    custo_troca_insumos: users[i].dre.custo_troca_insumos,
                                    hora_extra: users[i].dre.hora_extra,
                                    capacidade_n_utilizada: users[i].dre.capacidade_n_utilizada + users[i][index[o]][0],
                                    margem_bruta: users[i].dre.margem_bruta,
                                    despesas_administrativas: users[i].dre.despesas_administrativas,
                                    salario_promotores: users[i].dre.salario_promotores,
                                    comissao: users[i].dre.comissao,
                                    propaganda_institucional: users[i].dre.propaganda_institucional,
                                    propaganda_unitaria: users[i].dre.propaganda_unitaria,
                                    depreciacao_de_maquinas: users[i].dre.depreciacao_de_maquinas,
                                    encargos_financiamento: users[i].dre.encargos_financiamento,
                                    salario_frota: users[i].dre.salario_frota,
                                    manutencao_frota: users[i].dre.manutencao_frota,
                                    depreciacao_de_veiculos: users[i].dre.depreciacao_de_veiculos,
                                    frota_terceirizada: users[i].dre.frota_terceirizada,
                                    despesas_operacionais_n_planejadas: users[i].dre.despesas_operacionais_n_planejadas,
                                    pas: users[i].dre.pas,
                                    pesquisas: users[i].dre.pesquisas,
                                    tributos: users[i].dre.tributos,
                                    servicos: [users[i].dre.servicos[0],users[i].dre.servicos[1],users[i].dre.servicos[2],users[i].dre.servicos[3]],
                                    preco_medio: users[i].dre.preco_medio,
                                    atendimentos: users[i].dre.atendimentos,
                                    insumos_em_estoque: users[i].dre.insumos_em_estoque
                                }
                                users[i].fluxo_de_caixa = {
                                    saldo_anterior: users[i].fluxo_de_caixa.saldo_anterior,
                                    faturamento: users[i].fluxo_de_caixa.faturamento,
                                    contas_a_receber: users[i].fluxo_de_caixa.contas_a_receber,
                                    contas_a_receber_recebidas: users[i].fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                                    custo_de_servico_prestado: users[i].fluxo_de_caixa.custo_de_servico_prestado + users[i][index[o]][0]*36,
                                    emprestimos_contratados: users[i].fluxo_de_caixa.emprestimos_contratados,
                                    emprestimos_pagos: users[i].fluxo_de_caixa.emprestimos_pagos,
                                    veiculos_vendidos: users[i].fluxo_de_caixa.veiculos_vendidos,
                                    depreciacao_de_veiculos: users[i].fluxo_de_caixa.depreciacao_de_veiculos,
                                    depreciacao_de_maquinas: users[i].fluxo_de_caixa.depreciacao_de_maquinas,
                                    veiculos_comprados: users[i].fluxo_de_caixa.veiculos_comprados,
                                    tributos: users[i].fluxo_de_caixa.tributos,
                                    promotores: users[i].fluxo_de_caixa.promotores,
                                    propaganda: users[i].fluxo_de_caixa.propaganda,
                                    pesquisas: users[i].fluxo_de_caixa.pesquisas,
                                    pas: users[i].fluxo_de_caixa.pas,
                                    uso_frota: users[i].fluxo_de_caixa.uso_frota,
                                    despesas_operacionais_n_planejadas: users[i].fluxo_de_caixa.despesas_operacionais_n_planejadas,
                                    despesas_administrativas: users[i].fluxo_de_caixa.despesas_administrativas,
                                    encargos_financiamento: users[i].fluxo_de_caixa.encargos_financiamento,
                                    maquinas: users[i].fluxo_de_caixa.maquinas
                                }    
                                console.log("6 balan_caixa : " + users[i].balanco_patrimonial.caixa)                  

                            }
                            else{
                                console.log("antes 7: " + users[i].taokeys)
                                users[i].taokeys = users[i].taokeys + users[i][index[o]][0]*users[i][index[o]][2]*1.2
                                console.log("7 (+ users[i][index[o]][0]*users[i][index[o]][2]*1.2): " + users[i].taokeys)
                                users[i].balanco_patrimonial = {
                                    caixa: users[i].balanco_patrimonial.caixa + users[i][index[o]][0]*users[i][index[o]][2]*1.2,
                                    estoque: users[i].balanco_patrimonial.estoque + (-1)*(users[i][index[o]][0]*users[i][index[o]][2]),
                                    contas_a_receber60: users[i].balanco_patrimonial.contas_a_receber60,
                                    contas_a_receber120: users[i].balanco_patrimonial.contas_a_receber120,
                                    maquinas: users[i].balanco_patrimonial.maquinas,
                                    depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_maquinas,
                                    veiculos: users[i].balanco_patrimonial.veiculos,
                                    depreciacao_veiculos: users[i].balanco_patrimonial.depreciacao_veiculos,
                                    tributos_a_pagar_anterior: users[i].balanco_patrimonial.tributos_a_pagar_anterior,
                                    tributos_a_pagar_atual: users[i].balanco_patrimonial.tributos_a_pagar_atual,
                                    emprestimos: users[i].balanco_patrimonial.emprestimos,
                                    capial: users[i].balanco_patrimonial.capial,
                                    lucros_acumulados: users[i].balanco_patrimonial.lucros_acumulados + users[i][index[o]][0]*users[i][index[o]][2]*1.2 + (-1)*(users[i][index[o]][0]*users[i][index[o]][2])
                                }
                                users[i].dre = {
                                    receita: users[i].dre.receita, 
                                    csp: users[i].dre.csp + users[i][index[o]][0]*(users[i][index[o]][2]) + (-1)*users[i][index[o]][0]*users[i][index[o]][2]*1.2,
                                    estoque_inicial: users[i].dre.estoque_inicial,
                                    custo_prestacao_servico: users[i].dre.custo_prestacao_servico,
                                    custo_estocagem: users[i].dre.custo_estocagem,
                                    custo_troca_insumos: users[i].dre.custo_troca_insumos,
                                    hora_extra: users[i].dre.hora_extra,
                                    capacidade_n_utilizada: users[i].dre.capacidade_n_utilizada,
                                    margem_bruta: users[i].dre.margem_bruta,
                                    despesas_administrativas: users[i].dre.despesas_administrativas,
                                    salario_promotores: users[i].dre.salario_promotores,
                                    comissao: users[i].dre.comissao,
                                    propaganda_institucional: users[i].dre.propaganda_institucional,
                                    propaganda_unitaria: users[i].dre.propaganda_unitaria,
                                    depreciacao_de_maquinas: users[i].dre.depreciacao_de_maquinas,
                                    encargos_financiamento: users[i].dre.encargos_financiamento,
                                    salario_frota: users[i].dre.salario_frota,
                                    manutencao_frota: users[i].dre.manutencao_frota,
                                    depreciacao_de_veiculos: users[i].dre.depreciacao_de_veiculos,
                                    frota_terceirizada: users[i].dre.frota_terceirizada,
                                    despesas_operacionais_n_planejadas: users[i].dre.despesas_operacionais_n_planejadas,
                                    pas: users[i].dre.pas,
                                    pesquisas: users[i].dre.pesquisas,
                                    tributos: users[i].dre.tributos,
                                    servicos: [users[i].dre.servicos[0],users[i].dre.servicos[1],users[i].dre.servicos[2],users[i].dre.servicos[3]],
                                    preco_medio: users[i].dre.preco_medio,
                                    atendimentos: users[i].dre.atendimentos,
                                    insumos_em_estoque: users[i].dre.insumos_em_estoque// + (-1)*users[i][index[o]][0]*users[i][index[o]][2]
            
            
                                }
                                users[i].fluxo_de_caixa = {
                                    saldo_anterior: users[i].fluxo_de_caixa.saldo_anterior,
                                    faturamento: users[i].fluxo_de_caixa.faturamento,
                                    contas_a_receber: users[i].fluxo_de_caixa.contas_a_receber,
                                    contas_a_receber_recebidas: users[i].fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                                    custo_de_servico_prestado: users[i].fluxo_de_caixa.custo_de_servico_prestado + users[i][index[o]][0]*users[i][index[o]][2]*1.2,
                                    emprestimos_contratados: users[i].fluxo_de_caixa.emprestimos_contratados,
                                    emprestimos_pagos: users[i].fluxo_de_caixa.emprestimos_pagos,
                                    veiculos_vendidos: users[i].fluxo_de_caixa.veiculos_vendidos,
                                    depreciacao_de_veiculos: users[i].fluxo_de_caixa.depreciacao_de_veiculos,
                                    depreciacao_de_maquinas: users[i].fluxo_de_caixa.depreciacao_de_maquinas,
                                    veiculos_comprados: users[i].fluxo_de_caixa.veiculos_comprados,
                                    tributos: users[i].fluxo_de_caixa.tributos,
                                    promotores: users[i].fluxo_de_caixa.promotores,
                                    propaganda: users[i].fluxo_de_caixa.propaganda,
                                    pesquisas: users[i].fluxo_de_caixa.pesquisas,
                                    pas: users[i].fluxo_de_caixa.pas,
                                    uso_frota: users[i].fluxo_de_caixa.uso_frota,
                                    despesas_operacionais_n_planejadas: users[i].fluxo_de_caixa.despesas_operacionais_n_planejadas,
                                    despesas_administrativas: users[i].fluxo_de_caixa.despesas_administrativas,
                                    encargos_financiamento: users[i].fluxo_de_caixa.encargos_financiamento,
                                    maquinas: users[i].fluxo_de_caixa.maquinas
                                }
                                console.log("7 balan_caixa : " + users[i].balanco_patrimonial.caixa)  

                                
                                users[i].set(index[o], [0, users[i][index[o]][1], users[i][index[o]][2], users[i][index[o]][3], users[i][index[o]][4], users[i][index[o]][5], users[i][index[o]][6], users[i][index[o]][7]])
                            }

                            if(index[o][2] == '9' || index[o][2] == 9){
                                uso_frota = uso_frota + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i][index[o]][4]
                            }
                            else if(index[o][2] == '8' || index[o][2] == 8){
                                uso_frota = uso_frota + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i][index[o]][4]/2
                            }
                            else{}

                        }
                    }
                    
                    users[i]['scoremod'] = 1
                    users[i]['propaganda'] = 1
                    users[i]['propagandauni'] = 1
                    users[i]['npesquisas'] = 1
                    console.log('ss')
                    for(let o = 0; o < index.length; o++){ //ATUALIZA o estado de cada serviço (se esta em processo de cancelamento sera cancelado e etc)
                        let ser = index[o]
                        if(users[i][ser][1] == 3){
                            let array_dados_novo = [users[i][ser][0], 0, users[i][ser][2], users[i][ser][3], users[i][ser][4], users[i][ser][5], users[i][ser][6], users[i][ser][7]];
                            users[i].set(ser, array_dados_novo)
                        }
                        if(users[i][ser][1] == 2){
                            let array_dados_novo = [users[i][ser][0], 3, users[i][ser][2], users[i][ser][3], users[i][ser][4], users[i][ser][5], users[i][ser][6], users[i][ser][7]];
                            users[i].set(ser, array_dados_novo)
                        }
                    }


                    //   
                    let frota_soma = 0;
                    for(let h = 0; h < users[i]['frota'].length; h++){

                        frota_soma = frota_soma + users[i]['frota'][h]
                    }
                    users[i].pas = users[i].pas + users[i].pas1;
                    users[i].pas1 = users[i].pas2;
                    users[i].pas2 = 0;
                    console.log('llll')
                    if(uso_frota/2000 > frota_soma){
                        let j = (uso_frota%2000)
                        if(j > 0){
                            users[i].taokeys = users[i].taokeys - (((uso_frota-j)/2000)-frota_soma+1)*60 //desconta o valor gasto com frota terceirizada
                            console.log("8 (- (((uso_frota-j)/2000)-frota_soma+1)*60): " + users[i].taokeys)
                            users[i].balanco_patrimonial = {
                                caixa: users[i].balanco_patrimonial.caixa - (((uso_frota-j)/2000)-frota_soma+1)*60,
                                estoque: users[i].balanco_patrimonial.estoque,
                                contas_a_receber60: users[i].balanco_patrimonial.contas_a_receber60,
                                contas_a_receber120: users[i].balanco_patrimonial.contas_a_receber120,
                                maquinas: users[i].balanco_patrimonial.maquinas,
                                depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_maquinas,
                                veiculos: users[i].balanco_patrimonial.veiculos,
                                depreciacao_veiculos: users[i].balanco_patrimonial.depreciacao_veiculos,
                                tributos_a_pagar_anterior: users[i].balanco_patrimonial.tributos_a_pagar_anterior,
                                tributos_a_pagar_atual: users[i].balanco_patrimonial.tributos_a_pagar_atual,
                                emprestimos: users[i].balanco_patrimonial.emprestimos,
                                capial: users[i].balanco_patrimonial.capial,
                                lucros_acumulados: users[i].balanco_patrimonial.lucros_acumulados - (((uso_frota-j)/2000)-frota_soma+1)*60
                            }
                            users[i].dre = {
                                receita: users[i].dre.receita,
                                csp: users[i].dre.csp,
                                estoque_inicial: users[i].dre.estoque_inicial,
                                custo_prestacao_servico: users[i].dre.custo_prestacao_servico,
                                custo_estocagem: users[i].dre.custo_estocagem,
                                custo_troca_insumos: users[i].dre.custo_troca_insumos,
                                hora_extra: users[i].dre.hora_extra,
                                capacidade_n_utilizada: users[i].dre.capacidade_n_utilizada,
                                margem_bruta: users[i].dre.margem_bruta,
                                despesas_administrativas: users[i].dre.despesas_administrativas,
                                salario_promotores: users[i].dre.salario_promotores,
                                comissao: users[i].dre.comissao,
                                propaganda_institucional: users[i].dre.propaganda_institucional,
                                propaganda_unitaria: users[i].dre.propaganda_unitaria,
                                depreciacao_de_maquinas: users[i].dre.depreciacao_de_maquinas,
                                encargos_financiamento: users[i].dre.encargos_financiamento,
                                salario_frota: users[i].dre.salario_frota,
                                manutencao_frota: users[i].dre.manutencao_frota,
                                depreciacao_de_veiculos: users[i].dre.depreciacao_de_veiculos,
                                frota_terceirizada: users[i].dre.frota_terceirizada + (((uso_frota-j)/2000)-frota_soma+1)*60,
                                despesas_operacionais_n_planejadas: users[i].dre.despesas_operacionais_n_planejadas,
                                pas: users[i].dre.pas,
                                pesquisas: users[i].dre.pesquisas,
                                tributos: users[i].dre.tributos,
                                servicos: [users[i].dre.servicos[0], users[i].dre.servicos[1], users[i].dre.servicos[2], users[i].dre.servicos[3]],
                                preco_medio: users[i].dre.preco_medio,
                                atendimentos: users[i].dre.atendimentos,
                                insumos_em_estoque: users[i].dre.insumos_em_estoque
    
                            }
                            users[i].fluxo_de_caixa = {
                                saldo_anterior: users[i].fluxo_de_caixa.saldo_anterior,
                                faturamento: users[i].fluxo_de_caixa.faturamento,
                                contas_a_receber: users[i].fluxo_de_caixa.contas_a_receber,
                                contas_a_receber_recebidas: users[i].fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                                custo_de_servico_prestado: users[i].fluxo_de_caixa.custo_de_servico_prestado,
                                emprestimos_contratados: users[i].fluxo_de_caixa.emprestimos_contratados,
                                emprestimos_pagos: users[i].fluxo_de_caixa.emprestimos_pagos,
                                veiculos_vendidos: users[i].fluxo_de_caixa.veiculos_vendidos,
                                depreciacao_de_veiculos: users[i].fluxo_de_caixa.depreciacao_de_veiculos,
                                depreciacao_de_maquinas: users[i].fluxo_de_caixa.depreciacao_de_maquinas,
                                veiculos_comprados: users[i].fluxo_de_caixa.veiculos_comprados,
                                tributos: users[i].fluxo_de_caixa.tributos,
                                promotores: users[i].fluxo_de_caixa.promotores,
                                propaganda: users[i].fluxo_de_caixa.propaganda,
                                pesquisas: users[i].fluxo_de_caixa.pesquisas,
                                pas: users[i].fluxo_de_caixa.pas,
                                uso_frota: users[i].fluxo_de_caixa.uso_frota + (((uso_frota-j)/2000)-frota_soma+1)*60,
                                despesas_operacionais_n_planejadas: users[i].fluxo_de_caixa.despesas_operacionais_n_planejadas,
                                despesas_administrativas: users[i].fluxo_de_caixa.despesas_administrativas,
                                encargos_financiamento: users[i].fluxo_de_caixa.encargos_financiamento,
                                maquinas: users[i].fluxo_de_caixa.maquinas
                            }
                            console.log("8 balan_caixa : " + users[i].balanco_patrimonial.caixa)
                        }
                        else{

                            users[i].taokeys = users[i].taokeys - (((uso_frota)/2000)-frota_soma)*60 //desconta o valor gasto com frota terceirizada
                            console.log("9 - (((uso_frota)/2000)-frota_soma)*60: " + users[i].taokeys)
                            users[i].balanco_patrimonial = {
                                caixa: users[i].balanco_patrimonial.caixa - (((uso_frota-j)/2000)-frota_soma)*60,
                                estoque: users[i].balanco_patrimonial.estoque,
                                contas_a_receber60: users[i].balanco_patrimonial.contas_a_receber60,
                                contas_a_receber120: users[i].balanco_patrimonial.contas_a_receber120,
                                maquinas: users[i].balanco_patrimonial.maquinas,
                                depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_maquinas,
                                veiculos: users[i].balanco_patrimonial.veiculos,
                                depreciacao_veiculos: users[i].balanco_patrimonial.depreciacao_veiculos,
                                tributos_a_pagar_anterior: users[i].balanco_patrimonial.tributos_a_pagar_anterior,
                                tributos_a_pagar_atual: users[i].balanco_patrimonial.tributos_a_pagar_atual,
                                emprestimos: users[i].balanco_patrimonial.emprestimos,
                                capial: users[i].balanco_patrimonial.capial,
                                lucros_acumulados: users[i].balanco_patrimonial.lucros_acumulados - (((uso_frota-j)/2000)-frota_soma)*60
                            }
                            users[i].dre = {
                                receita: users[i].dre.receita,
                                csp: users[i].dre.csp,
                                estoque_inicial: users[i].dre.estoque_inicial,
                                custo_prestacao_servico: users[i].dre.custo_prestacao_servico,
                                custo_estocagem: users[i].dre.custo_estocagem,
                                custo_troca_insumos: users[i].dre.custo_troca_insumos,
                                hora_extra: users[i].dre.hora_extra,
                                capacidade_n_utilizada: users[i].dre.capacidade_n_utilizada,
                                margem_bruta: users[i].dre.margem_bruta,
                                despesas_administrativas: users[i].dre.despesas_administrativas,
                                salario_promotores: users[i].dre.salario_promotores,
                                comissao: users[i].dre.comissao,
                                propaganda_institucional: users[i].dre.propaganda_institucional,
                                propaganda_unitaria: users[i].dre.propaganda_unitaria,
                                depreciacao_de_maquinas: users[i].dre.depreciacao_de_maquinas,
                                encargos_financiamento: users[i].dre.encargos_financiamento,
                                salario_frota: users[i].dre.salario_frota,
                                manutencao_frota: users[i].dre.manutencao_frota,
                                depreciacao_de_veiculos: users[i].dre.depreciacao_de_veiculos,
                                frota_terceirizada: users[i].dre.frota_terceirizada + (((uso_frota-j)/2000)-frota_soma)*60,
                                despesas_operacionais_n_planejadas: users[i].dre.despesas_operacionais_n_planejadas,
                                pas: users[i].dre.pas,
                                pesquisas: users[i].dre.pesquisas,
                                tributos: users[i].dre.tributos,
                                servicos: [users[i].dre.servicos[0], users[i].dre.servicos[1], users[i].dre.servicos[2], users[i].dre.servicos[3]],
                                preco_medio: users[i].dre.preco_medio,
                                atendimentos: users[i].dre.atendimentos,
                                insumos_em_estoque: users[i].dre.insumos_em_estoque
    
                            }
                            users[i].fluxo_de_caixa = {
                                saldo_anterior: users[i].fluxo_de_caixa.saldo_anterior,
                                faturamento: users[i].fluxo_de_caixa.faturamento,
                                contas_a_receber: users[i].fluxo_de_caixa.contas_a_receber,
                                contas_a_receber_recebidas: users[i].fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                                custo_de_servico_prestado: users[i].fluxo_de_caixa.custo_de_servico_prestado,
                                emprestimos_contratados: users[i].fluxo_de_caixa.emprestimos_contratados,
                                emprestimos_pagos: users[i].fluxo_de_caixa.emprestimos_pagos,
                                veiculos_vendidos: users[i].fluxo_de_caixa.veiculos_vendidos,
                                depreciacao_de_veiculos: users[i].fluxo_de_caixa.depreciacao_de_veiculos,
                                depreciacao_de_maquinas: users[i].fluxo_de_caixa.depreciacao_de_maquinas,
                                veiculos_comprados: users[i].fluxo_de_caixa.veiculos_comprados,
                                tributos: users[i].fluxo_de_caixa.tributos,
                                promotores: users[i].fluxo_de_caixa.promotores,
                                propaganda: users[i].fluxo_de_caixa.propaganda,
                                pesquisas: users[i].fluxo_de_caixa.pesquisas,
                                pas: users[i].fluxo_de_caixa.pas,
                                uso_frota: users[i].fluxo_de_caixa.uso_frota + (((uso_frota-j)/2000)-frota_soma)*60,
                                despesas_operacionais_n_planejadas: users[i].fluxo_de_caixa.despesas_operacionais_n_planejadas,
                                despesas_administrativas: users[i].fluxo_de_caixa.despesas_administrativas,
                                encargos_financiamento: users[i].fluxo_de_caixa.encargos_financiamento,
                                maquinas: users[i].fluxo_de_caixa.maquinas
                            }
                            console.log("9 balan_caixa : " + users[i].balanco_patrimonial.caixa)
                        }
                    }
                      
                }
                    
                    // -_-_-_-
                for(let i = 0; i < users.length; i++){
                    //users[i]['npesquisas'] = 1 // (ALOCADO EM CIMA /\) numero de pesquisas feitas no turno q sera usada para divisao de 5% do faturamento total esta sendo "zerada" (apenas coloquei igual a 1 o padrao pq se n divide por 0 e o faturamento da errado) aqui para contagem no proximo turno
                    
                    
                    if(users[i].taokeys >= users[i]['divida'][0]/3 + users[i]['divida'][0]*0.08){
                        users[i].taokeys = users[i].taokeys - (users[i]['divida'][0]/3 + users[i]['divida'][0]*0.08)
                        console.log("9B (- (users[i]['divida'][0]/3 + users[i]['divida'][0]*0.08)): " + users[i].taokeys)
                        users[i].balanco_patrimonial = {
                            caixa: users[i].balanco_patrimonial.caixa - users[i]['divida'][0]/3 - users[i]['divida'][0]*0.08,
                            estoque: users[i].balanco_patrimonial.estoque,
                            contas_a_receber60: users[i].balanco_patrimonial.contas_a_receber60,
                            contas_a_receber120: users[i].balanco_patrimonial.contas_a_receber120,
                            maquinas: users[i].balanco_patrimonial.maquinas,
                            depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_maquinas,
                            veiculos: users[i].balanco_patrimonial.veiculos,
                            depreciacao_veiculos: users[i].balanco_patrimonial.depreciacao_veiculos,
                            tributos_a_pagar_anterior: users[i].balanco_patrimonial.tributos_a_pagar_anterior,
                            tributos_a_pagar_atual: users[i].balanco_patrimonial.tributos_a_pagar_atual,
                            emprestimos: users[i].balanco_patrimonial.emprestimos - users[i]['divida'][0]/3,
                            capial: users[i].balanco_patrimonial.capial,
                            lucros_acumulados: users[i].balanco_patrimonial.lucros_acumulados - users[i]['divida'][0]*0.08
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            csp: users[i].dre.csp,
                            estoque_inicial: users[i].dre.estoque_inicial,
                            custo_prestacao_servico: users[i].dre.custo_prestacao_servico,
                            custo_estocagem: users[i].dre.custo_estocagem,
                            custo_troca_insumos: users[i].dre.custo_troca_insumos,
                            hora_extra: users[i].dre.hora_extra,
                            capacidade_n_utilizada: users[i].dre.capacidade_n_utilizada,
                            margem_bruta: users[i].dre.margem_bruta,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            salario_promotores: users[i].dre.salario_promotores,
                            comissao: users[i].dre.comissao,
                            propaganda_institucional: users[i].dre.propaganda_institucional,
                            propaganda_unitaria: users[i].dre.propaganda_unitaria,
                            depreciacao_de_maquinas: users[i].dre.depreciacao_de_maquinas,
                            encargos_financiamento: users[i].dre.encargos_financiamento + users[i]['divida'][0]*0.08,
                            salario_frota: users[i].dre.salario_frota,
                            manutencao_frota: users[i].dre.manutencao_frota,
                            depreciacao_de_veiculos: users[i].dre.depreciacao_de_veiculos,
                            frota_terceirizada: users[i].dre.frota_terceirizada,
                            despesas_operacionais_n_planejadas: users[i].dre.despesas_operacionais_n_planejadas,
                            pas: users[i].dre.pas,
                            pesquisas: users[i].dre.pesquisas,
                            tributos: users[i].dre.tributos,
                            servicos: [users[i].dre.servicos[0], users[i].dre.servicos[1], users[i].dre.servicos[2], users[i].dre.servicos[3]],
                            preco_medio: users[i].dre.preco_medio,
                            atendimentos: users[i].dre.atendimentos,
                            insumos_em_estoque: users[i].dre.insumos_em_estoque

                        }
                        users[i].fluxo_de_caixa = {
                            saldo_anterior: users[i].fluxo_de_caixa.saldo_anterior,
                            faturamento: users[i].fluxo_de_caixa.faturamento,
                            contas_a_receber: users[i].fluxo_de_caixa.contas_a_receber,
                            contas_a_receber_recebidas: users[i].fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                            custo_de_servico_prestado: users[i].fluxo_de_caixa.custo_de_servico_prestado,
                            emprestimos_contratados: users[i].fluxo_de_caixa.emprestimos_contratados,
                            emprestimos_pagos: users[i].fluxo_de_caixa.emprestimos_pagos + users[i]['divida'][0]/3,
                            veiculos_vendidos: users[i].fluxo_de_caixa.veiculos_vendidos,
                            depreciacao_de_veiculos: users[i].fluxo_de_caixa.depreciacao_de_veiculos,
                            depreciacao_de_maquinas: users[i].fluxo_de_caixa.depreciacao_de_maquinas,
                            veiculos_comprados: users[i].fluxo_de_caixa.veiculos_comprados,
                            tributos: users[i].fluxo_de_caixa.tributos,
                            promotores: users[i].fluxo_de_caixa.promotores,
                            propaganda: users[i].fluxo_de_caixa.propaganda,
                            pesquisas: users[i].fluxo_de_caixa.pesquisas,
                            pas: users[i].fluxo_de_caixa.pas,
                            uso_frota: users[i].fluxo_de_caixa.uso_frota,
                            despesas_operacionais_n_planejadas: users[i].fluxo_de_caixa.despesas_operacionais_n_planejadas,
                            despesas_administrativas: users[i].fluxo_de_caixa.despesas_administrativas,
                            encargos_financiamento: users[i].fluxo_de_caixa.encargos_financiamento + users[i]['divida'][0]*0.08,
                            maquinas: users[i].fluxo_de_caixa.maquinas
                        }
                        console.log("9B balan_caixa : " + users[i].balanco_patrimonial.caixa)
                        
                        users[i].set('divida', [users[i]['divida'][0]*(2/3), users[i]['divida'][1], users[i]['divida'][2]]) //contabilizando a passagem de tempo
                    }
                    else if(users[i].taokeys > users[i]['divida'][0]*0.08){
                        let gamb = (users[i]['divida'][0]/3 + users[i]['divida'][0]*0.08) - users[i].taokeys
                        users[i].taokeys = 0
                        console.log("10 (users[i].taokeys = 0): " + users[i].taokeys)
                        users[i].balanco_patrimonial = {
                            caixa: 0,
                            estoque: users[i].balanco_patrimonial.estoque,
                            contas_a_receber60: users[i].balanco_patrimonial.contas_a_receber60,
                            contas_a_receber120: users[i].balanco_patrimonial.contas_a_receber120,
                            maquinas: users[i].balanco_patrimonial.maquinas,
                            depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_maquinas,
                            veiculos: users[i].balanco_patrimonial.veiculos,
                            depreciacao_veiculos: users[i].balanco_patrimonial.depreciacao_veiculos,
                            tributos_a_pagar_anterior: users[i].balanco_patrimonial.tributos_a_pagar_anterior,
                            tributos_a_pagar_atual: users[i].balanco_patrimonial.tributos_a_pagar_atual,
                            emprestimos: users[i].balanco_patrimonial.emprestimos - (users[i]['divida'][0]/3 - gamb),
                            capial: users[i].balanco_patrimonial.capial,
                            lucros_acumulados: users[i].balanco_patrimonial.lucros_acumulados - users[i]['divida'][0]*0.08
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            csp: users[i].dre.csp,
                            estoque_inicial: users[i].dre.estoque_inicial,
                            custo_prestacao_servico: users[i].dre.custo_prestacao_servico,
                            custo_estocagem: users[i].dre.custo_estocagem,
                            custo_troca_insumos: users[i].dre.custo_troca_insumos,
                            hora_extra: users[i].dre.hora_extra,
                            capacidade_n_utilizada: users[i].dre.capacidade_n_utilizada,
                            margem_bruta: users[i].dre.margem_bruta,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            salario_promotores: users[i].dre.salario_promotores,
                            comissao: users[i].dre.comissao,
                            propaganda_institucional: users[i].dre.propaganda_institucional,
                            propaganda_unitaria: users[i].dre.propaganda_unitaria,
                            depreciacao_de_maquinas: users[i].dre.depreciacao_de_maquinas,
                            encargos_financiamento: users[i].dre.encargos_financiamento + users[i]['divida'][0]*0.08,
                            salario_frota: users[i].dre.salario_frota,
                            manutencao_frota: users[i].dre.manutencao_frota,
                            depreciacao_de_veiculos: users[i].dre.depreciacao_de_veiculos,
                            frota_terceirizada: users[i].dre.frota_terceirizada,
                            despesas_operacionais_n_planejadas: users[i].dre.despesas_operacionais_n_planejadas,
                            pas: users[i].dre.pas,
                            pesquisas: users[i].dre.pesquisas,
                            tributos: users[i].dre.tributos,
                            servicos: [users[i].dre.servicos[0], users[i].dre.servicos[1], users[i].dre.servicos[2], users[i].dre.servicos[3]],
                            preco_medio: users[i].dre.preco_medio,
                            atendimentos: users[i].dre.atendimentos,
                            insumos_em_estoque: users[i].dre.insumos_em_estoque

                        },
                        users[i].fluxo_de_caixa = {
                            saldo_anterior: users[i].fluxo_de_caixa.saldo_anterior,
                            faturamento: users[i].fluxo_de_caixa.faturamento,
                            contas_a_receber: users[i].fluxo_de_caixa.contas_a_receber,
                            contas_a_receber_recebidas: users[i].fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                            custo_de_servico_prestado: users[i].fluxo_de_caixa.custo_de_servico_prestado,
                            emprestimos_contratados: users[i].fluxo_de_caixa.emprestimos_contratados,
                            emprestimos_pagos: users[i].fluxo_de_caixa.emprestimos_pagos + (users[i]['divida'][0]/3 - gamb),
                            veiculos_vendidos: users[i].fluxo_de_caixa.veiculos_vendidos,
                            depreciacao_de_veiculos: users[i].fluxo_de_caixa.depreciacao_de_veiculos,
                            depreciacao_de_maquinas: users[i].fluxo_de_caixa.depreciacao_de_maquinas,
                            veiculos_comprados: users[i].fluxo_de_caixa.veiculos_comprados,
                            tributos: users[i].fluxo_de_caixa.tributos,
                            promotores: users[i].fluxo_de_caixa.promotores,
                            propaganda: users[i].fluxo_de_caixa.propaganda,
                            pesquisas: users[i].fluxo_de_caixa.pesquisas,
                            pas: users[i].fluxo_de_caixa.pas,
                            uso_frota: users[i].fluxo_de_caixa.uso_frota,
                            despesas_operacionais_n_planejadas: users[i].fluxo_de_caixa.despesas_operacionais_n_planejadas,
                            despesas_administrativas: users[i].fluxo_de_caixa.despesas_administrativas,
                            encargos_financiamento: users[i].fluxo_de_caixa.encargos_financiamento + users[i]['divida'][0]*0.08,
                            maquinas: users[i].fluxo_de_caixa.maquinas
                        }
                        console.log("10 balan_caixa : " + users[i].balanco_patrimonial.caixa)
                        users[i].set('divida', [users[i]['divida'][0]*(2/3) + gamb, users[i]['divida'][1], users[i]['divida'][2]])
                    }
                    else{
                        users[i].balanco_patrimonial = {
                            caixa: 0,
                            estoque: users[i].balanco_patrimonial.estoque,
                            contas_a_receber60: users[i].balanco_patrimonial.contas_a_receber60,
                            contas_a_receber120: users[i].balanco_patrimonial.contas_a_receber120,
                            maquinas: users[i].balanco_patrimonial.maquinas,
                            depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_maquinas,
                            veiculos: users[i].balanco_patrimonial.veiculos,
                            depreciacao_veiculos: users[i].balanco_patrimonial.depreciacao_veiculos,
                            tributos_a_pagar_anterior: users[i].balanco_patrimonial.tributos_a_pagar_anterior,
                            tributos_a_pagar_atual: users[i].balanco_patrimonial.tributos_a_pagar_atual,
                            emprestimos: users[i].balanco_patrimonial.emprestimos + (users[i]['divida'][0]*0.08 - users[i].taokeys),
                            capial: users[i].balanco_patrimonial.capial,
                            lucros_acumulados: users[i].balanco_patrimonial.lucros_acumulados - users[i]['divida'][0]*0.08
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            csp: users[i].dre.csp,
                            estoque_inicial: users[i].dre.estoque_inicial,
                            custo_prestacao_servico: users[i].dre.custo_prestacao_servico,
                            custo_estocagem: users[i].dre.custo_estocagem,
                            custo_troca_insumos: users[i].dre.custo_troca_insumos,
                            hora_extra: users[i].dre.hora_extra,
                            capacidade_n_utilizada: users[i].dre.capacidade_n_utilizada,
                            margem_bruta: users[i].dre.margem_bruta,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            salario_promotores: users[i].dre.salario_promotores,
                            comissao: users[i].dre.comissao,
                            propaganda_institucional: users[i].dre.propaganda_institucional,
                            propaganda_unitaria: users[i].dre.propaganda_unitaria,
                            depreciacao_de_maquinas: users[i].dre.depreciacao_de_maquinas,
                            encargos_financiamento: users[i].dre.encargos_financiamento + users[i]['divida'][0]*0.08,
                            salario_frota: users[i].dre.salario_frota,
                            manutencao_frota: users[i].dre.manutencao_frota,
                            depreciacao_de_veiculos: users[i].dre.depreciacao_de_veiculos,
                            frota_terceirizada: users[i].dre.frota_terceirizada,
                            despesas_operacionais_n_planejadas: users[i].dre.despesas_operacionais_n_planejadas,
                            pas: users[i].dre.pas,
                            pesquisas: users[i].dre.pesquisas,
                            tributos: users[i].dre.tributos,
                            servicos: [users[i].dre.servicos[0], users[i].dre.servicos[1], users[i].dre.servicos[2], users[i].dre.servicos[3]],
                            preco_medio: users[i].dre.preco_medio,
                            atendimentos: users[i].dre.atendimentos,
                            insumos_em_estoque: users[i].dre.insumos_em_estoque

                        }
                        users[i].fluxo_de_caixa = {
                            saldo_anterior: users[i].fluxo_de_caixa.saldo_anterior,
                            faturamento: users[i].fluxo_de_caixa.faturamento,
                            contas_a_receber: users[i].fluxo_de_caixa.contas_a_receber,
                            contas_a_receber_recebidas: users[i].fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                            custo_de_servico_prestado: users[i].fluxo_de_caixa.custo_de_servico_prestado,
                            emprestimos_contratados: users[i].fluxo_de_caixa.emprestimos_contratados + (users[i]['divida'][0]*0.08 - users[i].taokeys),
                            emprestimos_pagos: users[i].fluxo_de_caixa.emprestimos_pagos,
                            veiculos_vendidos: users[i].fluxo_de_caixa.veiculos_vendidos,
                            depreciacao_de_veiculos: users[i].fluxo_de_caixa.depreciacao_de_veiculos,
                            depreciacao_de_maquinas: users[i].fluxo_de_caixa.depreciacao_de_maquinas,
                            veiculos_comprados: users[i].fluxo_de_caixa.veiculos_comprados,
                            tributos: users[i].fluxo_de_caixa.tributos,
                            promotores: users[i].fluxo_de_caixa.promotores,
                            propaganda: users[i].fluxo_de_caixa.propaganda,
                            pesquisas: users[i].fluxo_de_caixa.pesquisas,
                            pas: users[i].fluxo_de_caixa.pas,
                            uso_frota: users[i].fluxo_de_caixa.uso_frota,
                            despesas_operacionais_n_planejadas: users[i].fluxo_de_caixa.despesas_operacionais_n_planejadas,
                            despesas_administrativas: users[i].fluxo_de_caixa.despesas_administrativas,
                            encargos_financiamento: users[i].fluxo_de_caixa.encargos_financiamento + users[i]['divida'][0]*0.08,
                            maquinas: users[i].fluxo_de_caixa.maquinas
                        }

                        users[i].set('divida', [users[i]['divida'][0] + (users[i]['divida'][0]*0.08 - users[i].taokeys), users[i]['divida'][1], users[i]['divida'][2]])
                        users[i].taokeys = 0
                    }

                    if(users[i].taokeys >= users[i]['divida'][1]/2 + users[i]['divida'][1]*0.08){
                        users[i].taokeys = users[i].taokeys - (users[i]['divida'][1]/2 + users[i]['divida'][1]*0.08)
                        console.log("11 (- (users[i]['divida'][1]/2 + users[i]['divida'][1]*0.08)): " + users[i].taokeys)
                        users[i].balanco_patrimonial = {
                            caixa: users[i].balanco_patrimonial.caixa - users[i]['divida'][1]/2 - users[i]['divida'][1]*0.08,
                            estoque: users[i].balanco_patrimonial.estoque,
                            contas_a_receber60: users[i].balanco_patrimonial.contas_a_receber60,
                            contas_a_receber120: users[i].balanco_patrimonial.contas_a_receber120,
                            maquinas: users[i].balanco_patrimonial.maquinas,
                            depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_maquinas,
                            veiculos: users[i].balanco_patrimonial.veiculos,
                            depreciacao_veiculos: users[i].balanco_patrimonial.depreciacao_veiculos,
                            tributos_a_pagar_anterior: users[i].balanco_patrimonial.tributos_a_pagar_anterior,
                            tributos_a_pagar_atual: users[i].balanco_patrimonial.tributos_a_pagar_atual,
                            emprestimos: users[i].balanco_patrimonial.emprestimos - users[i]['divida'][1]/2,
                            capial: users[i].balanco_patrimonial.capial,
                            lucros_acumulados: users[i].balanco_patrimonial.lucros_acumulados - users[i]['divida'][0]*0.08
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            csp: users[i].dre.csp,
                            estoque_inicial: users[i].dre.estoque_inicial,
                            custo_prestacao_servico: users[i].dre.custo_prestacao_servico,
                            custo_estocagem: users[i].dre.custo_estocagem,
                            custo_troca_insumos: users[i].dre.custo_troca_insumos,
                            hora_extra: users[i].dre.hora_extra,
                            capacidade_n_utilizada: users[i].dre.capacidade_n_utilizada,
                            margem_bruta: users[i].dre.margem_bruta,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            salario_promotores: users[i].dre.salario_promotores,
                            comissao: users[i].dre.comissao,
                            propaganda_institucional: users[i].dre.propaganda_institucional,
                            propaganda_unitaria: users[i].dre.propaganda_unitaria,
                            depreciacao_de_maquinas: users[i].dre.depreciacao_de_maquinas,
                            encargos_financiamento: users[i].dre.encargos_financiamento + users[i]['divida'][0]*0.08,
                            salario_frota: users[i].dre.salario_frota,
                            manutencao_frota: users[i].dre.manutencao_frota,
                            depreciacao_de_veiculos: users[i].dre.depreciacao_de_veiculos,
                            frota_terceirizada: users[i].dre.frota_terceirizada,
                            despesas_operacionais_n_planejadas: users[i].dre.despesas_operacionais_n_planejadas,
                            pas: users[i].dre.pas,
                            pesquisas: users[i].dre.pesquisas,
                            tributos: users[i].dre.tributos,
                            servicos: [users[i].dre.servicos[0], users[i].dre.servicos[1], users[i].dre.servicos[2], users[i].dre.servicos[3]],
                            preco_medio: users[i].dre.preco_medio,
                            atendimentos: users[i].dre.atendimentos,
                            insumos_em_estoque: users[i].dre.insumos_em_estoque

                        }
                        users[i].fluxo_de_caixa = {
                            saldo_anterior: users[i].fluxo_de_caixa.saldo_anterior,
                            faturamento: users[i].fluxo_de_caixa.faturamento,
                            contas_a_receber: users[i].fluxo_de_caixa.contas_a_receber,
                            contas_a_receber_recebidas: users[i].fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                            custo_de_servico_prestado: users[i].fluxo_de_caixa.custo_de_servico_prestado,
                            emprestimos_contratados: users[i].fluxo_de_caixa.emprestimos_contratados,
                            emprestimos_pagos: users[i].fluxo_de_caixa.emprestimos_pagos + users[i]['divida'][1]/2,
                            veiculos_vendidos: users[i].fluxo_de_caixa.veiculos_vendidos,
                            depreciacao_de_veiculos: users[i].fluxo_de_caixa.depreciacao_de_veiculos,
                            depreciacao_de_maquinas: users[i].fluxo_de_caixa.depreciacao_de_maquinas,
                            veiculos_comprados: users[i].fluxo_de_caixa.veiculos_comprados,
                            tributos: users[i].fluxo_de_caixa.tributos,
                            promotores: users[i].fluxo_de_caixa.promotores,
                            propaganda: users[i].fluxo_de_caixa.propaganda,
                            pesquisas: users[i].fluxo_de_caixa.pesquisas,
                            pas: users[i].fluxo_de_caixa.pas,
                            uso_frota: users[i].fluxo_de_caixa.uso_frota,
                            despesas_operacionais_n_planejadas: users[i].fluxo_de_caixa.despesas_operacionais_n_planejadas,
                            despesas_administrativas: users[i].fluxo_de_caixa.despesas_administrativas,
                            encargos_financiamento: users[i].fluxo_de_caixa.encargos_financiamento + users[i]['divida'][0]*0.08,
                            maquinas: users[i].fluxo_de_caixa.maquinas
                        }
                        console.log("11 balan_caixa : " + users[i].balanco_patrimonial.caixa)
                        
                        users[i].set('divida', [users[i]['divida'][0], users[i]['divida'][1]/2, users[i]['divida'][2]]) //contabilizando a passagem de tempo
                    }
                    else if(users[i].taokeys > users[i]['divida'][1]*0.08){
                        let gamb = (users[i]['divida'][1]/2 + users[i]['divida'][1]*0.08) - users[i].taokeys
                        users[i].taokeys = 0
                        users[i].balanco_patrimonial = {
                            caixa: 0,
                            estoque: users[i].balanco_patrimonial.estoque,
                            contas_a_receber60: users[i].balanco_patrimonial.contas_a_receber60,
                            contas_a_receber120: users[i].balanco_patrimonial.contas_a_receber120,
                            maquinas: users[i].balanco_patrimonial.maquinas,
                            depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_maquinas,
                            veiculos: users[i].balanco_patrimonial.veiculos,
                            depreciacao_veiculos: users[i].balanco_patrimonial.depreciacao_veiculos,
                            tributos_a_pagar_anterior: users[i].balanco_patrimonial.tributos_a_pagar_anterior,
                            tributos_a_pagar_atual: users[i].balanco_patrimonial.tributos_a_pagar_atual,
                            emprestimos: users[i].balanco_patrimonial.emprestimos - (users[i]['divida'][1]/2 - gamb),
                            capial: users[i].balanco_patrimonial.capial,
                            lucros_acumulados: users[i].balanco_patrimonial.lucros_acumulados - users[i]['divida'][0]*0.08
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            csp: users[i].dre.csp,
                            estoque_inicial: users[i].dre.estoque_inicial,
                            custo_prestacao_servico: users[i].dre.custo_prestacao_servico,
                            custo_estocagem: users[i].dre.custo_estocagem,
                            custo_troca_insumos: users[i].dre.custo_troca_insumos,
                            hora_extra: users[i].dre.hora_extra,
                            capacidade_n_utilizada: users[i].dre.capacidade_n_utilizada,
                            margem_bruta: users[i].dre.margem_bruta,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            salario_promotores: users[i].dre.salario_promotores,
                            comissao: users[i].dre.comissao,
                            propaganda_institucional: users[i].dre.propaganda_institucional,
                            propaganda_unitaria: users[i].dre.propaganda_unitaria,
                            depreciacao_de_maquinas: users[i].dre.depreciacao_de_maquinas,
                            encargos_financiamento: users[i].dre.encargos_financiamento + users[i]['divida'][0]*0.08,
                            salario_frota: users[i].dre.salario_frota,
                            manutencao_frota: users[i].dre.manutencao_frota,
                            depreciacao_de_veiculos: users[i].dre.depreciacao_de_veiculos,
                            frota_terceirizada: users[i].dre.frota_terceirizada,
                            despesas_operacionais_n_planejadas: users[i].dre.despesas_operacionais_n_planejadas,
                            pas: users[i].dre.pas,
                            pesquisas: users[i].dre.pesquisas,
                            tributos: users[i].dre.tributos,
                            servicos: [users[i].dre.servicos[0], users[i].dre.servicos[1], users[i].dre.servicos[2], users[i].dre.servicos[3]],
                            preco_medio: users[i].dre.preco_medio,
                            atendimentos: users[i].dre.atendimentos,
                            insumos_em_estoque: users[i].dre.insumos_em_estoque

                        }
                        users[i].fluxo_de_caixa = {
                            saldo_anterior: users[i].fluxo_de_caixa.saldo_anterior,
                            faturamento: users[i].fluxo_de_caixa.faturamento,
                            contas_a_receber: users[i].fluxo_de_caixa.contas_a_receber,
                            contas_a_receber_recebidas: users[i].fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                            custo_de_servico_prestado: users[i].fluxo_de_caixa.custo_de_servico_prestado,
                            emprestimos_contratados: users[i].fluxo_de_caixa.emprestimos_contratados,
                            emprestimos_pagos: users[i].fluxo_de_caixa.emprestimos_pagos + (users[i]['divida'][1]/2 - gamb),
                            veiculos_vendidos: users[i].fluxo_de_caixa.veiculos_vendidos,
                            depreciacao_de_veiculos: users[i].fluxo_de_caixa.depreciacao_de_veiculos,
                            depreciacao_de_maquinas: users[i].fluxo_de_caixa.depreciacao_de_maquinas,
                            veiculos_comprados: users[i].fluxo_de_caixa.veiculos_comprados,
                            tributos: users[i].fluxo_de_caixa.tributos,
                            promotores: users[i].fluxo_de_caixa.promotores,
                            propaganda: users[i].fluxo_de_caixa.propaganda,
                            pesquisas: users[i].fluxo_de_caixa.pesquisas,
                            pas: users[i].fluxo_de_caixa.pas,
                            uso_frota: users[i].fluxo_de_caixa.uso_frota,
                            despesas_operacionais_n_planejadas: users[i].fluxo_de_caixa.despesas_operacionais_n_planejadas,
                            despesas_administrativas: users[i].fluxo_de_caixa.despesas_administrativas,
                            encargos_financiamento: users[i].fluxo_de_caixa.encargos_financiamento + users[i]['divida'][0]*0.08,
                            maquinas: users[i].fluxo_de_caixa.maquinas
                        }
                        
                        users[i].set('divida', [users[i]['divida'][0], users[i]['divida'][1]/2 + gamb, users[i]['divida'][2]])
                    
                    }
                    else{
                        users[i].balanco_patrimonial = {
                            caixa: 0,
                            estoque: users[i].balanco_patrimonial.estoque,
                            contas_a_receber60: users[i].balanco_patrimonial.contas_a_receber60,
                            contas_a_receber120: users[i].balanco_patrimonial.contas_a_receber120,
                            maquinas: users[i].balanco_patrimonial.maquinas,
                            depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_maquinas,
                            veiculos: users[i].balanco_patrimonial.veiculos,
                            depreciacao_veiculos: users[i].balanco_patrimonial.depreciacao_veiculos,
                            tributos_a_pagar_anterior: users[i].balanco_patrimonial.tributos_a_pagar_anterior,
                            tributos_a_pagar_atual: users[i].balanco_patrimonial.tributos_a_pagar_atual,
                            emprestimos: users[i].balanco_patrimonial.emprestimos + (users[i]['divida'][1]*0.08 - users[i].taokeys),
                            capial: users[i].balanco_patrimonial.capial,
                            lucros_acumulados: users[i].balanco_patrimonial.lucros_acumulados - users[i]['divida'][0]*0.08
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            csp: users[i].dre.csp,
                            estoque_inicial: users[i].dre.estoque_inicial,
                            custo_prestacao_servico: users[i].dre.custo_prestacao_servico,
                            custo_estocagem: users[i].dre.custo_estocagem,
                            custo_troca_insumos: users[i].dre.custo_troca_insumos,
                            hora_extra: users[i].dre.hora_extra,
                            capacidade_n_utilizada: users[i].dre.capacidade_n_utilizada,
                            margem_bruta: users[i].dre.margem_bruta,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            salario_promotores: users[i].dre.salario_promotores,
                            comissao: users[i].dre.comissao,
                            propaganda_institucional: users[i].dre.propaganda_institucional,
                            propaganda_unitaria: users[i].dre.propaganda_unitaria,
                            depreciacao_de_maquinas: users[i].dre.depreciacao_de_maquinas,
                            encargos_financiamento: users[i].dre.encargos_financiamento + users[i]['divida'][0]*0.08,
                            salario_frota: users[i].dre.salario_frota,
                            manutencao_frota: users[i].dre.manutencao_frota,
                            depreciacao_de_veiculos: users[i].dre.depreciacao_de_veiculos,
                            frota_terceirizada: users[i].dre.frota_terceirizada,
                            despesas_operacionais_n_planejadas: users[i].dre.despesas_operacionais_n_planejadas,
                            pas: users[i].dre.pas,
                            pesquisas: users[i].dre.pesquisas,
                            tributos: users[i].dre.tributos,
                            servicos: [users[i].dre.servicos[0], users[i].dre.servicos[1], users[i].dre.servicos[2], users[i].dre.servicos[3]],
                            preco_medio: users[i].dre.preco_medio,
                            atendimentos: users[i].dre.atendimentos,
                            insumos_em_estoque: users[i].dre.insumos_em_estoque

                        }
                        users[i].fluxo_de_caixa = {
                            saldo_anterior: users[i].fluxo_de_caixa.saldo_anterior,
                            faturamento: users[i].fluxo_de_caixa.faturamento,
                            contas_a_receber: users[i].fluxo_de_caixa.contas_a_receber,
                            contas_a_receber_recebidas: users[i].fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                            custo_de_servico_prestado: users[i].fluxo_de_caixa.custo_de_servico_prestado,
                            emprestimos_contratados: users[i].fluxo_de_caixa.emprestimos_contratados + (users[i]['divida'][1]*0.08 - users[i].taokeys),
                            emprestimos_pagos: users[i].fluxo_de_caixa.emprestimos_pagos,
                            veiculos_vendidos: users[i].fluxo_de_caixa.veiculos_vendidos,
                            depreciacao_de_veiculos: users[i].fluxo_de_caixa.depreciacao_de_veiculos,
                            depreciacao_de_maquinas: users[i].fluxo_de_caixa.depreciacao_de_maquinas,
                            veiculos_comprados: users[i].fluxo_de_caixa.veiculos_comprados,
                            tributos: users[i].fluxo_de_caixa.tributos,
                            promotores: users[i].fluxo_de_caixa.promotores,
                            propaganda: users[i].fluxo_de_caixa.propaganda,
                            pesquisas: users[i].fluxo_de_caixa.pesquisas,
                            pas: users[i].fluxo_de_caixa.pas,
                            uso_frota: users[i].fluxo_de_caixa.uso_frota,
                            despesas_operacionais_n_planejadas: users[i].fluxo_de_caixa.despesas_operacionais_n_planejadas,
                            despesas_administrativas: users[i].fluxo_de_caixa.despesas_administrativas,
                            encargos_financiamento: users[i].fluxo_de_caixa.encargos_financiamento + users[i]['divida'][0]*0.08,
                            maquinas: users[i].fluxo_de_caixa.maquinas
                        }
                        
                        users[i].set('divida', [users[i]['divida'][0], users[i]['divida'][1] + (users[i]['divida'][1]*0.08 - users[i].taokeys), users[i]['divida'][2]])
                        users[i].taokeys = 0

                    }
        
                    if(users[i].taokeys >= users[i]['divida'][2]*1.08){
                        users[i].taokeys = users[i].taokeys - users[i]['divida'][2]*1.08
                        console.log("12 (- users[i]['divida'][2]*1.08): " + users[i].taokeys)
                        users[i].balanco_patrimonial = {
                            caixa: users[i].balanco_patrimonial.caixa - users[i]['divida'][2]*0.08 - users[i]['divida'][2],
                            estoque: users[i].balanco_patrimonial.estoque,
                            contas_a_receber60: users[i].balanco_patrimonial.contas_a_receber60,
                            contas_a_receber120: users[i].balanco_patrimonial.contas_a_receber120,
                            maquinas: users[i].balanco_patrimonial.maquinas,
                            depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_maquinas,
                            veiculos: users[i].balanco_patrimonial.veiculos,
                            depreciacao_veiculos: users[i].balanco_patrimonial.depreciacao_veiculos,
                            tributos_a_pagar_anterior: users[i].balanco_patrimonial.tributos_a_pagar_anterior,
                            tributos_a_pagar_atual: users[i].balanco_patrimonial.tributos_a_pagar_atual,
                            emprestimos: users[i].balanco_patrimonial.emprestimos - users[i]['divida'][2],
                            capial: users[i].balanco_patrimonial.capial,
                            lucros_acumulados: users[i].balanco_patrimonial.lucros_acumulados - users[i]['divida'][2]*0.08
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            csp: users[i].dre.csp,
                            estoque_inicial: users[i].dre.estoque_inicial,
                            custo_prestacao_servico: users[i].dre.custo_prestacao_servico,
                            custo_estocagem: users[i].dre.custo_estocagem,
                            custo_troca_insumos: users[i].dre.custo_troca_insumos,
                            hora_extra: users[i].dre.hora_extra,
                            capacidade_n_utilizada: users[i].dre.capacidade_n_utilizada,
                            margem_bruta: users[i].dre.margem_bruta,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            salario_promotores: users[i].dre.salario_promotores,
                            comissao: users[i].dre.comissao,
                            propaganda_institucional: users[i].dre.propaganda_institucional,
                            propaganda_unitaria: users[i].dre.propaganda_unitaria,
                            depreciacao_de_maquinas: users[i].dre.depreciacao_de_maquinas,
                            encargos_financiamento: users[i].dre.encargos_financiamento + users[i]['divida'][0]*0.08,
                            salario_frota: users[i].dre.salario_frota,
                            manutencao_frota: users[i].dre.manutencao_frota,
                            depreciacao_de_veiculos: users[i].dre.depreciacao_de_veiculos,
                            frota_terceirizada: users[i].dre.frota_terceirizada,
                            despesas_operacionais_n_planejadas: users[i].dre.despesas_operacionais_n_planejadas,
                            pas: users[i].dre.pas,
                            pesquisas: users[i].dre.pesquisas,
                            tributos: users[i].dre.tributos,
                            servicos: [users[i].dre.servicos[0], users[i].dre.servicos[1], users[i].dre.servicos[2], users[i].dre.servicos[3]],
                            preco_medio: users[i].dre.preco_medio,
                            atendimentos: users[i].dre.atendimentos,
                            insumos_em_estoque: users[i].dre.insumos_em_estoque

                        }
                        users[i].fluxo_de_caixa = {
                            saldo_anterior: users[i].fluxo_de_caixa.saldo_anterior,
                            faturamento: users[i].fluxo_de_caixa.faturamento,
                            contas_a_receber: users[i].fluxo_de_caixa.contas_a_receber,
                            contas_a_receber_recebidas: users[i].fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                            custo_de_servico_prestado: users[i].fluxo_de_caixa.custo_de_servico_prestado,
                            emprestimos_contratados: users[i].fluxo_de_caixa.emprestimos_contratados,
                            emprestimos_pagos: users[i].fluxo_de_caixa.emprestimos_pagos + users[i]['divida'][2],
                            veiculos_vendidos: users[i].fluxo_de_caixa.veiculos_vendidos,
                            depreciacao_de_veiculos: users[i].fluxo_de_caixa.depreciacao_de_veiculos,
                            depreciacao_de_maquinas: users[i].fluxo_de_caixa.depreciacao_de_maquinas,
                            veiculos_comprados: users[i].fluxo_de_caixa.veiculos_comprados,
                            tributos: users[i].fluxo_de_caixa.tributos,
                            promotores: users[i].fluxo_de_caixa.promotores,
                            propaganda: users[i].fluxo_de_caixa.propaganda,
                            pesquisas: users[i].fluxo_de_caixa.pesquisas,
                            pas: users[i].fluxo_de_caixa.pas,
                            uso_frota: users[i].fluxo_de_caixa.uso_frota,
                            despesas_operacionais_n_planejadas: users[i].fluxo_de_caixa.despesas_operacionais_n_planejadas,
                            despesas_administrativas: users[i].fluxo_de_caixa.despesas_administrativas,
                            encargos_financiamento: users[i].fluxo_de_caixa.encargos_financiamento + users[i]['divida'][0]*0.08,
                            maquinas: users[i].fluxo_de_caixa.maquinas
                        }
                        console.log("12 balan_caixa : " + users[i].balanco_patrimonial.caixa)
                        
                       
                        users[i].set('divida', [0, users[i]['divida'][0], users[i]['divida'][1]]) //contabilizando a passagem de tempo
                    }
                    else if(users[i].taokeys > users[i]['divida'][2]*0.08){
                        let gamb = users[i]['divida'][2] + users[i]['divida'][2]*0.08 + (-1)*users[i].taokeys
                        users[i].balanco_patrimonial = {
                            caixa: 0,
                            estoque: users[i].balanco_patrimonial.estoque,
                            contas_a_receber60: users[i].balanco_patrimonial.contas_a_receber60,
                            contas_a_receber120: users[i].balanco_patrimonial.contas_a_receber120,
                            maquinas: users[i].balanco_patrimonial.maquinas,
                            depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_maquinas,
                            veiculos: users[i].balanco_patrimonial.veiculos,
                            depreciacao_veiculos: users[i].balanco_patrimonial.depreciacao_veiculos,
                            tributos_a_pagar_anterior: users[i].balanco_patrimonial.tributos_a_pagar_anterior,
                            tributos_a_pagar_atual: users[i].balanco_patrimonial.tributos_a_pagar_atual,
                            emprestimos: users[i].balanco_patrimonial.emprestimos - (users[i]['divida'][2] - gamb),
                            capial: users[i].balanco_patrimonial.capial,
                            lucros_acumulados: users[i].balanco_patrimonial.lucros_acumulados - users[i]['divida'][2]*0.08
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            csp: users[i].dre.csp,
                            estoque_inicial: users[i].dre.estoque_inicial,
                            custo_prestacao_servico: users[i].dre.custo_prestacao_servico,
                            custo_estocagem: users[i].dre.custo_estocagem,
                            custo_troca_insumos: users[i].dre.custo_troca_insumos,
                            hora_extra: users[i].dre.hora_extra,
                            capacidade_n_utilizada: users[i].dre.capacidade_n_utilizada,
                            margem_bruta: users[i].dre.margem_bruta,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            salario_promotores: users[i].dre.salario_promotores,
                            comissao: users[i].dre.comissao,
                            propaganda_institucional: users[i].dre.propaganda_institucional,
                            propaganda_unitaria: users[i].dre.propaganda_unitaria,
                            depreciacao_de_maquinas: users[i].dre.depreciacao_de_maquinas,
                            encargos_financiamento: users[i].dre.encargos_financiamento + users[i]['divida'][0]*0.08,
                            salario_frota: users[i].dre.salario_frota,
                            manutencao_frota: users[i].dre.manutencao_frota,
                            depreciacao_de_veiculos: users[i].dre.depreciacao_de_veiculos,
                            frota_terceirizada: users[i].dre.frota_terceirizada,
                            despesas_operacionais_n_planejadas: users[i].dre.despesas_operacionais_n_planejadas,
                            pas: users[i].dre.pas,
                            pesquisas: users[i].dre.pesquisas,
                            tributos: users[i].dre.tributos,
                            servicos: [users[i].dre.servicos[0], users[i].dre.servicos[1], users[i].dre.servicos[2], users[i].dre.servicos[3]],
                            preco_medio: users[i].dre.preco_medio,
                            atendimentos: users[i].dre.atendimentos,
                            insumos_em_estoque: users[i].dre.insumos_em_estoque

                        }
                        users[i].fluxo_de_caixa = {
                            saldo_anterior: users[i].fluxo_de_caixa.saldo_anterior,
                            faturamento: users[i].fluxo_de_caixa.faturamento,
                            contas_a_receber: users[i].fluxo_de_caixa.contas_a_receber,
                            contas_a_receber_recebidas: users[i].fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                            custo_de_servico_prestado: users[i].fluxo_de_caixa.custo_de_servico_prestado,
                            emprestimos_contratados: users[i].fluxo_de_caixa.emprestimos_contratados,
                            emprestimos_pagos: users[i].fluxo_de_caixa.emprestimos_pagos + (users[i]['divida'][2] - gamb),
                            veiculos_vendidos: users[i].fluxo_de_caixa.veiculos_vendidos,
                            depreciacao_de_veiculos: users[i].fluxo_de_caixa.depreciacao_de_veiculos,
                            depreciacao_de_maquinas: users[i].fluxo_de_caixa.depreciacao_de_maquinas,
                            veiculos_comprados: users[i].fluxo_de_caixa.veiculos_comprados,
                            tributos: users[i].fluxo_de_caixa.tributos,
                            promotores: users[i].fluxo_de_caixa.promotores,
                            propaganda: users[i].fluxo_de_caixa.propaganda,
                            pesquisas: users[i].fluxo_de_caixa.pesquisas,
                            pas: users[i].fluxo_de_caixa.pas,
                            uso_frota: users[i].fluxo_de_caixa.uso_frota,
                            despesas_operacionais_n_planejadas: users[i].fluxo_de_caixa.despesas_operacionais_n_planejadas,
                            despesas_administrativas: users[i].fluxo_de_caixa.despesas_administrativas,
                            encargos_financiamento: users[i].fluxo_de_caixa.encargos_financiamento + users[i]['divida'][0]*0.08,
                            maquinas: users[i].fluxo_de_caixa.maquinas
                        }
                        
                        
                        //users[i]['divida'].pop();
                        //users[i]['divida'].unshift(gamb*1.08); //cobrar multa aqui
                        users[i].set('divida', [gamb + users[i]['divida'][2], users[i]['divida'][0], users[i]['divida'][1]])
                        users[i].taokeys = 0
                    }
                    else{
                        users[i].balanco_patrimonial = {
                            caixa: 0,
                            estoque: users[i].balanco_patrimonial.estoque,
                            contas_a_receber60: users[i].balanco_patrimonial.contas_a_receber60,
                            contas_a_receber120: users[i].balanco_patrimonial.contas_a_receber120,
                            maquinas: users[i].balanco_patrimonial.maquinas,
                            depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_maquinas,
                            veiculos: users[i].balanco_patrimonial.veiculos,
                            depreciacao_veiculos: users[i].balanco_patrimonial.depreciacao_veiculos,
                            tributos_a_pagar_anterior: users[i].balanco_patrimonial.tributos_a_pagar_anterior,
                            tributos_a_pagar_atual: users[i].balanco_patrimonial.tributos_a_pagar_atual,
                            emprestimos: users[i].balanco_patrimonial.emprestimos + (users[i]['divida'][2]*0.08 - users[i].taokeys),
                            capial: users[i].balanco_patrimonial.capial,
                            lucros_acumulados: users[i].balanco_patrimonial.lucros_acumulados - users[i]['divida'][2]*0.08
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            csp: users[i].dre.csp,
                            estoque_inicial: users[i].dre.estoque_inicial,
                            custo_prestacao_servico: users[i].dre.custo_prestacao_servico,
                            custo_estocagem: users[i].dre.custo_estocagem,
                            custo_troca_insumos: users[i].dre.custo_troca_insumos,
                            hora_extra: users[i].dre.hora_extra,
                            capacidade_n_utilizada: users[i].dre.capacidade_n_utilizada,
                            margem_bruta: users[i].dre.margem_bruta,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            salario_promotores: users[i].dre.salario_promotores,
                            comissao: users[i].dre.comissao,
                            propaganda_institucional: users[i].dre.propaganda_institucional,
                            propaganda_unitaria: users[i].dre.propaganda_unitaria,
                            depreciacao_de_maquinas: users[i].dre.depreciacao_de_maquinas,
                            encargos_financiamento: users[i].dre.encargos_financiamento + users[i]['divida'][0]*0.08,
                            salario_frota: users[i].dre.salario_frota,
                            manutencao_frota: users[i].dre.manutencao_frota,
                            depreciacao_de_veiculos: users[i].dre.depreciacao_de_veiculos,
                            frota_terceirizada: users[i].dre.frota_terceirizada,
                            despesas_operacionais_n_planejadas: users[i].dre.despesas_operacionais_n_planejadas,
                            pas: users[i].dre.pas,
                            pesquisas: users[i].dre.pesquisas,
                            tributos: users[i].dre.tributos,
                            servicos: [users[i].dre.servicos[0], users[i].dre.servicos[1], users[i].dre.servicos[2], users[i].dre.servicos[3]],
                            preco_medio: users[i].dre.preco_medio,
                            atendimentos: users[i].dre.atendimentos,
                            insumos_em_estoque: users[i].dre.insumos_em_estoque

                        }
                        users[i].fluxo_de_caixa = {
                            saldo_anterior: users[i].fluxo_de_caixa.saldo_anterior,
                            faturamento: users[i].fluxo_de_caixa.faturamento,
                            contas_a_receber: users[i].fluxo_de_caixa.contas_a_receber,
                            contas_a_receber_recebidas: users[i].fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                            custo_de_servico_prestado: users[i].fluxo_de_caixa.custo_de_servico_prestado,
                            emprestimos_contratados: users[i].fluxo_de_caixa.emprestimos_contratados + (users[i]['divida'][2]*0.08 - users[i].taokeys),
                            emprestimos_pagos: users[i].fluxo_de_caixa.emprestimos_pagos,
                            veiculos_vendidos: users[i].fluxo_de_caixa.veiculos_vendidos,
                            depreciacao_de_veiculos: users[i].fluxo_de_caixa.depreciacao_de_veiculos,
                            depreciacao_de_maquinas: users[i].fluxo_de_caixa.depreciacao_de_maquinas,
                            veiculos_comprados: users[i].fluxo_de_caixa.veiculos_comprados,
                            tributos: users[i].fluxo_de_caixa.tributos,
                            promotores: users[i].fluxo_de_caixa.promotores,
                            propaganda: users[i].fluxo_de_caixa.propaganda,
                            pesquisas: users[i].fluxo_de_caixa.pesquisas,
                            pas: users[i].fluxo_de_caixa.pas,
                            uso_frota: users[i].fluxo_de_caixa.uso_frota,
                            despesas_operacionais_n_planejadas: users[i].fluxo_de_caixa.despesas_operacionais_n_planejadas,
                            despesas_administrativas: users[i].fluxo_de_caixa.despesas_administrativas,
                            encargos_financiamento: users[i].fluxo_de_caixa.encargos_financiamento + users[i]['divida'][0]*0.08,
                            maquinas: users[i].fluxo_de_caixa.maquinas
                        }
                        
                        users[i].set('divida', [users[i]['divida'][2] + (users[i]['divida'][2]*0.08 - users[i].taokeys), users[i]['divida'][0], users[i]['divida'][1]])
                        users[i].taokeys = 0
                    }

                    if(users[i].balanco_patrimonial.estoque > -0.1 && users[i].balanco_patrimonial.estoque < 0.1){
                        users[i].balanco_patrimonial = {
                            caixa: users[i].balanco_patrimonial.caixa,
                            estoque: 0,
                            contas_a_receber60: users[i].balanco_patrimonial.contas_a_receber60,
                            contas_a_receber120: users[i].balanco_patrimonial.contas_a_receber120,
                            maquinas: users[i].balanco_patrimonial.maquinas,
                            depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_maquinas,
                            veiculos: users[i].balanco_patrimonial.veiculos,
                            depreciacao_veiculos: users[i].balanco_patrimonial.depreciacao_veiculos,
                            tributos_a_pagar_anterior: users[i].balanco_patrimonial.tributos_a_pagar_anterior,
                            tributos_a_pagar_atual: users[i].balanco_patrimonial.tributos_a_pagar_atual,
                            emprestimos: users[i].balanco_patrimonial.emprestimos,
                            capial: users[i].balanco_patrimonial.capial,
                            lucros_acumulados: users[i].balanco_patrimonial.lucros_acumulados
                        }
                        
                        
                    }

                }

                
                let resp = []
                for(let i = 0; i < users.length; i++){
                    users[i].last_change = {
                        serv1: users[i].last_change.serv1,
                        serv2: users[i].last_change.serv2,
                        insu1: 0,
                        insu2: 0,
                        insu1i: users[i].last_change.insu1i,
                        insu2i: users[i].last_change.insu2i,
                        prop1: users[i].last_change.prop1,
                        prop2: users[i].last_change.prop2
                        }
                    if(users[i].last_change.serv2 !== 0){
                        //users[i].last_change.insu2i = users[i][users[i].last_change.serv2][0]
                        users[i].last_change = {
                            serv1: users[i].last_change.serv1,
                            serv2: users[i].last_change.serv2,
                            insu1: users[i].last_change.insu1,
                            insu2: users[i].last_change.insu2,
                            insu1i: users[i].last_change.insu1i,
                            insu2i: users[i][users[i].last_change.serv2][0],
                            prop1: users[i].last_change.prop1,
                            prop2: users[i].last_change.prop2
                        }
                    }
                    if(users[i].last_change.serv1 !== 0){
                        users[i].last_change = {
                            serv1: users[i].last_change.serv1,
                            serv2: users[i].last_change.serv2,
                            insu1: users[i].last_change.insu1,
                            insu2: users[i].last_change.insu2,
                            insu1i: users[i][users[i].last_change.serv1][0],
                            insu2i: users[i].last_change.insu2i,
                            prop1: users[i].last_change.prop1,
                            prop2: users[i].last_change.prop2
                        }
                        //users[i].last_change.insu1i = users[i][users[i].last_change.serv1][0]
                    }
                    users[i].turno = users[i].turno + 1

                    resp.push([
                        [...users[i]["147"],"147"],
                        [...users[i]["148"],"148"],
                        [...users[i]["149"],"149"],
                        [...users[i]["157"],"157"],
                        [...users[i]["158"],"158"],
                        [...users[i]["159"],"159"],
                        [...users[i]["257"],"257"],
                        [...users[i]["258"],"258"],
                        [...users[i]["259"],"259"],
                        [...users[i]["267"],"267"],
                        [...users[i]["268"],"268"],
                        [...users[i]["269"],"269"],
                        [...users[i]["347"],"347"],
                        [...users[i]["348"],"348"],
                        [...users[i]["349"],"349"],
                        [...users[i]["357"],"357"],
                        [...users[i]["358"],"358"],
                        [...users[i]["359"],"359"],
                        [...users[i]["367"],"367"],
                        [...users[i]["368"],"368"],
                        [...users[i]["369"],"369"],
                        users[i]["taokeys"],
                        users[i]["frota"],
                        users[i]["promotores"],
                        users[i]["comissao"],
                        users[i]["distribuidores"],
                        users[i]["pas"],
                        users[i]["propaganda"],
                        users[i]["propagandauni"],
                        users[i]["divida"],
                        users[i]["turno"],
                        users[i].cooperativa
                    ])

                
                socket.emit('tds-states', resp)

                    //

                    // (IGUALANDO O BANCO TEMPORARIO COM O OFICIAL)
                    

                    users[i].save()
                        .then(() => {
                            console.log(users[i]['cooperativa'] + ' Teve seu faturamento processado com sucesso.')
                            Aluno.findOne({cooperativa: users[i].cooperativa, instancia: adm.instancia, temporario: 1, ativo: 1})
                                            .then((usert) => {
                                                usert.last_change = {prop1: users[i].last_change.prop1, prop2: users[i].last_change.prop2 ,serv1: users[i].last_change.serv1, serv2: users[i].last_change.serv2, insu1: users[i].last_change.insu1, insu2: users[i].last_change.insu2, insu2i: users[i].last_change.insu2i, insu1i: users[i].last_change.insu1i, prop1: users[i].last_change.prop1, prop2: users[i].last_change.prop2}
                                                usert.deci = users[i].deci
                                                usert.set('npesquisas', users[i].npesquisas)
                                                usert.set('turno', users[i].turno)
                                                usert.set('propaganda', users[i].propaganda)
                                                usert.set('propagandauni', users[i].propagandauni)
                                                usert.set('taokeys', users[i].taokeys)
                                                usert.set('comissao', users[i].comissao)
                                                usert.set('pas', users[i].pas)
                                                usert.set('pas1', users[i].pas1)
                                                usert.set('pas2', users[i].pas2)
                                                usert.set('distribuidores', users[i].distribuidores)
                                                usert.set('promotores', users[i].promotores)
                                                usert.set('faturamento', users[i].faturamento)
                                                usert.set('divida', [users[i]["divida"][0],users[i]["divida"][1],users[i]["divida"][2]])
                                                usert.balanco_patrimonial = {
                                                    caixa: users[i].balanco_patrimonial.caixa,
                                                    estoque: users[i].balanco_patrimonial.estoque,
                                                    contas_a_receber60: users[i].balanco_patrimonial.contas_a_receber60,
                                                    contas_a_receber120: users[i].balanco_patrimonial.contas_a_receber120,
                                                    maquinas: users[i].balanco_patrimonial.maquinas,
                                                    depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_maquinas,
                                                    veiculos: users[i].balanco_patrimonial.veiculos,
                                                    depreciacao_veiculos: users[i].balanco_patrimonial.depreciacao_veiculos,
                                                    tributos_a_pagar_anterior: users[i].balanco_patrimonial.tributos_a_pagar_anterior,
                                                    tributos_a_pagar_atual: users[i].balanco_patrimonial.tributos_a_pagar_atual,
                                                    emprestimos: users[i].balanco_patrimonial.emprestimos,
                                                    capial: users[i].balanco_patrimonial.capial,
                                                    lucros_acumulados: users[i].balanco_patrimonial.lucros_acumulados
                                                }
                                                usert.dre = {
                                                    receita: users[i].dre.receita,
                                                    csp: users[i].dre.csp,
                                                    estoque_inicial: users[i].dre.estoque_inicial,
                                                    custo_prestacao_servico: users[i].dre.custo_prestacao_servico,
                                                    custo_estocagem: users[i].dre.custo_estocagem,
                                                    custo_troca_insumos: users[i].dre.custo_troca_insumos,
                                                    hora_extra: users[i].dre.hora_extra,
                                                    capacidade_n_utilizada: users[i].dre.capacidade_n_utilizada,
                                                    margem_bruta: users[i].dre.margem_bruta,
                                                    despesas_administrativas: users[i].dre.despesas_administrativas,
                                                    salario_promotores: users[i].dre.salario_promotores,
                                                    comissao: users[i].dre.comissao,
                                                    propaganda_institucional: users[i].dre.propaganda_institucional,
                                                    propaganda_unitaria: users[i].dre.propaganda_unitaria,
                                                    depreciacao_de_maquinas: users[i].dre.depreciacao_de_maquinas,
                                                    encargos_financiamento: users[i].dre.encargos_financiamento,
                                                    salario_frota: users[i].dre.salario_frota,
                                                    manutencao_frota: users[i].dre.manutencao_frota,
                                                    depreciacao_de_veiculos: users[i].dre.depreciacao_de_veiculos,
                                                    frota_terceirizada: users[i].dre.frota_terceirizada,
                                                    despesas_operacionais_n_planejadas: users[i].dre.despesas_operacionais_n_planejadas,
                                                    pas: users[i].dre.pas,
                                                    pesquisas: users[i].dre.pesquisas,
                                                    tributos: users[i].dre.tributos,
                                                    servicos: [users[i].dre.servicos[0], users[i].dre.servicos[1], users[i].dre.servicos[2], users[i].dre.servicos[3]],
                                                    preco_medio: users[i].dre.preco_medio,
                                                    atendimentos: users[i].dre.atendimentos,
                                                    insumos_em_estoque: users[i].dre.insumos_em_estoque
                        
                                                }
                                                usert.fluxo_de_caixa = {
                                                    saldo_anterior: users[i].fluxo_de_caixa.saldo_anterior,
                                                    faturamento: users[i].fluxo_de_caixa.faturamento,
                                                    contas_a_receber: users[i].fluxo_de_caixa.contas_a_receber,
                                                    contas_a_receber_recebidas: users[i].fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                                                    custo_de_servico_prestado: users[i].fluxo_de_caixa.custo_de_servico_prestado,
                                                    emprestimos_contratados: users[i].fluxo_de_caixa.emprestimos_contratados,
                                                    emprestimos_pagos: users[i].fluxo_de_caixa.emprestimos_pagos,
                                                    veiculos_vendidos: users[i].fluxo_de_caixa.veiculos_vendidos,
                                                    depreciacao_de_veiculos: users[i].fluxo_de_caixa.depreciacao_de_veiculos,
                                                    depreciacao_de_maquinas: users[i].fluxo_de_caixa.depreciacao_de_maquinas,
                                                    veiculos_comprados: users[i].fluxo_de_caixa.veiculos_comprados,
                                                    tributos: users[i].fluxo_de_caixa.tributos,
                                                    promotores: users[i].fluxo_de_caixa.promotores,
                                                    propaganda: users[i].fluxo_de_caixa.propaganda,
                                                    pesquisas: users[i].fluxo_de_caixa.pesquisas,
                                                    pas: users[i].fluxo_de_caixa.pas,
                                                    uso_frota: users[i].fluxo_de_caixa.uso_frota,
                                                    despesas_operacionais_n_planejadas: users[i].fluxo_de_caixa.despesas_operacionais_n_planejadas,
                                                    despesas_administrativas: users[i].fluxo_de_caixa.despesas_administrativas,
                                                    encargos_financiamento: users[i].fluxo_de_caixa.encargos_financiamento,
                                                    maquinas: users[i].fluxo_de_caixa.maquinas
                                                }
                                                usert.somapropuni = {tipo1: 0, inv1: 0, tipo2: 0, inv2: 0}
                                                usert.pes_p = {
                                                    modelos_oferecidos: 0,
                                                    total_pas: 0,
                                                    total_participacao_modelos: 0,
                                                    total_distribuidores: 0
                                                }
                                                usert.participacao_modelos = []
                                                for(let s = 0; s < index.length; s++){
                                                    //console.log(index[s])
                                                    let serv = index[s]
                                                    usert.set(serv, [users[i][serv][0], users[i][serv][1], users[i][serv][2], users[i][serv][3], users[i][serv][4], users[i][serv][5], users[i][serv][6], users[i][serv][7]])
                                                }
                                                usert.save()
                                                    .then(() => {
                                                        socket.emit('feedback', ['success', 'Turno foi finalizado'])
                                                        if(i == users.length - 1){
                                                            sockets.emit('final-turno') //manda a info pra tds os sockets conectados de que acabou o turno e para eles requisitarem (!!socket.emit('receber-faturamento')!!) o novo state pós FATURAMENTO e se o jogador n esriver conectado qnd acontecer o processo de faturamento essa puxada de dados tb smp acontece qnd ele se loga
                                                        }
                                                    })
                                                    .catch((err) => {socket.emit('feedback', ['danger', 'Falha ao salvar os dados no servidor (' + err + ')']);console.log(err)})
                                     
                                            })
                        })
                        .catch((err) => { console.log('Erro ao salvar os FATURAMENTOS processados. Motivo ==> ' + err)})
                }
                //sockets.emit('final-turno')

            })
            .catch((err) => {console.log('erro n 708 =>' + err + ' .id:' + socket.id)})
          // \/ essa parte de baixo calcula o resultado das pesquisas para serem mostradas no proximo turno mas CUIDADO porque esse bloco debaixo e o e cima rodarao simultaneamente do jeito q estra (precisa botar .then(() = > {logo qnd terminar esse logica botar ela antes do  botar .save() de cim botar a ;)})
            })
        
        }
        else{socket.emit('feedback', ['warning', 'Para finalizar o turno antes voce precisa inicia-lo'])}
        }
    else{socket.emit('feedback', ['danger',"Voce precisa estar logado para puxar o state atual da simulação"])}
            })
            .catch((err) => { console.log(err) }) 
    }) //falta contabilizar a depreciação das maquinas e TRIBUTOS
    socket.on('iniciar-turno', () => {
        Data.findOne({sockid: socket.id})    
            .then((pesquisas) => {
                if(pesquisas !== null){
                    if(pesquisas.finalizado == 1){
                        pesquisas.finalizado = 0
                        Aluno.find({ativo: 1, instancia: pesquisas.instancia, temporario: 0})
                            .then((users) => {
                        let tpas = 0
                        let tdis = 0
                        let serv = []
                        let part = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                        let total_part = 0
                        for(let i = 0; i < users.length; i++){
                            for(let h = 0; h < index.length; h++){
                                if(users[i][index[h]][1] == 1){
                                    serv.push(users[i].cooperativa+': '+index[h])
                                }
                                if(users[i][index[h]][6] > 0){
                                    part[h] = part[h] + users[i][index[h]][6]
                                    total_part = total_part + users[i][index[h]][6]
                                }
                            }
                            tpas = tpas + users[i]['pas'];
                            tdis = tdis + users[i]['distribuidores'];

                        }
                        let rep = ''
                        for(let i = 0; i < part.length; i++){
                            if(part[i] !== 0){
                                rep = rep + ' || ' + index[i]+ ': '+(part[i]/total_part)*100+'%'
                            }
                        }
                        let serv2 = serv.filter(function(item, pos) {
                            return serv.indexOf(item) == pos;
                        }) //retira redundancia

                        pesquisas['modelos_oferecidos'] = serv2
                        pesquisas['total_pas'] = tpas
                        pesquisas['participacao_modelos'] = part
                        pesquisas['total_participacao_modelos'] = total_part
                        pesquisas['total_distribuidores'] = tdis
                        
                        pesquisas.iniciado = 1
                        pesquisas.ativo = 1

                        pesquisas.save()
                            .then(() => {
                                        for(let i = 0; i < users.length; i++){
                                        let amem = []
                                        let tserv2 = serv2
                                        let ttpas = tpas
                                        let ttotal_part = total_part
                                        let ttdis = tdis
                                        //console.log(users[i].dre.servicos)
                                        
                                            for(let dd = 0; dd < users[i].participacao_modelos.length; dd++){
                                                console.log('users[i].participacao_modelos[dd][0][2]: ' + users[i].participacao_modelos[dd][0][2])
                                                console.log('users[i].participacao_modelos[dd][1][2]: ' + users[i].participacao_modelos[dd][1][2])
                                                if(users[i].participacao_modelos[dd][0][2] > users[i].participacao_modelos[dd][1][2] && users[i].participacao_modelos[dd][0][0] > users[i].participacao_modelos[dd][1][0]){
                                                    let sorte = Math.round(Math.random()*15) + 50
                                                    console.log('sorte: ' + sorte)
                                                    let azar = 100 - sorte
                                                    amem.push([users[i].participacao_modelos[dd][0]+' com preferência de '+sorte+'% e ',users[i].participacao_modelos[dd][1]+' com '+azar+'%.'])
                                                }
                                                else if(users[i].participacao_modelos[dd][0][2] > users[i].participacao_modelos[dd][1][2] && users[i].participacao_modelos[dd][0][0] <  users[i].participacao_modelos[dd][1][0]){
                                                    let sorte = Math.round(Math.random()*8) + 50
                                                    console.log('sorte: ' + sorte)
                                                    let azar = 100 - sorte
                                                    amem.push(["{ "+users[i].participacao_modelos[dd][0]+' com prefenrência de '+sorte+'% e ',users[i].participacao_modelos[dd][1]+' com '+azar+'%. }'])
                                                }
                                                else{
                                                    let sorte = Math.round(Math.random()*5) + 50
                                                    console.log('sorte: ' + sorte)
                                                    let azar = 100 - sorte
                                                    amem.push([users[i].participacao_modelos[dd][0]+' com prefenrência de '+sorte+'% e ',users[i].participacao_modelos[dd][1]+' com '+azar+'%.'])
                                                }
                                            }
                                        
                                        if(users[i].pes_p.modelos_oferecidos !== 1){
                                            console.log('mod-ofere-zero')
                                            tserv2 = 'vazio'}
                                        if(users[i].pes_p.total_pas !== 1){
                                            ttpas = 'vazio'}
                                            
                                        if(users[i].pes_p.total_participacao_modelos !== 1){
                                            rep = 'vazio'}
                                            
                                        if(users[i].pes_p.total_distribuidores !== 1){
                                            console.log('dist-zero')
                                            ttdis = 'vazio'}
                                            
                                        let backup = new Aluno({backup: 1, instancia: users[i].instancia, npesquisas: users[i].npesquisas, turno: Number(users[i].turno) - 1, propaganda: users[i].propaganda, propagandauni: users[i].propagandauni, faturamento: users[i].faturamento, ativo: 1, taokeys: users[i].taokeys, divida: [users[i]['divida'][0],users[i]['divida'][1],users[i]['divida'][2]], comissao: users[i].comissao, frota: [users[i].frota[0],users[i].frota[1],users[i].frota[2],users[i].frota[3],users[i].frota[4],users[i].frota[5],users[i].frota[6],users[i].frota[7],users[i].frota[8],users[i].frota[9],users[i].frota[10],users[i].frota[11]], cooperativa: users[i].cooperativa, pas: users[i].pas, pas1: users[i].pas1, pas2: users[i].pas2, distribuidores: users[i].distribuidores, promotores: users[i].promotores, 
                                            147:[users[i]['147'][0],users[i]['147'][1],users[i]['147'][2],users[i]['147'][3],users[i]['147'][4],users[i]['147'][5],users[i]['147'][6],users[i]['147'][7]],
                                            159:[users[i]['159'][0],users[i]['159'][1],users[i]['159'][2],users[i]['159'][3],users[i]['159'][4],users[i]['159'][5],users[i]['159'][6],users[i]['159'][7]],
                                            149:[users[i]['149'][0],users[i]['149'][1],users[i]['149'][2],users[i]['149'][3],users[i]['149'][4],users[i]['149'][5],users[i]['149'][6],users[i]['149'][7]],
                                            148:[users[i]['148'][0],users[i]['148'][1],users[i]['148'][2],users[i]['148'][3],users[i]['148'][4],users[i]['148'][5],users[i]['148'][6],users[i]['148'][7]],
                                            158:[users[i]['158'][0],users[i]['158'][1],users[i]['158'][2],users[i]['158'][3],users[i]['158'][4],users[i]['158'][5],users[i]['158'][6],users[i]['158'][7]],
                                            157:[users[i]['157'][0],users[i]['157'][1],users[i]['157'][2],users[i]['157'][3],users[i]['157'][4],users[i]['157'][5],users[i]['157'][6],users[i]['157'][7]],
                                            257:[users[i]['257'][0],users[i]['257'][1],users[i]['257'][2],users[i]['257'][3],users[i]['257'][4],users[i]['257'][5],users[i]['257'][6],users[i]['257'][7]],
                                            258:[users[i]['258'][0],users[i]['258'][1],users[i]['258'][2],users[i]['258'][3],users[i]['258'][4],users[i]['258'][5],users[i]['258'][6],users[i]['258'][7]],
                                            259:[users[i]['259'][0],users[i]['259'][1],users[i]['259'][2],users[i]['259'][3],users[i]['259'][4],users[i]['259'][5],users[i]['259'][6],users[i]['259'][7]],
                                            267:[users[i]['267'][0],users[i]['267'][1],users[i]['267'][2],users[i]['267'][3],users[i]['267'][4],users[i]['267'][5],users[i]['267'][6],users[i]['267'][7]],
                                            268:[users[i]['268'][0],users[i]['268'][1],users[i]['268'][2],users[i]['268'][3],users[i]['268'][4],users[i]['268'][5],users[i]['268'][6],users[i]['268'][7]],
                                            269:[users[i]['269'][0],users[i]['269'][1],users[i]['269'][2],users[i]['269'][3],users[i]['269'][4],users[i]['269'][5],users[i]['269'][6],users[i]['269'][7]],
                                            347:[users[i]['347'][0],users[i]['347'][1],users[i]['347'][2],users[i]['347'][3],users[i]['347'][4],users[i]['347'][5],users[i]['347'][6],users[i]['347'][7]],
                                            348:[users[i]['348'][0],users[i]['348'][1],users[i]['348'][2],users[i]['348'][3],users[i]['348'][4],users[i]['348'][5],users[i]['348'][6],users[i]['348'][7]],
                                            349:[users[i]['349'][0],users[i]['349'][1],users[i]['349'][2],users[i]['349'][3],users[i]['349'][4],users[i]['349'][5],users[i]['349'][6],users[i]['349'][7]],
                                            357:[users[i]['357'][0],users[i]['357'][1],users[i]['357'][2],users[i]['357'][3],users[i]['357'][4],users[i]['357'][5],users[i]['357'][6],users[i]['357'][7]],
                                            358:[users[i]['358'][0],users[i]['358'][1],users[i]['358'][2],users[i]['358'][3],users[i]['358'][4],users[i]['358'][5],users[i]['358'][6],users[i]['358'][7]],
                                            359:[users[i]['359'][0],users[i]['359'][1],users[i]['359'][2],users[i]['359'][3],users[i]['359'][4],users[i]['359'][5],users[i]['359'][6],users[i]['359'][7]],
                                            367:[users[i]['367'][0],users[i]['367'][1],users[i]['367'][2],users[i]['367'][3],users[i]['367'][4],users[i]['367'][5],users[i]['367'][6],users[i]['367'][7]],
                                            368:[users[i]['368'][0],users[i]['368'][1],users[i]['368'][2],users[i]['368'][3],users[i]['368'][4],users[i]['368'][5],users[i]['368'][6],users[i]['368'][7]],
                                            369:[users[i]['369'][0],users[i]['369'][1],users[i]['369'][2],users[i]['369'][3],users[i]['369'][4],users[i]['369'][5],users[i]['369'][6],users[i]['369'][7]],
                                            balanco_patrimonial: {
                                                caixa: users[i].balanco_patrimonial.caixa,
                                                estoque: users[i].balanco_patrimonial.estoque,
                                                contas_a_receber60: users[i].balanco_patrimonial.contas_a_receber60,
                                                contas_a_receber120: users[i].balanco_patrimonial.contas_a_receber120,
                                                maquinas: users[i].balanco_patrimonial.maquinas,
                                                depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_maquinas,
                                                veiculos: users[i].balanco_patrimonial.veiculos,
                                                depreciacao_veiculos: users[i].balanco_patrimonial.depreciacao_veiculos,
                                                tributos_a_pagar_anterior: users[i].balanco_patrimonial.tributos_a_pagar_anterior,
                                                tributos_a_pagar_atual: users[i].balanco_patrimonial.tributos_a_pagar_atual,
                                                emprestimos: users[i].balanco_patrimonial.emprestimos,
                                                capial: users[i].balanco_patrimonial.capial,
                                                lucros_acumulados: users[i].balanco_patrimonial.lucros_acumulados
                                            },
                                            dre: {
                                                receita: users[i].dre.receita,
                                                csp: users[i].dre.csp,
                                                estoque_inicial: users[i].dre.estoque_inicial,
                                                custo_prestacao_servico: users[i].dre.custo_prestacao_servico,
                                                custo_estocagem: users[i].dre.custo_estocagem,
                                                custo_troca_insumos: users[i].dre.custo_troca_insumos,
                                                hora_extra: users[i].dre.hora_extra,
                                                capacidade_n_utilizada: users[i].dre.capacidade_n_utilizada,
                                                margem_bruta: users[i].dre.margem_bruta,
                                                despesas_administrativas: users[i].dre.despesas_administrativas,
                                                salario_promotores: users[i].dre.salario_promotores,
                                                comissao: users[i].dre.comissao,
                                                propaganda_institucional: users[i].dre.propaganda_institucional,
                                                propaganda_unitaria: users[i].dre.propaganda_unitaria,
                                                depreciacao_de_maquinas: users[i].dre.depreciacao_de_maquinas,
                                                encargos_financiamento: users[i].dre.encargos_financiamento,
                                                salario_frota: users[i].dre.salario_frota,
                                                manutencao_frota: users[i].dre.manutencao_frota,
                                                depreciacao_de_veiculos: users[i].dre.depreciacao_de_veiculos,
                                                frota_terceirizada: users[i].dre.frota_terceirizada,
                                                despesas_operacionais_n_planejadas: users[i].dre.despesas_operacionais_n_planejadas,
                                                pas: users[i].dre.pas,
                                                pesquisas: users[i].dre.pesquisas,
                                                tributos: users[i].dre.tributos,
                                                servicos:[users[i].dre.servicos[0],users[i].dre.servicos[1],users[i].dre.servicos[2],users[i].dre.servicos[3]],
                                                preco_medio: users[i].dre.preco_medio,
                                                atendimentos: users[i].dre.atendimentos,
                                                insumos_em_estoque: users[i].dre.insumos_em_estoque
                    
                                            },
                                            fluxo_de_caixa: {
                                                saldo_anterior: users[i].fluxo_de_caixa.saldo_anterior,
                                                faturamento: users[i].fluxo_de_caixa.faturamento,
                                                contas_a_receber: users[i].fluxo_de_caixa.contas_a_receber,
                                                contas_a_receber_recebidas: users[i].fluxo_de_caixa.contas_a_receber_recebidas,
                                                custo_de_servico_prestado: users[i].fluxo_de_caixa.custo_de_servico_prestado,
                                                emprestimos_contratados: users[i].fluxo_de_caixa.emprestimos_contratados,
                                                emprestimos_pagos: users[i].fluxo_de_caixa.emprestimos_pagos,
                                                veiculos_vendidos: users[i].fluxo_de_caixa.veiculos_vendidos,
                                                depreciacao_de_veiculos: users[i].fluxo_de_caixa.depreciacao_de_veiculos,
                                                depreciacao_de_maquinas: users[i].fluxo_de_caixa.depreciacao_de_maquinas,
                                                veiculos_comprados: users[i].fluxo_de_caixa.veiculos_comprados,
                                                tributos: users[i].fluxo_de_caixa.tributos,
                                                promotores: users[i].fluxo_de_caixa.promotores,
                                                propaganda: users[i].fluxo_de_caixa.propaganda,
                                                pesquisas: users[i].fluxo_de_caixa.pesquisas,
                                                pas: users[i].fluxo_de_caixa.pas,
                                                uso_frota: users[i].fluxo_de_caixa.uso_frota,
                                                despesas_operacionais_n_planejadas: users[i].fluxo_de_caixa.despesas_operacionais_n_planejadas,
                                                despesas_administrativas: users[i].fluxo_de_caixa.despesas_administrativas,
                                                encargos_financiamento: users[i].fluxo_de_caixa.encargos_financiamento,
                                                maquinas: users[i].fluxo_de_caixa.maquinas,
                                            },
                                            pes_p: {
                                                modelos_oferecidos: tserv2,
                                                total_pas: ttpas,
                                                total_participacao_modelos: rep,
                                                total_distribuidores: ttdis
                                            },
                                            participacao_modelos: amem,
                                            deci: users[i].deci,
                                            last_change: {
                                                prop1: users[i].last_change.prop1,
                                                prop2: users[i].last_change.prop2,
                                                serv1: users[i].last_change.serv1,
                                                serv2: users[i].last_change.serv2,
                                                insu1: 0,
                                                insu2: 0,
                                                insu2i: users[i].last_change.insu2i,
                                                insu1i: users[i].last_change.insu1i
                                            }
                                            
                                        });
                                        backup.save() 
                                            .then(() => {
                                                users[i].fluxo_de_caixa = {
                                                    saldo_anterior: (users[i].balanco_patrimonial.contas_a_receber60 + users[i].fluxo_de_caixa.depreciacao_de_veiculos + users[i].fluxo_de_caixa.depreciacao_de_maquinas + users[i].fluxo_de_caixa.veiculos_vendidos) - (users[i].fluxo_de_caixa.promotores + users[i].fluxo_de_caixa.propaganda + users[i].fluxo_de_caixa.pesquisas + users[i].fluxo_de_caixa.pas + users[i].fluxo_de_caixa.uso_frota + users[i].fluxo_de_caixa.despesas_operacionais_n_planejadas + users[i].fluxo_de_caixa.despesas_administrativas + users[i].fluxo_de_caixa.encargos_de_financiamento + users[i].fluxo_de_caixa.custo_de_servico_prestado + users[i].fluxo_de_caixa.veiculos_comprados + users[i].fluxo_de_caixa.maquinas + users[i].fluxo_de_caixa.tributos),
                                                    faturamento: 0,
                                                    contas_a_receber: 0,
                                                    contas_a_receber_recebidas: 0, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                                                    custo_de_servico_prestado: 0,
                                                    emprestimos_contratados: 0,
                                                    emprestimos_pagos: 0,
                                                    veiculos_vendidos: 0,
                                                    depreciacao_de_veiculos: 0,
                                                    depreciacao_de_maquinas: 0,
                                                    veiculos_comprados: 0,
                                                    tributos: 0,
                                                    promotores: 0,
                                                    propaganda: 0,
                                                    pesquisas: 0,
                                                    pas: 0,
                                                    uso_frota: 0,
                                                    despesas_operacionais_n_planejadas: 0,
                                                    despesas_administrativas: 0,
                                                    encargos_financiamento: 0,
                                                    maquinas: 0,
                                                    distribuidores: 0
                                                }
                                                users[i].dre = {
                                                    receita: 0,
                                                    csp: 0,
                                                    estoque_inicial: users[i].balanco_patrimonial.estoque,
                                                    custo_prestacao_servico: 0,
                                                    custo_estocagem: 0,
                                                    custo_troca_insumos: 0,
                                                    hora_extra: 0,
                                                    capacidade_n_utilizada: users[i].balanco_patrimonial.estoque,
                                                    margem_bruta: 0,
                                                    despesas_administrativas: 0,
                                                    salario_promotores: 0,
                                                    comissao: 0,
                                                    propaganda_institucional: 0,
                                                    propaganda_unitaria: 0,
                                                    depreciacao_de_maquinas: 0,
                                                    encargos_financiamento: 0,
                                                    salario_frota: 0,
                                                    manutencao_frota: 0,
                                                    depreciacao_de_veiculos: 0,
                                                    frota_terceirizada: 0,
                                                    despesas_operacionais_n_planejadas: 0,
                                                    pas: 0,
                                                    pesquisas: 0,
                                                    tributos: 0,
                                                    servicos: [users[i].dre.servicos[0], users[i].dre.servicos[1], users[i].dre.servicos[2], users[i].dre.servicos[3]],
                                                    preco_medio: 0,
                                                    atendimentos: 0,
                                                    insumos_em_estoque: 0,
                                                    distribuidores: 0
                        
                                                }
                                                users[i].participacao_modelos = []
                                                users[i].pes_p = {
                                                    modelos_oferecidos: 0,
                                                    total_pas: 0,
                                                    total_participacao_modelos: 0,
                                                    total_distribuidores: 0
                                                }
                                                users[i].save()
                                                .then(() => {
                                                    console.log(users[i]['cooperativa'] + ' Teve seu faturamento processado com sucesso.')
                                                    Aluno.findOne({cooperativa: users[i].cooperativa, instancia: users[i].instancia, temporario: 1, ativo: 1})
                                                                    .then((usert) => {
                                                                        usert.last_change = {prop1: users[i].last_change.prop1, prop2: users[i].last_change.prop2 ,serv1: users[i].last_change.serv1, serv2: users[i].last_change.serv2, insu1: users[i].last_change.insu1, insu2: users[i].last_change.insu2, insu2i: users[i].last_change.insu2i, insu1i: users[i].last_change.insu1i, prop1: users[i].last_change.prop1, prop2: users[i].last_change.prop2}
                                                                        usert.deci = users[i].deci
                                                                        usert.set('frota', [users[i].frota[0],users[i].frota[1],users[i].frota[2],users[i].frota[3],users[i].frota[4],users[i].frota[5],users[i].frota[6],users[i].frota[7],users[i].frota[8],users[i].frota[9],users[i].frota[10],users[i].frota[11]])
                                                                        usert.set('npesquisas', users[i].npesquisas)
                                                                        usert.set('turno', users[i].turno)
                                                                        usert.set('propaganda', users[i].propaganda)
                                                                        usert.set('propagandauni', users[i].propagandauni)
                                                                        usert.set('taokeys', users[i].taokeys)
                                                                        usert.set('comissao', users[i].comissao)
                                                                        usert.set('pas', users[i].pas)
                                                                        usert.set('pas1', users[i].pas1)
                                                                        usert.set('pas2', users[i].pas2)
                                                                        usert.set('distribuidores', users[i].distribuidores)
                                                                        usert.set('promotores', users[i].promotores)
                                                                        usert.set('faturamento', users[i].faturamento)
                                                                        usert.set('divida', [users[i]["divida"][0],users[i]["divida"][1],users[i]["divida"][2]])
                                                                        usert.balanco_patrimonial = {
                                                                            caixa: users[i].balanco_patrimonial.caixa,
                                                                            estoque: users[i].balanco_patrimonial.estoque,
                                                                            contas_a_receber60: users[i].balanco_patrimonial.contas_a_receber60,
                                                                            contas_a_receber120: users[i].balanco_patrimonial.contas_a_receber120,
                                                                            maquinas: users[i].balanco_patrimonial.maquinas,
                                                                            depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_maquinas,
                                                                            veiculos: users[i].balanco_patrimonial.veiculos,
                                                                            depreciacao_veiculos: users[i].balanco_patrimonial.depreciacao_veiculos,
                                                                            tributos_a_pagar_anterior: users[i].balanco_patrimonial.tributos_a_pagar_anterior,
                                                                            tributos_a_pagar_atual: users[i].balanco_patrimonial.tributos_a_pagar_atual,
                                                                            emprestimos: users[i].balanco_patrimonial.emprestimos,
                                                                            capial: users[i].balanco_patrimonial.capial,
                                                                            lucros_acumulados: users[i].balanco_patrimonial.lucros_acumulados
                                                                        }
                                                                        usert.dre = {
                                                                            receita: users[i].dre.receita,
                                                                            csp: users[i].dre.csp,
                                                                            estoque_inicial: users[i].dre.estoque_inicial,
                                                                            custo_prestacao_servico: users[i].dre.custo_prestacao_servico,
                                                                            custo_estocagem: users[i].dre.custo_estocagem,
                                                                            custo_troca_insumos: users[i].dre.custo_troca_insumos,
                                                                            hora_extra: users[i].dre.hora_extra,
                                                                            capacidade_n_utilizada: users[i].dre.capacidade_n_utilizada,
                                                                            margem_bruta: users[i].dre.margem_bruta,
                                                                            despesas_administrativas: users[i].dre.despesas_administrativas,
                                                                            salario_promotores: users[i].dre.salario_promotores,
                                                                            comissao: users[i].dre.comissao,
                                                                            propaganda_institucional: users[i].dre.propaganda_institucional,
                                                                            propaganda_unitaria: users[i].dre.propaganda_unitaria,
                                                                            depreciacao_de_maquinas: users[i].dre.depreciacao_de_maquinas,
                                                                            encargos_financiamento: users[i].dre.encargos_financiamento,
                                                                            salario_frota: users[i].dre.salario_frota,
                                                                            manutencao_frota: users[i].dre.manutencao_frota,
                                                                            depreciacao_de_veiculos: users[i].dre.depreciacao_de_veiculos,
                                                                            frota_terceirizada: users[i].dre.frota_terceirizada,
                                                                            despesas_operacionais_n_planejadas: users[i].dre.despesas_operacionais_n_planejadas,
                                                                            pas: users[i].dre.pas,
                                                                            pesquisas: users[i].dre.pesquisas,
                                                                            tributos: users[i].dre.tributos,
                                                                            servicos: [users[i].dre.servicos[0], users[i].dre.servicos[1], users[i].dre.servicos[2], users[i].dre.servicos[3]],
                                                                            preco_medio: users[i].dre.preco_medio,
                                                                            atendimentos: users[i].dre.atendimentos,
                                                                            insumos_em_estoque: users[i].dre.insumos_em_estoque
                                                
                                                                        }
                                                                        usert.fluxo_de_caixa = {
                                                                            saldo_anterior: users[i].fluxo_de_caixa.saldo_anterior,
                                                                            faturamento: users[i].fluxo_de_caixa.faturamento,
                                                                            contas_a_receber: users[i].fluxo_de_caixa.contas_a_receber,
                                                                            contas_a_receber_recebidas: users[i].fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                                                                            custo_de_servico_prestado: users[i].fluxo_de_caixa.custo_de_servico_prestado,
                                                                            emprestimos_contratados: users[i].fluxo_de_caixa.emprestimos_contratados,
                                                                            emprestimos_pagos: users[i].fluxo_de_caixa.emprestimos_pagos,
                                                                            veiculos_vendidos: users[i].fluxo_de_caixa.veiculos_vendidos,
                                                                            depreciacao_de_veiculos: users[i].fluxo_de_caixa.depreciacao_de_veiculos,
                                                                            depreciacao_de_maquinas: users[i].fluxo_de_caixa.depreciacao_de_maquinas,
                                                                            veiculos_comprados: users[i].fluxo_de_caixa.veiculos_comprados,
                                                                            tributos: users[i].fluxo_de_caixa.tributos,
                                                                            promotores: users[i].fluxo_de_caixa.promotores,
                                                                            propaganda: users[i].fluxo_de_caixa.propaganda,
                                                                            pesquisas: users[i].fluxo_de_caixa.pesquisas,
                                                                            pas: users[i].fluxo_de_caixa.pas,
                                                                            uso_frota: users[i].fluxo_de_caixa.uso_frota,
                                                                            despesas_operacionais_n_planejadas: users[i].fluxo_de_caixa.despesas_operacionais_n_planejadas,
                                                                            despesas_administrativas: users[i].fluxo_de_caixa.despesas_administrativas,
                                                                            encargos_financiamento: users[i].fluxo_de_caixa.encargos_financiamento,
                                                                            maquinas: users[i].fluxo_de_caixa.maquinas
                                                                        }
                                                                        usert.somapropuni = {tipo1: 0, inv1: 0, tipo2: 0, inv2: 0}
                                                                        usert.pes_p = {
                                                                            modelos_oferecidos: 0,
                                                                            total_pas: 0,
                                                                            total_participacao_modelos: 0,
                                                                            total_distribuidores: 0
                                                                        }
                                                                        usert.participacao_modelos = []
                                                                        for(let s = 0; s < index.length; s++){
                                                                            //console.log(index[s])
                                                                            let serv = index[s]
                                                                            usert.set(serv, [users[i][serv][0], users[i][serv][1], users[i][serv][2], users[i][serv][3], users[i][serv][4], users[i][serv][5], users[i][serv][6], users[i][serv][7]])
                                                                        }
                                                                        usert.save()
                                                                            .then(() => {
                                                                                socket.emit('feedback', ['success', 'Turno foi iniciado'])
                                                                                if(i == users.length - 1){
                                                                                    sockets.emit('final-turno') //manda a info pra tds os sockets conectados de que acabou o turno e para eles requisitarem (!!socket.emit('receber-faturamento')!!) o novo state pós FATURAMENTO e se o jogador n esriver conectado qnd acontecer o processo de faturamento essa puxada de dados tb smp acontece qnd ele se loga
                                                                                }
                                                                            })
                                                                            .catch((err) => {socket.emit('feedback', ['danger', 'Falha ao salvar os dados no servidor (' + err + ')']);console.log(err)})
                                                             
                                                                    })
                                                })
                                                console.log('Save da cooperativa: ' + backup.cooperativa + '. realizado com sucesso para o turno: ' + backup.turno+'.')
                                            
                                            })
                                            .catch((err) => {console.log(err)})

                                        }
                                    
                            })
                            .catch((err) => {console.log(err)})

                        })
                    }
                else{
                    socket.emit('feedback', ['warning', 'Para iniciar um novo turno voce precisa antes finalizar o atual.'])}
                }
                else{
                    socket.emit('feedback', ['danger','É preciso estar logado para puxar o state atual da simulação'])
                }   

            })
            

    }) 
    socket.on('puxar-tds-states', () => {
        Data.findOne({sockid: socket.id})
            .then((data) => { 
            if(data !== null){
            Aluno.find({instancia: data.instancia, temporario: 0, ativo: 1, backup: 0})
                .then((userxs) => {
                let resp = []
                for(let i = 0; i < userxs.length; i++){

                    resp.push([
                        [...userxs[i]["147"],"147"],
                        [...userxs[i]["148"],"148"],
                        [...userxs[i]["149"],"149"],
                        [...userxs[i]["157"],"157"],
                        [...userxs[i]["158"],"158"],
                        [...userxs[i]["159"],"159"],
                        [...userxs[i]["257"],"257"],
                        [...userxs[i]["258"],"258"],
                        [...userxs[i]["259"],"259"],
                        [...userxs[i]["267"],"267"],
                        [...userxs[i]["268"],"268"],
                        [...userxs[i]["269"],"269"],
                        [...userxs[i]["347"],"347"],
                        [...userxs[i]["348"],"348"],
                        [...userxs[i]["349"],"349"],
                        [...userxs[i]["357"],"357"],
                        [...userxs[i]["358"],"358"],
                        [...userxs[i]["359"],"359"],
                        [...userxs[i]["367"],"367"],
                        [...userxs[i]["368"],"368"],
                        [...userxs[i]["369"],"369"],
                        userxs[i]["taokeys"],
                        userxs[i]["frota"],
                        userxs[i]["promotores"],
                        userxs[i]["comissao"],
                        userxs[i]["distribuidores"],
                        userxs[i]["pas"],
                        userxs[i]["propaganda"],
                        userxs[i]["propagandauni"],
                        userxs[i]["divida"],
                        userxs[i]["turno"],
                        userxs[i].cooperativa
                    ])

                }
                socket.emit('tds-states', resp)
                
                })
                .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
            }
            else{socket.emit('feedback', ['danger', 'voce precisa estar logado para puxar o state atual da simulação'])}

            })
            .catch((err) => { console.log(err) })
    })
    socket.on('puxar-balancos-adm',  (dados) => {
        let cooperativa = dados[0]
        let turno = dados[1]

        Data.findOne({sockid: socket.id})
            .then((data) => {

        
                if(data !== null){
                 Aluno.findOne({ cooperativa: cooperativa, backup: 1, instancia: data.instancia, turno: turno })                 
                    .then((balancos) => {
                                    
                        socket.emit('balancos-adm', { 
                            balanco_patrimonial: balancos.balanco_patrimonial,
                            dre: balancos.dre,
                            fluxo_de_caixa: balancos.fluxo_de_caixa
                        });
        
                                                      
                    })
                    .catch((err) => {console.log(err)})
                }
                else{
                    socket.emit('feedback', ['danger', 'voce precisa estar logado para puxar o state atual da simulação'])
                }

            
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})

    }) //FALTA PUXAR TB OS BALANCOS DO TURNO ATUAL

    socket.on('deletar-instancia', (dados) => {
        let senha_mestra = dados[0]
        let instancia = dados[1]
        if(senha_mestra == 'senha-mestra'){
            Data.find({instancia: instancia})
                .then((data) => {

                    if(data.length > 0){ 

                        Aluno.find({instancia: instancia}) //pega os saves, status temporarios e n_temporarios
                                    .then((alunos) => {
                                        for(let h = 0; h < data.length; h++){
                                            let nom = data[h].instancia
                                            data[h].remove()
                                                .then(()=> {socket.emit('resposta-root', 'instancia '+nom+' deletada')})
                                                .catch((err) => {socket.emit('resposta-root', err)})
                                        }
                                        for(let h = 0; h < alunos.length; h++){
                                            alunos[h].remove()
                                                .then(()=> {})
                                                .catch(() => {socket.emit('resposta-root', err)})
                                        }
                                    })
                            

                    }
                    else{
                        socket.emit('resposta-root', 'instancia nao encontrada')
                        socket.emit('feedback', ['warning', 'instancia nao encontrada'])
                    }

                })
        }
        else{
            socket.emit('resposta-root', 'senha mestra incorreta (OPERACAO NEGADA)')
            socket.emit('feedback', ['warning', 'senha-mestra incorreta'])
        }
    })
    socket.on('verificar-instancias', (dados) => {
        let senha_mestra = dados
        if(senha_mestra == 'senha-mestra'){
            Data.find()
                .then((data) => {

                    if(data.length > 0){ 
                        let resp = []
                       for(let i = 0; i < data.length; i++){
                        resp.push(data[i].instancia + ' (turno: ' + data[i].turno + ' )')
                       }
                       socket.emit('resposta-root', resp)

                    }
                    else{
                        socket.emit('resposta-root', 'nenhuma instancia foi encontrada')
                        socket.emit('feedback', ['warning', 'instancia nao encontrada'])
                    }

                })
        }
        else{
            socket.emit('resposta-root', 'senha mestra incorreta (OPERACAO NEGADA)')
            socket.emit('feedback', ['warning', 'senha-mestra incorreta'])
        }
    })
    

})
}
catch (e) {
    console.log(e)
    //socket.emit('feedback', ['danger', 'erro fatal no server: ' + e])
}
// PARA TESTES PROFESSOR PRETENDE TER INSTANCIAS COM 8 PESSOAS NA SITUAÇAO IDEAL (basear teste com o parametro 8)
server.listen(3000, () => {
    console.log(`--> Server escutando porta: 3000`)
})


            /*
CHECK LIST:
            FALTA CONCERTAR OS custos de estocagem (apenas replicar as logicas para casos especificos q ja tem na parte da tabela q mostra os custos de estocagem secos=)

            
            */
