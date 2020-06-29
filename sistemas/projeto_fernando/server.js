import express from 'express'
import http from 'http'
import socketio from 'socket.io'
import estrutura from './src/aluno.js'
const Aluno = estrutura[0]
const Data = estrutura[1]
const Usuario = estrutura[2] //login individual
const Deci = estrutura[3]
import mongoose from 'mongoose'

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
    socket.on('limpar-deci', () => {
        mongoose.connection.collections.decis.drop()
    })
    socket.on('teste', () => {console.log('teste OK: ' + socket.id)
    })
    socket.on('login-client', (creden) => {
            Aluno.findOne({sockid: socket.id, temporario: 1}) // se n achar retorna Null e se vc tentar fazer essa pesquisa com um String sendo q no Schema ta como Number vai ir pro Catch ou vai pro Catch tb se n conseguir se conectar com o MongoDB
            .then((ll) => {
                if(ll !== null){
                    console.log('>>usuario ja conectado');
                    socket.emit('feedback', ['warning','voce ja esta conectado com: ' + ll.cooperativa]) 
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
                                                                    
                                                                    for(let s = 0; s < index.length; s++){
                                                                        let serv = index[s]
                                                                        usert.set(serv, [userdef[serv][0], userdef[serv][1], userdef[serv][2], userdef[serv][3], userdef[serv][4], userdef[serv][5], userdef[serv][6], userdef[serv][7]])
                                                                    }

                                                                    usert.sockid = socket.id;
                                                                    usert.modificador = u.nome
                                                                    usert.save()
                                                                        .then(() => {
                                                                            console.log('>>login efetuado com sucesso')
                                                                            socket.emit('feedback', ['success', 'login aprovado para: ' + creden.login]) 
                                                                            socket.emit('login-client-aprovado')
                                                                        
                                                                        })
                                                                        .catch((err) => {socket.emit('feedback', ['danger','falha ao salvar os dados no servidor -> ' + err])})
                                     
                                            })
                              
                                        }
                                        else{
                                            socket.emit('feedback', ['warning','o turno atual ainda nao foi inicializado pelo administrador'])
                                        }        
                                    })
                                    .catch((errr) => {console.log(errr + ' <=> Falha na comunicacao com o Banco de dados n 403.0 ' + socket.id)})       
                            
                                }
                                else{
                                    socket.emit('feedback', ['danger','nenhuma cooperativa encontrada (entre em contato com o suporte tecnico)'])
                                }
                            })
                                        
                                }
                                else{
                                    socket.emit('feedback', ['danger', 'essa conta ainda nao foi vinculada com nenhuma Cooperativa (duvidas: sac@desafiosdegestao.com.br)'])    
                                }
                            }
                            else{
                                socket.emit('feedback', ['danger', 'credenciais invalidas'])
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
                            if(inst !== null && inst.turno == 0){

                            
        Aluno.findOne({cooperativa: creden[0], instancia: creden[2]})
            .then((userx) => { 
                if(userx !== null){
                    console.log('>>registro negado: já existe cooperativa com este nome');
                    socket.emit('feedback', ['danger', 'ja existe uma cooperativa com esse nome na instancia selecionada'])}
                else{
                    let jogador = new Aluno({ sockid: socket.id, backup: 0, temporario: 1, instancia: creden[2], npesquisas: 1, turno: 0, scoremod: 0, scorepreco: [0,0], propaganda: 1, propagandauni: 1, faturamento: 0, ativo: 1, taokeys: 1872000, divida: [0,0,0], comissao: 0.05, frota: [10,0,0,0,0,0,0,0,0,0,0,0], cooperativa: creden[0], pas: 15, pas1: 0, pas2: 0, distribuidores: 25, promotores: 20, senha: creden[1], 
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
                            caixa: 1119081,
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
                            lucros_acumulados: 2130849
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
                            saldo_anterior: 0,
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
                        somapropuni: {tipo1: '147', inv1: 0, tipo2: 0, inv2: 0}
                    });
                        jogador.save()
                            .then(Aluno.find({ cooperativa: creden[0], temporario: 1, instancia: creden[2]}))
                            .then((user) => { 
                                if(user !== null){

                                    let jogadorR = new Aluno({ sockid: "11994729653", backup: 0, temporario: 0, instancia: creden[2], npesquisas: 1, turno: 0, scoremod: 0, scorepreco: [0,0], propaganda: 1, propagandauni: 1, faturamento: 0, ativo: 1, taokeys: 1872000, divida: [0,0,0], comissao: 0.05, frota: [10,0,0,0,0,0,0,0,0,0,0,0], cooperativa: creden[0], pas: 15, pas1: 0, pas2: 0, distribuidores: 25, promotores: 20, senha: creden[1], 
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
                                        caixa: 1119081,
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
                                        lucros_acumulados: 2130849
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
                                        saldo_anterior: 0,
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
            
                                        //fluxo_financeiro: 0, // entra + emprestimos tomados e entra - empréstimos pagos 
                                        //fluxo_investimento: 0, // entra negativo tds as compras de VEICULOS e entra positivo todo o valor da venda de veiculos
                                        //fluxo: 0
                                    
                                    },
                                    somapropuni: {tipo1: '147', inv1: 0, tipo2: 0, inv2: 0}
                                    });
                                    jogadorR.save()
                                        .then(() => {
                                            console.log('>>login aprovado')
                                            socket.emit('feedback', ['success','login aprovado para: ' + creden[0]]) 
                                            socket.emit('register-client-aprovado')
                                        })
                                        .catch((err) => {console.log(err)})

                                }
                                else{
                                    console.log('>>falha ao registrar')
                                    socket.emit('feedback', ['danger','ocorreu uma falha no processo de registro']) 
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
        if(qnt > 0){
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                    
                    if(novo !== velho){
                    
                    if(userx['taokeys'] >= qnt*30 && userx[velho][0] >= qnt){
                        if(userx[novo][1] == 1){

                        if(userx[novo][2] - userx[velho][2] > 0){
                            if(userx['taokeys'] >= qnt*30 + qnt*(userx[novo][2] - userx[velho][2])){
                        
                            userx.balanco_patrimonial = {
                                caixa: userx.balanco_patrimonial.caixa - qnt*30 - (userx[novo][2] - userx[velho][2])*qnt,
                                estoque: userx.balanco_patrimonial.estoque + (userx[novo][2] - userx[velho][2])*qnt,
                                contas_a_receber60: userx.balanco_patrimonial.contas_a_receber60,
                                contas_a_receber120: userx.balanco_patrimonial.contas_a_receber120,
                                maquinas: userx.balanco_patrimonial.maquinas,
                                depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_de_maquinas,
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
                        userx.taokeys = userx.taokeys - qnt*30 - (userx[novo][2] - userx[velho][2])*qnt 
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
                                socket.emit('update', [
                                    [...user["147"],"147",propuni("147")],
                                    [...user["148"],"148",propuni("148")],
                                    [...user["149"],"149",propuni("149")],
                                    [...user["157"],"157",propuni("157")],
                                    [...user["158"],"158",propuni("158")],
                                    [...user["159"],"159",propuni("159")],
                                    [...user["257"],"257",propuni("257")],
                                    [...user["258"],"258",propuni("258")],
                                    [...user["259"],"259",propuni("259")],
                                    [...user["267"],"267",propuni("267")],
                                    [...user["268"],"268",propuni("268")],
                                    [...user["269"],"269",propuni("269")],
                                    [...user["347"],"347",propuni("347")],
                                    [...user["348"],"348",propuni("348")],
                                    [...user["349"],"349",propuni("349")],
                                    [...user["357"],"357",propuni("357")],
                                    [...user["358"],"358",propuni("358")],
                                    [...user["359"],"359",propuni("359")],
                                    [...user["367"],"367",propuni("367")],
                                    [...user["368"],"368",propuni("368")],
                                    [...user["369"],"369",propuni("369")],
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
                            else{socket.emit('feedback', ['warning','a cooperativa não possue caixa o suficiente para realizar essa operação'])}
                        }
                        else{
                                
                                userx.balanco_patrimonial = {
                                    caixa: userx.balanco_patrimonial.caixa - qnt*30,
                                    estoque: userx.balanco_patrimonial.estoque + (userx[novo][2] - userx[velho][2])*qnt,
                                    contas_a_receber60: userx.balanco_patrimonial.contas_a_receber60,
                                    contas_a_receber120: userx.balanco_patrimonial.contas_a_receber120,
                                    maquinas: userx.balanco_patrimonial.maquinas,
                                    depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_de_maquinas,
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
                                    socket.emit('update', [
                                    [...user["147"],"147",propuni("147")],
                                    [...user["148"],"148",propuni("148")],
                                    [...user["149"],"149",propuni("149")],
                                    [...user["157"],"157",propuni("157")],
                                    [...user["158"],"158",propuni("158")],
                                    [...user["159"],"159",propuni("159")],
                                    [...user["257"],"257",propuni("257")],
                                    [...user["258"],"258",propuni("258")],
                                    [...user["259"],"259",propuni("259")],
                                    [...user["267"],"267",propuni("267")],
                                    [...user["268"],"268",propuni("268")],
                                    [...user["269"],"269",propuni("269")],
                                    [...user["347"],"347",propuni("347")],
                                    [...user["348"],"348",propuni("348")],
                                    [...user["349"],"349",propuni("349")],
                                    [...user["357"],"357",propuni("357")],
                                    [...user["358"],"358",propuni("358")],
                                    [...user["359"],"359",propuni("359")],
                                    [...user["367"],"367",propuni("367")],
                                    [...user["368"],"368",propuni("368")],
                                    [...user["369"],"369",propuni("369")],
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
    
                    }
                    else{socket.emit('feedback', ['warning','voce nao pode transferir insumos para um servico que nao esta ativo'])}
                    }
                
                
                }
                else{socket.emit('feedback', ['warning','voce nao pode trocar insumos de um serviço para ele mesmo'])}
                }
                else{
                    socket.emit('feedback', ['danger','voce precisa estar logado para puxar o state atual da simulação'])
                }
            
            })
        }
        else{
            socket.emit('feedback', ['danger', 'apenas numeros positivos sao aceitos nesse campo'])
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
                    if(userx['taokeys'] >= userx[velho][0]*30){
                        if(userx[novo][2] - userx[velho][2] > 0 && userx['taokeys'] >= userx[velho][0]*30 + userx[velho][0]*(userx[novo][2] - userx[velho][2])){

                        
                        userx.balanco_patrimonial = {
                            caixa: userx.balanco_patrimonial.caixa - userx[velho][0]*30 - (userx[novo][2] - userx[velho][2])*userx[velho][0],
                            estoque: userx.balanco_patrimonial.estoque + (userx[novo][2] - userx[velho][2])*userx[velho][0],
                            contas_a_receber60: userx.balanco_patrimonial.contas_a_receber60,
                            contas_a_receber120: userx.balanco_patrimonial.contas_a_receber120,
                            maquinas: userx.balanco_patrimonial.maquinas,
                            depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_de_maquinas,
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
                                    socket.emit('update', [
                                    [...user["147"],"147",propuni("147")],
                                    [...user["148"],"148",propuni("148")],
                                    [...user["149"],"149",propuni("149")],
                                    [...user["157"],"157",propuni("157")],
                                    [...user["158"],"158",propuni("158")],
                                    [...user["159"],"159",propuni("159")],
                                    [...user["257"],"257",propuni("257")],
                                    [...user["258"],"258",propuni("258")],
                                    [...user["259"],"259",propuni("259")],
                                    [...user["267"],"267",propuni("267")],
                                    [...user["268"],"268",propuni("268")],
                                    [...user["269"],"269",propuni("269")],
                                    [...user["347"],"347",propuni("347")],
                                    [...user["348"],"348",propuni("348")],
                                    [...user["349"],"349",propuni("349")],
                                    [...user["357"],"357",propuni("357")],
                                    [...user["358"],"358",propuni("358")],
                                    [...user["359"],"359",propuni("359")],
                                    [...user["367"],"367",propuni("367")],
                                    [...user["368"],"368",propuni("368")],
                                    [...user["369"],"369",propuni("369")],
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
                        
                        userx.balanco_patrimonial = {
                            caixa: userx.balanco_patrimonial.caixa - userx[velho][0]*30,
                            estoque: userx.balanco_patrimonial.estoque + (userx[novo][2] - userx[velho][2])*userx[velho][0],
                            contas_a_receber60: userx.balanco_patrimonial.contas_a_receber60,
                            contas_a_receber120: userx.balanco_patrimonial.contas_a_receber120,
                            maquinas: userx.balanco_patrimonial.maquinas,
                            depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_de_maquinas,
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
                                    socket.emit('update', [
                                    [...user["147"],"147",propuni("147")],
                                    [...user["148"],"148",propuni("148")],
                                    [...user["149"],"149",propuni("149")],
                                    [...user["157"],"157",propuni("157")],
                                    [...user["158"],"158",propuni("158")],
                                    [...user["159"],"159",propuni("159")],
                                    [...user["257"],"257",propuni("257")],
                                    [...user["258"],"258",propuni("258")],
                                    [...user["259"],"259",propuni("259")],
                                    [...user["267"],"267",propuni("267")],
                                    [...user["268"],"268",propuni("268")],
                                    [...user["269"],"269",propuni("269")],
                                    [...user["347"],"347",propuni("347")],
                                    [...user["348"],"348",propuni("348")],
                                    [...user["349"],"349",propuni("349")],
                                    [...user["357"],"357",propuni("357")],
                                    [...user["358"],"358",propuni("358")],
                                    [...user["359"],"359",propuni("359")],
                                    [...user["367"],"367",propuni("367")],
                                    [...user["368"],"368",propuni("368")],
                                    [...user["369"],"369",propuni("369")],
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
                    socket.emit('feedback', ['danger','voce precisa estar logado para puxar o state atual da simulação'])
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
                                        socket.emit('update', [
                                    [...user["147"],"147",propuni("147")],
                                    [...user["148"],"148",propuni("148")],
                                    [...user["149"],"149",propuni("149")],
                                    [...user["157"],"157",propuni("157")],
                                    [...user["158"],"158",propuni("158")],
                                    [...user["159"],"159",propuni("159")],
                                    [...user["257"],"257",propuni("257")],
                                    [...user["258"],"258",propuni("258")],
                                    [...user["259"],"259",propuni("259")],
                                    [...user["267"],"267",propuni("267")],
                                    [...user["268"],"268",propuni("268")],
                                    [...user["269"],"269",propuni("269")],
                                    [...user["347"],"347",propuni("347")],
                                    [...user["348"],"348",propuni("348")],
                                    [...user["349"],"349",propuni("349")],
                                    [...user["357"],"357",propuni("357")],
                                    [...user["358"],"358",propuni("358")],
                                    [...user["359"],"359",propuni("359")],
                                    [...user["367"],"367",propuni("367")],
                                    [...user["368"],"368",propuni("368")],
                                    [...user["369"],"369",propuni("369")],
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
                    socket.emit('feedback', ['danger','voce precisa estar logado para puxar o state atual da simulação'])
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    }) 
    socket.on('alterar-volume', (dados) => {
        let tipo = dados[0];
        let volume = Number(dados[1]);
        //let ttt;
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                //ttt = userx;
                if(userx !== null){
                    if(userx[tipo][1] == 1){
                        if(volume > 0){
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
                                        socket.emit('update', [
                                    [...user["147"],"147",propuni("147")],
                                    [...user["148"],"148",propuni("148")],
                                    [...user["149"],"149",propuni("149")],
                                    [...user["157"],"157",propuni("157")],
                                    [...user["158"],"158",propuni("158")],
                                    [...user["159"],"159",propuni("159")],
                                    [...user["257"],"257",propuni("257")],
                                    [...user["258"],"258",propuni("258")],
                                    [...user["259"],"259",propuni("259")],
                                    [...user["267"],"267",propuni("267")],
                                    [...user["268"],"268",propuni("268")],
                                    [...user["269"],"269",propuni("269")],
                                    [...user["347"],"347",propuni("347")],
                                    [...user["348"],"348",propuni("348")],
                                    [...user["349"],"349",propuni("349")],
                                    [...user["357"],"357",propuni("357")],
                                    [...user["358"],"358",propuni("358")],
                                    [...user["359"],"359",propuni("359")],
                                    [...user["367"],"367",propuni("367")],
                                    [...user["368"],"368",propuni("368")],
                                    [...user["369"],"369",propuni("369")],
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
                    else{socket.emit('feedback', ['warning','o volume de vendas so aceita valores positivos'])}
                    
                
                }
                else{socket.emit('feedback', ['warning','voce nao pode alterar o preco de venda enquanto o servico estiver em processo de encerramento'])}
            }
                else{
                    socket.emit('feedback', ['danger', 'voce precisa estar logado para puxar o state atual da simulação'])
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})     
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
                        let dec = new Deci({
                        balanco_patrimonial_antigo: {
                            caixa: userdef.balanco_patrimonial.caixa,
                            estoque: userdef.balanco_patrimonial.estoque,
                            contas_a_receber60: userdef.balanco_patrimonial.contas_a_receber60,
                            contas_a_receber120: userdef.balanco_patrimonial.contas_a_receber120,
                            maquinas: userdef.balanco_patrimonial.maquinas,
                            depreciacao_maquinas: userdef.balanco_patrimonial.depreciacao_de_maquinas,
                            veiculos: userdef.balanco_patrimonial.veiculos,
                            depreciacao_veiculos: userdef.balanco_patrimonial.depreciacao_veiculos,
                            tributos_a_pagar_anterior: userdef.balanco_patrimonial.tributos_a_pagar_anterior,
                            tributos_a_pagar_atual: userdef.balanco_patrimonial.tributos_a_pagar_atual,
                            emprestimos: userdef.balanco_patrimonial.emprestimos,
                            capial: userdef.balanco_patrimonial.capial,
                            lucros_acumulados: userdef.balanco_patrimonial.lucros_acumulados
                        },
                        balanco_patrimonial_novo: {
                            caixa: usert.balanco_patrimonial.caixa,
                            estoque: usert.balanco_patrimonial.estoque,
                            contas_a_receber60: usert.balanco_patrimonial.contas_a_receber60,
                            contas_a_receber120: usert.balanco_patrimonial.contas_a_receber120,
                            maquinas: usert.balanco_patrimonial.maquinas,
                            depreciacao_maquinas: usert.balanco_patrimonial.depreciacao_de_maquinas,
                            veiculos: usert.balanco_patrimonial.veiculos,
                            depreciacao_veiculos: usert.balanco_patrimonial.depreciacao_veiculos,
                            tributos_a_pagar_anterior: usert.balanco_patrimonial.tributos_a_pagar_anterior,
                            tributos_a_pagar_atual: usert.balanco_patrimonial.tributos_a_pagar_atual,
                            emprestimos: usert.balanco_patrimonial.emprestimos,
                            capial: usert.balanco_patrimonial.capial,
                            lucros_acumulados: usert.balanco_patrimonial.lucros_acumulados
                        },
                        dre_antiga: {
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
                            servicos: [userdef.dre.servicos[0], userdef.dre.servicos[1], userdef.dre.servicos[2], userdef.dre.servicos[3]],
                            preco_medio: userdef.dre.preco_medio,
                            atendimentos: userdef.dre.atendimentos,
                            insumos_em_estoque: userdef.dre.insumos_em_estoque,
                            distribuidores: userdef.dre.distribuidores

                        },
                        dre_nova: {
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

                        },
                        fluxo_de_caixa_antigo: {
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
                        },
                        fluxo_de_caixa_novo: {
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
                        },
                        modificador: usert.modificador,
                        turno: usert.turno
                    })
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
                        //console.log(index)
                        userdef.balanco_patrimonial = {
                            caixa: usert.balanco_patrimonial.caixa,
                            estoque: usert.balanco_patrimonial.estoque,
                            contas_a_receber60: usert.balanco_patrimonial.contas_a_receber60,
                            contas_a_receber120: usert.balanco_patrimonial.contas_a_receber120,
                            maquinas: usert.balanco_patrimonial.maquinas,
                            depreciacao_maquinas: usert.balanco_patrimonial.depreciacao_de_maquinas,
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
                        
                        for(let s = 0; s < index.length; s++){
                            //console.log(index[s])
                            let serv = index[s]
                            userdef.set(serv, [usert[serv][0], usert[serv][1], usert[serv][2], usert[serv][3], usert[serv][4], usert[serv][5], usert[serv][6], usert[serv][7]])
                        }
                        userdef.modificador = usert.modificador
                        userdef.save()
                            .then(() => {
                                dec.save()
                                    .then(() => {
                                        socket.emit('feedback', ['success','os dados foram salvos com sucesso'])
                                    })

                            })
                            .catch((err) => {socket.emit('feedback', ['danger','falha ao salvar os dados no servidor'])})
                        


                    })
                }
                else{socket.emit('feedback', ['danger','você só pode salvar uma jogada quando o moderador iniciar oficialmente o turno'])}
                })
            }
            else{
                socket.emit('feedback', ['danger','voce precisa estar logado para puxar o state atual da simulação'])
            }
            })
    }) //OKK falta teste
    socket.on('resetar', () => {
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((usert) => {
                if(usert !== null){
                Aluno.findOne({cooperativa: usert.cooperativa, instancia: usert.instancia, temporario: 0})
                    .then((userdef) => {
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
                        //console.log(index)
                        usert.balanco_patrimonial = {
                            caixa: userdef.balanco_patrimonial.caixa,
                            estoque: userdef.balanco_patrimonial.estoque,
                            contas_a_receber60: userdef.balanco_patrimonial.contas_a_receber60,
                            contas_a_receber120: userdef.balanco_patrimonial.contas_a_receber120,
                            maquinas: userdef.balanco_patrimonial.maquinas,
                            depreciacao_maquinas: userdef.balanco_patrimonial.depreciacao_de_maquinas,
                            veiculos: userdef.balanco_patrimonial.veiculos,
                            depreciacao_veiculos: userdef.balanco_patrimonial.depreciacao_veiculos,
                            tributos_a_pagar_anterior: userdef.balanco_patrimonial.tributos_a_pagar_anterior,
                            tributos_a_pagar_atual: userdef.balanco_patrimonial.tributos_a_pagar_atual,
                            emprestimos: userdef.balanco_patrimonial.emprestimos,
                            capial: userdef.balanco_patrimonial.capial,
                            lucros_acumulados: userdef.balanco_patrimonial.lucros_acumulados
                        }
                        /*
                        usert.dre = {
                            receita: userdef.dre.receita,
                            cmv: userdef.dre.cmv,
                            despesas_administrativas: userdef.dre.despesas_administrativas,
                            despesas_vendas: userdef.dre.despesas_vendas,
                            despesas_financeiras: userdef.dre.despesas_financeiras,
                            depreciacao_e_amortizacao: userdef.dre.depreciacao_e_amortizacao,
                            ir: userdef.dre.ir
                        }
                        */
                        for(let s = 0; s < index.length; s++){
                            //console.log(index[s])
                            let serv = index[s]
                            usert.set(serv, [userdef[serv][0], userdef[serv][1], userdef[serv][2], userdef[serv][3], userdef[serv][4], userdef[serv][5], userdef[serv][6], userdef[serv][7]])
                        }
                        
                        usert.save()
                            .then(() => {
                                function propuni(tipo) {
                                    if(usert.somapropuni.tipo1 == tipo){
                                        return usert.somapropuni.inv1
                                    }
                                    else if(usert.somapropuni.tipo2 == tipo){
                                        return usert.somapropuni.inv2
                                    }
                                    else{return 0}
                                }
                                socket.emit('update', [
                                    [...usert["147"],"147",propuni("147")],
                                    [...usert["148"],"148",propuni("148")],
                                    [...usert["149"],"149",propuni("149")],
                                    [...usert["157"],"157",propuni("157")],
                                    [...usert["158"],"158",propuni("158")],
                                    [...usert["159"],"159",propuni("159")],
                                    [...usert["257"],"257",propuni("257")],
                                    [...usert["258"],"258",propuni("258")],
                                    [...usert["259"],"259",propuni("259")],
                                    [...usert["267"],"267",propuni("267")],
                                    [...usert["268"],"268",propuni("268")],
                                    [...usert["269"],"269",propuni("269")],
                                    [...usert["347"],"347",propuni("347")],
                                    [...usert["348"],"348",propuni("348")],
                                    [...usert["349"],"349",propuni("349")],
                                    [...usert["357"],"357",propuni("357")],
                                    [...usert["358"],"358",propuni("358")],
                                    [...usert["359"],"359",propuni("359")],
                                    [...usert["367"],"367",propuni("367")],
                                    [...usert["368"],"368",propuni("368")],
                                    [...usert["369"],"369",propuni("369")],
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
                            .catch((err) => {socket.emit('feedback', ['danger','falha ao salvar os dados no servidor'])})
                        


                    })
                
                
            }
            else{
                socket.emit('feedback', ['danger','voce precisa estar logado para puxar o state atual da simulação'])
            }
            })
    })
    socket.on('aumentar-frota', (dados) => {
        let qnt = Number(dados)
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                        if(qnt > 0 && userx.taokeys > qnt*57600){
                            userx.balanco_patrimonial = {
                                caixa: userx.balanco_patrimonial.caixa - qnt*57600,
                                estoque: userx.balanco_patrimonial.estoque,
                                contas_a_receber60: userx.balanco_patrimonial.contas_a_receber60,
                                contas_a_receber120: userx.balanco_patrimonial.contas_a_receber120,
                                maquinas: userx.balanco_patrimonial.maquinas,
                                depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_de_maquinas,
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
                                        socket.emit('update', [
                                    [...user["147"],"147",propuni("147")],
                                    [...user["148"],"148",propuni("148")],
                                    [...user["149"],"149",propuni("149")],
                                    [...user["157"],"157",propuni("157")],
                                    [...user["158"],"158",propuni("158")],
                                    [...user["159"],"159",propuni("159")],
                                    [...user["257"],"257",propuni("257")],
                                    [...user["258"],"258",propuni("258")],
                                    [...user["259"],"259",propuni("259")],
                                    [...user["267"],"267",propuni("267")],
                                    [...user["268"],"268",propuni("268")],
                                    [...user["269"],"269",propuni("269")],
                                    [...user["347"],"347",propuni("347")],
                                    [...user["348"],"348",propuni("348")],
                                    [...user["349"],"349",propuni("349")],
                                    [...user["357"],"357",propuni("357")],
                                    [...user["358"],"358",propuni("358")],
                                    [...user["359"],"359",propuni("359")],
                                    [...user["367"],"367",propuni("367")],
                                    [...user["368"],"368",propuni("368")],
                                    [...user["369"],"369",propuni("369")],
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
                    else if(qnt > 0 && userx.taokeys < qnt*57600){
                        socket.emit('feedback', ['warning','falta caixa'])
                    }
                    else{socket.emit('feedback', ['warning','apenas valores positivos'])}
                    
                
             
            }
                else{
                    socket.emit('feedback', ['danger','voce precisa estar logado para puxar o state atual da simulação'])
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
                                            
                                            userx.balanco_patrimonial = {
                                                caixa: userx.balanco_patrimonial.caixa + userx.frota[k]*(57600/12)*(12-k),
                                                estoque: userx.balanco_patrimonial.estoque,
                                                contas_a_receber60: userx.balanco_patrimonial.contas_a_receber60,
                                                contas_a_receber120: userx.balanco_patrimonial.contas_a_receber120,
                                                maquinas: userx.balanco_patrimonial.maquinas,
                                                depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_de_maquinas,
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
                                        
                                            userx.balanco_patrimonial = {
                                            caixa: userx.balanco_patrimonial.caixa + userx.frota[k]*(57600/12)*(12-k),
                                            estoque: userx.balanco_patrimonial.estoque,
                                            contas_a_receber60: userx.balanco_patrimonial.contas_a_receber60,
                                            contas_a_receber120: userx.balanco_patrimonial.contas_a_receber120,
                                            maquinas: userx.balanco_patrimonial.maquinas,
                                            depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_de_maquinas,
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
                                        socket.emit('update', [
                                    [...user["147"],"147",propuni("147")],
                                    [...user["148"],"148",propuni("148")],
                                    [...user["149"],"149",propuni("149")],
                                    [...user["157"],"157",propuni("157")],
                                    [...user["158"],"158",propuni("158")],
                                    [...user["159"],"159",propuni("159")],
                                    [...user["257"],"257",propuni("257")],
                                    [...user["258"],"258",propuni("258")],
                                    [...user["259"],"259",propuni("259")],
                                    [...user["267"],"267",propuni("267")],
                                    [...user["268"],"268",propuni("268")],
                                    [...user["269"],"269",propuni("269")],
                                    [...user["347"],"347",propuni("347")],
                                    [...user["348"],"348",propuni("348")],
                                    [...user["349"],"349",propuni("349")],
                                    [...user["357"],"357",propuni("357")],
                                    [...user["358"],"358",propuni("358")],
                                    [...user["359"],"359",propuni("359")],
                                    [...user["367"],"367",propuni("367")],
                                    [...user["368"],"368",propuni("368")],
                                    [...user["369"],"369",propuni("369")],
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
                            else{socket.emit('feedback', ['warning','sua cooperativa nao possue esse numero de veiculos'])}
                          
                    }
                    else{socket.emit('feedback', ['warning','apenas valores positivos'])}
                    
                
             
            }
                else{
                    socket.emit('feedback', ['danger','voce precisa estar logado para puxar o state atual da simulação'])
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
                    socket.emit('update', [
                                    [...userx["147"],"147",propuni("147")],
                                    [...userx["148"],"148",propuni("148")],
                                    [...userx["149"],"149",propuni("149")],
                                    [...userx["157"],"157",propuni("157")],
                                    [...userx["158"],"158",propuni("158")],
                                    [...userx["159"],"159",propuni("159")],
                                    [...userx["257"],"257",propuni("257")],
                                    [...userx["258"],"258",propuni("258")],
                                    [...userx["259"],"259",propuni("259")],
                                    [...userx["267"],"267",propuni("267")],
                                    [...userx["268"],"268",propuni("268")],
                                    [...userx["269"],"269",propuni("269")],
                                    [...userx["347"],"347",propuni("347")],
                                    [...userx["348"],"348",propuni("348")],
                                    [...userx["349"],"349",propuni("349")],
                                    [...userx["357"],"357",propuni("357")],
                                    [...userx["358"],"358",propuni("358")],
                                    [...userx["359"],"359",propuni("359")],
                                    [...userx["367"],"367",propuni("367")],
                                    [...userx["368"],"368",propuni("368")],
                                    [...userx["369"],"369",propuni("369")],
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
                    socket.emit('feedback', ['danger','voce precisa estar logado para puxar o state atual da simulação'])
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    }) 
    socket.on('alterar-preco', (dados) => {
        let tipo = dados[0];
        let preco = Number(dados[1]);
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                    if(userx[tipo][1] == 1){
                        if(preco > 0 && preco <= 9999){
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
                                        socket.emit('update', [
                                    [...user["147"],"147",propuni("147")],
                                    [...user["148"],"148",propuni("148")],
                                    [...user["149"],"149",propuni("149")],
                                    [...user["157"],"157",propuni("157")],
                                    [...user["158"],"158",propuni("158")],
                                    [...user["159"],"159",propuni("159")],
                                    [...user["257"],"257",propuni("257")],
                                    [...user["258"],"258",propuni("258")],
                                    [...user["259"],"259",propuni("259")],
                                    [...user["267"],"267",propuni("267")],
                                    [...user["268"],"268",propuni("268")],
                                    [...user["269"],"269",propuni("269")],
                                    [...user["347"],"347",propuni("347")],
                                    [...user["348"],"348",propuni("348")],
                                    [...user["349"],"349",propuni("349")],
                                    [...user["357"],"357",propuni("357")],
                                    [...user["358"],"358",propuni("358")],
                                    [...user["359"],"359",propuni("359")],
                                    [...user["367"],"367",propuni("367")],
                                    [...user["368"],"368",propuni("368")],
                                    [...user["369"],"369",propuni("369")],
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
                    else{socket.emit('feedback', ['warning','o valor do preco unitario deve estar entre 0 e 9999'])}
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
                    socket.emit('feedback', ['danger','voce precisa estar logado para puxar o state atual da simulação'])
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    }) 
    socket.on('aumentar-promotores', (dados) => {
        let qnt = Number(dados)
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                        if(qnt > 0){
                            let novaf = userx['promotores'] + qnt
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
                                        socket.emit('update', [
                                    [...user["147"],"147",propuni("147")],
                                    [...user["148"],"148",propuni("148")],
                                    [...user["149"],"149",propuni("149")],
                                    [...user["157"],"157",propuni("157")],
                                    [...user["158"],"158",propuni("158")],
                                    [...user["159"],"159",propuni("159")],
                                    [...user["257"],"257",propuni("257")],
                                    [...user["258"],"258",propuni("258")],
                                    [...user["259"],"259",propuni("259")],
                                    [...user["267"],"267",propuni("267")],
                                    [...user["268"],"268",propuni("268")],
                                    [...user["269"],"269",propuni("269")],
                                    [...user["347"],"347",propuni("347")],
                                    [...user["348"],"348",propuni("348")],
                                    [...user["349"],"349",propuni("349")],
                                    [...user["357"],"357",propuni("357")],
                                    [...user["358"],"358",propuni("358")],
                                    [...user["359"],"359",propuni("359")],
                                    [...user["367"],"367",propuni("367")],
                                    [...user["368"],"368",propuni("368")],
                                    [...user["369"],"369",propuni("369")],
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
                    else if(qnt > 0 && userx.taokeys < qnt*57600){
                        socket.emit('feedback', ['warning','falta caixa'])
                    }
                    else{socket.emit('feedback', ['warning','apenas valores positivos'])}
                    
                
             
            }
                else{
                    socket.emit('feedback', ['danger','voce precisa estar logado para puxar o state atual da simulação'])
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
                                        socket.emit('update', [
                                    [...user["147"],"147",propuni("147")],
                                    [...user["148"],"148",propuni("148")],
                                    [...user["149"],"149",propuni("149")],
                                    [...user["157"],"157",propuni("157")],
                                    [...user["158"],"158",propuni("158")],
                                    [...user["159"],"159",propuni("159")],
                                    [...user["257"],"257",propuni("257")],
                                    [...user["258"],"258",propuni("258")],
                                    [...user["259"],"259",propuni("259")],
                                    [...user["267"],"267",propuni("267")],
                                    [...user["268"],"268",propuni("268")],
                                    [...user["269"],"269",propuni("269")],
                                    [...user["347"],"347",propuni("347")],
                                    [...user["348"],"348",propuni("348")],
                                    [...user["349"],"349",propuni("349")],
                                    [...user["357"],"357",propuni("357")],
                                    [...user["358"],"358",propuni("358")],
                                    [...user["359"],"359",propuni("359")],
                                    [...user["367"],"367",propuni("367")],
                                    [...user["368"],"368",propuni("368")],
                                    [...user["369"],"369",propuni("369")],
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
                    else if(qnt > 0 && userx.taokeys < qnt*57600){
                        socket.emit('feedback', ['warning', 'falta caixa'])
                    }
                    else{socket.emit('feedback', ['warning', 'apenas valores positivos'])}
                    
                
             
            }
                else{
                    socket.emit('feedback', ['danger','voce precisa estar logado para puxar o state atual da simulação'])
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
                                depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_de_maquinas,
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
                                        socket.emit('update', [
                                    [...user["147"],"147",propuni("147")],
                                    [...user["148"],"148",propuni("148")],
                                    [...user["149"],"149",propuni("149")],
                                    [...user["157"],"157",propuni("157")],
                                    [...user["158"],"158",propuni("158")],
                                    [...user["159"],"159",propuni("159")],
                                    [...user["257"],"257",propuni("257")],
                                    [...user["258"],"258",propuni("258")],
                                    [...user["259"],"259",propuni("259")],
                                    [...user["267"],"267",propuni("267")],
                                    [...user["268"],"268",propuni("268")],
                                    [...user["269"],"269",propuni("269")],
                                    [...user["347"],"347",propuni("347")],
                                    [...user["348"],"348",propuni("348")],
                                    [...user["349"],"349",propuni("349")],
                                    [...user["357"],"357",propuni("357")],
                                    [...user["358"],"358",propuni("358")],
                                    [...user["359"],"359",propuni("359")],
                                    [...user["367"],"367",propuni("367")],
                                    [...user["368"],"368",propuni("368")],
                                    [...user["369"],"369",propuni("369")],
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
                            depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_de_maquinas,
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
                                        socket.emit('update', [
                                    [...user["147"],"147",propuni("147")],
                                    [...user["148"],"148",propuni("148")],
                                    [...user["149"],"149",propuni("149")],
                                    [...user["157"],"157",propuni("157")],
                                    [...user["158"],"158",propuni("158")],
                                    [...user["159"],"159",propuni("159")],
                                    [...user["257"],"257",propuni("257")],
                                    [...user["258"],"258",propuni("258")],
                                    [...user["259"],"259",propuni("259")],
                                    [...user["267"],"267",propuni("267")],
                                    [...user["268"],"268",propuni("268")],
                                    [...user["269"],"269",propuni("269")],
                                    [...user["347"],"347",propuni("347")],
                                    [...user["348"],"348",propuni("348")],
                                    [...user["349"],"349",propuni("349")],
                                    [...user["357"],"357",propuni("357")],
                                    [...user["358"],"358",propuni("358")],
                                    [...user["359"],"359",propuni("359")],
                                    [...user["367"],"367",propuni("367")],
                                    [...user["368"],"368",propuni("368")],
                                    [...user["369"],"369",propuni("369")],
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
                                        socket.emit('update', [
                                    [...user["147"],"147",propuni("147")],
                                    [...user["148"],"148",propuni("148")],
                                    [...user["149"],"149",propuni("149")],
                                    [...user["157"],"157",propuni("157")],
                                    [...user["158"],"158",propuni("158")],
                                    [...user["159"],"159",propuni("159")],
                                    [...user["257"],"257",propuni("257")],
                                    [...user["258"],"258",propuni("258")],
                                    [...user["259"],"259",propuni("259")],
                                    [...user["267"],"267",propuni("267")],
                                    [...user["268"],"268",propuni("268")],
                                    [...user["269"],"269",propuni("269")],
                                    [...user["347"],"347",propuni("347")],
                                    [...user["348"],"348",propuni("348")],
                                    [...user["349"],"349",propuni("349")],
                                    [...user["357"],"357",propuni("357")],
                                    [...user["358"],"358",propuni("358")],
                                    [...user["359"],"359",propuni("359")],
                                    [...user["367"],"367",propuni("367")],
                                    [...user["368"],"368",propuni("368")],
                                    [...user["369"],"369",propuni("369")],
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
                    else if(qnt > 0 && userx.taokeys < qnt*57600){
                        socket.emit('feedback', ['warning','falta caixa'])
                    }
                    else{socket.emit('feedback', ['warning','apenas valores positivos'])}
                    
                
             
            }
                else{
                    socket.emit('feedback', ['danger','voce precisa estar logado para puxar o state atual da simulação'])
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
                                        socket.emit('update', [
                                    [...user["147"],"147",propuni("147")],
                                    [...user["148"],"148",propuni("148")],
                                    [...user["149"],"149",propuni("149")],
                                    [...user["157"],"157",propuni("157")],
                                    [...user["158"],"158",propuni("158")],
                                    [...user["159"],"159",propuni("159")],
                                    [...user["257"],"257",propuni("257")],
                                    [...user["258"],"258",propuni("258")],
                                    [...user["259"],"259",propuni("259")],
                                    [...user["267"],"267",propuni("267")],
                                    [...user["268"],"268",propuni("268")],
                                    [...user["269"],"269",propuni("269")],
                                    [...user["347"],"347",propuni("347")],
                                    [...user["348"],"348",propuni("348")],
                                    [...user["349"],"349",propuni("349")],
                                    [...user["357"],"357",propuni("357")],
                                    [...user["358"],"358",propuni("358")],
                                    [...user["359"],"359",propuni("359")],
                                    [...user["367"],"367",propuni("367")],
                                    [...user["368"],"368",propuni("368")],
                                    [...user["369"],"369",propuni("369")],
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
                    else{socket.emit('feedback', ['warning', 'apenas valores positivos'])}
                    
                
             
            }
                else{
                    socket.emit('feedback', ['danger','voce precisa estar logado para puxar o state atual da simulação'])
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    })
    socket.on('diminuir-pas', (dados) => {
        let qnt = Number(dados)
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                        if(qnt > 0 && userx['pas'] >= qnt){
                            let novaf = userx['pas'] - qnt
                            userx.set('pas', novaf) 
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
                                        socket.emit('update', [
                                    [...user["147"],"147",propuni("147")],
                                    [...user["148"],"148",propuni("148")],
                                    [...user["149"],"149",propuni("149")],
                                    [...user["157"],"157",propuni("157")],
                                    [...user["158"],"158",propuni("158")],
                                    [...user["159"],"159",propuni("159")],
                                    [...user["257"],"257",propuni("257")],
                                    [...user["258"],"258",propuni("258")],
                                    [...user["259"],"259",propuni("259")],
                                    [...user["267"],"267",propuni("267")],
                                    [...user["268"],"268",propuni("268")],
                                    [...user["269"],"269",propuni("269")],
                                    [...user["347"],"347",propuni("347")],
                                    [...user["348"],"348",propuni("348")],
                                    [...user["349"],"349",propuni("349")],
                                    [...user["357"],"357",propuni("357")],
                                    [...user["358"],"358",propuni("358")],
                                    [...user["359"],"359",propuni("359")],
                                    [...user["367"],"367",propuni("367")],
                                    [...user["368"],"368",propuni("368")],
                                    [...user["369"],"369",propuni("369")],
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
                            let novaf = userx['pas2'] + qnt
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
                                        socket.emit('update', [
                                    [...user["147"],"147",propuni("147")],
                                    [...user["148"],"148",propuni("148")],
                                    [...user["149"],"149",propuni("149")],
                                    [...user["157"],"157",propuni("157")],
                                    [...user["158"],"158",propuni("158")],
                                    [...user["159"],"159",propuni("159")],
                                    [...user["257"],"257",propuni("257")],
                                    [...user["258"],"258",propuni("258")],
                                    [...user["259"],"259",propuni("259")],
                                    [...user["267"],"267",propuni("267")],
                                    [...user["268"],"268",propuni("268")],
                                    [...user["269"],"269",propuni("269")],
                                    [...user["347"],"347",propuni("347")],
                                    [...user["348"],"348",propuni("348")],
                                    [...user["349"],"349",propuni("349")],
                                    [...user["357"],"357",propuni("357")],
                                    [...user["358"],"358",propuni("358")],
                                    [...user["359"],"359",propuni("359")],
                                    [...user["367"],"367",propuni("367")],
                                    [...user["368"],"368",propuni("368")],
                                    [...user["369"],"369",propuni("369")],
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
                    else{socket.emit('feedback', ['warning','apenas valores positivos'])}
                    
                
             
            }
                else{
                    socket.emit('feedback', ['danger','voce precisa estar logado para puxar o state atual da simulação'])
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    }) 
    socket.on('propaganda-unitaria', (dados) => {
        let tipo = dados[0]
        let qnt = Number(dados[1])
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                        if(qnt > 0 && userx.taokeys >= qnt){
                            userx.balanco_patrimonial = {
                                caixa: userx.balanco_patrimonial.caixa - qnt,
                                estoque: userx.balanco_patrimonial.estoque,
                                contas_a_receber60: userx.balanco_patrimonial.contas_a_receber60,
                                contas_a_receber120: userx.balanco_patrimonial.contas_a_receber120,
                                maquinas: userx.balanco_patrimonial.maquinas,
                                depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_de_maquinas,
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
                                        tipo1: userx.somapropuni.tipo1, inv1: Number(userx.somapropuni.inv1) + qnt,
                                        tipo2: userx.somapropuni.tipo2, inv2: userx.somapropuni.inv2
                                    })
                                }
                                if(tipo == userx.somapropuni.tipo2){
                                    userx.set('somapropuni', {
                                        tipo1: userx.somapropuni.tipo1, inv1: userx.somapropuni.inv1,
                                        tipo2: userx.somapropuni.tipo2, inv2: Number(userx.somapropuni.inv2) + qnt
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
                                        socket.emit('update', [
                                    [...user["147"],"147",propuni("147")],
                                    [...user["148"],"148",propuni("148")],
                                    [...user["149"],"149",propuni("149")],
                                    [...user["157"],"157",propuni("157")],
                                    [...user["158"],"158",propuni("158")],
                                    [...user["159"],"159",propuni("159")],
                                    [...user["257"],"257",propuni("257")],
                                    [...user["258"],"258",propuni("258")],
                                    [...user["259"],"259",propuni("259")],
                                    [...user["267"],"267",propuni("267")],
                                    [...user["268"],"268",propuni("268")],
                                    [...user["269"],"269",propuni("269")],
                                    [...user["347"],"347",propuni("347")],
                                    [...user["348"],"348",propuni("348")],
                                    [...user["349"],"349",propuni("349")],
                                    [...user["357"],"357",propuni("357")],
                                    [...user["358"],"358",propuni("358")],
                                    [...user["359"],"359",propuni("359")],
                                    [...user["367"],"367",propuni("367")],
                                    [...user["368"],"368",propuni("368")],
                                    [...user["369"],"369",propuni("369")],
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
                        if(userx.taokeys >= qnt){socket.emit('feedback', ['warning','apenas valores positivos'])}
                        else{socket.emit('feedback', ['warning','sua cooperativa nao possue caixa o suficiente'])}
                }
                    
                
             
            }
                else{
                    socket.emit('feedback', ['danger','voce precisa estar logado para puxar o state atual da simulação'])
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    })
    socket.on('aumentar-propaganda', (dados) => {
        let qnt = Number(dados)
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                        if(qnt > 0 && userx.taokeys >= qnt){
                            userx.balanco_patrimonial = {
                                caixa: userx.balanco_patrimonial.caixa - qnt,
                                estoque: userx.balanco_patrimonial.estoque,
                                contas_a_receber60: userx.balanco_patrimonial.contas_a_receber60,
                                contas_a_receber120: userx.balanco_patrimonial.contas_a_receber120,
                                maquinas: userx.balanco_patrimonial.maquinas,
                                depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_de_maquinas,
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
                                propaganda_institucional: userx.dre.propaganda_institucional + qnt,
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
                            
                            let novaf = userx['propaganda'] + qnt
                            userx.taokeys = userx.taokeys - qnt
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
                                        socket.emit('update', [
                                    [...user["147"],"147",propuni("147")],
                                    [...user["148"],"148",propuni("148")],
                                    [...user["149"],"149",propuni("149")],
                                    [...user["157"],"157",propuni("157")],
                                    [...user["158"],"158",propuni("158")],
                                    [...user["159"],"159",propuni("159")],
                                    [...user["257"],"257",propuni("257")],
                                    [...user["258"],"258",propuni("258")],
                                    [...user["259"],"259",propuni("259")],
                                    [...user["267"],"267",propuni("267")],
                                    [...user["268"],"268",propuni("268")],
                                    [...user["269"],"269",propuni("269")],
                                    [...user["347"],"347",propuni("347")],
                                    [...user["348"],"348",propuni("348")],
                                    [...user["349"],"349",propuni("349")],
                                    [...user["357"],"357",propuni("357")],
                                    [...user["358"],"358",propuni("358")],
                                    [...user["359"],"359",propuni("359")],
                                    [...user["367"],"367",propuni("367")],
                                    [...user["368"],"368",propuni("368")],
                                    [...user["369"],"369",propuni("369")],
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
                    else{socket.emit('feedback', ['warning','apenas valores positivos'])}
                    
                
             
            }
                else{
                    socket.emit('feedback', ['danger', 'voce precisa estar logado para puxar o state atual da simulação'])
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
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
        let qnt = Number(dados)
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                        if(qnt > 0 && qnt <= 1){
                            userx.set('comissao', qnt) 
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
                                        socket.emit('update', [
                                    [...user["147"],"147",propuni("147")],
                                    [...user["148"],"148",propuni("148")],
                                    [...user["149"],"149",propuni("149")],
                                    [...user["157"],"157",propuni("157")],
                                    [...user["158"],"158",propuni("158")],
                                    [...user["159"],"159",propuni("159")],
                                    [...user["257"],"257",propuni("257")],
                                    [...user["258"],"258",propuni("258")],
                                    [...user["259"],"259",propuni("259")],
                                    [...user["267"],"267",propuni("267")],
                                    [...user["268"],"268",propuni("268")],
                                    [...user["269"],"269",propuni("269")],
                                    [...user["347"],"347",propuni("347")],
                                    [...user["348"],"348",propuni("348")],
                                    [...user["349"],"349",propuni("349")],
                                    [...user["357"],"357",propuni("357")],
                                    [...user["358"],"358",propuni("358")],
                                    [...user["359"],"359",propuni("359")],
                                    [...user["367"],"367",propuni("367")],
                                    [...user["368"],"368",propuni("368")],
                                    [...user["369"],"369",propuni("369")],
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
                    else{socket.emit('feedback', ['warning','apenas valores entra 0 e 1'])}
                    
                
             
            }
                else{
                    socket.emit('feedback', ['danger','voce precisa estar logado para puxar o state atual da simulação'])
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
                                        socket.emit('update', [
                                    [...user["147"],"147",propuni("147")],
                                    [...user["148"],"148",propuni("148")],
                                    [...user["149"],"149",propuni("149")],
                                    [...user["157"],"157",propuni("157")],
                                    [...user["158"],"158",propuni("158")],
                                    [...user["159"],"159",propuni("159")],
                                    [...user["257"],"257",propuni("257")],
                                    [...user["258"],"258",propuni("258")],
                                    [...user["259"],"259",propuni("259")],
                                    [...user["267"],"267",propuni("267")],
                                    [...user["268"],"268",propuni("268")],
                                    [...user["269"],"269",propuni("269")],
                                    [...user["347"],"347",propuni("347")],
                                    [...user["348"],"348",propuni("348")],
                                    [...user["349"],"349",propuni("349")],
                                    [...user["357"],"357",propuni("357")],
                                    [...user["358"],"358",propuni("358")],
                                    [...user["359"],"359",propuni("359")],
                                    [...user["367"],"367",propuni("367")],
                                    [...user["368"],"368",propuni("368")],
                                    [...user["369"],"369",propuni("369")],
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
                                    else{socket.emit('feedback', ['danger', 'falha ao atunteticar operacao'])}                  
                                })
                        .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})

                    }
                    else{
                        if(userx[tipo][1] == 3){
                        socket.emit('feedback', ['warning', 'esse servico esta indisponivel para ativação nesse turno'])
                        }
                        else{
                            socket.emit('feedback', ['warning', 'voce so pode ter 2 servicoes simultaneos'])
                        }
                    }

                }
                else{
                    socket.emit('feedback', ['danger','voce precisa estar logado para puxar o state atual da simulação'])
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    }) 
    socket.on('comprar-servico', (dados) => {
        let tipo = dados[0];
        let qnti = Number(dados[1]);
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => { 
                    if(userx !== null){
                        if(qnti > 0){ 
                       
                        if(userx['taokeys'] >= qnti*userx[tipo][2] && userx[tipo][1] !== 2){
                            if(userx[tipo][1] !== 3 && userx[tipo][1] !== 0){
                            userx.balanco_patrimonial = {
                                caixa: userx.balanco_patrimonial.caixa - qnti*userx[tipo][2],
                                estoque: userx.balanco_patrimonial.estoque + qnti*userx[tipo][2],
                                contas_a_receber60: userx.balanco_patrimonial.contas_a_receber60,
                                contas_a_receber120: userx.balanco_patrimonial.contas_a_receber120,
                                maquinas: userx.balanco_patrimonial.maquinas,
                                depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_de_maquinas,
                                veiculos: userx.balanco_patrimonial.veiculos,
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
                                custo_de_servico_prestado: userx.fluxo_de_caixa.custo_de_servico_prestado - qnti*userx[tipo][2],
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
                                        socket.emit('feedback', ['success', qnti + ' insumos comprados com sucesso para o serviço: ' + tipo])
                                        function propuni(tipo) {
                                            if(user.somapropuni.tipo1 == tipo){
                                                return user.somapropuni.inv1
                                            }
                                            else if(user.somapropuni.tipo2 == tipo){
                                                return user.somapropuni.inv2
                                            }
                                            else{return 0}
                                        }
                                        socket.emit('update', [
                                    [...user["147"],"147",propuni("147")],
                                    [...user["148"],"148",propuni("148")],
                                    [...user["149"],"149",propuni("149")],
                                    [...user["157"],"157",propuni("157")],
                                    [...user["158"],"158",propuni("158")],
                                    [...user["159"],"159",propuni("159")],
                                    [...user["257"],"257",propuni("257")],
                                    [...user["258"],"258",propuni("258")],
                                    [...user["259"],"259",propuni("259")],
                                    [...user["267"],"267",propuni("267")],
                                    [...user["268"],"268",propuni("268")],
                                    [...user["269"],"269",propuni("269")],
                                    [...user["347"],"347",propuni("347")],
                                    [...user["348"],"348",propuni("348")],
                                    [...user["349"],"349",propuni("349")],
                                    [...user["357"],"357",propuni("357")],
                                    [...user["358"],"358",propuni("358")],
                                    [...user["359"],"359",propuni("359")],
                                    [...user["367"],"367",propuni("367")],
                                    [...user["368"],"368",propuni("368")],
                                    [...user["369"],"369",propuni("369")],
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
                                        socket.emit('feedback', ['warning', 'esse servico nao esta ativado'])
                                    }
                            }
                            else if(userx['taokeys'] >= qnti*userx[tipo][2] && userx[tipo][1] == 2){
                                socket.emit('feedback', ['warning','esse servico esta em espera'])
                            }
                        else{
                            socket.emit('feedback', ['warning','falta caixa']);
                            //console.log('hlu')
                    }
                     }
                     else{
                        socket.emit('feedback', ['danger','Apenas numeros sao aceitos nessa campo'])
                     }
                    //console.log(user.taokeys)
                    }
                    else{
                        socket.emit('feedback', ['danger','voce precisa estar logado para puxar o state atual da simulação'])
                    }
            }) 
            .catch((err) => { console.log('falha na comunicacao com o banco de dados para o ' +socket.id+ " - " + err)
    })
    })
    socket.on('pesquisar-pas', () => {
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => { 
                    if(userx !== null){

                        if(userx['taokeys'] >= 2160){
                        userx.balanco_patrimonial = {
                            caixa: userx.balanco_patrimonial.caixa - 2160,
                            estoque: userx.balanco_patrimonial.estoque,
                            contas_a_receber60: userx.balanco_patrimonial.contas_a_receber60,
                            contas_a_receber120: userx.balanco_patrimonial.contas_a_receber120,
                            maquinas: userx.balanco_patrimonial.maquinas,
                            depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_de_maquinas,
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
                           //console.log(user.taokeys)
                           userx.save()
                            .then(() => {
                                Data.findOne({ativo: 1, instancia: userx.instancia})
                                    .then((dados) => {
                                        if(dados !== null){
                                        socket.emit('resposta-pesquisa', dados['total_pas'])
                                        function propuni(tipo) {
                                            if(userx.somapropuni.tipo1 == tipo){
                                                return userx.somapropuni.inv1
                                            }
                                            else if(userx.somapropuni.tipo2 == tipo){
                                                return userx.somapropuni.inv2
                                            }
                                            else{return 0}
                                        }
                                        socket.emit('update', [
                                    [...userx["147"],"147",propuni("147")],
                                    [...userx["148"],"148",propuni("148")],
                                    [...userx["149"],"149",propuni("149")],
                                    [...userx["157"],"157",propuni("157")],
                                    [...userx["158"],"158",propuni("158")],
                                    [...userx["159"],"159",propuni("159")],
                                    [...userx["257"],"257",propuni("257")],
                                    [...userx["258"],"258",propuni("258")],
                                    [...userx["259"],"259",propuni("259")],
                                    [...userx["267"],"267",propuni("267")],
                                    [...userx["268"],"268",propuni("268")],
                                    [...userx["269"],"269",propuni("269")],
                                    [...userx["347"],"347",propuni("347")],
                                    [...userx["348"],"348",propuni("348")],
                                    [...userx["349"],"349",propuni("349")],
                                    [...userx["357"],"357",propuni("357")],
                                    [...userx["358"],"358",propuni("358")],
                                    [...userx["359"],"359",propuni("359")],
                                    [...userx["367"],"367",propuni("367")],
                                    [...userx["368"],"368",propuni("368")],
                                    [...userx["369"],"369",propuni("369")],
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
                                        socket.emit('feedback', ['danger','voce nao pode realizar pesquisas ate que o administrador inicie o turno'])
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
                        socket.emit('feedback', ['danger','voce precisa estar logado para puxar o state atual da simulação'])
                    }
            }) 
            .catch(() => { console.log('falha na comunicacao com o banco de dados para o ' +socket.id)
    })
    }) 
    socket.on('pesquisar-distribuidores', () => {
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => { 
                    if(userx !== null){
                        
                        
                        if(userx['taokeys'] >= 2160){
                            userx.balanco_patrimonial = {
                                caixa: userx.balanco_patrimonial.caixa - 2160,
                                estoque: userx.balanco_patrimonial.estoque,
                                contas_a_receber60: userx.balanco_patrimonial.contas_a_receber60,
                                contas_a_receber120: userx.balanco_patrimonial.contas_a_receber120,
                                maquinas: userx.balanco_patrimonial.maquinas,
                                depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_de_maquinas,
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
                           //console.log(user.taokeys)
                           userx.save()
                            .then(() => {
                                Data.findOne({ativo: 1, instancia: userx.instancia})
                                    .then((dados) => {
                                        if(dados !== null){
                                        socket.emit('resposta-pesquisa', dados['total_distribuidores'])
                                        function propuni(tipo) {
                                            if(userx.somapropuni.tipo1 == tipo){
                                                return userx.somapropuni.inv1
                                            }
                                            else if(userx.somapropuni.tipo2 == tipo){
                                                return userx.somapropuni.inv2
                                            }
                                            else{return 0}
                                        }
                                        socket.emit('update', [
                                    [...userx["147"],"147",propuni("147")],
                                    [...userx["148"],"148",propuni("148")],
                                    [...userx["149"],"149",propuni("149")],
                                    [...userx["157"],"157",propuni("157")],
                                    [...userx["158"],"158",propuni("158")],
                                    [...userx["159"],"159",propuni("159")],
                                    [...userx["257"],"257",propuni("257")],
                                    [...userx["258"],"258",propuni("258")],
                                    [...userx["259"],"259",propuni("259")],
                                    [...userx["267"],"267",propuni("267")],
                                    [...userx["268"],"268",propuni("268")],
                                    [...userx["269"],"269",propuni("269")],
                                    [...userx["347"],"347",propuni("347")],
                                    [...userx["348"],"348",propuni("348")],
                                    [...userx["349"],"349",propuni("349")],
                                    [...userx["357"],"357",propuni("357")],
                                    [...userx["358"],"358",propuni("358")],
                                    [...userx["359"],"359",propuni("359")],
                                    [...userx["367"],"367",propuni("367")],
                                    [...userx["368"],"368",propuni("368")],
                                    [...userx["369"],"369",propuni("369")],
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
                    socket.emit('feedback', ['danger', 'voce nao pode realizar pesquisas ate que o administrador inicie o turno'])
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
                        socket.emit('feedback', ['danger','voce precisa estar logado para puxar o state atual da simulação'])
                    }
            }) 
            .catch(() => { console.log('falha na comunicacao com o banco de dados para o ' +socket.id)
    })
    }) 
    socket.on('pesquisar-participacao-servicos', (input) => {
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => { 
                    if(userx !== null && input.length < 3){
                        //console.log(user.taokeys + ' ccccccccccccccc');
                        if(userx['taokeys'] >= 10800 && input.length == 1){
                            userx.balanco_patrimonial = {
                                caixa: userx.balanco_patrimonial.caixa - 10800,
                                estoque: userx.balanco_patrimonial.estoque,
                                contas_a_receber60: userx.balanco_patrimonial.contas_a_receber60,
                                contas_a_receber120: userx.balanco_patrimonial.contas_a_receber120,
                                maquinas: userx.balanco_patrimonial.maquinas,
                                depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_de_maquinas,
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
                           //console.log(user.taokeys)
                           userx.save()
                            .then(() => {
                                Data.findOne({ativo: 1, instancia: userx.instancia})
                                    .then((dados) => {
                                        if(dados !== null){
                                            let respostaP = 0
                                            for(let ss = 0; ss < index.length; ss++){
                                                if(index[ss] == input){
                                                    respostaP = dados['participacao_modelos'][ss]
                                                }
                                            }
                                        socket.emit('resposta-pesquisa', respostaP)
                                        function propuni(tipo) {
                                            if(userx.somapropuni.tipo1 == tipo){
                                                return userx.somapropuni.inv1
                                            }
                                            else if(userx.somapropuni.tipo2 == tipo){
                                                return userx.somapropuni.inv2
                                            }
                                            else{return 0}
                                        }
                                        socket.emit('update', [
                                    [...userx["147"],"147",propuni("147")],
                                    [...userx["148"],"148",propuni("148")],
                                    [...userx["149"],"149",propuni("149")],
                                    [...userx["157"],"157",propuni("157")],
                                    [...userx["158"],"158",propuni("158")],
                                    [...userx["159"],"159",propuni("159")],
                                    [...userx["257"],"257",propuni("257")],
                                    [...userx["258"],"258",propuni("258")],
                                    [...userx["259"],"259",propuni("259")],
                                    [...userx["267"],"267",propuni("267")],
                                    [...userx["268"],"268",propuni("268")],
                                    [...userx["269"],"269",propuni("269")],
                                    [...userx["347"],"347",propuni("347")],
                                    [...userx["348"],"348",propuni("348")],
                                    [...userx["349"],"349",propuni("349")],
                                    [...userx["357"],"357",propuni("357")],
                                    [...userx["358"],"358",propuni("358")],
                                    [...userx["359"],"359",propuni("359")],
                                    [...userx["367"],"367",propuni("367")],
                                    [...userx["368"],"368",propuni("368")],
                                    [...userx["369"],"369",propuni("369")],
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
                socket.emit('feedback', ['danger','voce nao pode realizar pesquisas ate que o administrador inicie o turno'])
            }
                                    })

                            })
                            .catch((err) => {console.log('falha em salvar transacao por pesquisa n 307' + err)})
                            }
                            else if(userx['taokeys'] >= 14400 && input.length == 2){
                                userx.balanco_patrimonial = {
                                    caixa: userx.balanco_patrimonial.caixa - 14400,
                                    estoque: userx.balanco_patrimonial.estoque,
                                    contas_a_receber60: userx.balanco_patrimonial.contas_a_receber60,
                                    contas_a_receber120: userx.balanco_patrimonial.contas_a_receber120,
                                    maquinas: userx.balanco_patrimonial.maquinas,
                                    depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_de_maquinas,
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
                                
                                //console.log(user.taokeys)
                                userx.save()
                                 .then(() => {
                                     Data.findOne({ativo: 1, instancia: userx.instancia})
                                         .then((dados) => {
                                             if(dados !== null){
                                                let respostaP = []
                                                for(let kk = 0; kk < 2; kk++){
                                                for(let ss = 0; ss < index.length; ss++){
                                                    if(index[ss] == input[kk]){
                                                        respostaP.push(dados['participacao_modelos'][ss])
                                                    }
                                                }
                                            } 
                                             socket.emit('resposta-pesquisa', String(respostaP))
                                             function propuni(tipo) {
                                                if(userx.somapropuni.tipo1 == tipo){
                                                    return userx.somapropuni.inv1
                                                }
                                                else if(userx.somapropuni.tipo2 == tipo){
                                                    return userx.somapropuni.inv2
                                                }
                                                else{return 0}
                                            }
                                             socket.emit('update', [
                                                [...userx["147"],"147",propuni("147")],
                                                [...userx["148"],"148",propuni("148")],
                                                [...userx["149"],"149",propuni("149")],
                                                [...userx["157"],"157",propuni("157")],
                                                [...userx["158"],"158",propuni("158")],
                                                [...userx["159"],"159",propuni("159")],
                                                [...userx["257"],"257",propuni("257")],
                                                [...userx["258"],"258",propuni("258")],
                                                [...userx["259"],"259",propuni("259")],
                                                [...userx["267"],"267",propuni("267")],
                                                [...userx["268"],"268",propuni("268")],
                                                [...userx["269"],"269",propuni("269")],
                                                [...userx["347"],"347",propuni("347")],
                                                [...userx["348"],"348",propuni("348")],
                                                [...userx["349"],"349",propuni("349")],
                                                [...userx["357"],"357",propuni("357")],
                                                [...userx["358"],"358",propuni("358")],
                                                [...userx["359"],"359",propuni("359")],
                                                [...userx["367"],"367",propuni("367")],
                                                [...userx["368"],"368",propuni("368")],
                                                [...userx["369"],"369",propuni("369")],
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
                     socket.emit('feedback', ['danger', 'voce nao pode realizar pesquisas ate que o administrador inicie o turno'])
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
                        socket.emit('feedback', ['danger','voce precisa estar logado para puxar o state atual da simulação'])
                    }
            }) 
            .catch(() => { console.log('falha na comunicacao com o banco de dados para o ' +socket.id)
    })
    }) 
    socket.on('pesquisar-servicos-oferecidos-concorrencia', () => {
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => { 
                    if(userx !== null){
                        //console.log(user.taokeys + ' ccccccccccccccc');
                        if(userx['taokeys'] >= 2160){
                            userx.balanco_patrimonial = {
                                caixa: userx.balanco_patrimonial.caixa - 2160,
                                estoque: userx.balanco_patrimonial.estoque,
                                contas_a_receber60: userx.balanco_patrimonial.contas_a_receber60,
                                contas_a_receber120: userx.balanco_patrimonial.contas_a_receber120,
                                maquinas: userx.balanco_patrimonial.maquinas,
                                depreciacao_maquinas: userx.balanco_patrimonial.depreciacao_de_maquinas,
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
                            /*
                            userx.dre = {
                                receita: userx.dre.receita,
                                cmv: userx.dre.cmv,
                                despesas_administrativas: userx.dre.despesas_administrativas + 2160,
                                despesas_vendas: userx.dre.despesas_vendas,
                                despesas_financeiras: userx.dre.despesas_financeiras,
                                depreciacao_e_amortizacao: userx.dre.depreciacao_e_amortizacao,
                                ir: userx.dre.ir
                            }
                            */
                           //console.log(user.taokeys + " <====")
                           userx.taokeys = userx.taokeys - 2160
                           userx['npesquisas'] = userx['npesquisas'] + 1 
                           //console.log(user.taokeys)
                           userx.save()
                            .then(() => {
                                Data.findOne({ativo: 1, instancia: userx.instancia})
                                    .then((dados) => {
                                        if(dados !== null){
                                        socket.emit('resposta-pesquisa', String(dados['modelos_oferecidos']))
                                        function propuni(tipo) {
                                            if(userx.somapropuni.tipo1 == tipo){
                                                return userx.somapropuni.inv1
                                            }
                                            else if(userx.somapropuni.tipo2 == tipo){
                                                return userx.somapropuni.inv2
                                            }
                                            else{return 0}
                                        }
                                        socket.emit('update', [
                                    [...userx["147"],"147",propuni("147")],
                                    [...userx["148"],"148",propuni("148")],
                                    [...userx["149"],"149",propuni("149")],
                                    [...userx["157"],"157",propuni("157")],
                                    [...userx["158"],"158",propuni("158")],
                                    [...userx["159"],"159",propuni("159")],
                                    [...userx["257"],"257",propuni("257")],
                                    [...userx["258"],"258",propuni("258")],
                                    [...userx["259"],"259",propuni("259")],
                                    [...userx["267"],"267",propuni("267")],
                                    [...userx["268"],"268",propuni("268")],
                                    [...userx["269"],"269",propuni("269")],
                                    [...userx["347"],"347",propuni("347")],
                                    [...userx["348"],"348",propuni("348")],
                                    [...userx["349"],"349",propuni("349")],
                                    [...userx["357"],"357",propuni("357")],
                                    [...userx["358"],"358",propuni("358")],
                                    [...userx["359"],"359",propuni("359")],
                                    [...userx["367"],"367",propuni("367")],
                                    [...userx["368"],"368",propuni("368")],
                                    [...userx["369"],"369",propuni("369")],
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
                socket.emit('feedback', ['danger','voce nao pode realizar pesquisas ate que o administrador inicie o turno'])
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
                        socket.emit('feedback',['danger','voce precisa estar logado para puxar o state atual da simulação'])
                    }
            }) 
            .catch(() => { console.log('falha na comunicacao com o banco de dados para o ' + socket.id)
    })
    }) 
    socket.on('puxar-balancos',  (turno) => {

        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                            //if(userx.turno == turno){} seria melhor ao registrar as instancias colocar como turno 1 na geração do JSON, mas fazer com cautela
                            Aluno.findOne({ cooperativa: userx.cooperativa, backup: 1, instancia: userx.instancia, turno: turno })                 
                                .then((balancos) => {
                                    
                                        socket.emit('balancos', { 
                                            balanco_patrimonial: balancos.balanco_patrimonial,
                                            dre: balancos.dre,
                                            fluxo: balancos.fluxo_de_caixa
                                         });
        
                                                      
                                })
                                .catch((err) => {console.log(err)})
                          

            }
                else{
                    socket.emit('feedback', ['danger','voce precisa estar logado para puxar o state atual da simulação'])
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})

    }) //FALTA PUXAR TB OS BALANCOS DO TURNO ATUAL 
    
    // SOCKETS AMD \/
    socket.on('registrar-nova-instancia', (creden) => {
                if(creden[4] == "senha-mestra"){
                    Data.findOne({instancia: creden[2]})
                        .then((ll) => {
                            if(ll !== null){
                                socket.emit('resposta-root', 'ja existe uma instacia com esse nome (OPERACAO NEGADA)')
                                socket.emit('feedback', ['danger','ja existe uma instancia com esse nome'])
                            }
                            else{
                                Data.findOne({login_adm: creden[0]})
                                    .then((userL) => {
                                        if(userL == null){
                                            let jogo = new Data({login_adm: creden[0], iniciado: 1, senha_adm: creden[1], instancia: creden[2], senha_instancia: creden[3], turno: 0, oferta_mercado: 800000, ativo: 1})
                                            jogo.save()
                                                .then(() => {
                                                    console.log('>>> Instancia: ' + creden[2] + ' registrada com sucesso')    
                                                    socket.emit('resposta-root', 'instancia '+ creden[2]+ ' criada com sucesso')
                                                    //socket.emit('registro-instancia-completo', creden[0])
                                                })
                                                .catch((err) => {console.log(err)})
                                        }
                                        else{
                                            socket.emit('resposta-root', 'ja existe ums instancia com esse LOGIN de administrador (OPERACAO NEGADA)')
                                            socket.emit('feedback', ['danger','ja existe ums instancia com esse LOGIN de administrador'])
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
                if(ll !== null){socket.emit('feedback', ['danger','voce ja esta conectado'])}
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
                                        socket.emit('feedback', ['success', 'login aprovado para ' + adm.instancia])
                                    })
                                    .catch((err) => {
                                        console.log(err)
                                   })
                            }
                            else{socket.emit('feedback', ['danger', 'instancia nao encontrada'])}
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
                    socket.emit('feedback', ['danger','voce precisa estar logado para puxar o state atual da simulação'])
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
                        socket.emit('feedback', ['danger','só é possivel alterar a demanda global antes de finalizar o primeiro turno'])
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
                    soma = soma + users[i]['distribuidores']
                    soma1 = soma1 + users[i]['pas']
                    soma2 = soma2 + users[i]['promotores']
                    soma3 = soma3 + users[i]['comissao']

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
                                    servicos: [index[r], users[i][index[r]][2], users[i].dre.servicos[2], users[i].dre.servicos[3]],
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
                                    depreciacao_de_veiculos: users[i].dre.depreciacao_de_veiculos + 2400*users[i]['frota'][f],
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
                for(let i = 0; i < users.length; i++){
                    scorex = scorex + users[i]['scoremod']
                    scorey1 = scorey1 + users[i]['scorepreco'][0]
                    scorey2 = scorey2 + users[i]['scorepreco'][1]
                }
                //console.log(scorey1 + ' <-- scorey1 - ' + scorey2 + ' <-- scorey2')
                let preco_medio = scorey2/scorey1; //continuar daqui o rateio do faturamento pelo preco unitario usando esse preco medio global
                let dist = 0;
                //console.log('|| ' + preco_medio + ' <-- PRECO MEDIO ||')

                for(let i = 0; i < users.length; i++){
                    let media_user = users[i]['scorepreco'][1]/users[i]['scorepreco'][0]
                    dist = dist + Math.pow((preco_medio/media_user),2)
                    let somaF = 0
                    for(let f = 0; f < 12; f++){
                        somaF = somaF + users[i]['frota'][f]
                        if(users[i]['frota'][f] > 0){
                            users[i].balanco_patrimonial = {
                                caixa: users[i].balanco_patrimonial.caixa - 2400*users[i]['frota'][f],
                                estoque: users[i].balanco_patrimonial.estoque,
                                contas_a_receber60: users[i].balanco_patrimonial.contas_a_receber60,
                                contas_a_receber120: users[i].balanco_patrimonial.contas_a_receber120,
                                maquinas: users[i].balanco_patrimonial.maquinas,
                                depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_de_maquinas,
                                veiculos: users[i].balanco_patrimonial.veiculos,
                                depreciacao_veiculos: users[i].balanco_patrimonial.depreciacao_veiculos,
                                tributos_a_pagar_anterior: users[i].balanco_patrimonial.tributos_a_pagar_anterior,
                                tributos_a_pagar_atual: users[i].balanco_patrimonial.tributos_a_pagar_atual,
                                emprestimos: users[i].balanco_patrimonial.emprestimos,
                                capial: users[i].balanco_patrimonial.capial,
                                lucros_acumulados: users[i].balanco_patrimonial.lucros_acumulados - 2400*users[i]['frota'][f]
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
                                custo_de_servico_prestado: users[i].fluxo_de_caixa.custo_de_servico_prestado,
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
                        }
                        if(users[i]['frota'][f] > 0 && f == 11){
                            users[i].balanco_patrimonial = {
                                caixa: users[i].balanco_patrimonial.caixa,
                                estoque: users[i].balanco_patrimonial.estoque,
                                contas_a_receber60: users[i].balanco_patrimonial.contas_a_receber60,
                                contas_a_receber120: users[i].balanco_patrimonial.contas_a_receber120,
                                maquinas: users[i].balanco_patrimonial.maquinas,
                                depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_de_maquinas,
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
                    users[i]['faturamento'] = (0.09*users[i]['distribuidores']/soma + 0.09*users[i]['pas']/soma1 + 0.07*users[i]['promotores']/soma2 + 0.06*users[i]['comissao']/soma3 + 0.1*users[i]['propaganda']/soma5 + 0.12*users[i]['scoremod']/scorex + 0.3*(scorepp/dist) + 0.12*users[i]['propagandauni']/soma6 + 0.05*users[i]['npesquisas']/soma7)*demanda
                    console.log("Parcela de mercado conquistada para o player >>>" + users[i]['cooperativa'] + '<<<   || DISTRIBUIDORES (max 0.09) ==> ' + 0.09*users[i]['distribuidores']/soma + '<== || P.A.S. (max 0.09) ==>  ' + 0.09*users[i]['pas']/soma1 + '<== || PROMOTORES (max 0.07) ==> ' + 0.07*users[i]['promotores']/soma2 + '<== || COMISSAO (max 0.06) ==> ' + 0.06*users[i]['comissao']/soma3 + '<== || PROPAGANDA (max 0.10) ==> ' + 0.1*users[i]['propaganda']/soma5 + ' <== || QUALIDADE_DO_SERVICO (max 0.12) ==> ' + 0.12*users[i]['scoremod']/scorex + '<== || PRECO_DE_VENDA (max 0.30) ==> ' + 0.3*(scorepp/dist) + ' <== || PROPAGANDA_UNITARIA (max 0.12) ==> ' + 0.12*users[i]['propagandauni']/soma6 + '<== || NUMERO_DE_PESQUISAS (max 0.05) ==> ' + 0.05*users[i]['npesquisas']/soma7 + ' || |=|=|=| SOMA: ' + (0.05*users[i]['npesquisas']/soma7 + 0.12*users[i]['propagandauni']/soma6 + 0.3*(scorepp/dist) + 0.12*users[i]['scoremod']/scorex + 0.1*users[i]['propaganda']/soma5 + 0.06*users[i]['comissao']/soma3 + 0.07*users[i]['promotores']/soma2 + 0.09*users[i]['pas']/soma1 + 0.09*users[i]['distribuidores']/soma) + ' |=|=|=|')
                    console.log((0.09*users[i]['distribuidores']/soma + 0.09*users[i]['pas']/soma1 + 0.07*users[i]['promotores']/soma2 + 0.06*users[i]['comissao']/soma3 + 0.1*users[i]['propaganda']/soma5 + 0.12*users[i]['scoremod']/scorex + 0.3*(scorepp/dist) + 0.12*users[i]['propagandauni']/soma6 + 0.05*users[i]['npesquisas']/soma7)*demanda)
                    //users[i]['faturamento'] = users[i]['faturamento']*0.95
                    //users[i]['faturamento']/users[i]['scorepreco'][1]  <-- qnts % vendeu do que foi planejado
                    
                    
                    //  -_-_-_-
                    //Apos a computacao do faturamento do player no codigo abaixo altera-se no Schema o lucro resultante desse faturamento levando em conta o faturamento planejado do player, como o professor instruiu \/
                    users[i].taokeys = users[i].taokeys + users[i].balanco_patrimonial.contas_a_receber60 - users[i]['promotores']*2160 - users[i]['distribuidores']*360 - users[i]['pas']*2160 - users[i]['faturamento']*users[i]['comissao']
                    users[i].balanco_patrimonial = {
                        caixa: users[i].balanco_patrimonial.caixa + users[i].balanco_patrimonial.contas_a_receber60 - users[i]['promotores']*2160 - users[i]['distribuidores']*360 - users[i]['pas']*2160 - users[i]['faturamento']*users[i]['comissao'],
                        estoque: users[i].balanco_patrimonial.estoque,
                        contas_a_receber60: users[i].balanco_patrimonial.contas_a_receber60 - users[i].balanco_patrimonial.contas_a_receber60 + users[i].balanco_patrimonial.contas_a_receber120,
                        contas_a_receber120: 0,
                        maquinas: users[i].balanco_patrimonial.maquinas,
                        depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_de_maquinas,
                        veiculos: users[i].balanco_patrimonial.veiculos,
                        depreciacao_veiculos: users[i].balanco_patrimonial.depreciacao_veiculos,
                        tributos_a_pagar_anterior: users[i].balanco_patrimonial.tributos_a_pagar_anterior,
                        tributos_a_pagar_atual: users[i].balanco_patrimonial.tributos_a_pagar_atual,
                        emprestimos: users[i].balanco_patrimonial.emprestimos,
                        capial: users[i].balanco_patrimonial.capial,
                        lucros_acumulados: users[i].balanco_patrimonial.lucros_acumulados - users[i]['promotores']*2160 - users[i]['distribuidores']*360 - users[i]['pas']*2160 - users[i]['faturamento']*users[i]['comissao']
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
                        salario_promotores: users[i].dre.salario_promotores + users[i]['promotores']*2160, //gambiarra
                        comissao: users[i].dre.comissao + users[i]['faturamento']*users[i]['comissao'],
                        propaganda_institucional: users[i].dre.propaganda_institucional,
                        propaganda_unitaria: users[i].dre.propaganda_unitaria,
                        depreciacao_de_maquinas: users[i].dre.depreciacao_de_maquinas,
                        encargos_financiamento: users[i].dre.encargos_financiamento,
                        salario_frota: users[i].dre.salario_frota,
                        manutencao_frota: users[i].dre.manutencao_frota,
                        depreciacao_de_veiculos: users[i].dre.depreciacao_de_veiculos,
                        frota_terceirizada: users[i].dre.frota_terceirizada,
                        despesas_operacionais_n_planejadas: users[i].dre.despesas_operacionais_n_planejadas,
                        pas: users[i].dre.pas + users[i]['pas']*2160,
                        pesquisas: users[i].dre.pesquisas,
                        tributos: users[i].dre.tributos,
                        servicos: [users[i].dre.servicos[0], users[i].dre.servicos[1], users[i].dre.servicos[2], users[i].dre.servicos[3]],
                        preco_medio: users[i].dre.preco_medio,
                        atendimentos: users[i].dre.atendimentos,
                        insumos_em_estoque: users[i].dre.insumos_em_estoque,
                        distribuidores: users[i].dre.distribuidores + users[i]['distribuidores']*360


                    }
                    users[i].fluxo_de_caixa = {
                        saldo_anterior: users[i].fluxo_de_caixa.saldo_anterior,
                        faturamento: users[i].fluxo_de_caixa.faturamento,
                        contas_a_receber: users[i].contas_a_receber,
                        contas_a_receber_recebidas: users[i].fluxo_de_caixa.contas_a_receber_recebidas + users[i].balanco_patrimonial.contas_a_receber60, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                        custo_de_servico_prestado: users[i].fluxo_de_caixa.custo_de_servico_prestado,
                        emprestimos_contratados: users[i].fluxo_de_caixa.emprestimos_contratados,
                        emprestimos_pagos: users[i].fluxo_de_caixa.emprestimos_pagos,
                        veiculos_vendidos: users[i].fluxo_de_caixa.veiculos_vendidos,
                        depreciacao_de_veiculos: users[i].fluxo_de_caixa.depreciacao_de_veiculos,
                        depreciacao_de_maquinas: users[i].fluxo_de_caixa.depreciacao_de_maquinas,
                        veiculos_comprados: users[i].fluxo_de_caixa.veiculos_comprados,
                        tributos: users[i].fluxo_de_caixa.tributos,
                        promotores: users[i].fluxo_de_caixa.promotores + users[i]['promotores']*2160 + users[i]['faturamento']*users[i]['comissao'],
                        propaganda: users[i].fluxo_de_caixa.propaganda,
                        pesquisas: users[i].fluxo_de_caixa.pesquisas,
                        pas: users[i].fluxo_de_caixa.pas + users[i]['pas']*2160,
                        uso_frota: users[i].uso_frota,
                        despesas_operacionais_n_planejadas: users[i].fluxo_de_caixa.despesas_operacionais_n_planejadas,
                        despesas_administrativas: users[i].fluxo_de_caixa.despesas_administrativas,
                        encargos_financiamento: users[i].fluxo_de_caixa.encargos_financiamento,
                        maquinas: users[i].fluxo_de_caixa.maquinas,
                        distribuidores: users[i].fluxo_de_caixa.distribuidores + users[i]['distribuidores']*360
                    }

                    

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
                                depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_de_maquinas,
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
                                estoque_inicial: users[i].dre.estoque_inicial + users[i][index[o]][0]*users[i][index[o]][2],
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
                                insumos_em_estoque: users[i].dre.insumos_em_estoque + (users[i][index[o]][0]*users[i][index[o]][2] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i][index[o]][4]*(users[i][index[o]][2]))
        
        
                            }
                            
                            users[i].fluxo_de_caixa = {
                                saldo_anterior: users[i].fluxo_de_caixa.saldo_anterior,
                                faturamento: users[i].fluxo_de_caixa.faturamento,
                                contas_a_receber: users[i].contas_a_receber + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i][index[o]][4]*(users[i][index[o]][3]),
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
                                uso_frota: users[i].uso_frota,
                                despesas_operacionais_n_planejadas: users[i].fluxo_de_caixa.despesas_operacionais_n_planejadas,
                                despesas_administrativas: users[i].fluxo_de_caixa.despesas_administrativas,
                                encargos_financiamento: users[i].fluxo_de_caixa.encargos_financiamento,
                                maquinas: users[i].fluxo_de_caixa.maquinas,
                                distribuidores: users[i].fluxo_de_caixa.distribuidores
                            }


                            let array_insu = [(users[i][index[o]][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i][index[o]][4]), users[i][index[o]][1], users[i][index[o]][2], users[i][index[o]][3], users[i][index[o]][4],(users[i][index[o]][5] + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i][index[o]][4]), (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i][index[o]][4]*users[i][index[o]][3], 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i][index[o]][4]*(users[i][index[o]][3])]
                            //(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['147'][4]*users[i]['147'][3] => igual ao faturamento obtido pelo jogador nesse serviço especifico
                            
                            users[i].set(index[o], array_insu)
                            //users[i].balanco_patrimonial.contas_a_receber = users[i]['147'][7]
                            
                            //users[i][index[o]][0] = users[i]['147'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['147'][4]
                            if(users[i][index[o]][0] >= 0){
                                users[i].taokeys = users[i].taokeys - users[i][index[o]][0]*36
    

                                users[i].balanco_patrimonial = {
                                caixa: users[i].balanco_patrimonial.caixa - users[i][index[o]][0]*36,
                                estoque: users[i].balanco_patrimonial.estoque,
                                contas_a_receber60: users[i].balanco_patrimonial.contas_a_receber60,
                                contas_a_receber120: users[i].balanco_patrimonial.contas_a_receber120,
                                maquinas: users[i].balanco_patrimonial.maquinas,
                                depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_de_maquinas,
                                veiculos: users[i].balanco_patrimonial.veiculos,
                                depreciacao_veiculos: users[i].balanco_patrimonial.depreciacao_veiculos,
                                tributos_a_pagar_anterior: users[i].balanco_patrimonial.tributos_a_pagar_anterior,
                                tributos_a_pagar_atual: users[i].balanco_patrimonial.tributos_a_pagar_atual,
                                emprestimos: users[i].balanco_patrimonial.emprestimos,
                                capial: users[i].balanco_patrimonial.capial,
                                lucros_acumulados: users[i].balanco_patrimonial.lucros_acumulados - users[i][index[o]][0]*36
                            }
                                
                                users[i].dre = {
                                    receita: users[i].dre.receita, 
                                    csp: users[i].dre.csp + users[i][index[o]][0]*36,
                                    estoque_inicial: users[i].dre.estoque_inicial,
                                    custo_prestacao_servico: users[i].dre.custo_prestacao_servico,
                                    custo_estocagem: users[i].dre.custo_estocagem + users[i][index[o]][0]*36,
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

                            }
                            else{
                                users[i].taokeys = users[i].taokeys + users[i][index[o]][0]*users[i][index[o]][2]*1.2
                                
                                users[i].balanco_patrimonial = {
                                    caixa: users[i].balanco_patrimonial.caixa + users[i][index[o]][0]*users[i][index[o]][2]*1.2,
                                    estoque: users[i].balanco_patrimonial.estoque + (-1)*(users[i][index[o]][0]*users[i][index[o]][2]),
                                    contas_a_receber60: users[i].balanco_patrimonial.contas_a_receber60,
                                    contas_a_receber120: users[i].balanco_patrimonial.contas_a_receber120,
                                    maquinas: users[i].balanco_patrimonial.maquinas,
                                    depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_de_maquinas,
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
                                    insumos_em_estoque: users[i].dre.insumos_em_estoque + (-1)*users[i][index[o]][0]*users[i][index[o]][2]
            
            
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
                    if(frota_soma > 0){
                        users[i].taokeys = users[i].taokeys - frota_soma*10800
                        users[i].balanco_patrimonial = {
                            caixa: users[i].balanco_patrimonial.caixa - frota_soma*10800,
                            estoque: users[i].balanco_patrimonial.estoque,
                            contas_a_receber60: users[i].balanco_patrimonial.contas_a_receber60,
                            contas_a_receber120: users[i].balanco_patrimonial.contas_a_receber120,
                            maquinas: users[i].balanco_patrimonial.maquinas,
                            depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_de_maquinas,
                            veiculos: users[i].balanco_patrimonial.veiculos,
                            depreciacao_veiculos: users[i].balanco_patrimonial.depreciacao_veiculos,
                            tributos_a_pagar_anterior: users[i].balanco_patrimonial.tributos_a_pagar_anterior,
                            tributos_a_pagar_atual: users[i].balanco_patrimonial.tributos_a_pagar_atual,
                            emprestimos: users[i].balanco_patrimonial.emprestimos,
                            capial: users[i].balanco_patrimonial.capial,
                            lucros_acumulados: users[i].balanco_patrimonial.lucros_acumuladossao - frota_soma*10800
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
                            salario_frota: users[i].dre.salario_frota + frota_soma*10800,
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
                            uso_frota: users[i].fluxo_de_caixa.uso_frota + frota_soma*10800,
                            despesas_operacionais_n_planejadas: users[i].fluxo_de_caixa.despesas_operacionais_n_planejadas,
                            despesas_administrativas: users[i].fluxo_de_caixa.despesas_administrativas,
                            encargos_financiamento: users[i].fluxo_de_caixa.encargos_financiamento,
                            maquinas: users[i].fluxo_de_caixa.maquinas
                        }
                        /*
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            cmv: users[i].dre.cmv,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas + frota_soma*10800,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                        */
                    }
                    users[i].pas = users[i].pas + users[i].pas1;
                    users[i].pas1 = users[i].pas2;
                    users[i].pas2 = 0;
                    console.log('llll')
                    if(uso_frota/2000 > frota_soma){
                        let j = (uso_frota%2000)
                        if(j > 0){
                            users[i].taokeys = users[i].taokeys - (((uso_frota-j)/2000)-frota_soma+1)*60 //desconta o valor gasto com frota terceirizada
                            users[i].balanco_patrimonial = {
                                caixa: users[i].balanco_patrimonial.caixa - (((uso_frota-j)/2000)-frota_soma+1)*60,
                                estoque: users[i].balanco_patrimonial.estoque,
                                contas_a_receber60: users[i].balanco_patrimonial.contas_a_receber60,
                                contas_a_receber120: users[i].balanco_patrimonial.contas_a_receber120,
                                maquinas: users[i].balanco_patrimonial.maquinas,
                                depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_de_maquinas,
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
                        }
                        else{

                            users[i].taokeys = users[i].taokeys - (((uso_frota)/2000)-frota_soma)*60 //desconta o valor gasto com frota terceirizada
                            users[i].balanco_patrimonial = {
                                caixa: users[i].balanco_patrimonial.caixa - (((uso_frota-j)/2000)-frota_soma)*60,
                                estoque: users[i].balanco_patrimonial.estoque,
                                contas_a_receber60: users[i].balanco_patrimonial.contas_a_receber60,
                                contas_a_receber120: users[i].balanco_patrimonial.contas_a_receber120,
                                maquinas: users[i].balanco_patrimonial.maquinas,
                                depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_de_maquinas,
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
                        }
                    }
                      
                }
                    
                    // -_-_-_-
                for(let i = 0; i < users.length; i++){
                    //users[i]['npesquisas'] = 1 // (ALOCADO EM CIMA /\) numero de pesquisas feitas no turno q sera usada para divisao de 5% do faturamento total esta sendo "zerada" (apenas coloquei igual a 1 o padrao pq se n divide por 0 e o faturamento da errado) aqui para contagem no proximo turno
                    
                    
                    if(users[i].taokeys >= users[i]['divida'][0]/3 + users[i]['divida'][0]*0.08){
                        users[i].taokeys = users[i].taokeys - (users[i]['divida'][0]/3 + users[i]['divida'][0]*0.08)
                        users[i].balanco_patrimonial = {
                            caixa: users[i].balanco_patrimonial.caixa - users[i]['divida'][0]/3 - users[i]['divida'][0]*0.08,
                            estoque: users[i].balanco_patrimonial.estoque,
                            contas_a_receber60: users[i].balanco_patrimonial.contas_a_receber60,
                            contas_a_receber120: users[i].balanco_patrimonial.contas_a_receber120,
                            maquinas: users[i].balanco_patrimonial.maquinas,
                            depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_de_maquinas,
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
                        
                        users[i].set('divida', [users[i]['divida'][0]*(2/3), users[i]['divida'][1], users[i]['divida'][2]]) //contabilizando a passagem de tempo
                    }
                    else if(users[i].taokeys > users[i]['divida'][0]*0.08){
                        let gamb = (users[i]['divida'][0]/3 + users[i]['divida'][0]*0.08) - users[i].taokeys
                        users[i].taokeys = 0
                        users[i].balanco_patrimonial = {
                            caixa: 0,
                            estoque: users[i].balanco_patrimonial.estoque,
                            contas_a_receber60: users[i].balanco_patrimonial.contas_a_receber60,
                            contas_a_receber120: users[i].balanco_patrimonial.contas_a_receber120,
                            maquinas: users[i].balanco_patrimonial.maquinas,
                            depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_de_maquinas,
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
                        users[i].set('divida', [users[i]['divida'][0]*(2/3) + gamb, users[i]['divida'][1], users[i]['divida'][2]])
                    }
                    else{
                        users[i].balanco_patrimonial = {
                            caixa: 0,
                            estoque: users[i].balanco_patrimonial.estoque,
                            contas_a_receber60: users[i].balanco_patrimonial.contas_a_receber60,
                            contas_a_receber120: users[i].balanco_patrimonial.contas_a_receber120,
                            maquinas: users[i].balanco_patrimonial.maquinas,
                            depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_de_maquinas,
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
                        users[i].balanco_patrimonial = {
                            caixa: users[i].balanco_patrimonial.caixa - users[i]['divida'][1]/2 - users[i]['divida'][1]*0.08,
                            estoque: users[i].balanco_patrimonial.estoque,
                            contas_a_receber60: users[i].balanco_patrimonial.contas_a_receber60,
                            contas_a_receber120: users[i].balanco_patrimonial.contas_a_receber120,
                            maquinas: users[i].balanco_patrimonial.maquinas,
                            depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_de_maquinas,
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
                            depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_de_maquinas,
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
                            depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_de_maquinas,
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
                        users[i].balanco_patrimonial = {
                            caixa: users[i].balanco_patrimonial.caixa - users[i]['divida'][2]*0.08 - users[i]['divida'][2],
                            estoque: users[i].balanco_patrimonial.estoque,
                            contas_a_receber60: users[i].balanco_patrimonial.contas_a_receber60,
                            contas_a_receber120: users[i].balanco_patrimonial.contas_a_receber120,
                            maquinas: users[i].balanco_patrimonial.maquinas,
                            depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_de_maquinas,
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
                            depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_de_maquinas,
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
                            depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_de_maquinas,
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
                            depreciacao_maquinas: users[i].balanco_patrimonial.depreciacao_de_maquinas,
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
                                                    caixa: users[i].caixa,
                                                    estoque: users[i].estoque,
                                                    contas_a_receber60: users[i].contas_a_receber60,
                                                    contas_a_receber120: users[i].contas_a_receber120,
                                                    maquinas: users[i].maquinas,
                                                    depreciacao_maquinas: users[i].depreciacao_de_maquinas,
                                                    veiculos: users[i].veiculos,
                                                    depreciacao_veiculos: users[i].depreciacao_de_veiculos,
                                                    tributos_a_pagar_anterior: users[i].tributos_a_pagar_anterior,
                                                    tributos_a_pagar_atual: users[i].tributos_a_pagar_atual,
                                                    emprestimos: users[i].emprestimos,
                                                    capial: users[i].capital,
                                                    lucros_acumulados: users[i].lucros_acumulados
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
                                                
                                                
                                                for(let s = 0; s < index.length; s++){
                                                    //console.log(index[s])
                                                    let serv = index[s]
                                                    usert.set(serv, [users[i][serv][0], users[i][serv][1], users[i][serv][2], users[i][serv][3], users[i][serv][4], users[i][serv][5], users[i][serv][6], users[i][serv][7]])
                                                }
                                                usert.save()
                                                    .then(() => {
                                                        socket.emit('feedback', ['success', 'turno foi finalizado'])
                                                        if(i == users.length - 1){
                                                            sockets.emit('final-turno') //manda a info pra tds os sockets conectados de que acabou o turno e para eles requisitarem (!!socket.emit('receber-faturamento')!!) o novo state pós FATURAMENTO e se o jogador n esriver conectado qnd acontecer o processo de faturamento essa puxada de dados tb smp acontece qnd ele se loga
                                                        }
                                                    })
                                                    .catch((err) => {socket.emit('feedback', ['danger', 'falha ao salvar os dados no servidor (' + err + ')'])})
                                     
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
        else{socket.emit('feedback', ['warning', 'para finalizar o turno antes voce precisa inicia-lo'])}
        }
    else{socket.emit('feedback', ['danger',"voce precisa estar logado para puxar o state atual da simulação"])}
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
                                    serv.push(index[h])
                                }
                                if(users[i][index[h]][6] > 0){
                                    part[h] = part[h] + users[i][index[h]][6]
                                    total_part = total_part + users[i][index[h]][6]
                                }
                            }
                            tpas = tpas + users[i]['pas'];
                            tdis = tdis + users[i]['distribuidores'];

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
                                        console.log(users[i].dre.servicos)
                                        let backup = new Aluno({backup: 1, instancia: users[i].instancia, npesquisas: users[i].npesquisas, turno: users[i].turno, propaganda: users[i].propaganda, propagandauni: users[i].propagandauni, faturamento: users[i].faturamento, ativo: 1, taokeys: users[i].taokeys, divida: [users[i]['divida'][0],users[i]['divida'][1],users[i]['divida'][2]], comissao: users[i].comissao, frota: [users[i].frota[0],users[i].frota[1],users[i].frota[2],users[i].frota[3],users[i].frota[4],users[i].frota[5],users[i].frota[6],users[i].frota[7],users[i].frota[8],users[i].frota[9],users[i].frota[10],users[i].frota[11]], cooperativa: users[i].cooperativa, pas: users[i].pas, pas1: users[i].pas1, pas2: users[i].pas2, distribuidores: users[i].distribuidores, promotores: users[i].promotores, 
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
                                                insumos_em_estoque: users[i].insumos_em_estoque
                    
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
                                            }
                                            
                                        });
                                        backup.save() 
                                            .then(() => {
                                                users[i].save()
                                                console.log('Save da cooperativa: ' + backup.cooperativa + '. realizado com sucesso para o turno: ' + backup.turno)
                                            
                                            })
                                            .catch((err) => {console.log(err)})

                                        }
                                    
                            })
                            .catch((err) => {console.log(err)})

                    })
                        
                        //
                }
                else{socket.emit('feedback', ['warning', 'para iniciar um novo turno voce precisa antes finalizar o atual'])}
                }
                else{
                    socket.emit('feedback', ['danger','voce precisa estar logado para puxar o state atual da simulação'])
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
    socket.emit('feedback', ['danger', 'erro fatal no server: ' + e])
}
// PARA TESTES PROFESSOR PRETENDE TER INSTANCIAS COM 8 PESSOAS NA SITUAÇAO IDEAL (basear teste com o parametro 8)
server.listen(3000, () => {
    console.log(`--> Server escutando porta: 3000`)
})


            /*
CHECK LIST:
            - COLETAR DADOS PARA DEMONSTRATIVOS FINANCEIROS DURANTE O PROCESSAMENTO DO TURNO SALVANDO NO SCHEMA DE CADA COOPERATIVA

            -OK LIMITAR O NUMERO DE POSSIVEIS SERVICOS ATIVOS PARA 2 //metodo: 
                NOVOS SOCKETS: - SUBSTITUICAO DE SERVICO (transferir tds os insumos para outro servico, ativa-lo e desativar o antigo) (ps: tem q haver substituicao ate para servicos em processo de cancelamento) - ; - COMPRA DE SERVICO (para serviços já ativos) - ; - TROCA DE INSUMOS (troca de insumos entre os servicoes ativos apenas) - ; - ATIVACAO DE SERVICO (para servicos n cancelados) - ; - DESATIVACAO DO SERVICO (para servicos ativos e com 0 insumos contanto que sempre haja 1 servico ativo a todo momento(ps: por isso é essencial a SUBSTITUICAO)) -
            
            - IDEA PARA BACK UP (e saves antigos): ao final do turno criar um: new Aluno({ ... }) mas com uma assim: key: backup (0 ou 1) e dai vai ter o Ativo q é 0 ou 1 q auxilia pra so processar os dados atuais

            - Implementar sistema de Lock (ou como ta agr q os proximos turnos apenas fornecem 0 de dinheiro) ao final da Simulação e fornecer os dados de quem ganhou
            
            */
