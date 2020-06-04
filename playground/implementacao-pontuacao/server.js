import express from 'express'
import http from 'http'
//import createGame from './public/game.js'
import socketio from 'socket.io'
import estrutura from './src/aluno.js'
const Aluno = estrutura[0]
const Data = estrutura[1]

//import { isMainThread } from 'worker_threads'
import mongoose from 'mongoose'

//import { createCipher } from 'crypto'

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
//appadm.use(express.static('publicadm'))

sockets.on('connection', (socket) => { //conversa do server com os clients(n ADM)
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
                    Aluno.findOne({ cooperativa: creden[0], senha: creden[1], temporario: 1, instancia: creden[2]})
                        .then((usert) => { if(usert == null){
                                console.log('>>login não permitido: credenciais invalidas', creden[0], creden[1], creden[2])
                                socket.emit('feedback', ['danger', 'login negado para: ' + creden[0]])
                                }
                                else{ 
                                    Data.findOne({instancia: usert.instancia}) //filtro para apenas liberar o login se o turno estiver ATIVO aqui se necessário
                                        .then((check2) => {
                                if(check2 !== null){ 
                                        Aluno.findOne({cooperativa: usert.cooperativa, temporario: 0, instancia: usert.instancia})
                                            .then((userdef) => {
                                                usert.set('npesquisas', userdef.npesquisas)
                                                usert.set('turno', userdef.turno)
                                                usert.set('propaganda', userdef.propaganda)
                                                usert.set('propagandauni', userdef.propagandauni)
                                                usert.set('taokeys', userdef.taokeys)
                                                usert.set('comissao', userdef.comissao)
                                                //console.log('PASt: ' + userdef.pas)
                                                usert.set('pas', userdef.pas)
                                                usert.set('pas1', userdef.pas1)
                                                usert.set('pas2', userdef.pas2)
                                                usert.set('distribuidores', userdef.distribuidores)
                                                usert.set('promotores', userdef.promotores)
                                                //console.log(index)
                                                
                                                for(let s = 0; s < index.length; s++){
                                                    //console.log(index[s])
                                                    let serv = index[s]
                                                    usert.set(serv, [userdef[serv][0], userdef[serv][1], userdef[serv][2], userdef[serv][3], userdef[serv][4], userdef[serv][5], userdef[serv][6], userdef[serv][7]])
                                                }

                                                usert.sockid = socket.id;
                                                usert.save()
                                                    .then(() => {
                                                        console.log('>>login efetuado com sucesso')
                                                        socket.emit('feedback', ['success', 'login aprovado para: ' + creden[0]]) 
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
                            }})
                        .catch((err) => {console.log(err + ' <=> Falha na comunicacao com o Banco de dados n 403.1 ' + socket.id)})
                        }
            })
            .catch(() => {console.log('falha na comunicacao com o Banco de dados n 504 ' +socket.id)})

                       
    }) //OK (alteracao para CHECAR TB a instancia do Client ao inves de so a senha e o nome (pq poderia dar conflito (alternativa seria n perminitir q dois cliente tenham senhas iguais)))
    socket.on('register-client', (creden) => {
        Aluno.findOne({sockid: socket.id, temporario: 1}) // se n achar retorna Null e se vc tentar fazer essa pesquisa com um String sendo q no Schema ta como Number vai ir pro Catch ou vai pro Catch tb se n conseguir se conectar com o MongoDB
            .then((ll) => {
                if(ll !== null){
                    console.log('>>usuario ja conectado')
                    socket.emit('feedback', ['warning','voce ja esta conectado com: ' + ll.cooperativa])
                }
                else{
                    Data.findOne({instancia: creden[2], senha_instancia: creden[3]})
                        .then((inst) => {
                            if(inst !== null){

                            
        Aluno.findOne({cooperativa: creden[0], instancia: creden[2]})
            .then((userx) => { 
                if(userx !== null){
                    console.log('>>registro negado: já existe cooperativa com este nome');
                    socket.emit('feedback', ['danger', 'ja existe uma cooperativa com esse nome na instancia selecionada'])}
                else{
                    let jogador = new Aluno({ sockid: socket.id, backup: 0, temporario: 1, instancia: creden[2], npesquisas: 1, turno: 0, scoremod: 0, scorepreco: [0,0], propaganda: 1, propagandauni: 1, faturamento: 0, ativo: 1, taokeys: 1872000, divida: [0,0,0], comissao: 0.05, frota: [10,0,0,0,0,0,0,0,0,0,0,0], cooperativa: creden[0], pas: 30, pas1:0, pas2:0, distribuidores: 640, promotores: 40, senha: creden[1], 
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
                            ativo: {
                                circulante: {
                                    caixa: 1872000,
                                    estoque: 288*985,
                                    contas_a_receber: 0

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: 30,
                                        frota: 10*57600,
                                        depreciacao_frota: 0
                                    }
                                }
                            },
                            passivo: {
                                contas_a_pagar: 0
                            },
                            patrimonio_liquido: {
                                capital_social: 1872000+288*985+10*57600,
                                lucros_acumulados: 0
                            }
                        },
                        dre: {
                            receita: 0,
                            cmv: 0,
                            despesas_administrativas: 0,
                            despesas_vendas: 0,
                            despesas_financeiras: 0,
                            depreciacao_e_amortizacao: 0,
                            ir: 0
                        },
                        fluxo_de_caixa: {

                            lucro_bruto: 0,
                            contas_a_receber: 0,
                            contas_a_receber_recebidas: 0, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                            despesas: 0,
                            fluxo_operacional: 0,
                            fluxo_financeiro: 0, // entra + emprestimos tomados e entra - empréstimos pagos 
                            fluxo_investimento: 0, // entra negativo tds as compras de VEICULOS e entra positivo todo o valor da venda de veiculos
                            fluxo: 0
                        
                        }
                    });
                        jogador.save()
                            .then(Aluno.find({ cooperativa: creden[0], temporario: 1, instancia: creden[2]}))
                            .then((user) => { 
                                if(user !== null){
                                    console.log('usurario: ' + jogador.cooperativa + ' registrado com sucesso')
                                    let jogadorR = new Aluno({ sockid: "11994729653", backup: 0, temporario: 0, instancia: creden[2], npesquisas: 1, turno: 0, scoremod: 0, scorepreco: [0,0], propaganda: 1, propagandauni: 1, faturamento: 0, ativo: 1, taokeys: 1872000, divida: [0,0,0], comissao: 0.05, frota: [10,0,0,0,0,0,0,0,0,0,0,0], cooperativa: creden[0], pas: 30, pas1:0, pas2:0, distribuidores: 640, promotores: 40, senha: creden[1], 
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
                                        ativo: {
                                            circulante: {
                                                caixa: 1872000,
                                                estoque: 288*985,
                                                contas_a_receber: 0
            
                                            },
                                            n_circulante: {
                                                imobilizado: {
                                                    pas: 30,
                                                    frota: 10*57600,
                                                    depreciacao_frota: 0
                                                },
                                            },
                                        },
                                        passivo: {
                                            contas_a_pagar: 0
                                        },
                                        patrimonio_liquido: {
                                            capital_social: 1872000+288*985+10*57600,
                                            lucros_acumulados: 0
                                        }
                                    },
                                    dre: {
                                        receita: 0,
                                        cmv: 0,
                                        despesas_administrativas: 0,
                                        despesas_vendas: 0,
                                        despesas_financeiras: 0,
                                        depreciacao_e_amortizacao: 0,
                                        ir: 0
                                    },
                                    fluxo_de_caixa: {

                                        lucro_bruto: 0,
                                        contas_a_receber: 0,
                                        contas_a_receber_recebidas: 0, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                                        despesas: 0,
                                        fluxo_operacional: 0,
                                        fluxo_financeiro: 0, // entra + emprestimos tomados e entra - empréstimos pagos 
                                        fluxo_investimento: 0, // entra negativo tds as compras de VEICULOS e entra positivo todo o valor da venda de veiculos
                                        fluxo: 0
                                    
                                    }
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
    }) //ok
    socket.on('trocar-servico', (dados) => {
        let velho = dados[0];
        let novo = dados[1];
        let qnt = dados[2];
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
                        else{
                            return false
                        }
                    }
                    if(userx[novo][1] == 1 || check_1_servico_ativo()){ 
                    if(userx['taokeys'] >= qnt*30 && userx[velho][0] >= qnt){
                        if(userx[novo][1] == 1){

                        if(userx[novo][2] - userx[velho][2] > 0 && userx['taokeys'] >= qnt*30 + qnt*(userx[novo][2] - userx[velho][2])){

                        
                            userx.balanco_patrimonial = {
                                ativo: {
                                    circulante: {
                                        caixa: userx.balanco_patrimonial.ativo.circulante.caixa - qnt*30 - (userx[novo][2] - userx[velho][2])*qnt,
                                        estoque: userx.balanco_patrimonial.ativo.circulante.estoque + (userx[novo][2] - userx[velho][2])*qnt,
                                        contas_a_receber: userx.balanco_patrimonial.ativo.circulante.contas_a_receber
    
                                    },
                                    n_circulante: {
                                        imobilizado: {
                                            pas: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                            frota: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                            depreciacao_frota: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                        },
                                    },
                                },
                                passivo: {
                                    contas_a_pagar: userx.balanco_patrimonial.passivo.contas_a_pagar
                                },
                                patrimonio_liquido: {
                                    capital_social: userx.balanco_patrimonial.patrimonio_liquido.capital_social,
                                    lucros_acumulados: userx.balanco_patrimonial.patrimonio_liquido.lucros_acumulados - qnt*30
                                }
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
                                socket.emit('update', [
                                [...user["147"],"147"],
                                [...user["148"],"148"],
                                [...user["149"],"149"],
                                [...user["157"],"157"],
                                [...user["158"],"158"],
                                [...user["159"],"159"],
                                [...user["257"],"257"],
                                [...user["258"],"258"],
                                [...user["259"],"259"],
                                [...user["267"],"267"],
                                [...user["268"],"268"],
                                [...user["269"],"269"],
                                [...user["347"],"347"],
                                [...user["348"],"348"],
                                [...user["349"],"349"],
                                [...user["357"],"357"],
                                [...user["358"],"358"],
                                [...user["359"],"359"],
                                [...user["367"],"367"],
                                [...user["368"],"368"],
                                [...user["369"],"369"],
                                user["taokeys"],
                                user["frota"],
                                user["promotores"],
                                user["comissao"],
                                user["distribuidores"],
                                user["pas"],
                                user["propaganda"],
                                user["propagandauni"],
                                user["divida"],
                                user["turno"]]);
        
                                    }                  
                                })
                            .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})
                        }
                            else{
                                userx.balanco_patrimonial = {
                                    ativo: {
                                        circulante: {
                                            caixa: userx.balanco_patrimonial.ativo.circulante.caixa - qnt*30,
                                            estoque: userx.balanco_patrimonial.ativo.circulante.estoque + (userx[novo][2] - userx[velho][2])*qnt,
                                            contas_a_receber: userx.balanco_patrimonial.ativo.circulante.contas_a_receber
        
                                        },
                                        n_circulante: {
                                            imobilizado: {
                                                pas: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                                frota: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                                depreciacao_frota: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                            },
                                        },
                                    },
                                    passivo: {
                                        contas_a_pagar: userx.balanco_patrimonial.passivo.contas_a_pagar
                                    },
                                    patrimonio_liquido: {
                                        capital_social: userx.balanco_patrimonial.patrimonio_liquido.capital_social,
                                        lucros_acumulados: userx.balanco_patrimonial.patrimonio_liquido.lucros_acumulados - qnt*30 + (userx[novo][2] - userx[velho][2])*qnt //na DRE isso vai entrar como despesa de operação
                                    }
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
                                    socket.emit('update', [
                                    [...user["147"],"147"],
                                    [...user["148"],"148"],
                                    [...user["149"],"149"],
                                    [...user["157"],"157"],
                                    [...user["158"],"158"],
                                    [...user["159"],"159"],
                                    [...user["257"],"257"],
                                    [...user["258"],"258"],
                                    [...user["259"],"259"],
                                    [...user["267"],"267"],
                                    [...user["268"],"268"],
                                    [...user["269"],"269"],
                                    [...user["347"],"347"],
                                    [...user["348"],"348"],
                                    [...user["349"],"349"],
                                    [...user["357"],"357"],
                                    [...user["358"],"358"],
                                    [...user["359"],"359"],
                                    [...user["367"],"367"],
                                    [...user["368"],"368"],
                                    [...user["369"],"369"],
                                    user["taokeys"],
                                    user["frota"],
                                    user["promotores"],
                                    user["comissao"],
                                    user["distribuidores"],
                                    user["pas"],
                                    user["propaganda"],
                                    user["propagandauni"],
                                    user["divida"],
                                    user["turno"]]);
            
                                        }                  
                                    })
                                .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})

                            }
                        if(userx[novo][2] - userx[velho][2] > 0 && userx['taokeys'] <= qnt*30 + qnt*(userx[novo][2] - userx[velho][2])){
                            socket.emit('feedback', ['warning', 'falta caixa para realizar essa operação'])
                        }
                    }
                    else{socket.emit('feedback', ['warning','voce nao pode transferir insumos para um servico que nao esta ativo'])}
                    }
                }
                else{
                    socket.emit('feedback', ['warning','voce nao pode ter mais de dois serviços ativos simultaneamente'])
                }
                }
                else{
                    socket.emit('feedback', ['danger','voce precisa estar logado para puxar o state atual da simulação'])
                }
            
            })
    }) //OK troca insu de um servico ativo para outro ativo APENAS TESTADO BALAN OK
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
                            ativo: {
                                circulante: {
                                    caixa: userx.balanco_patrimonial.ativo.circulante.caixa - userx[velho][0]*30 - (userx[novo][2] - userx[velho][2])*userx[velho][0],
                                    estoque: userx.balanco_patrimonial.ativo.circulante.estoque + (userx[novo][2] - userx[velho][2])*userx[velho][0],
                                    contas_a_receber: userx.balanco_patrimonial.ativo.circulante.contas_a_receber

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: userx.balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: userx.balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: userx.balanco_patrimonial.patrimonio_liquido.lucros_acumulados - userx[velho][0]*30
                            }
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
                                    socket.emit('update', [
                                        [...user["147"],"147"],
                                        [...user["148"],"148"],
                                        [...user["149"],"149"],
                                        [...user["157"],"157"],
                                        [...user["158"],"158"],
                                        [...user["159"],"159"],
                                        [...user["257"],"257"],
                                        [...user["258"],"258"],
                                        [...user["259"],"259"],
                                        [...user["267"],"267"],
                                        [...user["268"],"268"],
                                        [...user["269"],"269"],
                                        [...user["347"],"347"],
                                        [...user["348"],"348"],
                                        [...user["349"],"349"],
                                        [...user["357"],"357"],
                                        [...user["358"],"358"],
                                        [...user["359"],"359"],
                                        [...user["367"],"367"],
                                        [...user["368"],"368"],
                                        [...user["369"],"369"],
                                        user["taokeys"],
                                        user["frota"],
                                        user["promotores"],
                                        user["comissao"],
                                        user["distribuidores"],
                                        user["pas"],
                                        user["propaganda"],
                                        user["propagandauni"],
                                        user["divida"],
                                        user["turno"]]);
        
                                    }                  
                                })
                            .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})
                    }
                    else{
                        userx.balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: userx.balanco_patrimonial.ativo.circulante.caixa - userx[velho][0]*30,
                                    estoque: userx.balanco_patrimonial.ativo.circulante.estoque + (userx[novo][2] - userx[velho][2])*userx[velho][0],
                                    contas_a_receber: userx.balanco_patrimonial.ativo.circulante.contas_a_receber

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: userx.balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: userx.balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: userx.balanco_patrimonial.patrimonio_liquido.lucros_acumulados - userx[velho][0]*30 + (userx[novo][2] - userx[velho][2])*userx[velho][0]
                            }
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
                                    socket.emit('update', [
                                        [...user["147"],"147"],
                                        [...user["148"],"148"],
                                        [...user["149"],"149"],
                                        [...user["157"],"157"],
                                        [...user["158"],"158"],
                                        [...user["159"],"159"],
                                        [...user["257"],"257"],
                                        [...user["258"],"258"],
                                        [...user["259"],"259"],
                                        [...user["267"],"267"],
                                        [...user["268"],"268"],
                                        [...user["269"],"269"],
                                        [...user["347"],"347"],
                                        [...user["348"],"348"],
                                        [...user["349"],"349"],
                                        [...user["357"],"357"],
                                        [...user["358"],"358"],
                                        [...user["359"],"359"],
                                        [...user["367"],"367"],
                                        [...user["368"],"368"],
                                        [...user["369"],"369"],
                                        user["taokeys"],
                                        user["frota"],
                                        user["promotores"],
                                        user["comissao"],
                                        user["distribuidores"],
                                        user["pas"],
                                        user["propaganda"],
                                        user["propagandauni"],
                                        user["divida"],
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
    }) //OK (falta teste) BALAN OK
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
                                        socket.emit('update', [
                                            [...user["147"],"147"],
                                            [...user["148"],"148"],
                                            [...user["149"],"149"],
                                            [...user["157"],"157"],
                                            [...user["158"],"158"],
                                            [...user["159"],"159"],
                                            [...user["257"],"257"],
                                            [...user["258"],"258"],
                                            [...user["259"],"259"],
                                            [...user["267"],"267"],
                                            [...user["268"],"268"],
                                            [...user["269"],"269"],
                                            [...user["347"],"347"],
                                            [...user["348"],"348"],
                                            [...user["349"],"349"],
                                            [...user["357"],"357"],
                                            [...user["358"],"358"],
                                            [...user["359"],"359"],
                                            [...user["367"],"367"],
                                            [...user["368"],"368"],
                                            [...user["369"],"369"],
                                            user["taokeys"],
                                            user["frota"],
                                            user["promotores"],
                                            user["comissao"],
                                            user["distribuidores"],
                                            user["pas"],
                                            user["propaganda"],
                                            user["propagandauni"],
                                            user["divida"],
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
    }) //OK
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
                                        socket.emit('update', [
                                            [...user["147"],"147"],
                                            [...user["148"],"148"],
                                            [...user["149"],"149"],
                                            [...user["157"],"157"],
                                            [...user["158"],"158"],
                                            [...user["159"],"159"],
                                            [...user["257"],"257"],
                                            [...user["258"],"258"],
                                            [...user["259"],"259"],
                                            [...user["267"],"267"],
                                            [...user["268"],"268"],
                                            [...user["269"],"269"],
                                            [...user["347"],"347"],
                                            [...user["348"],"348"],
                                            [...user["349"],"349"],
                                            [...user["357"],"357"],
                                            [...user["358"],"358"],
                                            [...user["359"],"359"],
                                            [...user["367"],"367"],
                                            [...user["368"],"368"],
                                            [...user["369"],"369"],
                                            user["taokeys"],
                                            user["frota"],
                                            user["promotores"],
                                            user["comissao"],
                                            user["distribuidores"],
                                            user["pas"],
                                            user["propaganda"],
                                            user["propagandauni"],
                                            user["divida"],
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
    }) //OK
    socket.on('salvar', () => {
        //console.log('inicio-salvamento')
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((usert) => {
                if(usert !== null){
                Data.findOne({instancia: usert.instancia})
                    .then((check) => {
                        if(check.ativo == 1){
                Aluno.findOne({cooperativa: usert.cooperativa, instancia: usert.instancia, temporario: 0})
                    .then((userdef) => {
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
                        //console.log(index)

                        userdef.balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: usert.balanco_patrimonial.ativo.circulante.caixa,
                                    estoque: usert.balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: usert.balanco_patrimonial.ativo.circulante.contas_a_receber

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: usert.balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: usert.balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: usert.balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: usert.balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: usert.balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: usert.balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                            }
                        }
                        userdef.dre = {
                            receita: usert.dre.receita,
                            cmv: usert.dre.cmv,
                            despesas_administrativas: usert.dre.despesas_administrativas,
                            despesas_vendas: usert.dre.despesas_vendas,
                            despesas_financeiras: usert.dre.despesas_financeiras,
                            depreciacao_e_amortizacao: usert.dre.depreciacao_e_amortizacao,
                            ir: usert.dre.ir
                        }
                        
                        for(let s = 0; s < index.length; s++){
                            //console.log(index[s])
                            let serv = index[s]
                            userdef.set(serv, [usert[serv][0], usert[serv][1], usert[serv][2], usert[serv][3], usert[serv][4], usert[serv][5], usert[serv][6], usert[serv][7]])
                        }
                        
                        userdef.save()
                            .then(() => {socket.emit('feedback', ['success','os dados foram salvos com sucesso'])})
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
    }) //OK
    socket.on('aumentar-frota', (dados) => {
        let qnt = Number(dados)
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                        if(qnt > 0 && userx.taokeys > qnt*57600){
                            userx.balanco_patrimonial = {
                                ativo: {
                                    circulante: {
                                        caixa: userx.balanco_patrimonial.ativo.circulante.caixa - qnt*57600,
                                        estoque: userx.balanco_patrimonial.ativo.circulante.estoque,
                                        contas_a_receber: userx.balanco_patrimonial.ativo.circulante.contas_a_receber
    
                                    },
                                    n_circulante: {
                                        imobilizado: {
                                            pas: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                            frota: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.frota + qnt*57600,
                                            depreciacao_frota: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                        },
                                    },
                                },
                                passivo: {
                                    contas_a_pagar: userx.balanco_patrimonial.passivo.contas_a_pagar
                                },
                                patrimonio_liquido: {
                                    capital_social: userx.balanco_patrimonial.patrimonio_liquido.capital_social,
                                    lucros_acumulados: userx.balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                                }
                            }   
                            let novaf = userx['frota'][0] + qnt
                            let array_dados = [novaf, userx['frota'][1], userx['frota'][2], userx['frota'][3], userx['frota'][4], userx['frota'][5], userx['frota'][6], userx['frota'][7], userx['frota'][8], userx['frota'][9], userx['frota'][10], userx['frota'][11], userx['frota'][12], userx['frota'][13], userx['frota'][14], userx['frota'][15], userx['frota'][16], userx['frota'][17], userx['frota'][18], userx['frota'][19], userx['frota'][20], userx['frota'][21], userx['frota'][22], userx['frota'][23]]
                            userx.taokeys = userx.taokeys - 57600*Number(dados)
                            userx.set('frota', array_dados) 
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id, temporario: 1}))                 
                                .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        socket.emit('update', [
                                            [...user["147"],"147"],
                                            [...user["148"],"148"],
                                            [...user["149"],"149"],
                                            [...user["157"],"157"],
                                            [...user["158"],"158"],
                                            [...user["159"],"159"],
                                            [...user["257"],"257"],
                                            [...user["258"],"258"],
                                            [...user["259"],"259"],
                                            [...user["267"],"267"],
                                            [...user["268"],"268"],
                                            [...user["269"],"269"],
                                            [...user["347"],"347"],
                                            [...user["348"],"348"],
                                            [...user["349"],"349"],
                                            [...user["357"],"357"],
                                            [...user["358"],"358"],
                                            [...user["359"],"359"],
                                            [...user["367"],"367"],
                                            [...user["368"],"368"],
                                            [...user["369"],"369"],
                                            user["taokeys"],
                                            user["frota"],
                                            user["promotores"],
                                            user["comissao"],
                                            user["distribuidores"],
                                            user["pas"],
                                            user["propaganda"],
                                            user["propagandauni"],
                                            user["divida"],
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
    }) //OK BALAN OK
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
    }) //OK
    socket.on('puxar-state', () => {
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                    socket.emit('update', [
                        [...userx["147"],"147"],
                        [...userx["148"],"148"],
                        [...userx["149"],"149"],
                        [...userx["157"],"157"],
                        [...userx["158"],"158"],
                        [...userx["159"],"159"],
                        [...userx["257"],"257"],
                        [...userx["258"],"258"],
                        [...userx["259"],"259"],
                        [...userx["267"],"267"],
                        [...userx["268"],"268"],
                        [...userx["269"],"269"],
                        [...userx["347"],"347"],
                        [...userx["348"],"348"],
                        [...userx["349"],"349"],
                        [...userx["357"],"357"],
                        [...userx["358"],"358"],
                        [...userx["359"],"359"],
                        [...userx["367"],"367"],
                        [...userx["368"],"368"],
                        [...userx["369"],"369"],
                        userx["taokeys"],
                        userx["frota"],
                        userx["promotores"],
                        userx["comissao"],
                        userx["distribuidores"],
                        userx["pas"],
                        userx["propaganda"],
                        userx["propagandauni"],
                        userx["divida"],
                        userx["turno"]]);
                }
                else{
                    socket.emit('feedback', ['danger','voce precisa estar logado para puxar o state atual da simulação'])
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    }) //OK
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
                                        socket.emit('update', [
                                            [...user["147"],"147"],
                                            [...user["148"],"148"],
                                            [...user["149"],"149"],
                                            [...user["157"],"157"],
                                            [...user["158"],"158"],
                                            [...user["159"],"159"],
                                            [...user["257"],"257"],
                                            [...user["258"],"258"],
                                            [...user["259"],"259"],
                                            [...user["267"],"267"],
                                            [...user["268"],"268"],
                                            [...user["269"],"269"],
                                            [...user["347"],"347"],
                                            [...user["348"],"348"],
                                            [...user["349"],"349"],
                                            [...user["357"],"357"],
                                            [...user["358"],"358"],
                                            [...user["359"],"359"],
                                            [...user["367"],"367"],
                                            [...user["368"],"368"],
                                            [...user["369"],"369"],
                                            user["taokeys"],
                                            user["frota"],
                                            user["promotores"],
                                            user["comissao"],
                                            user["distribuidores"],
                                            user["pas"],
                                            user["propaganda"],
                                            user["propagandauni"],
                                            user["divida"],
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
    }) //OK
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
                                        socket.emit('update', [
                                            [...user["147"],"147"],
                                            [...user["148"],"148"],
                                            [...user["149"],"149"],
                                            [...user["157"],"157"],
                                            [...user["158"],"158"],
                                            [...user["159"],"159"],
                                            [...user["257"],"257"],
                                            [...user["258"],"258"],
                                            [...user["259"],"259"],
                                            [...user["267"],"267"],
                                            [...user["268"],"268"],
                                            [...user["269"],"269"],
                                            [...user["347"],"347"],
                                            [...user["348"],"348"],
                                            [...user["349"],"349"],
                                            [...user["357"],"357"],
                                            [...user["358"],"358"],
                                            [...user["359"],"359"],
                                            [...user["367"],"367"],
                                            [...user["368"],"368"],
                                            [...user["369"],"369"],
                                            user["taokeys"],
                                            user["frota"],
                                            user["promotores"],
                                            user["comissao"],
                                            user["distribuidores"],
                                            user["pas"],
                                            user["propaganda"],
                                            user["propagandauni"],
                                            user["divida"],
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
    }) //OK
    socket.on('diminuir-promotores', (dados) => {
        let qnt = Number(dados)
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                        if(qnt > 0){
                            let novaf = userx['promotores'] - qnt
                            userx.set('promotores', novaf) 
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id, temporario: 1}))                 
                                .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        socket.emit('update', [
                                            [...user["147"],"147"],
                                            [...user["148"],"148"],
                                            [...user["149"],"149"],
                                            [...user["157"],"157"],
                                            [...user["158"],"158"],
                                            [...user["159"],"159"],
                                            [...user["257"],"257"],
                                            [...user["258"],"258"],
                                            [...user["259"],"259"],
                                            [...user["267"],"267"],
                                            [...user["268"],"268"],
                                            [...user["269"],"269"],
                                            [...user["347"],"347"],
                                            [...user["348"],"348"],
                                            [...user["349"],"349"],
                                            [...user["357"],"357"],
                                            [...user["358"],"358"],
                                            [...user["359"],"359"],
                                            [...user["367"],"367"],
                                            [...user["368"],"368"],
                                            [...user["369"],"369"],
                                            user["taokeys"],
                                            user["frota"],
                                            user["promotores"],
                                            user["comissao"],
                                            user["distribuidores"],
                                            user["pas"],
                                            user["propaganda"],
                                            user["propagandauni"],
                                            user["divida"],
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
    }) //OK
    socket.on('emprestimo', (dados) => {
        let qnt = Number(dados)
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                        if(qnt > 0){
                            userx.balanco_patrimonial = {
                                ativo: {
                                    circulante: {
                                        caixa: userx.balanco_patrimonial.ativo.circulante.caixa + qnt,
                                        estoque: userx.balanco_patrimonial.ativo.circulante.estoque,
                                        contas_a_receber: userx.balanco_patrimonial.ativo.circulante.contas_a_receber
    
                                    },
                                    n_circulante: {
                                        imobilizado: {
                                            pas: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                            frota: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                            depreciacao_frota: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                        },
                                    },
                                },
                                passivo: {
                                    contas_a_pagar: userx.balanco_patrimonial.passivo.contas_a_pagar + qnt
                                },
                                patrimonio_liquido: {
                                    capital_social: userx.balanco_patrimonial.patrimonio_liquido.capital_social,
                                    lucros_acumulados: userx.balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                                }
                            }
                            userx.set('divida', [(qnt+userx['divida'][0]), userx['divida'][1], userx['divida'][2]]) 
                            userx.taokeys = userx.taokeys + qnt
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id, temporario: 1}))                 
                                .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        socket.emit('update', [
                                            [...user["147"],"147"],
                                            [...user["148"],"148"],
                                            [...user["149"],"149"],
                                            [...user["157"],"157"],
                                            [...user["158"],"158"],
                                            [...user["159"],"159"],
                                            [...user["257"],"257"],
                                            [...user["258"],"258"],
                                            [...user["259"],"259"],
                                            [...user["267"],"267"],
                                            [...user["268"],"268"],
                                            [...user["269"],"269"],
                                            [...user["347"],"347"],
                                            [...user["348"],"348"],
                                            [...user["349"],"349"],
                                            [...user["357"],"357"],
                                            [...user["358"],"358"],
                                            [...user["359"],"359"],
                                            [...user["367"],"367"],
                                            [...user["368"],"368"],
                                            [...user["369"],"369"],
                                            user["taokeys"],
                                            user["frota"],
                                            user["promotores"],
                                            user["comissao"],
                                            user["distribuidores"],
                                            user["pas"],
                                            user["propaganda"],
                                            user["propagandauni"],
                                            user["divida"],
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
    }) //OK BALAN OK
    socket.on('quitar-divida', () => {
        //let qnt = Number(dados)
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                    if(userx.taokeys >= (userx['divida'][0] + userx['divida'][1] + userx['divida'][2])){
                        userx.balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: userx.balanco_patrimonial.ativo.circulante.caixa - (userx['divida'][0] + userx['divida'][1] + userx['divida'][2]),
                                    estoque: userx.balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: userx.balanco_patrimonial.ativo.circulante.contas_a_receber

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: userx.balanco_patrimonial.passivo.contas_a_pagar - (userx['divida'][0] + userx['divida'][1] + userx['divida'][2])
                            },
                            patrimonio_liquido: {
                                capital_social: userx.balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: userx.balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                            }
                        }
                        userx.taokeys = userx.taokeys - (userx['divida'][0] + userx['divida'][1] + userx['divida'][2])
                        userx.set('divida', [0,0,0])
    
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id, temporario: 1}))                 
                                .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        socket.emit('update', [
                                            [...user["147"],"147"],
                                            [...user["148"],"148"],
                                            [...user["149"],"149"],
                                            [...user["157"],"157"],
                                            [...user["158"],"158"],
                                            [...user["159"],"159"],
                                            [...user["257"],"257"],
                                            [...user["258"],"258"],
                                            [...user["259"],"259"],
                                            [...user["267"],"267"],
                                            [...user["268"],"268"],
                                            [...user["269"],"269"],
                                            [...user["347"],"347"],
                                            [...user["348"],"348"],
                                            [...user["349"],"349"],
                                            [...user["357"],"357"],
                                            [...user["358"],"358"],
                                            [...user["359"],"359"],
                                            [...user["367"],"367"],
                                            [...user["368"],"368"],
                                            [...user["369"],"369"],
                                            user["taokeys"],
                                            user["frota"],
                                            user["promotores"],
                                            user["comissao"],
                                            user["distribuidores"],
                                            user["pas"],
                                            user["propaganda"],
                                            user["propagandauni"],
                                            user["divida"],
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
    }) //OK BALAN OK
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
                                        socket.emit('update', [
                                            [...user["147"],"147"],
                                            [...user["148"],"148"],
                                            [...user["149"],"149"],
                                            [...user["157"],"157"],
                                            [...user["158"],"158"],
                                            [...user["159"],"159"],
                                            [...user["257"],"257"],
                                            [...user["258"],"258"],
                                            [...user["259"],"259"],
                                            [...user["267"],"267"],
                                            [...user["268"],"268"],
                                            [...user["269"],"269"],
                                            [...user["347"],"347"],
                                            [...user["348"],"348"],
                                            [...user["349"],"349"],
                                            [...user["357"],"357"],
                                            [...user["358"],"358"],
                                            [...user["359"],"359"],
                                            [...user["367"],"367"],
                                            [...user["368"],"368"],
                                            [...user["369"],"369"],
                                            user["taokeys"],
                                            user["frota"],
                                            user["promotores"],
                                            user["comissao"],
                                            user["distribuidores"],
                                            user["pas"],
                                            user["propaganda"],
                                            user["propagandauni"],
                                            user["divida"],
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
    }) //OK
    socket.on('diminuir-distribuidores', (dados) => {
        let qnt = Number(dados)
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                        if(qnt > 0){
                            let novaf = userx['distribuidores'] - qnt
                            userx.set('distribuidores', novaf) 
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id, temporario: 1}))                 
                                .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        socket.emit('update', [
                                            [...user["147"],"147"],
                                            [...user["148"],"148"],
                                            [...user["149"],"149"],
                                            [...user["157"],"157"],
                                            [...user["158"],"158"],
                                            [...user["159"],"159"],
                                            [...user["257"],"257"],
                                            [...user["258"],"258"],
                                            [...user["259"],"259"],
                                            [...user["267"],"267"],
                                            [...user["268"],"268"],
                                            [...user["269"],"269"],
                                            [...user["347"],"347"],
                                            [...user["348"],"348"],
                                            [...user["349"],"349"],
                                            [...user["357"],"357"],
                                            [...user["358"],"358"],
                                            [...user["359"],"359"],
                                            [...user["367"],"367"],
                                            [...user["368"],"368"],
                                            [...user["369"],"369"],
                                            user["taokeys"],
                                            user["frota"],
                                            user["promotores"],
                                            user["comissao"],
                                            user["distribuidores"],
                                            user["pas"],
                                            user["propaganda"],
                                            user["propagandauni"],
                                            user["divida"],
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
    }) //OK
    socket.on('diminuir-pas', (dados) => {
        let qnt = Number(dados)
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                        if(qnt > 0){
                            let novaf = userx['pas'] - qnt
                            userx.set('pas', novaf) 
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id, temporario: 1}))                 
                                .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        socket.emit('update', [
                                            [...user["147"],"147"],
                                            [...user["148"],"148"],
                                            [...user["149"],"149"],
                                            [...user["157"],"157"],
                                            [...user["158"],"158"],
                                            [...user["159"],"159"],
                                            [...user["257"],"257"],
                                            [...user["258"],"258"],
                                            [...user["259"],"259"],
                                            [...user["267"],"267"],
                                            [...user["268"],"268"],
                                            [...user["269"],"269"],
                                            [...user["347"],"347"],
                                            [...user["348"],"348"],
                                            [...user["349"],"349"],
                                            [...user["357"],"357"],
                                            [...user["358"],"358"],
                                            [...user["359"],"359"],
                                            [...user["367"],"367"],
                                            [...user["368"],"368"],
                                            [...user["369"],"369"],
                                            user["taokeys"],
                                            user["frota"],
                                            user["promotores"],
                                            user["comissao"],
                                            user["distribuidores"],
                                            user["pas"],
                                            user["propaganda"],
                                            user["propagandauni"],
                                            user["divida"],
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
    }) //OK
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
                                        socket.emit('update', [
                                            [...user["147"],"147"],
                                            [...user["148"],"148"],
                                            [...user["149"],"149"],
                                            [...user["157"],"157"],
                                            [...user["158"],"158"],
                                            [...user["159"],"159"],
                                            [...user["257"],"257"],
                                            [...user["258"],"258"],
                                            [...user["259"],"259"],
                                            [...user["267"],"267"],
                                            [...user["268"],"268"],
                                            [...user["269"],"269"],
                                            [...user["347"],"347"],
                                            [...user["348"],"348"],
                                            [...user["349"],"349"],
                                            [...user["357"],"357"],
                                            [...user["358"],"358"],
                                            [...user["359"],"359"],
                                            [...user["367"],"367"],
                                            [...user["368"],"368"],
                                            [...user["369"],"369"],
                                            user["taokeys"],
                                            user["frota"],
                                            user["promotores"],
                                            user["comissao"],
                                            user["distribuidores"],
                                            user["pas"],
                                            user["propaganda"],
                                            user["propagandauni"],
                                            user["divida"],
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
    }) //OK
    socket.on('propaganda-unitaria', (dados) => {
        let qnt = Number(dados)
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                        if(qnt > 0 && userx.taokeys >= qnt){
                            userx.balanco_patrimonial = {
                                ativo: {
                                    circulante: {
                                        caixa: userx.balanco_patrimonial.ativo.circulante.caixa - qnt,
                                        estoque: userx.balanco_patrimonial.ativo.circulante.estoque,
                                        contas_a_receber: userx.balanco_patrimonial.ativo.circulante.contas_a_receber
    
                                    },
                                    n_circulante: {
                                        imobilizado: {
                                            pas: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                            frota: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                            depreciacao_frota: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                        },
                                    },
                                },
                                passivo: {
                                    contas_a_pagar: userx.balanco_patrimonial.passivo.contas_a_pagar
                                },
                                patrimonio_liquido: {
                                    capital_social: userx.balanco_patrimonial.patrimonio_liquido.capital_social,
                                    lucros_acumulados: userx.balanco_patrimonial.patrimonio_liquido.lucros_acumulados - qnt
                                }
                            }
                            userx.dre = {
                                receita: userx.dre.receita,
                                cmv: userx.dre.cmv,
                                despesas_administrativas: userx.dre.despesas_administrativas + qnt,
                                despesas_vendas: userx.dre.despesas_vendas,
                                despesas_financeiras: userx.dre.despesas_financeiras,
                                depreciacao_e_amortizacao: userx.dre.depreciacao_e_amortizacao,
                                ir: userx.dre.ir
                            }
                            
                            let novaf = Number(userx['propagandauni']) + qnt
                            userx.taokeys = userx.taokeys - qnt
                            userx.set('propagandauni', novaf) 
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id, temporario: 1}))                 
                                .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        socket.emit('update', [
                                            [...user["147"],"147"],
                                            [...user["148"],"148"],
                                            [...user["149"],"149"],
                                            [...user["157"],"157"],
                                            [...user["158"],"158"],
                                            [...user["159"],"159"],
                                            [...user["257"],"257"],
                                            [...user["258"],"258"],
                                            [...user["259"],"259"],
                                            [...user["267"],"267"],
                                            [...user["268"],"268"],
                                            [...user["269"],"269"],
                                            [...user["347"],"347"],
                                            [...user["348"],"348"],
                                            [...user["349"],"349"],
                                            [...user["357"],"357"],
                                            [...user["358"],"358"],
                                            [...user["359"],"359"],
                                            [...user["367"],"367"],
                                            [...user["368"],"368"],
                                            [...user["369"],"369"],
                                            user["taokeys"],
                                            user["frota"],
                                            user["promotores"],
                                            user["comissao"],
                                            user["distribuidores"],
                                            user["pas"],
                                            user["propaganda"],
                                            user["propagandauni"],
                                            user["divida"],
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
    }) //OK BALAN OK DRE OK
    socket.on('aumentar-propaganda', (dados) => {
        let qnt = Number(dados)
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                        if(qnt > 0 && userx.taokeys >= qnt){
                            userx.balanco_patrimonial = {
                                ativo: {
                                    circulante: {
                                        caixa: userx.balanco_patrimonial.ativo.circulante.caixa - qnt,
                                        estoque: userx.balanco_patrimonial.ativo.circulante.estoque,
                                        contas_a_receber: userx.balanco_patrimonial.ativo.circulante.contas_a_receber
    
                                    },
                                    n_circulante: {
                                        imobilizado: {
                                            pas: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                            frota: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                            depreciacao_frota: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                        },
                                    },
                                },
                                passivo: {
                                    contas_a_pagar: userx.balanco_patrimonial.passivo.contas_a_pagar
                                },
                                patrimonio_liquido: {
                                    capital_social: userx.balanco_patrimonial.patrimonio_liquido.capital_social,
                                    lucros_acumulados: userx.balanco_patrimonial.patrimonio_liquido.lucros_acumulados - qnt
                                }
                            }
                            userx.dre = {
                                receita: userx.dre.receita,
                                cmv: userx.dre.cmv,
                                despesas_administrativas: userx.dre.despesas_administrativas + qnt,
                                despesas_vendas: userx.dre.despesas_vendas,
                                despesas_financeiras: userx.dre.despesas_financeiras,
                                depreciacao_e_amortizacao: userx.dre.depreciacao_e_amortizacao,
                                ir: userx.dre.ir
                            }   
                            let novaf = userx['propaganda'] + qnt
                            userx.taokeys = userx.taokeys - qnt
                            userx.set('propaganda', novaf) 
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id, temporario: 1}))                 
                                .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        socket.emit('update', [
                                            [...user["147"],"147"],
                                            [...user["148"],"148"],
                                            [...user["149"],"149"],
                                            [...user["157"],"157"],
                                            [...user["158"],"158"],
                                            [...user["159"],"159"],
                                            [...user["257"],"257"],
                                            [...user["258"],"258"],
                                            [...user["259"],"259"],
                                            [...user["267"],"267"],
                                            [...user["268"],"268"],
                                            [...user["269"],"269"],
                                            [...user["347"],"347"],
                                            [...user["348"],"348"],
                                            [...user["349"],"349"],
                                            [...user["357"],"357"],
                                            [...user["358"],"358"],
                                            [...user["359"],"359"],
                                            [...user["367"],"367"],
                                            [...user["368"],"368"],
                                            [...user["369"],"369"],
                                            user["taokeys"],
                                            user["frota"],
                                            user["promotores"],
                                            user["comissao"],
                                            user["distribuidores"],
                                            user["pas"],
                                            user["propaganda"],
                                            user["propagandauni"],
                                            user["divida"],
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
    }) //OK BALAN OK DRE OK
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
    }) //OK
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
                                        socket.emit('update', [
                                            [...user["147"],"147"],
                                            [...user["148"],"148"],
                                            [...user["149"],"149"],
                                            [...user["157"],"157"],
                                            [...user["158"],"158"],
                                            [...user["159"],"159"],
                                            [...user["257"],"257"],
                                            [...user["258"],"258"],
                                            [...user["259"],"259"],
                                            [...user["267"],"267"],
                                            [...user["268"],"268"],
                                            [...user["269"],"269"],
                                            [...user["347"],"347"],
                                            [...user["348"],"348"],
                                            [...user["349"],"349"],
                                            [...user["357"],"357"],
                                            [...user["358"],"358"],
                                            [...user["359"],"359"],
                                            [...user["367"],"367"],
                                            [...user["368"],"368"],
                                            [...user["369"],"369"],
                                            user["taokeys"],
                                            user["frota"],
                                            user["promotores"],
                                            user["comissao"],
                                            user["distribuidores"],
                                            user["pas"],
                                            user["propaganda"],
                                            user["propagandauni"],
                                            user["divida"],
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
    }) //OK
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
                                        socket.emit('update', [
                                            [...user["147"],"147"],
                                            [...user["148"],"148"],
                                            [...user["149"],"149"],
                                            [...user["157"],"157"],
                                            [...user["158"],"158"],
                                            [...user["159"],"159"],
                                            [...user["257"],"257"],
                                            [...user["258"],"258"],
                                            [...user["259"],"259"],
                                            [...user["267"],"267"],
                                            [...user["268"],"268"],
                                            [...user["269"],"269"],
                                            [...user["347"],"347"],
                                            [...user["348"],"348"],
                                            [...user["349"],"349"],
                                            [...user["357"],"357"],
                                            [...user["358"],"358"],
                                            [...user["359"],"359"],
                                            [...user["367"],"367"],
                                            [...user["368"],"368"],
                                            [...user["369"],"369"],
                                            user["taokeys"],
                                            user["frota"],
                                            user["promotores"],
                                            user["comissao"],
                                            user["distribuidores"],
                                            user["pas"],
                                            user["propaganda"],
                                            user["propagandauni"],
                                            user["divida"],
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
    }) //OK fazet teste (so ativa se tiver 1 ou 0 servicos ja ativos)
    socket.on('comprar-servico', (dados) => {
        let tipo = dados[0];
        let qnti = dados[1];
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => { 
                    if(userx !== null){
                        //console.log(user.taokeys + ' ccccccccccccccc');
                        if(userx['taokeys'] >= qnti*userx[tipo][2] && userx[tipo][1] !== 2){
                            userx.balanco_patrimonial = {
                                ativo: {
                                    circulante: {
                                        caixa: userx.balanco_patrimonial.ativo.circulante.caixa - qnti*userx[tipo][2],
                                        estoque: userx.balanco_patrimonial.ativo.circulante.estoque + qnti*userx[tipo][2],
                                        contas_a_receber: userx.balanco_patrimonial.ativo.circulante.contas_a_receber
    
                                    },
                                    n_circulante: {
                                        imobilizado: {
                                            pas: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                            frota: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                            depreciacao_frota: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                        },
                                    },
                                },
                                passivo: {
                                    contas_a_pagar: userx.balanco_patrimonial.passivo.contas_a_pagar
                                },
                                patrimonio_liquido: {
                                    capital_social: userx.balanco_patrimonial.patrimonio_liquido.capital_social,
                                    lucros_acumulados: userx.balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                                }
                            }
                            if(userx[tipo][1] !== 3 && userx[tipo][1] !== 0){
                           //console.log(userx[tipo][1] + " <====")
                           //userx[tipo][1] = 1
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
                            /*
                            userx.balanco_patrimonial = { 
                                                        ativo: userx.balanco_patrimonial.ativo + 20,
                                                        passivo: userx.balanco_patrimonial.passivo,
                                                        ativo_circulante: userx.balanco_patrimonial.ativo_circulante + 1
                        
                                                        }
                                                        */
                           userx.set(tipo, array_dados)
                           userx.taokeys = userx.taokeys - qnti*userx[tipo][2]
                           userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id, temporario: 1}))                 
                                .then((user) => {
                                  //  console.log(userx[tipo][1] + ' <----userx(Schema trabalhado aqui)')
                                  //  console.log(user[tipo][1] + ' <=====user(recem pesquisado)')
                                    if(user.taokeys == userx.taokeys){
                                        socket.emit('update', [
                                            [...user["147"],"147"],
                                            [...user["148"],"148"],
                                            [...user["149"],"149"],
                                            [...user["157"],"157"],
                                            [...user["158"],"158"],
                                            [...user["159"],"159"],
                                            [...user["257"],"257"],
                                            [...user["258"],"258"],
                                            [...user["259"],"259"],
                                            [...user["267"],"267"],
                                            [...user["268"],"268"],
                                            [...user["269"],"269"],
                                            [...user["347"],"347"],
                                            [...user["348"],"348"],
                                            [...user["349"],"349"],
                                            [...user["357"],"357"],
                                            [...user["358"],"358"],
                                            [...user["359"],"359"],
                                            [...user["367"],"367"],
                                            [...user["368"],"368"],
                                            [...user["369"],"369"],
                                            user["taokeys"],
                                            user["frota"],
                                            user["promotores"],
                                            user["comissao"],
                                            user["distribuidores"],
                                            user["pas"],
                                            user["propaganda"],
                                            user["propagandauni"],
                                            user["divida"],
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
                    //console.log(user.taokeys)
                    }
                    else{
                        socket.emit('feedback', ['danger','voce precisa estar logado para puxar o state atual da simulação'])
                    }
            }) 
            .catch((err) => { console.log('falha na comunicacao com o banco de dados para o ' +socket.id+ " - " + err)
    })
    }) //OK BALAN OK
    socket.on('pesquisar-pas', () => {
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => { 
                    if(userx !== null){
                        userx.balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: userx.balanco_patrimonial.ativo.circulante.caixa - 2160,
                                    estoque: userx.balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: userx.balanco_patrimonial.ativo.circulante.contas_a_receber

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: userx.balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: userx.balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: userx.balanco_patrimonial.patrimonio_liquido.lucros_acumulados - 2160
                            }
                        }
                        userx.dre = {
                            receita: userx.dre.receita,
                            cmv: userx.dre.cmv,
                            despesas_administrativas: userx.dre.despesas_administrativas + 2160,
                            despesas_vendas: userx.dre.despesas_vendas,
                            despesas_financeiras: userx.dre.despesas_financeiras,
                            depreciacao_e_amortizacao: userx.dre.depreciacao_e_amortizacao,
                            ir: userx.dre.ir
                        }
                        //console.log(user.taokeys + ' ccccccccccccccc');
                        if(userx['taokeys'] >= 2160){
                           //console.log(user.taokeys + " <====")
                           userx.taokeys = userx.taokeys - 2160
                           userx['npesquisas'] = userx['npesquisas'] + 1 
                           //console.log(user.taokeys)
                           userx.save()
                            .then(() => {
                                Data.findOne({ativo: 1, instancia: userx.instancia})
                                    .then((dados) => {
                                        if(dados !== null){
                                        socket.emit('resposta-pesquisa', dados['total_pas'])
                                        socket.emit('update', [
                                            [...userx["147"],"147"],
                                            [...userx["148"],"148"],
                                            [...userx["149"],"149"],
                                            [...userx["157"],"157"],
                                            [...userx["158"],"158"],
                                            [...userx["159"],"159"],
                                            [...userx["257"],"257"],
                                            [...userx["258"],"258"],
                                            [...userx["259"],"259"],
                                            [...userx["267"],"267"],
                                            [...userx["268"],"268"],
                                            [...userx["269"],"269"],
                                            [...userx["347"],"347"],
                                            [...userx["348"],"348"],
                                            [...userx["349"],"349"],
                                            [...userx["357"],"357"],
                                            [...userx["358"],"358"],
                                            [...userx["359"],"359"],
                                            [...userx["367"],"367"],
                                            [...userx["368"],"368"],
                                            [...userx["369"],"369"],
                                            userx["taokeys"],
                                            userx["frota"],
                                            userx["promotores"],
                                            userx["comissao"],
                                            userx["distribuidores"],
                                            userx["pas"],
                                            userx["propaganda"],
                                            userx["propagandauni"],
                                            userx["divida"],
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
    }) //OK BALAN OK DRE OK
    socket.on('pesquisar-distribuidores', () => {
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => { 
                    if(userx !== null){
                        userx.balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: userx.balanco_patrimonial.ativo.circulante.caixa - 2160,
                                    estoque: userx.balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: userx.balanco_patrimonial.ativo.circulante.contas_a_receber

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: userx.balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: userx.balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: userx.balanco_patrimonial.patrimonio_liquido.lucros_acumulados - 2160
                            }
                        }
                        userx.dre = {
                            receita: userx.dre.receita,
                            cmv: userx.dre.cmv,
                            despesas_administrativas: userx.dre.despesas_administrativas + 2160,
                            despesas_vendas: userx.dre.despesas_vendas,
                            despesas_financeiras: userx.dre.despesas_financeiras,
                            depreciacao_e_amortizacao: userx.dre.depreciacao_e_amortizacao,
                            ir: userx.dre.ir
                        }
                        //console.log(user.taokeys + ' ccccccccccccccc');
                        if(userx['taokeys'] >= 2160){
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
                                        socket.emit('update', [
                                            [...userx["147"],"147"],
                                            [...userx["148"],"148"],
                                            [...userx["149"],"149"],
                                            [...userx["157"],"157"],
                                            [...userx["158"],"158"],
                                            [...userx["159"],"159"],
                                            [...userx["257"],"257"],
                                            [...userx["258"],"258"],
                                            [...userx["259"],"259"],
                                            [...userx["267"],"267"],
                                            [...userx["268"],"268"],
                                            [...userx["269"],"269"],
                                            [...userx["347"],"347"],
                                            [...userx["348"],"348"],
                                            [...userx["349"],"349"],
                                            [...userx["357"],"357"],
                                            [...userx["358"],"358"],
                                            [...userx["359"],"359"],
                                            [...userx["367"],"367"],
                                            [...userx["368"],"368"],
                                            [...userx["369"],"369"],
                                            userx["taokeys"],
                                            userx["frota"],
                                            userx["promotores"],
                                            userx["comissao"],
                                            userx["distribuidores"],
                                            userx["pas"],
                                            userx["propaganda"],
                                            userx["propagandauni"],
                                            userx["divida"],
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
    }) //OK BALAN OK DRE OK
    //
    socket.on('pesquisar-participacao-servicos', (input) => {
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => { 
                    if(userx !== null && input.length < 3){
                        //console.log(user.taokeys + ' ccccccccccccccc');
                        if(userx['taokeys'] >= 10800 && input.length == 1){
                            userx.balanco_patrimonial = {
                                ativo: {
                                    circulante: {
                                        caixa: userx.balanco_patrimonial.ativo.circulante.caixa - 10800,
                                        estoque: userx.balanco_patrimonial.ativo.circulante.estoque,
                                        contas_a_receber: userx.balanco_patrimonial.ativo.circulante.contas_a_receber
    
                                    },
                                    n_circulante: {
                                        imobilizado: {
                                            pas: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                            frota: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                            depreciacao_frota: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                        },
                                    },
                                },
                                passivo: {
                                    contas_a_pagar: userx.balanco_patrimonial.passivo.contas_a_pagar
                                },
                                patrimonio_liquido: {
                                    capital_social: userx.balanco_patrimonial.patrimonio_liquido.capital_social,
                                    lucros_acumulados: userx.balanco_patrimonial.patrimonio_liquido.lucros_acumulados - 10800
                                }
                            }
                            userx.dre = {
                                receita: userx.dre.receita,
                                cmv: userx.dre.cmv,
                                despesas_administrativas: userx.dre.despesas_administrativas + 10800,
                                despesas_vendas: userx.dre.despesas_vendas,
                                despesas_financeiras: userx.dre.despesas_financeiras,
                                depreciacao_e_amortizacao: userx.dre.depreciacao_e_amortizacao,
                                ir: userx.dre.ir
                            }
                           //console.log(user.taokeys + " <====")
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
                                        socket.emit('resposta-pesquisar-participacao-servicos', respostaP)
                                        socket.emit('update', [
                                            [...userx["147"],"147"],
                                            [...userx["148"],"148"],
                                            [...userx["149"],"149"],
                                            [...userx["157"],"157"],
                                            [...userx["158"],"158"],
                                            [...userx["159"],"159"],
                                            [...userx["257"],"257"],
                                            [...userx["258"],"258"],
                                            [...userx["259"],"259"],
                                            [...userx["267"],"267"],
                                            [...userx["268"],"268"],
                                            [...userx["269"],"269"],
                                            [...userx["347"],"347"],
                                            [...userx["348"],"348"],
                                            [...userx["349"],"349"],
                                            [...userx["357"],"357"],
                                            [...userx["358"],"358"],
                                            [...userx["359"],"359"],
                                            [...userx["367"],"367"],
                                            [...userx["368"],"368"],
                                            [...userx["369"],"369"],
                                            userx["taokeys"],
                                            userx["frota"],
                                            userx["promotores"],
                                            userx["comissao"],
                                            userx["distribuidores"],
                                            userx["pas"],
                                            userx["propaganda"],
                                            userx["propagandauni"],
                                            userx["divida"],
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
                                    ativo: {
                                        circulante: {
                                            caixa: userx.balanco_patrimonial.ativo.circulante.caixa - 14400,
                                            estoque: userx.balanco_patrimonial.ativo.circulante.estoque,
                                            contas_a_receber: userx.balanco_patrimonial.ativo.circulante.contas_a_receber
        
                                        },
                                        n_circulante: {
                                            imobilizado: {
                                                pas: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                                frota: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                                depreciacao_frota: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                            },
                                        },
                                    },
                                    passivo: {
                                        contas_a_pagar: userx.balanco_patrimonial.passivo.contas_a_pagar
                                    },
                                    patrimonio_liquido: {
                                        capital_social: userx.balanco_patrimonial.patrimonio_liquido.capital_social,
                                        lucros_acumulados: userx.balanco_patrimonial.patrimonio_liquido.lucros_acumulados - 14400
                                    }
                                }
                                userx.dre = {
                                    receita: userx.dre.receita,
                                    cmv: userx.dre.cmv,
                                    despesas_administrativas: userx.dre.despesas_administrativas + 14400,
                                    despesas_vendas: userx.dre.despesas_vendas,
                                    despesas_financeiras: userx.dre.despesas_financeiras,
                                    depreciacao_e_amortizacao: userx.dre.depreciacao_e_amortizacao,
                                    ir: userx.dre.ir
                                }
                                //console.log(user.taokeys + " <====")
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
                                             socket.emit('resposta-pesquisa', respostaP)
                                             socket.emit('update', [
                                                [...userx["147"],"147"],
                                                [...userx["148"],"148"],
                                                [...userx["149"],"149"],
                                                [...userx["157"],"157"],
                                                [...userx["158"],"158"],
                                                [...userx["159"],"159"],
                                                [...userx["257"],"257"],
                                                [...userx["258"],"258"],
                                                [...userx["259"],"259"],
                                                [...userx["267"],"267"],
                                                [...userx["268"],"268"],
                                                [...userx["269"],"269"],
                                                [...userx["347"],"347"],
                                                [...userx["348"],"348"],
                                                [...userx["349"],"349"],
                                                [...userx["357"],"357"],
                                                [...userx["358"],"358"],
                                                [...userx["359"],"359"],
                                                [...userx["367"],"367"],
                                                [...userx["368"],"368"],
                                                [...userx["369"],"369"],
                                                userx["taokeys"],
                                                userx["frota"],
                                                userx["promotores"],
                                                userx["comissao"],
                                                userx["distribuidores"],
                                                userx["pas"],
                                                userx["propaganda"],
                                                userx["propagandauni"],
                                                userx["divida"],
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
    }) //FALTA COLOCAR O VALOR CERTO DE DINHEIROS PARA A PESQUISA DE UM SO SERVICO E DE DOIS! E FALTA TESTAR // PARA FUNCIONAR CORRETAMENTE OS INPUTS TEM Q SMP VIR DENTRO DE UM ARRAY MSM Q SEJA A PESQUISA DE UM SO SERVIÇO
    // BALAN OK DRE OK
    socket.on('pesquisar-servicos-oferecidos-concorrencia', () => {
        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => { 
                    if(userx !== null){
                        //console.log(user.taokeys + ' ccccccccccccccc');
                        if(userx['taokeys'] >= 2160){
                            userx.balanco_patrimonial = {
                                ativo: {
                                    circulante: {
                                        caixa: userx.balanco_patrimonial.ativo.circulante.caixa - 2160,
                                        estoque: userx.balanco_patrimonial.ativo.circulante.estoque,
                                        contas_a_receber: userx.balanco_patrimonial.ativo.circulante.contas_a_receber
    
                                    },
                                    n_circulante: {
                                        imobilizado: {
                                            pas: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                            frota: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                            depreciacao_frota: userx.balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                        },
                                    },
                                },
                                passivo: {
                                    contas_a_pagar: userx.balanco_patrimonial.passivo.contas_a_pagar
                                },
                                patrimonio_liquido: {
                                    capital_social: userx.balanco_patrimonial.patrimonio_liquido.capital_social,
                                    lucros_acumulados: userx.balanco_patrimonial.patrimonio_liquido.lucros_acumulados - 2160
                                }
                            }
                            userx.dre = {
                                receita: userx.dre.receita,
                                cmv: userx.dre.cmv,
                                despesas_administrativas: userx.dre.despesas_administrativas + 2160,
                                despesas_vendas: userx.dre.despesas_vendas,
                                despesas_financeiras: userx.dre.despesas_financeiras,
                                depreciacao_e_amortizacao: userx.dre.depreciacao_e_amortizacao,
                                ir: userx.dre.ir
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
                                        socket.emit('resposta-pesquisa', dados['modelos_oferecidos'])
                                        socket.emit('update', [
                                            [...userx["147"],"147"],
                                            [...userx["148"],"148"],
                                            [...userx["149"],"149"],
                                            [...userx["157"],"157"],
                                            [...userx["158"],"158"],
                                            [...userx["159"],"159"],
                                            [...userx["257"],"257"],
                                            [...userx["258"],"258"],
                                            [...userx["259"],"259"],
                                            [...userx["267"],"267"],
                                            [...userx["268"],"268"],
                                            [...userx["269"],"269"],
                                            [...userx["347"],"347"],
                                            [...userx["348"],"348"],
                                            [...userx["349"],"349"],
                                            [...userx["357"],"357"],
                                            [...userx["358"],"358"],
                                            [...userx["359"],"359"],
                                            [...userx["367"],"367"],
                                            [...userx["368"],"368"],
                                            [...userx["369"],"369"],
                                            userx["taokeys"],
                                            userx["frota"],
                                            userx["promotores"],
                                            userx["comissao"],
                                            userx["distribuidores"],
                                            userx["pas"],
                                            userx["propaganda"],
                                            userx["propagandauni"],
                                            userx["divida"],
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
    }) //OK BALAN OK DRE OK
    socket.on('puxar-balancos',  (turno) => {

        Aluno.findOne({sockid: socket.id, temporario: 1})
            .then((userx) => {
                if(userx !== null){
                        
                            Aluno.findOne({ cooperativa: userx.cooperativa, backup: 1, instancia: userx.instancia, turno: turno })                 
                                .then((balancos) => {
                                    
                                        socket.emit('balancos', { 
                                            balanco_patrimonial: balancos.balanco_patrimonial,
                                            dre: balancos.dre,
                                            fluxo_de_caixa: balancos.fluxo_de_caixa
                                         });
        
                                                      
                                })
                                .catch((err) => {console.log(err)})
                          

            }
                else{
                    socket.emit('feedback', ['danger','voce precisa estar logado para puxar o state atual da simulação'])
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
                                socket.emit('feedback', ['danger','ja existe uma instancia com esse nome'])
                            }
                            else{
                                Data.findOne({login_adm: creden[0]})
                                    .then((userL) => {
                                        if(userL == null){
                                            let jogo = new Data({login_adm: creden[0], iniciado: 1, senha_adm: creden[1], instancia: creden[2], senha_instancia: creden[3], turno: 0, oferta_mercado: 800000})
                                            jogo.save()
                                                .then(() => {
                                                    console.log('>>> Instancia: ' + creden[2] + ' registrada com sucesso')    
                                                    socket.emit('registro-instancia-completo', creden[0])
                                                })
                                                .catch((err) => {console.log(err)})
                                        }
                                        else{
                                            socket.emit('feedback', ['danger','ja existe ums instancia com esse LOGIN de administrador'])
                                        }

                                    })
                            }
                        })
                }
                else{socket.emit('feedback', ['danger','senha mestra incorreta'])}  
    })
    socket.on('login-adm', (creden) => {
        Data.findOne({sockid: socket.id})
            .then((ll) => {
                if(ll !== null){socket.emit('feedback', ['danger','voce ja esta conectado'])}
                else{
                    Data.findOne({login_adm: creden[0], senha_adm: creden[1]})
                        .then((adm) => {
                            if(adm !== null){
                                adm.sockid = socket.id
                                adm.save()
                                    .then(() => {
                                        Aluno.find({instancia: adm.instancia, temporario: 0})
                                            .then((cooperativas) => {
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

                  

    }) //OK falta lista-la
     //falta implementar a Sazonalidade (input da Demanda vai ser colocado por Ano e destribuido pelos turnos numa proporcao fixa)
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
                let scorep = 0;
                //let soma4 = 0
                let soma5 = 0
                let soma6 = 0
                let soma7 = 0
                for(let i = 0; i < users.length; i++){
                    soma = soma + users[i]['distribuidores']
                    soma1 = soma1 + users[i]['pas']
                    soma2 = soma2 + users[i]['promotores']
                    soma3 = soma3 + users[i]['comissao']
                    //soma4 = soma4 + users[i]['distribuidores']
                    soma5 = soma5 + users[i]['propaganda']
                    soma6 = soma6 + users[i]['propagandauni']
                    soma7 = soma7 + users[i]['npesquisas']
                    //
                
                    
                    for(let r = 0; r < index.length; r++){

                        if(users[i][index[r]][4] > 0 && users[i][index[r]][1] == 1){
                            users[i]['scorepreco'][0] = users[i]['scorepreco'][0] + users[i][index[r]][4] //soma vendas planejadas
                            users[i]['scorepreco'][1] = users[i]['scorepreco'][1] + users[i][index[r]][4]*users[i][index[r]][3] //soma de -vendas planejadas vezes preço de venda( = faturamento planejado)- 
                          } 

                    }
                    if(users[i]['147'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['147'][4]*5 // se quiser alterar o peso que cada serviço tem para a competição pela parcel de mercado distribuida com base na "qualidade" dos serviços oferecidos
                      }
                    if(users[i]['159'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['159'][4]*5
           
                      }
                    if(users[i]['149'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['149'][4]*5          
                            }
                    if(users[i]['148'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['148'][4]*5            
                            }
                    if(users[i]['158'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['158'][4]*5        
                            }
                    if(users[i]['157'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['157'][4]*5            
                            }
                    if(users[i]['257'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['257'][4]*6         
                    }
                    if(users[i]['258'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['258'][4]*6        
                    }
                    if(users[i]['259'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['259'][4]*6          
                    }
                    if(users[i]['267'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['267'][4]*6          
                    }
                    if(users[i]['268'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['268'][4]*6           
                    }
                    if(users[i]['269'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['269'][4]*6          
                    }
                    if(users[i]['347'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['347'][4]*7           
                    }
                    if(users[i]['348'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['348'][4]*7            
                    }
                    if(users[i]['349'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['349'][4]*7           
                    }
                    if(users[i]['357'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['357'][4]*7          
                    }
                    if(users[i]['358'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['358'][4]*7          
                    }
                    if(users[i]['359'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['359'][4]*7          
                    }
                    if(users[i]['367'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['367'][4]*7         
                    }
                    if(users[i]['368'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['368'][4]*7           
                    }
                    if(users[i]['369'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['369'][4]*7      
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
                console.log('|| ' + preco_medio + ' <-- PRECO MEDIO ||')
                for(let i = 0; i < users.length; i++){
                    let media_user = users[i]['scorepreco'][1]/users[i]['scorepreco'][0]
                    dist = dist + preco_medio/media_user
                    let somaF = 0
                    for(let f = 0; f < 12; f++){
                        somaF = somaF + users[i]['frota'][f]
                        if(users[i]['frota'][f] > 0){
                            
                            users[i].balanco_patrimonial = {
                                ativo: {
                                    circulante: {
                                        caixa: users[i].balanco_patrimonial.ativo.circulante.caixa,
                                        estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                        contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber
    
                                    },
                                    n_circulante: {
                                        imobilizado: {
                                            pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                            frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                            depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota - 2400*users[i]['frota'][f]
                                        }
                                    }
                                },
                                passivo: {
                                    contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                },
                                patrimonio_liquido: {
                                    capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                    lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - 2400*users[i]['frota'][f]
                                }
                            }
                            users[i].dre = {
                                receita: users[i].dre.receita,
                                cmv: users[i].dre.cmv,
                                despesas_administrativas: users[i].dre.despesas_administrativas,
                                despesas_vendas: users[i].dre.despesas_vendas,
                                despesas_financeiras: users[i].dre.despesas_financeiras,
                                depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao + 2400*users[i]['frota'][f],
                                ir: users[i].dre.ir
                            }
                        }
                        if(users[i]['frota'][f] > 0 && f == 11){
                            users[i].balanco_patrimonial = {
                                ativo: {
                                    circulante: {
                                        caixa: users[i].balanco_patrimonial.ativo.circulante.caixa,
                                        estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                        contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber
    
                                    },
                                    n_circulante: {
                                        imobilizado: {
                                            pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                            frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota - 57600*users[i]['frota'][f],
                                            depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota - 57600*users[i]['frota'][f]
                                        },
                                    },
                                },
                                passivo: {
                                    contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                },
                                patrimonio_liquido: {
                                    capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                    lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                                }
                            }
                        }
                    }
                    
                    users[i]['frota'].pop(); //depreciacao do veiculo! a cada turno apaga o ultimo elemento do array e adiciona um 0 no inicio, logo tds os elemtos q sobram avancam uma casa pra direita ou seja depreciam mais
                    users[i]['frota'].unshift(0);
                    for(let r = 0; r < index.length; r++){ //desconto no custo untario por ter experiencia no servico
                        if(users[i][index[r]][5] > 36000){
                            let des = (users[i][index[r]][5] - users[i][index[r]][5]%36000)/36000
                            users[i].set(index[r], [users[i][index[r]][0], users[i][index[r]][1], (users[i][index[r]][2]*(Math.pow(0.9,des))), users[i][index[r]][3], users[i][index[r]][4], (users[i][index[r]][5] - des*36000), users[i][index[r]][6], users[i][index[r]][7]]) //Desconta 10% no custo unitario do serviço toda vez que o player obtem 36 mil ou mais vendas acumuladas.   
                        }
                    }
                }
                
                function sazonalidade(DemandaAnual) { //AJUSTAR VALORES!
                    if(adm.turno == 1){
                        return DemandaAnual*0.10
                    }
                    else if(adm.turno == 2){
                        return DemandaAnual*0.20
                    }
                    else if(adm.turno == 3){    
                        return DemandaAnual*0.12
                    }
                    else if(adm.turno == 4){
                        return DemandaAnual*0.12
                    }
                    else if(adm.turno == 5){
                        return DemandaAnual*0.21
                    }
                    else if(adm.turno == 6){
                        return DemandaAnual*0.25
                    }
                    else{
                        console.log('||-=-=-=-=-=-=-=-=-=-=-||==> Game Over <==||-=-=-=-=-=-=-=-=-=-=-||')
                        return DemandaAnual*0
                        
                    }
                }
                let demanda = sazonalidade(adm['oferta_mercado'])
                for(let i = 0; i < users.length; i++){ 

                    let media_user = users[i]['scorepreco'][1]/users[i]['scorepreco'][0]
                    let scorepp = preco_medio/media_user
                    users[i]['faturamento'] = (0.09*users[i]['distribuidores']/soma + 0.09*users[i]['pas']/soma1 + 0.07*users[i]['promotores']/soma2 + 0.06*users[i]['comissao']/soma3 + 0.1*users[i]['propaganda']/soma5 + 0.12*users[i]['scoremod']/scorex + 0.3*(scorepp/dist) + 0.12*users[i]['propagandauni']/soma6 + 0.05*users[i]['npesquisas']/soma7)*demanda
                    console.log("Parcela de mercado conquistada para o player >>>" + users[i]['cooperativa'] + '<<<   || DISTRIBUIDORES (max 0.09) ==> ' + 0.09*users[i]['distribuidores']/soma + '<== || P.A.S. (max 0.09) ==>  ' + 0.09*users[i]['pas']/soma1 + '<== || PROMOTORES (max 0.07) ==> ' + 0.07*users[i]['promotores']/soma2 + '<== || COMISSAO (max 0.06) ==> ' + 0.06*users[i]['comissao']/soma3 + '<== || PROPAGANDA (max 0.10) ==> ' + 0.1*users[i]['propaganda']/soma5 + ' <== || QUALIDADE_DO_SERVICO (max 0.12) ==> ' + 0.12*users[i]['scoremod']/scorex + '<== || PRECO_DE_VENDA (max 0.30) ==> ' + 0.3*(scorepp/dist) + ' <== || PROPAGANDA_UNITARIA (max 0.12) ==> ' + 0.12*users[i]['propagandauni']/soma6 + '<== || NUMERO_DE_PESQUISAS (max 0.05) ==> ' + 0.05*users[i]['npesquisas']/soma7 + ' || |=|=|=| SOMA: ' + (0.05*users[i]['npesquisas']/soma7 + 0.12*users[i]['propagandauni']/soma6 + 0.3*(scorepp/dist) + 0.12*users[i]['scoremod']/scorex + 0.1*users[i]['propaganda']/soma5 + 0.06*users[i]['comissao']/soma3 + 0.07*users[i]['promotores']/soma2 + 0.09*users[i]['pas']/soma1 + 0.09*users[i]['distribuidores']/soma) + ' |=|=|=|')
                    console.log((0.09*users[i]['distribuidores']/soma + 0.09*users[i]['pas']/soma1 + 0.07*users[i]['promotores']/soma2 + 0.06*users[i]['comissao']/soma3 + 0.1*users[i]['propaganda']/soma5 + 0.12*users[i]['scoremod']/scorex + 0.3*(scorepp/dist) + 0.12*users[i]['propagandauni']/soma6 + 0.05*users[i]['npesquisas']/soma7)*demanda)
                    //users[i]['faturamento'] = users[i]['faturamento']*0.95
                    //users[i]['faturamento']/users[i]['scorepreco'][1]  <-- qnts % vendeu do que foi planejado
                    
                    
                    //  -_-_-_-
                    //Apos a computacao do faturamento do player no codigo abaixo altera-se no Schema o lucro resultante desse faturamento levando em conta o faturamento planejado do player, como o professor instruiu \/
                  
                    users[i].balanco_patrimonial = { //despesas regulares com PROMOTORES, DISTRIBUIDORES, PAS e despesas de vendas (comissão)
                        ativo: {
                            circulante: {
                                caixa: users[i].balanco_patrimonial.ativo.circulante.caixa - users[i]['promotores']*2160 - users[i]['distribuidores']*2160 - users[i]['pas']*2160 - users[i]['faturamento']*users[i]['comissao'],
                                estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber

                            },
                            n_circulante: {
                                imobilizado: {
                                    pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                    frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                    depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                },
                            },
                        },
                        passivo: {
                            contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                        },
                        patrimonio_liquido: {
                            capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                            lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - users[i]['promotores']*2160 - users[i]['distribuidores']*2160 - (users[i]['pas'])*2160 - users[i]['faturamento']*users[i]['comissao']
                        }
                    }
                    users[i].dre = {

                        receita: users[i].dre.receita,
                        cmv: users[i].dre.cmv,
                        despesas_administrativas: users[i].dre.despesas_administrativas,
                        despesas_vendas: users[i].dre.despesas_vendas + users[i]['promotores']*2160 + users[i]['distribuidores']*2160 + (users[i]['pas'])*2160 + users[i]['faturamento']*users[i]['comissao'],
                        despesas_financeiras: users[i].dre.despesas_financeiras,
                        depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                        ir: users[i].dre.ir

                    }
                    console.log("users[i]['faturamento']*users[i]['comissao']: " + users[i]['faturamento']*users[i]['comissao'])
                    console.log("users[i]['promotores']*2160 + users[i]['distribuidores']*2160 + (users[i]['pas'])*2160 + users[i]['faturamento']*users[i]['comissao']: " + (users[i]['promotores']*2160 + users[i]['distribuidores']*2160 + (users[i]['pas'])*2160 + users[i]['faturamento']*users[i]['comissao']))
                    users[i].taokeys = users[i].taokeys - users[i]['promotores']*2160
                    users[i].taokeys = users[i].taokeys - users[i]['faturamento']*users[i]['comissao']
                    users[i].taokeys = users[i].taokeys - users[i]['distribuidores']*2160
                    

                    let uso_frota = 0;
                    
                    users[i].set('147', [users[i]['147'][0], users[i]['147'][1], users[i]['147'][2], users[i]['147'][3], users[i]['147'][4], users[i]['147'][5], 0, users[i]['147'][7]])
                    if(users[i]['147'][4] > 0){
                        //console.log('----------> antes (do recebimento de contas a receber): ' + users[i].taokeys)
                        users[i].taokeys = users[i].taokeys + users[i]['147'][7] //recebendo contas a receber

                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['147'][7],
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['147'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                            }
                        }
                        
                        //console.log('----------> depois (do recebimento de contas a receber): ' + users[i].taokeys)
                        users[i].taokeys = users[i].taokeys + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['147'][4]*(users[i]['147'][3]) - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['147'][4]*users[i]['147'][2] // pega a razao do qnt ele vendeu pelo qnt pretendia dai multiplica qnt q pretendia vender de cada servvico e faz vezes o precco - o custo (mas aqui esta recebendo td a grana de uma vez (nada fiado))
                        let array_insu = [(users[i]['147'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['147'][4]), users[i]['147'][1], users[i]['147'][2], users[i]['147'][3], users[i]['147'][4],(users[i]['147'][5] + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['147'][4]), (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['147'][4]*users[i]['147'][3], 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['147'][4]*(users[i]['147'][3])]
                        //(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['147'][4]*users[i]['147'][3] => igual ao faturamento obtido pelo jogador nesse serviço especifico
                        users[i].set('147', array_insu)
                        //users[i].balanco_patrimonial.contas_a_receber = users[i]['147'][7]
                        
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['147'][4]*(users[i]['147'][3]),
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['147'][4]*(users[i]['147'][2]),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber + users[i]['147'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['147'][4]*(users[i]['147'][2]) + users[i]['147'][7] + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['147'][4]*(users[i]['147'][3])
                            }
                        }
                        
                        users[i].dre = {
                            receita: users[i].dre.receita + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['147'][4]*(users[i]['147'][3]),
                            cmv: users[i].dre.cmv + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['147'][4]*(users[i]['147'][2]),
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                        //users[i]['147'][0] = users[i]['147'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['147'][4]
                        if(users[i]['147'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['147'][0]*36

                            users[i].balanco_patrimonial = {
                                ativo: {
                                    circulante: {
                                        caixa: users[i].balanco_patrimonial.ativo.circulante.caixa - users[i]['147'][0]*36, 
                                        estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                        contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber
    
                                    },
                                    n_circulante: {
                                        imobilizado: {
                                            pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                            frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                            depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                        },
                                    },
                                },
                                passivo: {
                                    contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                },
                                patrimonio_liquido: {
                                    capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                    lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - users[i]['147'][0]*36
                                }
                            }
                            
                            users[i].dre = {
                                receita: users[i].dre.receita,
                                cmv: users[i].dre.cmv + users[i]['147'][0]*36,
                                despesas_administrativas: users[i].dre.despesas_administrativas,
                                despesas_vendas: users[i].dre.despesas_vendas,
                                despesas_financeiras: users[i].dre.despesas_financeiras,
                                depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                                ir: users[i].dre.ir
                            }
                        }
                        else{
                            users[i].taokeys = users[i].taokeys + users[i]['147'][0]*users[i]['147'][2]*1.2
                            let gamb = users[i].balanco_patrimonial.ativo.circulante.estoque
                            
                            users[i].balanco_patrimonial = { //MODELO
                                ativo: {
                                    circulante: {
                                        caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['147'][0]*users[i]['147'][2]*1.2,
                                        estoque: users[i].balanco_patrimonial.ativo.circulante.estoque + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque),
                                        contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber
    
                                    },
                                    n_circulante: {
                                        imobilizado: {
                                            pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                            frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                            depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                        },
                                    },
                                },
                                passivo: {
                                    contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                },
                                patrimonio_liquido: {
                                    capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                    lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados + users[i]['147'][0]*users[i]['147'][2]*1.2 + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque)
                                }
                            }
                            
                            users[i].dre = {
                                receita: users[i].dre.receita,
                                cmv: users[i].dre.cmv + (-1)*users[i]['147'][0]*users[i]['147'][2]*1.2 + gamb,
                                despesas_administrativas: users[i].dre.despesas_administrativas,
                                despesas_vendas: users[i].dre.despesas_vendas,
                                despesas_financeiras: users[i].dre.despesas_financeiras,
                                depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                                ir: users[i].dre.ir
                            }
                            
                            users[i].set('147', [0, users[i]['147'][1], users[i]['147'][2], users[i]['147'][3], users[i]['147'][4], users[i]['147'][5], users[i]['147'][6], users[i]['147'][7]])
                        }
           
                      }
                      else{
                          
                        users[i].taokeys = users[i].taokeys + users[i]['147'][7]; //recebendo contas a receber, aqui no caso se o serviço n estiver mais sendo utilizado
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['147'][7],
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['147'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                            }
                        }          
                        let array_novo = [users[i]['147'][0], users[i]['147'][1], users[i]['147'][2], users[i]['147'][3], users[i]['147'][4], users[i]['147'][5], users[i]['147'][6], 0]
                        users[i].set('147', array_novo)

                        }
                        /*

                      users[i].set('159', [users[i]['159'][0], users[i]['159'][1], users[i]['159'][2], users[i]['159'][3], users[i]['159'][4], users[i]['159'][5], 0, users[i]['159'][7]])
                    if(users[i]['159'][4] > 0){
                        users[i].taokeys = users[i].taokeys + users[i]['159'][7]
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['159'][7],
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['159'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    }
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                            }
                        }
                        users[i].taokeys = users[i].taokeys + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['159'][4]*(users[i]['159'][3] - users[i]['159'][2])
                        let array_insu = [(users[i]['159'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['159'][4]), users[i]['159'][1], users[i]['159'][2], users[i]['159'][3], users[i]['159'][4],(users[i]['159'][5] + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['159'][4]), (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['159'][4]*users[i]['159'][3], 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['159'][4]*(users[i]['159'][3])]
                        users[i].set('159', array_insu)
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['159'][4]*(users[i]['159'][3]),
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['159'][4]*(users[i]['159'][2]),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber + users[i]['159'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['159'][4]*(users[i]['159'][2]) + users[i]['159'][7] + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['159'][4]*(users[i]['159'][3])
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['159'][4]*(users[i]['159'][3]),
                            cmv: users[i].dre.cmv + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['159'][4]*(users[i]['159'][2]),
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                        //users[i]['159'][0] = users[i]['159'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['159'][4]
                        if(users[i]['159'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['159'][0]*36
                            users[i].balanco_patrimonial = {
                                ativo: {
                                    circulante: {
                                        caixa: users[i].balanco_patrimonial.ativo.circulante.caixa - users[i]['159'][0]*36, 
                                        estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                        contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber
    
                                    },
                                    n_circulante: {
                                        imobilizado: {
                                            pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                            frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                            depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                        },
                                    },
                                },
                                passivo: {
                                    contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                },
                                patrimonio_liquido: {
                                    capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                    lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - users[i]['159'][0]*36
                                }
                            }
                            users[i].dre = {
                                receita: users[i].dre.receita,
                                cmv: users[i].dre.cmv + users[i]['159'][0]*36,
                                despesas_administrativas: users[i].dre.despesas_administrativas,
                                despesas_vendas: users[i].dre.despesas_vendas,
                                despesas_financeiras: users[i].dre.despesas_financeiras,
                                depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                                ir: users[i].dre.ir
                            }
                        }
                        else{users[i].taokeys = users[i].taokeys + users[i]['159'][0]*users[i]['159'][2]*1.2
                        let gamb = users[i].balanco_patrimonial.ativo.circulante.estoque
                        users[i].balanco_patrimonial = { //MODELO
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['159'][0]*users[i]['159'][2]*1.2,
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados + users[i]['159'][0]*users[i]['159'][2]*1.2 + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque)
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            cmv: users[i].dre.cmv + (-1)*users[i]['159'][0]*users[i]['159'][2]*1.2 + gamb,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                    users[i].set('159', [0, users[i]['159'][1], users[i]['159'][2], users[i]['159'][3], users[i]['159'][4], users[i]['159'][5], users[i]['159'][6], users[i]['159'][7]])}
                        uso_frota = uso_frota + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['159'][4]
                      }
                      else{
                        users[i].taokeys = users[i].taokeys + users[i]['159'][7];
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['159'][7],
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['159'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                            }
                        }
                        let array_novo = [users[i]['159'][0], users[i]['159'][1], users[i]['159'][2], users[i]['159'][3], users[i]['159'][4], users[i]['159'][5], users[i]['159'][6], 0]
                        users[i].set('159', array_novo)
                        }

                      users[i].set('149', [users[i]['149'][0], users[i]['149'][1], users[i]['149'][2], users[i]['149'][3], users[i]['149'][4], users[i]['149'][5], 0, users[i]['149'][7]])
                    if(users[i]['149'][4] > 0){
                        users[i].taokeys = users[i].taokeys + users[i]['149'][7]
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['149'][7],
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['149'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                            }
                        }
                        users[i].taokeys = users[i].taokeys + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['149'][4]*(users[i]['149'][3] - users[i]['149'][2])
                        let array_insu = [(users[i]['149'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['149'][4]), users[i]['149'][1], users[i]['149'][2], users[i]['149'][3], users[i]['149'][4],(users[i]['149'][5] + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['149'][4]), (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['149'][4]*users[i]['149'][3], users[i]['149'][7], 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['149'][4]*(users[i]['149'][3])]
                        users[i].set('149', array_insu)
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['149'][4]*(users[i]['149'][3]),
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['149'][4]*(users[i]['149'][2]),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber + users[i]['149'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['149'][4]*(users[i]['149'][2]) + users[i]['149'][7] + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['149'][4]*(users[i]['149'][3])
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['149'][4]*(users[i]['149'][3]),
                            cmv: users[i].dre.cmv + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['149'][4]*(users[i]['149'][2]),
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                        //users[i]['149'][0] = users[i]['149'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['149'][4]
                        if(users[i]['149'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['149'][0]*36
                            users[i].balanco_patrimonial = {
                                ativo: {
                                    circulante: {
                                        caixa: users[i].balanco_patrimonial.ativo.circulante.caixa - users[i]['149'][0]*36, 
                                        estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                        contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber
    
                                    },
                                    n_circulante: {
                                        imobilizado: {
                                            pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                            frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                            depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                        },
                                    },
                                },
                                passivo: {
                                    contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                },
                                patrimonio_liquido: {
                                    capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                    lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - users[i]['149'][0]*36
                                }
                            }
                            users[i].dre = {
                                receita: users[i].dre.receita,
                                cmv: users[i].dre.cmv + users[i]['149'][0]*36,
                                despesas_administrativas: users[i].dre.despesas_administrativas,
                                despesas_vendas: users[i].dre.despesas_vendas,
                                despesas_financeiras: users[i].dre.despesas_financeiras,
                                depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                                ir: users[i].dre.ir
                            }
                        }
                        else{users[i].taokeys = users[i].taokeys + users[i]['149'][0]*users[i]['149'][2]*1.2
                        let gamb = users[i].balanco_patrimonial.ativo.circulante.estoque
                        users[i].balanco_patrimonial = { //MODELO
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['149'][0]*users[i]['149'][2]*1.2,
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados + users[i]['149'][0]*users[i]['149'][2]*1.2 + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque)
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            cmv: users[i].dre.cmv + (-1)*users[i]['149'][0]*users[i]['149'][2]*1.2 + gamb,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                    users[i].set('149', [0, users[i]['149'][1], users[i]['149'][2], users[i]['149'][3], users[i]['149'][4], users[i]['149'][5], users[i]['149'][6], users[i]['149'][7]])}
                        uso_frota = uso_frota + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['149'][4]        
                            }
                            else{
                                users[i].taokeys = users[i].taokeys + users[i]['149'][7];
                                users[i].balanco_patrimonial = {
                                    ativo: {
                                        circulante: {
                                            caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['149'][7],
                                            estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                            contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['149'][7]
        
                                        },
                                        n_circulante: {
                                            imobilizado: {
                                                pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                                frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                                depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                            },
                                        },
                                    },
                                    passivo: {
                                        contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                    },
                                    patrimonio_liquido: {
                                        capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                        lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                                    }
                                }
                                let array_novo = [users[i]['149'][0], users[i]['149'][1], users[i]['149'][2], users[i]['149'][3], users[i]['149'][4], users[i]['149'][5], users[i]['149'][6], 0]
                                users[i].set('149', array_novo)
                                }

                        users[i].set('148', [users[i]['148'][0], users[i]['148'][1], users[i]['148'][2], users[i]['148'][3], users[i]['148'][4], users[i]['148'][5], 0, users[i]['148'][7]])
                    if(users[i]['148'][4] > 0){
                        users[i].taokeys = users[i].taokeys + users[i]['148'][7]
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['148'][7],
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['148'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                            }
                        }
                        users[i].taokeys = users[i].taokeys + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['148'][4]*(users[i]['148'][3] - users[i]['148'][2])
                        let array_insu = [(users[i]['148'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['148'][4]), users[i]['148'][1], users[i]['148'][2], users[i]['148'][3], users[i]['148'][4],(users[i]['148'][5] + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['148'][4]), (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['148'][4]*users[i]['148'][3], 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['148'][4]*(users[i]['148'][3])]
                        users[i].set('148', array_insu)
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['148'][4]*(users[i]['148'][3]),
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['148'][4]*(users[i]['148'][2]),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber + users[i]['148'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['148'][4]*(users[i]['148'][2]) + users[i]['149'][7] + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['148'][4]*(users[i]['148'][3])
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['148'][4]*(users[i]['148'][3]),
                            cmv: users[i].dre.cmv + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['148'][4]*(users[i]['148'][2]),
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                        //users[i]['148'][0] = users[i]['148'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['148'][4]
                        if(users[i]['148'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['148'][0]*36
                            users[i].balanco_patrimonial = {
                                ativo: {
                                    circulante: {
                                        caixa: users[i].balanco_patrimonial.ativo.circulante.caixa - users[i]['148'][0]*36, 
                                        estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                        contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber
    
                                    },
                                    n_circulante: {
                                        imobilizado: {
                                            pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                            frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                            depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                        },
                                    },
                                },
                                passivo: {
                                    contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                },
                                patrimonio_liquido: {
                                    capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                    lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - users[i]['148'][0]*36
                                }
                            }
                            users[i].dre = {
                                receita: users[i].dre.receita,
                                cmv: users[i].dre.cmv + users[i]['148'][0]*36,
                                despesas_administrativas: users[i].dre.despesas_administrativas,
                                despesas_vendas: users[i].dre.despesas_vendas,
                                despesas_financeiras: users[i].dre.despesas_financeiras,
                                depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                                ir: users[i].dre.ir
                            }
                        }   
                        else{users[i].taokeys = users[i].taokeys + users[i]['148'][0]*users[i]['148'][2]*1.2
                        let gamb = users[i].balanco_patrimonial.ativo.circulante.estoque
                        users[i].balanco_patrimonial = { //MODELO
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['148'][0]*users[i]['148'][2]*1.2,
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados + users[i]['148'][0]*users[i]['148'][2]*1.2 + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque)
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            cmv: users[i].dre.cmv + (-1)*users[i]['148'][0]*users[i]['148'][2]*1.2 + gamb,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                    users[i].set('148', [0, users[i]['148'][1], users[i]['148'][2], users[i]['148'][3], users[i]['148'][4], users[i]['148'][5], users[i]['148'][6], users[i]['148'][7]])}
                        uso_frota = uso_frota + ((users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['148'][4])/2
                    }
                    else{
                        users[i].taokeys = users[i].taokeys + users[i]['148'][7];
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['148'][7],
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['148'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                            }
                        }
                        let array_novo = [users[i]['148'][0], users[i]['148'][1], users[i]['148'][2], users[i]['148'][3], users[i]['148'][4], users[i]['148'][5], users[i]['148'][6], 0]
                        users[i].set('148', array_novo)
                        }

                    users[i].set('158', [users[i]['158'][0], users[i]['158'][1], users[i]['158'][2], users[i]['158'][3], users[i]['158'][4], users[i]['158'][5],0, users[i]['158'][7]])
                    if(users[i]['158'][4] > 0){
                        users[i].taokeys = users[i].taokeys + users[i]['158'][7]
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['158'][7],
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['158'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                            }
                        }
                        users[i].taokeys = users[i].taokeys + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['158'][4]*(users[i]['158'][3] - users[i]['158'][2])
                        let array_insu = [(users[i]['158'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['158'][4]), users[i]['158'][1], users[i]['158'][2], users[i]['158'][3], users[i]['158'][4],(users[i]['158'][5] + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['158'][4]), (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['158'][4]*users[i]['158'][3], 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['158'][4]*(users[i]['158'][3])]
                        users[i].set('158', array_insu)
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['158'][4]*(users[i]['158'][3]),
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['158'][4]*(users[i]['158'][2]),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber + users[i]['158'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['158'][4]*(users[i]['158'][2]) + users[i]['158'][7] + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['158'][4]*(users[i]['158'][3])
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['158'][4]*(users[i]['158'][3]),
                            cmv: users[i].dre.cmv + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['158'][4]*(users[i]['158'][2]),
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                        //users[i]['158'][0] = users[i]['158'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['158'][4]
                        if(users[i]['158'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['158'][0]*36
                            users[i].balanco_patrimonial = {
                                ativo: {
                                    circulante: {
                                        caixa: users[i].balanco_patrimonial.ativo.circulante.caixa - users[i]['158'][0]*36, 
                                        estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                        contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber
    
                                    },
                                    n_circulante: {
                                        imobilizado: {
                                            pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                            frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                            depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                        },
                                    },
                                },
                                passivo: {
                                    contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                },
                                patrimonio_liquido: {
                                    capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                    lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - users[i]['158'][0]*36
                                }
                            }
                            users[i].dre = {
                                receita: users[i].dre.receita,
                                cmv: users[i].dre.cmv + users[i]['158'][0]*36,
                                despesas_administrativas: users[i].dre.despesas_administrativas,
                                despesas_vendas: users[i].dre.despesas_vendas,
                                despesas_financeiras: users[i].dre.despesas_financeiras,
                                depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                                ir: users[i].dre.ir
                            }
                        }   
                        else{users[i].taokeys = users[i].taokeys + users[i]['158'][0]*users[i]['158'][2]*1.2
                        let gamb = users[i].balanco_patrimonial.ativo.circulante.estoque
                        users[i].balanco_patrimonial = { //MODELO
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['158'][0]*users[i]['158'][2]*1.2,
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados + users[i]['158'][0]*users[i]['158'][2]*1.2 + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque)
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            cmv: users[i].dre.cmv + (-1)*users[i]['158'][0]*users[i]['158'][2]*1.2 + gamb,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                    users[i].set('158', [0, users[i]['158'][1], users[i]['158'][2], users[i]['158'][3], users[i]['158'][4], users[i]['158'][5], users[i]['158'][6], users[i]['158'][7]])}
                        uso_frota = uso_frota + ((users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['158'][4])/2
                    }
                    else{
                        users[i].taokeys = users[i].taokeys + users[i]['158'][7];
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['158'][7],
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['158'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                            }
                        }
                        let array_novo = [users[i]['158'][0], users[i]['158'][1], users[i]['158'][2], users[i]['158'][3], users[i]['158'][4], users[i]['158'][5], users[i]['158'][6], 0]
                        users[i].set('158', array_novo)
                        }

                    users[i].set('157', [users[i]['157'][0], users[i]['157'][1], users[i]['157'][2], users[i]['157'][3], users[i]['157'][4], users[i]['157'][5], 0, users[i]['157'][7]])
                    if(users[i]['157'][4] > 0){
                        users[i].taokeys = users[i].taokeys + users[i]['157'][7]
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['157'][7],
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['157'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                            }
                        }
                        users[i].taokeys = users[i].taokeys + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['157'][4]*(users[i]['157'][3] - users[i]['157'][2])
                        let array_insu = [(users[i]['157'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['157'][4]), users[i]['157'][1], users[i]['157'][2], users[i]['157'][3], users[i]['157'][4],(users[i]['157'][5] + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['157'][4]), (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['157'][4]*users[i]['157'][3], 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['157'][4]*(users[i]['157'][3])]
                        users[i].set('157', array_insu)
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['157'][4]*(users[i]['157'][3]),
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['157'][4]*(users[i]['157'][2]),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber + users[i]['157'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['157'][4]*(users[i]['157'][2]) + users[i]['158'][7] + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['157'][4]*(users[i]['157'][3])
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['157'][4]*(users[i]['157'][3]),
                            cmv: users[i].dre.cmv + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['157'][4]*(users[i]['157'][2]),
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                        //users[i]['157'][0] = users[i]['157'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['157'][4]
                        if(users[i]['157'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['157'][0]*36
                            users[i].balanco_patrimonial = {
                                ativo: {
                                    circulante: {
                                        caixa: users[i].balanco_patrimonial.ativo.circulante.caixa - users[i]['157'][0]*36, 
                                        estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                        contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber
    
                                    },
                                    n_circulante: {
                                        imobilizado: {
                                            pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                            frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                            depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                        },
                                    },
                                },
                                passivo: {
                                    contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                },
                                patrimonio_liquido: {
                                    capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                    lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - users[i]['157'][0]*36
                                }
                            }
                            users[i].dre = {
                                receita: users[i].dre.receita,
                                cmv: users[i].dre.cmv + users[i]['157'][0]*36,
                                despesas_administrativas: users[i].dre.despesas_administrativas,
                                despesas_vendas: users[i].dre.despesas_vendas,
                                despesas_financeiras: users[i].dre.despesas_financeiras,
                                depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                                ir: users[i].dre.ir
                            }
                        }   
                        else{users[i].taokeys = users[i].taokeys + users[i]['157'][0]*users[i]['157'][2]*1.2
                        let gamb = users[i].balanco_patrimonial.ativo.circulante.estoque
                        users[i].balanco_patrimonial = { //MODELO
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['157'][0]*users[i]['157'][2]*1.2,
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados + users[i]['157'][0]*users[i]['157'][2]*1.2 + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque)
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            cmv: users[i].dre.cmv + (-1)*users[i]['157'][0]*users[i]['157'][2]*1.2 + gamb,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                    users[i].set('157', [0, users[i]['157'][1], users[i]['157'][2], users[i]['157'][3], users[i]['157'][4], users[i]['157'][5], users[i]['157'][6], users[i]['157'][7]])}
                            }
                            else{
                                users[i].taokeys = users[i].taokeys + users[i]['157'][7];
                                users[i].balanco_patrimonial = {
                                    ativo: {
                                        circulante: {
                                            caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['157'][7],
                                            estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                            contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['157'][7]
        
                                        },
                                        n_circulante: {
                                            imobilizado: {
                                                pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                                frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                                depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                            },
                                        },
                                    },
                                    passivo: {
                                        contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                    },
                                    patrimonio_liquido: {
                                        capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                        lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                                    }
                                }
                                let array_novo = [users[i]['157'][0], users[i]['157'][1], users[i]['157'][2], users[i]['157'][3], users[i]['157'][4], users[i]['157'][5], users[i]['157'][6], 0]
                                users[i].set('157', array_novo)
                                }

                        users[i].set('257', [users[i]['257'][0], users[i]['257'][1], users[i]['257'][2], users[i]['257'][3], users[i]['257'][4], users[i]['257'][5],0, users[i]['257'][7]])
                    if(users[i]['257'][4] > 0){
                        users[i].taokeys = users[i].taokeys + users[i]['257'][7]
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['257'][7],
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['257'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                            }
                        }
                        users[i].taokeys = users[i].taokeys + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['257'][4]*(users[i]['257'][3] - users[i]['257'][2])
                        let array_insu = [(users[i]['257'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['257'][4]), users[i]['257'][1], users[i]['257'][2], users[i]['257'][3], users[i]['257'][4],(users[i]['257'][5] + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['257'][4]), (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['257'][4]*users[i]['257'][3], 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['257'][4]*(users[i]['257'][3])]
                        users[i].set('257', array_insu)
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['257'][4]*(users[i]['257'][3]),
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['257'][4]*(users[i]['257'][2]),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber + users[i]['257'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['257'][4]*(users[i]['257'][2]) + users[i]['257'][7] + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['257'][4]*(users[i]['257'][3])
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['257'][4]*(users[i]['257'][3]),
                            cmv: users[i].dre.cmv + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['257'][4]*(users[i]['257'][2]),
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                        //users[i]['257'][0] = users[i]['257'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['257'][4]
                        if(users[i]['257'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['257'][0]*36
                            users[i].balanco_patrimonial = {
                                ativo: {
                                    circulante: {
                                        caixa: users[i].balanco_patrimonial.ativo.circulante.caixa - users[i]['257'][0]*36, 
                                        estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                        contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber
    
                                    },
                                    n_circulante: {
                                        imobilizado: {
                                            pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                            frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                            depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                        },
                                    },
                                },
                                passivo: {
                                    contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                },
                                patrimonio_liquido: {
                                    capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                    lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - users[i]['257'][0]*36
                                }
                            }
                            users[i].dre = {
                                receita: users[i].dre.receita,
                                cmv: users[i].dre.cmv + users[i]['257'][0]*36,
                                despesas_administrativas: users[i].dre.despesas_administrativas,
                                despesas_vendas: users[i].dre.despesas_vendas,
                                despesas_financeiras: users[i].dre.despesas_financeiras,
                                depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                                ir: users[i].dre.ir
                            }
                        
                        }   
                        else{users[i].taokeys = users[i].taokeys + users[i]['257'][0]*users[i]['257'][2]*1.2
                        let gamb = users[i].balanco_patrimonial.ativo.circulante.estoque
                        users[i].balanco_patrimonial = { //MODELO
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['257'][0]*users[i]['257'][2]*1.2,
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados + users[i]['257'][0]*users[i]['257'][2]*1.2 + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque)
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            cmv: users[i].dre.cmv + (-1)*users[i]['257'][0]*users[i]['257'][2]*1.2 + gamb,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                    users[i].set('257', [0, users[i]['257'][1], users[i]['257'][2], users[i]['257'][3], users[i]['257'][4], users[i]['257'][5], users[i]['257'][6], users[i]['257'][7]])}
                    }
                    else{
                        users[i].taokeys = users[i].taokeys + users[i]['257'][7];
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['257'],
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['257'][7]
                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                            }
                        }
                        let array_novo = [users[i]['257'][0], users[i]['257'][1], users[i]['257'][2], users[i]['257'][3], users[i]['257'][4], users[i]['257'][5], users[i]['257'][6], 0]
                        users[i].set('257', array_novo)
                        }

                    users[i].set('258', [users[i]['258'][0], users[i]['258'][1], users[i]['258'][2], users[i]['258'][3], users[i]['258'][4], users[i]['258'][5], 0, users[i]['258'][7]])
                    if(users[i]['258'][4] > 0){
                        users[i].taokeys = users[i].taokeys + users[i]['258'][7]
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['258'][7],
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['258'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                            }
                        }
                        users[i].taokeys = users[i].taokeys + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['258'][4]*(users[i]['258'][3] - users[i]['258'][2])
                        let array_insu = [(users[i]['258'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['258'][4]), users[i]['258'][1], users[i]['258'][2], users[i]['258'][3], users[i]['258'][4],(users[i]['258'][5] + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['258'][4]), (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['258'][4]*users[i]['258'][3], 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['258'][4]*(users[i]['258'][3])]
                        users[i].set('258', array_insu)
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['258'][4]*(users[i]['258'][3]),
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['258'][4]*(users[i]['258'][2]),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber + users[i]['258'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['258'][4]*(users[i]['258'][2]) + users[i]['258'][7] + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['258'][4]*(users[i]['258'][3])
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['258'][4]*(users[i]['258'][3]),
                            cmv: users[i].dre.cmv + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['258'][4]*(users[i]['258'][2]),
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                        //users[i]['258'][0] = users[i]['258'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['258'][4]
                        if(users[i]['258'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['258'][0]*36
                            users[i].balanco_patrimonial = {
                                ativo: {
                                    circulante: {
                                        caixa: users[i].balanco_patrimonial.ativo.circulante.caixa - users[i]['258'][0]*36, 
                                        estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                        contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber
    
                                    },
                                    n_circulante: {
                                        imobilizado: {
                                            pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                            frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                            depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                        },
                                    },
                                },
                                passivo: {
                                    contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                },
                                patrimonio_liquido: {
                                    capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                    lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - users[i]['258'][0]*36
                                }
                            }
                            users[i].dre = {
                                receita: users[i].dre.receita,
                                cmv: users[i].dre.cmv + users[i]['258'][0]*36,
                                despesas_administrativas: users[i].dre.despesas_administrativas,
                                despesas_vendas: users[i].dre.despesas_vendas,
                                despesas_financeiras: users[i].dre.despesas_financeiras,
                                depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                                ir: users[i].dre.ir
                            }
                        }   
                        else{
                            users[i].taokeys = users[i].taokeys + users[i]['258'][0]*users[i]['258'][2]*1.2
                            let gamb = users[i].balanco_patrimonial.ativo.circulante.estoque
                            users[i].balanco_patrimonial = { //MODELO
                                ativo: {
                                    circulante: {
                                        caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['258'][0]*users[i]['258'][2]*1.2,
                                        estoque: users[i].balanco_patrimonial.ativo.circulante.estoque + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque),
                                        contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber
    
                                    },
                                    n_circulante: {
                                        imobilizado: {
                                            pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                            frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                            depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                        },
                                    },
                                },
                                passivo: {
                                    contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                },
                                patrimonio_liquido: {
                                    capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                    lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados + users[i]['258'][0]*users[i]['258'][2]*1.2 + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque)
                                }
                            }
                            users[i].dre = {
                                receita: users[i].dre.receita,
                                cmv: users[i].dre.cmv + (-1)*users[i]['258'][0]*users[i]['258'][2]*1.2 + gamb,
                                despesas_administrativas: users[i].dre.despesas_administrativas,
                                despesas_vendas: users[i].dre.despesas_vendas,
                                despesas_financeiras: users[i].dre.despesas_financeiras,
                                depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                                ir: users[i].dre.ir
                            }
                            users[i].set('258', [0, users[i]['258'][1], users[i]['258'][2], users[i]['258'][3], users[i]['258'][4], users[i]['258'][5], users[i]['258'][6], users[i]['258'][7]])
                        }
                        uso_frota = uso_frota + ((users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['258'][4])/2
                    }
                    else{
                        users[i].taokeys = users[i].taokeys + users[i]['258'][7];
                        users[i].balanco_patrimonial = {
                                    ativo: {
                                        circulante: {
                                            caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['258'][7],
                                            estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                            contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['258'][7]
        
                                        },
                                        n_circulante: {
                                            imobilizado: {
                                                pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                                frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                                depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                            },
                                        },
                                    },
                                    passivo: {
                                        contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                    },
                                    patrimonio_liquido: {
                                        capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                        lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                                    }
                                }
                        let array_novo = [users[i]['258'][0], users[i]['258'][1], users[i]['258'][2], users[i]['258'][3], users[i]['258'][4], users[i]['258'][5], users[i]['258'][6], 0]
                        users[i].set('258', array_novo)
                        }

                    users[i].set('259', [users[i]['259'][0], users[i]['259'][1], users[i]['259'][2], users[i]['259'][3], users[i]['259'][4], users[i]['259'][5], 0, users[i]['259'][7]])
                    if(users[i]['259'][4] > 0){
                        users[i].taokeys = users[i].taokeys + users[i]['259'][7]
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['259'][7],
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['259'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                            }
                        }
                        users[i].taokeys = users[i].taokeys + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['259'][4]*(users[i]['259'][3] - users[i]['259'][2])
                        let array_insu = [(users[i]['259'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['259'][4]), users[i]['259'][1], users[i]['259'][2], users[i]['259'][3], users[i]['259'][4],(users[i]['259'][5] + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['259'][4]), (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['259'][4]*users[i]['259'][3], 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['259'][4]*(users[i]['259'][3])]
                        users[i].set('259', array_insu)
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['259'][4]*(users[i]['259'][3]),
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['259'][4]*(users[i]['259'][2]),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber + users[i]['259'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['259'][4]*(users[i]['259'][2]) + users[i]['259'][7] + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['259'][4]*(users[i]['259'][3])
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['259'][4]*(users[i]['259'][3]),
                            cmv: users[i].dre.cmv + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['259'][4]*(users[i]['259'][2]),
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                        //users[i]['259'][0] = users[i]['259'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['259'][4]
                        if(users[i]['259'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['259'][0]*36
                            users[i].balanco_patrimonial = {
                                ativo: {
                                    circulante: {
                                        caixa: users[i].balanco_patrimonial.ativo.circulante.caixa - users[i]['259'][0]*36, 
                                        estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                        contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber
    
                                    },
                                    n_circulante: {
                                        imobilizado: {
                                            pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                            frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                            depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                        },
                                    },
                                },
                                passivo: {
                                    contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                },
                                patrimonio_liquido: {
                                    capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                    lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - users[i]['259'][0]*36
                                }
                            }
                            users[i].dre = {
                                receita: users[i].dre.receita,
                                cmv: users[i].dre.cmv + users[i]['259'][0]*36,
                                despesas_administrativas: users[i].dre.despesas_administrativas,
                                despesas_vendas: users[i].dre.despesas_vendas,
                                despesas_financeiras: users[i].dre.despesas_financeiras,
                                depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                                ir: users[i].dre.ir
                            }
                        }   
                        else{users[i].taokeys = users[i].taokeys + users[i]['259'][0]*users[i]['259'][2]*1.2
                        let gamb = users[i].balanco_patrimonial.ativo.circulante.estoque
                        users[i].balanco_patrimonial = { //MODELO
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['259'][0]*users[i]['259'][2]*1.2,
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados + users[i]['259'][0]*users[i]['259'][2]*1.2 + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque)
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            cmv: users[i].dre.cmv + (-1)*users[i]['259'][0]*users[i]['259'][2]*1.2 + gamb,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                    users[i].set('259', [0, users[i]['259'][1], users[i]['259'][2], users[i]['259'][3], users[i]['259'][4], users[i]['259'][5], users[i]['259'][6], users[i]['259'][7]])}
                        uso_frota = uso_frota + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['259'][4]
                    }
                    else{
                        users[i].taokeys = users[i].taokeys + users[i]['259'][7];
                        users[i].balanco_patrimonial = {
                                    ativo: {
                                        circulante: {
                                            caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['259'][7],
                                            estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                            contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['259'][7]
        
                                        },
                                        n_circulante: {
                                            imobilizado: {
                                                pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                                frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                                depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                            },
                                        },
                                    },
                                    passivo: {
                                        contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                    },
                                    patrimonio_liquido: {
                                        capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                        lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                                    }
                                }
                        let array_novo = [users[i]['259'][0], users[i]['259'][1], users[i]['259'][2], users[i]['259'][3], users[i]['259'][4], users[i]['259'][5], users[i]['259'][6], 0]
                        users[i].set('259', array_novo)
                        }

                    users[i].set('267', [users[i]['267'][0], users[i]['267'][1], users[i]['267'][2], users[i]['267'][3], users[i]['267'][4], users[i]['267'][5], 0, users[i]['267'][7]])
                    if(users[i]['267'][4] > 0){
                        users[i].taokeys = users[i].taokeys + users[i]['267'][7]
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['267'][7],
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['267'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                            }
                        }
                        users[i].taokeys = users[i].taokeys + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['267'][4]*(users[i]['267'][3] - users[i]['267'][2])
                        let array_insu = [(users[i]['267'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['267'][4]), users[i]['267'][1], users[i]['267'][2], users[i]['267'][3], users[i]['267'][4],(users[i]['267'][5] + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['267'][4]), (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['267'][4]*users[i]['267'][3], 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['267'][4]*(users[i]['267'][3])]
                        users[i].set('267', array_insu)
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['267'][4]*(users[i]['267'][3]),
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['267'][4]*(users[i]['267'][2]),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber + users[i]['267'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['267'][4]*(users[i]['267'][2]) + users[i]['267'][7] + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['267'][4]*(users[i]['267'][3])
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['267'][4]*(users[i]['267'][3]),
                            cmv: users[i].dre.cmv + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['267'][4]*(users[i]['267'][2]),
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                        //users[i]['267'][0] = users[i]['267'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['267'][4]
                        if(users[i]['267'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['267'][0]*36
                            users[i].balanco_patrimonial = {
                                ativo: {
                                    circulante: {
                                        caixa: users[i].balanco_patrimonial.ativo.circulante.caixa - users[i]['267'][0]*36, 
                                        estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                        contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber
    
                                    },
                                    n_circulante: {
                                        imobilizado: {
                                            pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                            frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                            depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                        },
                                    },
                                },
                                passivo: {
                                    contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                },
                                patrimonio_liquido: {
                                    capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                    lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - users[i]['267'][0]*36
                                }
                            }
                            users[i].dre = {
                                receita: users[i].dre.receita,
                                cmv: users[i].dre.cmv + users[i]['267'][0]*36,
                                despesas_administrativas: users[i].dre.despesas_administrativas,
                                despesas_vendas: users[i].dre.despesas_vendas,
                                despesas_financeiras: users[i].dre.despesas_financeiras,
                                depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                                ir: users[i].dre.ir
                            }
                        }   
                        else{users[i].taokeys = users[i].taokeys + users[i]['267'][0]*users[i]['267'][2]*1.2
                        let gamb = users[i].balanco_patrimonial.ativo.circulante.estoque
                        users[i].balanco_patrimonial = { //MODELO
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['267'][0]*users[i]['267'][2]*1.2,
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados + users[i]['267'][0]*users[i]['267'][2]*1.2 + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque)
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            cmv: users[i].dre.cmv + (-1)*users[i]['267'][0]*users[i]['267'][2]*1.2 + gamb,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                    users[i].set('267', [0, users[i]['267'][1], users[i]['267'][2], users[i]['267'][3], users[i]['267'][4], users[i]['267'][5], users[i]['267'][6], users[i]['267'][7]])}
                    }
                    else{
                        users[i].taokeys = users[i].taokeys + users[i]['267'][7];
                        users[i].balanco_patrimonial = {
                                    ativo: {
                                        circulante: {
                                            caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['267'][7],
                                            estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                            contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['267'][7]
        
                                        },
                                        n_circulante: {
                                            imobilizado: {
                                                pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                                frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                                depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                            },
                                        },
                                    },
                                    passivo: {
                                        contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                    },
                                    patrimonio_liquido: {
                                        capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                        lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                                    }
                                }
                        let array_novo = [users[i]['267'][0], users[i]['267'][1], users[i]['267'][2], users[i]['267'][3], users[i]['267'][4], users[i]['267'][5], users[i]['267'][6], 0]
                        users[i].set('267', array_novo)
                        }

                    users[i].set('268', [users[i]['268'][0], users[i]['268'][1], users[i]['268'][2], users[i]['268'][3], users[i]['268'][4], users[i]['268'][5], 0, users[i]['268'][7]])
                    if(users[i]['268'][4] > 0){
                        users[i].taokeys = users[i].taokeys + users[i]['268'][7]
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['268'][7],
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['268'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                            }
                        }
                        users[i].taokeys = users[i].taokeys + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['268'][4]*(users[i]['268'][3] - users[i]['268'][2])
                        let array_insu = [(users[i]['268'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['268'][4]), users[i]['268'][1], users[i]['268'][2], users[i]['268'][3], users[i]['268'][4],(users[i]['268'][5] + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['268'][4]), (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['268'][4]*users[i]['268'][3], 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['268'][4]*(users[i]['268'][3])]
                        users[i].set('268', array_insu)
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['268'][4]*(users[i]['268'][3]),
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['268'][4]*(users[i]['268'][2]),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber + users[i]['268'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['268'][4]*(users[i]['268'][2]) + users[i]['268'][7] + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['268'][4]*(users[i]['268'][3])
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['268'][4]*(users[i]['268'][3]),
                            cmv: users[i].dre.cmv + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['268'][4]*(users[i]['268'][2]),
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                        //users[i]['268'][0] = users[i]['268'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['268'][4]
                        if(users[i]['268'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['268'][0]*36
                            users[i].balanco_patrimonial = {
                                ativo: {
                                    circulante: {
                                        caixa: users[i].balanco_patrimonial.ativo.circulante.caixa - users[i]['268'][0]*36, 
                                        estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                        contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber
    
                                    },
                                    n_circulante: {
                                        imobilizado: {
                                            pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                            frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                            depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                        },
                                    },
                                },
                                passivo: {
                                    contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                },
                                patrimonio_liquido: {
                                    capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                    lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - users[i]['268'][0]*36
                                }
                            }
                            users[i].dre = {
                                receita: users[i].dre.receita,
                                cmv: users[i].dre.cmv + users[i]['268'][0]*36,
                                despesas_administrativas: users[i].dre.despesas_administrativas,
                                despesas_vendas: users[i].dre.despesas_vendas,
                                despesas_financeiras: users[i].dre.despesas_financeiras,
                                depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                                ir: users[i].dre.ir
                            }
                        }   
                        else{users[i].taokeys = users[i].taokeys + users[i]['268'][0]*users[i]['268'][2]*1.2
                        let gamb = users[i].balanco_patrimonial.ativo.circulante.estoque
                        users[i].balanco_patrimonial = { //MODELO
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['268'][0]*users[i]['268'][2]*1.2,
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados + users[i]['268'][0]*users[i]['268'][2]*1.2 + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque)
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            cmv: users[i].dre.cmv + (-1)*users[i]['268'][0]*users[i]['268'][2]*1.2 + gamb,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                    users[i].set('268', [0, users[i]['268'][1], users[i]['268'][2], users[i]['268'][3], users[i]['268'][4], users[i]['268'][5], users[i]['268'][6], users[i]['268'][7]])}
                        uso_frota = uso_frota + ((users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['268'][4])/2
                    }
                    else{
                        users[i].taokeys = users[i].taokeys + users[i]['268'][7];
                        users[i].balanco_patrimonial = {
                                    ativo: {
                                        circulante: {
                                            caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['268'][7],
                                            estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                            contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['268'][7]
        
                                        },
                                        n_circulante: {
                                            imobilizado: {
                                                pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                                frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                                depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                            },
                                        },
                                    },
                                    passivo: {
                                        contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                    },
                                    patrimonio_liquido: {
                                        capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                        lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                                    }
                                }
                        let array_novo = [users[i]['268'][0], users[i]['268'][1], users[i]['268'][2], users[i]['268'][3], users[i]['268'][4], users[i]['268'][5], users[i]['268'][6], 0]
                        users[i].set('268', array_novo)
                        }

                    users[i].set('269', [users[i]['269'][0], users[i]['269'][1], users[i]['269'][2], users[i]['269'][3], users[i]['269'][4], users[i]['269'][5], 0, users[i]['269'][7]])
                    if(users[i]['269'][4] > 0){
                        users[i].taokeys = users[i].taokeys + users[i]['269'][7]
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['269'][7],
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['269'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                            }
                        }
                        users[i].taokeys = users[i].taokeys + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['269'][4]*(users[i]['269'][3] - users[i]['269'][2])
                        let array_insu = [(users[i]['269'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['269'][4]), users[i]['269'][1], users[i]['269'][2], users[i]['269'][3], users[i]['269'][4],(users[i]['269'][5] + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['269'][4]), (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['269'][4]*users[i]['269'][3], 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['269'][4]*(users[i]['269'][3])]
                        users[i].set('269', array_insu)
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['269'][4]*(users[i]['269'][3]),
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['269'][4]*(users[i]['269'][2]),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber + users[i]['269'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['269'][4]*(users[i]['269'][2]) + users[i]['269'][7] + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['269'][4]*(users[i]['269'][3])
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['269'][4]*(users[i]['269'][3]),
                            cmv: users[i].dre.cmv + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['269'][4]*(users[i]['269'][2]),
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                        //users[i]['269'][0] = users[i]['269'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['269'][4]
                        if(users[i]['269'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['269'][0]*36
                            users[i].balanco_patrimonial = {
                                ativo: {
                                    circulante: {
                                        caixa: users[i].balanco_patrimonial.ativo.circulante.caixa - users[i]['269'][0]*36, 
                                        estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                        contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber
    
                                    },
                                    n_circulante: {
                                        imobilizado: {
                                            pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                            frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                            depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                        },
                                    },
                                },
                                passivo: {
                                    contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                },
                                patrimonio_liquido: {
                                    capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                    lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - users[i]['269'][0]*36
                                }
                            }
                            users[i].dre = {
                                receita: users[i].dre.receita,
                                cmv: users[i].dre.cmv + users[i]['269'][0]*36,
                                despesas_administrativas: users[i].dre.despesas_administrativas,
                                despesas_vendas: users[i].dre.despesas_vendas,
                                despesas_financeiras: users[i].dre.despesas_financeiras,
                                depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                                ir: users[i].dre.ir
                            }
                        }   
                        else{users[i].taokeys = users[i].taokeys + users[i]['269'][0]*users[i]['269'][2]*1.2
                        let gamb = users[i].balanco_patrimonial.ativo.circulante.estoque
                        users[i].balanco_patrimonial = { //MODELO
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['269'][0]*users[i]['269'][2]*1.2,
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados + users[i]['269'][0]*users[i]['269'][2]*1.2 + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque)
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            cmv: users[i].dre.cmv + (-1)*users[i]['269'][0]*users[i]['269'][2]*1.2 + gamb,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                    users[i].set('269', [0, users[i]['269'][1], users[i]['269'][2], users[i]['269'][3], users[i]['269'][4], users[i]['269'][5], users[i]['269'][6], users[i]['269'][7]])}
                        uso_frota = uso_frota + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['269'][4]
                    }
                    else{
                        users[i].taokeys = users[i].taokeys + users[i]['269'][7];
                        users[i].balanco_patrimonial = {
                                    ativo: {
                                        circulante: {
                                            caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['269'][7],
                                            estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                            contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['269'][7]
        
                                        },
                                        n_circulante: {
                                            imobilizado: {
                                                pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                                frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                                depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                            },
                                        },
                                    },
                                    passivo: {
                                        contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                    },
                                    patrimonio_liquido: {
                                        capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                        lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                                    }
                                }
                        let array_novo = [users[i]['269'][0], users[i]['269'][1], users[i]['269'][2], users[i]['269'][3], users[i]['269'][4], users[i]['269'][5], users[i]['269'][6], 0]
                        users[i].set('269', array_novo)
                        }

                    users[i].set('347', [users[i]['347'][0], users[i]['347'][1], users[i]['347'][2], users[i]['347'][3], users[i]['347'][4], users[i]['347'][5], 0, users[i]['347'][7]])
                    if(users[i]['347'][4] > 0){
                        users[i].taokeys = users[i].taokeys + users[i]['347'][7]
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['347'][7],
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['347'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                            }
                        }
                        users[i].taokeys = users[i].taokeys + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['347'][4]*(users[i]['347'][3] - users[i]['347'][2])
                        let array_insu = [(users[i]['347'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['347'][4]), users[i]['347'][1], users[i]['347'][2], users[i]['347'][3], users[i]['347'][4],(users[i]['347'][5] + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['347'][4]), (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['347'][4]*users[i]['347'][3], 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['347'][4]*(users[i]['347'][3])]
                        users[i].set('347', array_insu)
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['347'][4]*(users[i]['347'][3]),
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['347'][4]*(users[i]['347'][2]),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber + users[i]['347'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['347'][4]*(users[i]['347'][2]) + users[i]['347'][7] + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['347'][4]*(users[i]['347'][3])
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['347'][4]*(users[i]['347'][3]),
                            cmv: users[i].dre.cmv + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['347'][4]*(users[i]['347'][2]),
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                        //users[i]['347'][0] = users[i]['347'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['347'][4]
                        if(users[i]['347'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['347'][0]*36
                            users[i].balanco_patrimonial = {
                                ativo: {
                                    circulante: {
                                        caixa: users[i].balanco_patrimonial.ativo.circulante.caixa - users[i]['347'][0]*36, 
                                        estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                        contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber
    
                                    },
                                    n_circulante: {
                                        imobilizado: {
                                            pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                            frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                            depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                        },
                                    },
                                },
                                passivo: {
                                    contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                },
                                patrimonio_liquido: {
                                    capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                    lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - users[i]['347'][0]*36
                                }
                            }
                            users[i].dre = {
                                receita: users[i].dre.receita,
                                cmv: users[i].dre.cmv + users[i]['347'][0]*36,
                                despesas_administrativas: users[i].dre.despesas_administrativas,
                                despesas_vendas: users[i].dre.despesas_vendas,
                                despesas_financeiras: users[i].dre.despesas_financeiras,
                                depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                                ir: users[i].dre.ir
                            }
                        }   
                        else{users[i].taokeys = users[i].taokeys + users[i]['347'][0]*users[i]['347'][2]*1.2
                        let gamb = users[i].balanco_patrimonial.ativo.circulante.estoque
                        users[i].balanco_patrimonial = { //MODELO
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['347'][0]*users[i]['347'][2]*1.2,
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados + users[i]['347'][0]*users[i]['347'][2]*1.2 + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque)
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            cmv: users[i].dre.cmv + (-1)*users[i]['347'][0]*users[i]['347'][2]*1.2 + gamb,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                    users[i].set('347', [0, users[i]['347'][1], users[i]['347'][2], users[i]['347'][3], users[i]['347'][4], users[i]['347'][5], users[i]['347'][6], users[i]['347'][7]])}
                    }
                    else{
                        users[i].taokeys = users[i].taokeys + users[i]['347'][7];
                        users[i].balanco_patrimonial = {
                                    ativo: {
                                        circulante: {
                                            caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['347'][7],
                                            estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                            contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['347'][7]
        
                                        },
                                        n_circulante: {
                                            imobilizado: {
                                                pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                                frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                                depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                            },
                                        },
                                    },
                                    passivo: {
                                        contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                    },
                                    patrimonio_liquido: {
                                        capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                        lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                                    }
                                }
                        let array_novo = [users[i]['347'][0], users[i]['347'][1], users[i]['347'][2], users[i]['347'][3], users[i]['347'][4], users[i]['347'][5], users[i]['347'][6], 0]
                        users[i].set('347', array_novo)
                        }

                    users[i].set('348', [users[i]['348'][0], users[i]['348'][1], users[i]['348'][2], users[i]['348'][3], users[i]['348'][4], users[i]['348'][5], 0, users[i]['348'][7]])
                    if(users[i]['348'][4] > 0){
                        users[i].taokeys = users[i].taokeys + users[i]['348'][7]
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['348'][7],
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['348'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                            }
                        }
                        users[i].taokeys = users[i].taokeys + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['348'][4]*(users[i]['348'][3] - users[i]['348'][2])
                        let array_insu = [(users[i]['348'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['348'][4]), users[i]['348'][1], users[i]['348'][2], users[i]['348'][3], users[i]['348'][4],(users[i]['348'][5] + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['348'][4]), (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['348'][4]*users[i]['348'][3], 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['348'][4]*(users[i]['348'][3])]
                        users[i].set('348', array_insu)
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['348'][4]*(users[i]['348'][3]),
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['348'][4]*(users[i]['348'][2]),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber + users[i]['348'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['348'][4]*(users[i]['348'][2]) + users[i]['348'][7] + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['348'][4]*(users[i]['348'][3])
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['348'][4]*(users[i]['348'][3]),
                            cmv: users[i].dre.cmv + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['348'][4]*(users[i]['348'][2]),
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                        //users[i]['348'][0] = users[i]['348'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['348'][4]
                        if(users[i]['348'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['348'][0]*36
                            users[i].balanco_patrimonial = {
                                ativo: {
                                    circulante: {
                                        caixa: users[i].balanco_patrimonial.ativo.circulante.caixa - users[i]['348'][0]*36, 
                                        estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                        contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber
    
                                    },
                                    n_circulante: {
                                        imobilizado: {
                                            pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                            frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                            depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                        },
                                    },
                                },
                                passivo: {
                                    contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                },
                                patrimonio_liquido: {
                                    capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                    lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - users[i]['348'][0]*36
                                }
                            }
                            users[i].dre = {
                                receita: users[i].dre.receita,
                                cmv: users[i].dre.cmv + users[i]['348'][0]*36,
                                despesas_administrativas: users[i].dre.despesas_administrativas,
                                despesas_vendas: users[i].dre.despesas_vendas,
                                despesas_financeiras: users[i].dre.despesas_financeiras,
                                depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                                ir: users[i].dre.ir
                            }
                        }   
                        else{users[i].taokeys = users[i].taokeys + users[i]['348'][0]*users[i]['348'][2]*1.2
                        let gamb = users[i].balanco_patrimonial.ativo.circulante.estoque
                        users[i].balanco_patrimonial = { //MODELO
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['348'][0]*users[i]['348'][2]*1.2,
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados + users[i]['348'][0]*users[i]['348'][2]*1.2 + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque)
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            cmv: users[i].dre.cmv + (-1)*users[i]['348'][0]*users[i]['348'][2]*1.2 + gamb,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                    users[i].set('348', [0, users[i]['348'][1], users[i]['348'][2], users[i]['348'][3], users[i]['348'][4], users[i]['348'][5], users[i]['348'][6], users[i]['348'][7]])}
                        uso_frota = uso_frota + ((users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['348'][4])/2
                    }
                    else{
                        users[i].taokeys = users[i].taokeys + users[i]['348'][7];
                        users[i].balanco_patrimonial = {
                                    ativo: {
                                        circulante: {
                                            caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['348'][7],
                                            estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                            contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['348'][7]
        
                                        },
                                        n_circulante: {
                                            imobilizado: {
                                                pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                                frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                                depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                            },
                                        },
                                    },
                                    passivo: {
                                        contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                    },
                                    patrimonio_liquido: {
                                        capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                        lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                                    }
                                }
                        let array_novo = [users[i]['348'][0], users[i]['348'][1], users[i]['348'][2], users[i]['348'][3], users[i]['348'][4], users[i]['348'][5], users[i]['348'][6], 0]
                        users[i].set('348', array_novo)
                        }

                    users[i].set('349', [users[i]['349'][0], users[i]['349'][1], users[i]['349'][2], users[i]['349'][3], users[i]['349'][4], users[i]['349'][5], 0, users[i]['349'][7]])
                    if(users[i]['349'][4] > 0){
                        users[i].taokeys = users[i].taokeys + users[i]['349'][7]
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['349'][7],
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['349'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                            }
                        }
                        users[i].taokeys = users[i].taokeys + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['349'][4]*(users[i]['349'][3] - users[i]['349'][2])
                        let array_insu = [(users[i]['349'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['349'][4]), users[i]['349'][1], users[i]['349'][2], users[i]['349'][3], users[i]['349'][4],(users[i]['349'][5] + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['349'][4]), (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['349'][4]*users[i]['349'][3], 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['349'][4]*(users[i]['349'][3])]
                        users[i].set('349', array_insu)
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['349'][4]*(users[i]['349'][3]),
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['349'][4]*(users[i]['349'][2]),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber + users[i]['349'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['349'][4]*(users[i]['349'][2]) + users[i]['349'][7] + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['349'][4]*(users[i]['349'][3])
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['349'][4]*(users[i]['349'][3]),
                            cmv: users[i].dre.cmv + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['349'][4]*(users[i]['349'][2]),
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                        //users[i]['349'][0] = users[i]['349'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['349'][4]
                        if(users[i]['349'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['349'][0]*36
                            users[i].balanco_patrimonial = {
                                ativo: {
                                    circulante: {
                                        caixa: users[i].balanco_patrimonial.ativo.circulante.caixa - users[i]['349'][0]*36, 
                                        estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                        contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber
    
                                    },
                                    n_circulante: {
                                        imobilizado: {
                                            pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                            frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                            depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                        },
                                    },
                                },
                                passivo: {
                                    contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                },
                                patrimonio_liquido: {
                                    capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                    lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - users[i]['349'][0]*36
                                }
                            }
                            users[i].dre = {
                                receita: users[i].dre.receita,
                                cmv: users[i].dre.cmv + users[i]['349'][0]*36,
                                despesas_administrativas: users[i].dre.despesas_administrativas,
                                despesas_vendas: users[i].dre.despesas_vendas,
                                despesas_financeiras: users[i].dre.despesas_financeiras,
                                depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                                ir: users[i].dre.ir
                            }
                        }   
                        else{users[i].taokeys = users[i].taokeys + users[i]['349'][0]*users[i]['349'][2]*1.2
                        let gamb = users[i].balanco_patrimonial.ativo.circulante.estoque
                        users[i].balanco_patrimonial = { //MODELO
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['349'][0]*users[i]['349'][2]*1.2,
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados + users[i]['349'][0]*users[i]['349'][2]*1.2 + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque)
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            cmv: users[i].dre.cmv + (-1)*users[i]['349'][0]*users[i]['349'][2]*1.2 + gamb,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                    users[i].set('349', [0, users[i]['349'][1], users[i]['349'][2], users[i]['349'][3], users[i]['349'][4], users[i]['349'][5], users[i]['349'][6], users[i]['349'][7]])}
                        uso_frota = uso_frota + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['349'][4]
                    }
                    else{
                        users[i].taokeys = users[i].taokeys + users[i]['349'][7];
                        users[i].balanco_patrimonial = {
                                    ativo: {
                                        circulante: {
                                            caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['349'][7],
                                            estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                            contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['349'][7]
        
                                        },
                                        n_circulante: {
                                            imobilizado: {
                                                pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                                frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                                depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                            },
                                        },
                                    },
                                    passivo: {
                                        contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                    },
                                    patrimonio_liquido: {
                                        capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                        lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                                    }
                                }
                        let array_novo = [users[i]['349'][0], users[i]['349'][1], users[i]['349'][2], users[i]['349'][3], users[i]['349'][4], users[i]['349'][5], users[i]['349'][6], 0]
                        users[i].set('349', array_novo)
                        }

                    users[i].set('357', [users[i]['357'][0], users[i]['357'][1], users[i]['357'][2], users[i]['357'][3], users[i]['357'][4], users[i]['357'][5], 0, users[i]['357'][7]])
                    if(users[i]['357'][4] > 0){
                        users[i].taokeys = users[i].taokeys + users[i]['357'][7]
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['357'][7],
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['357'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                            }
                        }
                        users[i].taokeys = users[i].taokeys + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['357'][4]*(users[i]['357'][3] - users[i]['357'][2])
                        let array_insu = [(users[i]['357'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['357'][4]), users[i]['357'][1], users[i]['357'][2], users[i]['357'][3], users[i]['357'][4],(users[i]['357'][5] + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['357'][4]), (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['357'][4]*users[i]['357'][3], 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['357'][4]*(users[i]['357'][3])]
                        users[i].set('357', array_insu)
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['357'][4]*(users[i]['357'][3]),
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['357'][4]*(users[i]['357'][2]),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber + users[i]['357'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['357'][4]*(users[i]['357'][2]) + users[i]['357'][7] + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['357'][4]*(users[i]['357'][3])
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['357'][4]*(users[i]['357'][3]),
                            cmv: users[i].dre.cmv + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['357'][4]*(users[i]['357'][2]),
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                        //users[i]['357'][0] = users[i]['357'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['357'][4]
                        if(users[i]['357'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['357'][0]*36
                            users[i].balanco_patrimonial = {
                                ativo: {
                                    circulante: {
                                        caixa: users[i].balanco_patrimonial.ativo.circulante.caixa - users[i]['357'][0]*36, 
                                        estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                        contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber
    
                                    },
                                    n_circulante: {
                                        imobilizado: {
                                            pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                            frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                            depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                        },
                                    },
                                },
                                passivo: {
                                    contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                },
                                patrimonio_liquido: {
                                    capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                    lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - users[i]['357'][0]*36
                                }
                            }
                            users[i].dre = {
                                receita: users[i].dre.receita,
                                cmv: users[i].dre.cmv + users[i]['357'][0]*36,
                                despesas_administrativas: users[i].dre.despesas_administrativas,
                                despesas_vendas: users[i].dre.despesas_vendas,
                                despesas_financeiras: users[i].dre.despesas_financeiras,
                                depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                                ir: users[i].dre.ir
                            }
                        }   
                        else{users[i].taokeys = users[i].taokeys + users[i]['357'][0]*users[i]['357'][2]*1.2
                        let gamb = users[i].balanco_patrimonial.ativo.circulante.estoque
                        users[i].balanco_patrimonial = { //MODELO
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['357'][0]*users[i]['357'][2]*1.2,
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados + users[i]['357'][0]*users[i]['357'][2]*1.2 + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque)
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            cmv: users[i].dre.cmv + (-1)*users[i]['357'][0]*users[i]['357'][2]*1.2 + gamb,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                    users[i].set('357', [0, users[i]['357'][1], users[i]['357'][2], users[i]['357'][3], users[i]['357'][4], users[i]['357'][5], users[i]['357'][6], users[i]['357'][7]])}
                    }
                    else{
                        users[i].taokeys = users[i].taokeys + users[i]['357'][7];
                        users[i].balanco_patrimonial = {
                                    ativo: {
                                        circulante: {
                                            caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['357'][7],
                                            estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                            contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['357'][7]
        
                                        },
                                        n_circulante: {
                                            imobilizado: {
                                                pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                                frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                                depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                            },
                                        },
                                    },
                                    passivo: {
                                        contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                    },
                                    patrimonio_liquido: {
                                        capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                        lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                                    }
                                }
                        let array_novo = [users[i]['357'][0], users[i]['357'][1], users[i]['357'][2], users[i]['357'][3], users[i]['357'][4], users[i]['357'][5], users[i]['357'][6], 0]
                        users[i].set('357', array_novo)
                        }

                    users[i].set('358', [users[i]['358'][0], users[i]['358'][1], users[i]['358'][2], users[i]['358'][3], users[i]['358'][4], users[i]['358'][5], 0, users[i]['358'][7]])
                    if(users[i]['358'][4] > 0){
                        users[i].taokeys = users[i].taokeys + users[i]['358'][7]
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['358'][7],
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['358'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                            }
                        }
                        users[i].taokeys = users[i].taokeys + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['358'][4]*(users[i]['358'][3] - users[i]['358'][2])
                        let array_insu = [(users[i]['358'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['358'][4]), users[i]['358'][1], users[i]['358'][2], users[i]['358'][3], users[i]['358'][4],(users[i]['358'][5] + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['358'][4]), (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['358'][4]*users[i]['358'][3], 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['358'][4]*(users[i]['358'][3])]
                        users[i].set('358', array_insu)
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['358'][4]*(users[i]['358'][3]),
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['358'][4]*(users[i]['358'][2]),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber + users[i]['358'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['358'][4]*(users[i]['358'][2]) + users[i]['358'][7] + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['358'][4]*(users[i]['358'][3])
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['358'][4]*(users[i]['358'][3]),
                            cmv: users[i].dre.cmv + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['358'][4]*(users[i]['358'][2]),
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                        //users[i]['358'][0] = users[i]['358'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['358'][4]
                        if(users[i]['358'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['358'][0]*36
                            users[i].balanco_patrimonial = {
                                ativo: {
                                    circulante: {
                                        caixa: users[i].balanco_patrimonial.ativo.circulante.caixa - users[i]['358'][0]*36, 
                                        estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                        contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber
    
                                    },
                                    n_circulante: {
                                        imobilizado: {
                                            pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                            frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                            depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                        },
                                    },
                                },
                                passivo: {
                                    contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                },
                                patrimonio_liquido: {
                                    capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                    lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - users[i]['358'][0]*36
                                }
                            }
                            users[i].dre = {
                                receita: users[i].dre.receita,
                                cmv: users[i].dre.cmv + users[i]['358'][0]*36,
                                despesas_administrativas: users[i].dre.despesas_administrativas,
                                despesas_vendas: users[i].dre.despesas_vendas,
                                despesas_financeiras: users[i].dre.despesas_financeiras,
                                depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                                ir: users[i].dre.ir
                            }
                        }   
                        else{users[i].taokeys = users[i].taokeys + users[i]['358'][0]*users[i]['358'][2]*1.2
                        let gamb = users[i].balanco_patrimonial.ativo.circulante.estoque
                        users[i].balanco_patrimonial = { //MODELO
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['358'][0]*users[i]['358'][2]*1.2,
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados + users[i]['358'][0]*users[i]['358'][2]*1.2 + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque)
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            cmv: users[i].dre.cmv + (-1)*users[i]['358'][0]*users[i]['358'][2]*1.2 + gamb,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                    users[i].set('358', [0, users[i]['358'][1], users[i]['358'][2], users[i]['358'][3], users[i]['358'][4], users[i]['358'][5], users[i]['358'][6], users[i]['358'][7]])}
                        uso_frota = uso_frota + ((users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['358'][4])/2
                    }
                    else{
                        users[i].taokeys = users[i].taokeys + users[i]['358'][7];
                        users[i].balanco_patrimonial = {
                                    ativo: {
                                        circulante: {
                                            caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['358'][7],
                                            estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                            contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['358'][7]
        
                                        },
                                        n_circulante: {
                                            imobilizado: {
                                                pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                                frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                                depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                            },
                                        },
                                    },
                                    passivo: {
                                        contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                    },
                                    patrimonio_liquido: {
                                        capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                        lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                                    }
                                }
                        let array_novo = [users[i]['358'][0], users[i]['358'][1], users[i]['358'][2], users[i]['358'][3], users[i]['358'][4], users[i]['358'][5], users[i]['358'][6], 0]
                        users[i].set('358', array_novo)
                        }

                    users[i].set('359', [users[i]['359'][0], users[i]['359'][1], users[i]['359'][2], users[i]['359'][3], users[i]['359'][4], users[i]['359'][5], 0, users[i]['359'][7]])
                    if(users[i]['359'][4] > 0){
                        users[i].taokeys = users[i].taokeys + users[i]['359'][7]
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['359'][7],
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['359'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                            }
                        }
                        users[i].taokeys = users[i].taokeys + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['359'][4]*(users[i]['359'][3] - users[i]['359'][2])
                        let array_insu = [(users[i]['359'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['359'][4]), users[i]['359'][1], users[i]['359'][2], users[i]['359'][3], users[i]['359'][4],(users[i]['359'][5] + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['359'][4]), (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['359'][4]*users[i]['359'][3], 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['359'][4]*(users[i]['359'][3])]
                        users[i].set('359', array_insu)
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['359'][4]*(users[i]['359'][3]),
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['359'][4]*(users[i]['359'][2]),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber + users[i]['359'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['359'][4]*(users[i]['359'][2]) + users[i]['359'][7] + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['359'][4]*(users[i]['359'][3])
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['359'][4]*(users[i]['359'][3]),
                            cmv: users[i].dre.cmv + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['359'][4]*(users[i]['359'][2]),
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                        //users[i]['359'][0] = users[i]['359'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['359'][4]
                        if(users[i]['359'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['359'][0]*36
                            users[i].balanco_patrimonial = {
                                ativo: {
                                    circulante: {
                                        caixa: users[i].balanco_patrimonial.ativo.circulante.caixa - users[i]['359'][0]*36, 
                                        estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                        contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber
    
                                    },
                                    n_circulante: {
                                        imobilizado: {
                                            pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                            frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                            depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                        },
                                    },
                                },
                                passivo: {
                                    contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                },
                                patrimonio_liquido: {
                                    capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                    lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - users[i]['359'][0]*36
                                }
                            }
                            users[i].dre = {
                                receita: users[i].dre.receita,
                                cmv: users[i].dre.cmv + users[i]['359'][0]*36,
                                despesas_administrativas: users[i].dre.despesas_administrativas,
                                despesas_vendas: users[i].dre.despesas_vendas,
                                despesas_financeiras: users[i].dre.despesas_financeiras,
                                depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                                ir: users[i].dre.ir
                            }
                        }   
                        else{users[i].taokeys = users[i].taokeys + users[i]['359'][0]*users[i]['359'][2]*1.2
                        let gamb = users[i].balanco_patrimonial.ativo.circulante.estoque
                        users[i].balanco_patrimonial = { //MODELO
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['359'][0]*users[i]['359'][2]*1.2,
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados + users[i]['359'][0]*users[i]['359'][2]*1.2 + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque)
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            cmv: users[i].dre.cmv + (-1)*users[i]['359'][0]*users[i]['359'][2]*1.2 + gamb,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                    users[i].set('359', [0, users[i]['359'][1], users[i]['359'][2], users[i]['359'][3], users[i]['359'][4], users[i]['359'][5], users[i]['359'][6], users[i]['359'][7]])}
                        uso_frota = uso_frota + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['359'][4]
                    }
                    else{
                        users[i].taokeys = users[i].taokeys + users[i]['359'][7];
                        users[i].balanco_patrimonial = {
                                    ativo: {
                                        circulante: {
                                            caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['359'][7],
                                            estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                            contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['359'][7]
        
                                        },
                                        n_circulante: {
                                            imobilizado: {
                                                pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                                frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                                depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                            },
                                        },
                                    },
                                    passivo: {
                                        contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                    },
                                    patrimonio_liquido: {
                                        capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                        lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                                    }
                                }
                        let array_novo = [users[i]['359'][0], users[i]['359'][1], users[i]['359'][2], users[i]['359'][3], users[i]['359'][4], users[i]['359'][5], users[i]['359'][6], 0]
                        users[i].set('359', array_novo)
                        }

                    users[i].set('367', [users[i]['367'][0], users[i]['367'][1], users[i]['367'][2], users[i]['367'][3], users[i]['367'][4], users[i]['367'][5], 0, users[i]['367'][7]])
                    if(users[i]['367'][4] > 0){
                        users[i].taokeys = users[i].taokeys + users[i]['367'][7]
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['367'][7],
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['367'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                            }
                        }
                        users[i].taokeys = users[i].taokeys + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['367'][4]*(users[i]['367'][3] - users[i]['367'][2])
                        let array_insu = [(users[i]['367'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['367'][4]), users[i]['367'][1], users[i]['367'][2], users[i]['367'][3], users[i]['367'][4],(users[i]['367'][5] + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['367'][4]), (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['367'][4]*users[i]['367'][3], 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['367'][4]*(users[i]['367'][3])]
                        users[i].set('367', array_insu)
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['367'][4]*(users[i]['367'][3]),
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['367'][4]*(users[i]['367'][2]),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber + users[i]['367'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['367'][4]*(users[i]['367'][2]) + users[i]['367'][7] + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['367'][4]*(users[i]['367'][3])
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['367'][4]*(users[i]['367'][3]),
                            cmv: users[i].dre.cmv + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['367'][4]*(users[i]['367'][2]),
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                        //users[i]['367'][0] = users[i]['367'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['367'][4]
                        if(users[i]['367'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['367'][0]*36
                            users[i].balanco_patrimonial = {
                                ativo: {
                                    circulante: {
                                        caixa: users[i].balanco_patrimonial.ativo.circulante.caixa - users[i]['367'][0]*36, 
                                        estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                        contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber
    
                                    },
                                    n_circulante: {
                                        imobilizado: {
                                            pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                            frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                            depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                        },
                                    },
                                },
                                passivo: {
                                    contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                },
                                patrimonio_liquido: {
                                    capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                    lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - users[i]['367'][0]*36
                                }
                            }
                            users[i].dre = {
                                receita: users[i].dre.receita,
                                cmv: users[i].dre.cmv + users[i]['367'][0]*36,
                                despesas_administrativas: users[i].dre.despesas_administrativas,
                                despesas_vendas: users[i].dre.despesas_vendas,
                                despesas_financeiras: users[i].dre.despesas_financeiras,
                                depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                                ir: users[i].dre.ir
                            }
                        }   
                        else{users[i].taokeys = users[i].taokeys + users[i]['367'][0]*users[i]['367'][2]*1.2
                        let gamb = users[i].balanco_patrimonial.ativo.circulante.estoque
                        users[i].balanco_patrimonial = { //MODELO
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['367'][0]*users[i]['367'][2]*1.2,
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados + users[i]['367'][0]*users[i]['367'][2]*1.2 + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque)
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            cmv: users[i].dre.cmv + (-1)*users[i]['367'][0]*users[i]['367'][2]*1.2 + gamb,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                    users[i].set('367', [0, users[i]['367'][1], users[i]['367'][2], users[i]['367'][3], users[i]['367'][4], users[i]['367'][5], users[i]['367'][6], users[i]['367'][7]])}
                    }
                    else{
                        users[i].taokeys = users[i].taokeys + users[i]['367'][7];
                        users[i].balanco_patrimonial = {
                                    ativo: {
                                        circulante: {
                                            caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['367'][7],
                                            estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                            contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['367'][7]
        
                                        },
                                        n_circulante: {
                                            imobilizado: {
                                                pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                                frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                                depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                            },
                                        },
                                    },
                                    passivo: {
                                        contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                    },
                                    patrimonio_liquido: {
                                        capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                        lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                                    }
                                }
                        let array_novo = [users[i]['367'][0], users[i]['367'][1], users[i]['367'][2], users[i]['367'][3], users[i]['367'][4], users[i]['367'][5], users[i]['367'][6], 0]
                        users[i].set('367', array_novo)
                        }

                    users[i].set('368', [users[i]['368'][0], users[i]['368'][1], users[i]['368'][2], users[i]['368'][3], users[i]['368'][4], users[i]['368'][5], 0, users[i]['368'][7]])
                    if(users[i]['368'][4] > 0){
                        users[i].taokeys = users[i].taokeys + users[i]['368'][7]
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['368'][7],
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['368'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                            }
                        }
                        users[i].taokeys = users[i].taokeys + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['368'][4]*(users[i]['368'][3] - users[i]['368'][2])
                        let array_insu = [(users[i]['368'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['368'][4]), users[i]['368'][1], users[i]['368'][2], users[i]['368'][3], users[i]['368'][4],(users[i]['368'][5] + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['368'][4]), (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['368'][4]*users[i]['368'][3], 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['368'][4]*(users[i]['368'][3])]
                        users[i].set('368', array_insu)
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['368'][4]*(users[i]['368'][3]),
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['368'][4]*(users[i]['368'][2]),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber + users[i]['368'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['368'][4]*(users[i]['368'][2]) + users[i]['368'][7] + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['368'][4]*(users[i]['368'][3])
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['368'][4]*(users[i]['368'][3]),
                            cmv: users[i].dre.cmv + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['368'][4]*(users[i]['368'][2]),
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                        //users[i]['368'][0] = users[i]['368'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['368'][4]
                        if(users[i]['368'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['368'][0]*36
                            users[i].balanco_patrimonial = {
                                ativo: {
                                    circulante: {
                                        caixa: users[i].balanco_patrimonial.ativo.circulante.caixa - users[i]['368'][0]*36, 
                                        estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                        contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber
    
                                    },
                                    n_circulante: {
                                        imobilizado: {
                                            pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                            frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                            depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                        },
                                    },
                                },
                                passivo: {
                                    contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                },
                                patrimonio_liquido: {
                                    capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                    lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - users[i]['368'][0]*36
                                }
                            }
                            users[i].dre = {
                                receita: users[i].dre.receita,
                                cmv: users[i].dre.cmv + users[i]['368'][0]*36,
                                despesas_administrativas: users[i].dre.despesas_administrativas,
                                despesas_vendas: users[i].dre.despesas_vendas,
                                despesas_financeiras: users[i].dre.despesas_financeiras,
                                depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                                ir: users[i].dre.ir
                            }
                        }   
                        else{users[i].taokeys = users[i].taokeys + users[i]['368'][0]*users[i]['368'][2]*1.2
                        let gamb = users[i].balanco_patrimonial.ativo.circulante.estoque
                        users[i].balanco_patrimonial = { //MODELO
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['368'][0]*users[i]['368'][2]*1.2,
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados + users[i]['368'][0]*users[i]['368'][2]*1.2 + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque)
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            cmv: users[i].dre.cmv + (-1)*users[i]['368'][0]*users[i]['368'][2]*1.2 + gamb,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                    users[i].set('368', [0, users[i]['368'][1], users[i]['368'][2], users[i]['368'][3], users[i]['368'][4], users[i]['368'][5], users[i]['368'][6], users[i]['368'][7]])} 
                        uso_frota = uso_frota + ((users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['368'][4])/2
                    }
                    else{
                        users[i].taokeys = users[i].taokeys + users[i]['368'][7];
                        users[i].balanco_patrimonial = {
                                    ativo: {
                                        circulante: {
                                            caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['368'][7],
                                            estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                            contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['368'][7]
        
                                        },
                                        n_circulante: {
                                            imobilizado: {
                                                pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                                frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                                depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                            },
                                        },
                                    },
                                    passivo: {
                                        contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                    },
                                    patrimonio_liquido: {
                                        capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                        lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                                    }
                                }
                        let array_novo = [users[i]['368'][0], users[i]['368'][1], users[i]['368'][2], users[i]['368'][3], users[i]['368'][4], users[i]['368'][5], users[i]['368'][6], 0]
                        users[i].set('368', array_novo)
                        }

                    users[i].set('369', [users[i]['369'][0], users[i]['369'][1], users[i]['369'][2], users[i]['369'][3], users[i]['369'][4], users[i]['369'][5], 0, users[i]['369'][7]])
                    if(users[i]['369'][4] > 0){
                        users[i].taokeys = users[i].taokeys + users[i]['369'][7]
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['369'][7],
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['369'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                            }
                        }
                        users[i].taokeys = users[i].taokeys + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['369'][4]*(users[i]['369'][3] - users[i]['369'][2])
                        let array_insu = [(users[i]['369'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['369'][4]), users[i]['369'][1], users[i]['369'][2], users[i]['369'][3], users[i]['369'][4],(users[i]['369'][5] + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['369'][4]), (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['369'][4]*users[i]['369'][3], 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['369'][4]*(users[i]['369'][3])]
                        users[i].set('369', array_insu)
                        users[i].balanco_patrimonial = {
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + 0.5*(users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['369'][4]*(users[i]['369'][3]),
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['369'][4]*(users[i]['369'][2]),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber + users[i]['369'][7]

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['369'][4]*(users[i]['369'][2]) + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['369'][4]*(users[i]['369'][3])
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['369'][4]*(users[i]['369'][3]),
                            cmv: users[i].dre.cmv + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['369'][4]*(users[i]['369'][2]),
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                        //users[i]['369'][0] = users[i]['369'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['369'][4]
                        if(users[i]['369'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['369'][0]*36 //descontando valor de guardar insumos no estoque
                            users[i].balanco_patrimonial = {
                                ativo: {
                                    circulante: {
                                        caixa: users[i].balanco_patrimonial.ativo.circulante.caixa - users[i]['369'][0]*36, 
                                        estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                        contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber
    
                                    },
                                    n_circulante: {
                                        imobilizado: {
                                            pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                            frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                            depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                        },
                                    },
                                },
                                passivo: {
                                    contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                },
                                patrimonio_liquido: {
                                    capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                    lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - users[i]['369'][0]*36
                                }
                            }
                            users[i].dre = {
                                receita: users[i].dre.receita,
                                cmv: users[i].dre.cmv + users[i]['369'][0]*36,
                                despesas_administrativas: users[i].dre.despesas_administrativas,
                                despesas_vendas: users[i].dre.despesas_vendas,
                                despesas_financeiras: users[i].dre.despesas_financeiras,
                                depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                                ir: users[i].dre.ir
                            }
                        }   
                        else{users[i].taokeys = users[i].taokeys + users[i]['369'][0]*users[i]['369'][2]*1.2
                        let gamb = users[i].balanco_patrimonial.ativo.circulante.estoque
                        users[i].balanco_patrimonial = { //MODELO
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['369'][0]*users[i]['369'][2]*1.2,
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque),
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados + users[i]['369'][0]*users[i]['369'][2]*1.2 + (-1)*(users[i].balanco_patrimonial.ativo.circulante.estoque)
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            cmv: users[i].dre.cmv + (-1)*users[i]['369'][0]*users[i]['369'][2]*1.2 + gamb,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                    users[i].set('369', [0, users[i]['369'][1], users[i]['369'][2], users[i]['369'][3], users[i]['369'][4], users[i]['369'][5], users[i]['369'][6], users[i]['369'][7]])}
                        uso_frota = uso_frota + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['369'][4]
                    }
                    else{
                        users[i].taokeys = users[i].taokeys + users[i]['369'][7];
                        users[i].balanco_patrimonial = {
                                    ativo: {
                                        circulante: {
                                            caixa: users[i].balanco_patrimonial.ativo.circulante.caixa + users[i]['369'][7],
                                            estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                            contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - users[i]['369'][7]
        
                                        },
                                        n_circulante: {
                                            imobilizado: {
                                                pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                                frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                                depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                            },
                                        },
                                    },
                                    passivo: {
                                        contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                    },
                                    patrimonio_liquido: {
                                        capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                        lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                                    }
                                }
                        let array_novo = [users[i]['369'][0], users[i]['369'][1], users[i]['369'][2], users[i]['369'][3], users[i]['369'][4], users[i]['369'][5], users[i]['369'][6], 0]
                        users[i].set('369', array_novo)
                        }
                        */
                        
                    //
                    
                    users[i]['scoremod'] = 1
                    users[i]['propaganda'] = 1
                    users[i]['propagandauni'] = 1
                    users[i]['npesquisas'] = 1
//console.log(users[i]['147'][1])
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
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa - frota_soma*10800,
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - frota_soma*10800
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            cmv: users[i].dre.cmv,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas + frota_soma*10800,
                            despesas_financeiras: users[i].dre.despesas_financeiras,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                    }
                    users[i].taokeys = users[i].taokeys - users[i].pas*2160 //despesas do PAS
                    users[i].pas = users[i].pas + users[i].pas1;
                    users[i].pas1 = users[i].pas2;
                    users[i].pas2 = 0;

                    if(uso_frota/2000 > frota_soma){
                        let j = (uso_frota%2000)
                        if(j > 0){
                            users[i].taokeys = users[i].taokeys - (((uso_frota-j)/2000)-frota_soma+1)*60 //desconta o valor gasto com frota terceirizada
                            users[i].balanco_patrimonial = {
                                ativo: {
                                    circulante: {
                                        caixa: users[i].balanco_patrimonial.ativo.circulante.caixa - (((uso_frota-j)/2000)-frota_soma+1)*60,
                                        estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                        contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber
    
                                    },
                                    n_circulante: {
                                        imobilizado: {
                                            pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                            frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                            depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                        },
                                    },
                                },
                                passivo: {
                                    contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                },
                                patrimonio_liquido: {
                                    capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                    lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - (((uso_frota-j)/2000)-frota_soma+1)*60
                                }
                            }
                            users[i].dre = {
                                receita: users[i].dre.receita,
                                cmv: users[i].dre.cmv,
                                despesas_administrativas: users[i].dre.despesas_administrativas,
                                despesas_vendas: users[i].dre.despesas_vendas + (((uso_frota-j)/2000)-frota_soma+1)*60,
                                despesas_financeiras: users[i].dre.despesas_financeiras,
                                depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                                ir: users[i].dre.ir
                            }
                        }
                        else{
                            users[i].taokeys = users[i].taokeys - (((uso_frota)/2000)-frota_soma)*60 //desconta o valor gasto com frota terceirizada
                            users[i].balanco_patrimonial = {
                                ativo: {
                                    circulante: {
                                        caixa: users[i].balanco_patrimonial.ativo.circulante.caixa - (((uso_frota-j)/2000)-frota_soma)*60,
                                        estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                        contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber
    
                                    },
                                    n_circulante: {
                                        imobilizado: {
                                            pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                            frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                            depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                        },
                                    },
                                },
                                passivo: {
                                    contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                },
                                patrimonio_liquido: {
                                    capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                    lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - (((uso_frota-j)/2000)-frota_soma)*60
                                }
                            }
                            users[i].dre = {
                                receita: users[i].dre.receita,
                                cmv: users[i].dre.cmv,
                                despesas_administrativas: users[i].dre.despesas_administrativas,
                                despesas_vendas: users[i].dre.despesas_vendas + (((uso_frota-j)/2000)-frota_soma)*60,
                                despesas_financeiras: users[i].dre.despesas_financeiras,
                                depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                                ir: users[i].dre.ir
                            }
                        }
                    }
                      
                }
                    
                    // -_-_-_-
                for(let i = 0; i < users.length; i++){
                    //users[i]['npesquisas'] = 1 // (ALOCADO EM CIMA /\) numero de pesquisas feitas no turno q sera usada para divisao de 5% do faturamento total esta sendo "zerada" (apenas coloquei igual a 1 o padrao pq se n divide por 0 e o faturamento da errado) aqui para contagem no proximo turno
                    
                    
                    if(users[i].taokeys >= users[i]['divida'][0]/3 + users[i]['divida'][0]*0.08){
                        users[i].taokeys = users[i].taokeys - (users[i]['divida'][0]/3 + users[i]['divida'][0]*0.08)
                        users[i].balanco_patrimonial = { // Adding despesas financeiras
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa - users[i]['divida'][0]/3 - users[i]['divida'][0]*0.08,
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar - users[i]['divida'][0]/3
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - users[i]['divida'][0]*0.08
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            cmv: users[i].dre.cmv,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras + users[i]['divida'][0]*0.08,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                        users[i].set('divida', [users[i]['divida'][0]*(2/3), users[i]['divida'][1], users[i]['divida'][2]]) //contabilizando a passagem de tempo
                    }
                    else if(users[i].taokeys > users[i]['divida'][0]*0.08){
                        let gamb = (users[i]['divida'][0]/3 + users[i]['divida'][0]*0.08) - users[i].taokeys
                        users[i].taokeys = 0
                        users[i].balanco_patrimonial = { // Adding despesas financeiras
                            ativo: {
                                circulante: {
                                    caixa: 0,
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar - (users[i]['divida'][0]/3 - gamb)
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - users[i]['divida'][0]*0.08
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            cmv: users[i].dre.cmv,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras + users[i]['divida'][0]*0.08,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                        users[i].set('divida', [users[i]['divida'][0]*(2/3) + gamb, users[i]['divida'][1], users[i]['divida'][2]])
                    }
                    else{
                        users[i].balanco_patrimonial = { // Adding despesas financeiras
                            ativo: {
                                circulante: {
                                    caixa: 0,
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar + (users[i]['divida'][0]*0.08 - users[i].taokeys)
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - users[i]['divida'][0]*0.08
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            cmv: users[i].dre.cmv,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras + users[i]['divida'][0]*0.08,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                        users[i].set('divida', [users[i]['divida'][0] + (users[i]['divida'][0]*0.08 - users[i].taokeys), users[i]['divida'][1], users[i]['divida'][2]])
                        users[i].taokeys = 0
                    }

                    if(users[i].taokeys >= users[i]['divida'][1]/2 + users[i]['divida'][1]*0.08){
                        users[i].taokeys = users[i].taokeys - (users[i]['divida'][1]/2 + users[i]['divida'][1]*0.08)
                        users[i].balanco_patrimonial = { // Adding despesas financeiras
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa - users[i]['divida'][1]/2 - users[i]['divida'][1]*0.08,
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar - users[i]['divida'][1]/2
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - users[i]['divida'][1]*0.08
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            cmv: users[i].dre.cmv,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras + users[i]['divida'][1]*0.08,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                        users[i].set('divida', [users[i]['divida'][0], users[i]['divida'][1]/2, users[i]['divida'][2]]) //contabilizando a passagem de tempo
                    }
                    else if(users[i].taokeys > users[i]['divida'][1]*0.08){
                        let gamb = (users[i]['divida'][1]/2 + users[i]['divida'][1]*0.08) - users[i].taokeys
                        users[i].taokeys = 0
                        users[i].balanco_patrimonial = { // Adding despesas financeiras
                            ativo: {
                                circulante: {
                                    caixa: 0,
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar - (users[i]['divida'][1]/2 - gamb)
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - users[i]['divida'][1]*0.08
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            cmv: users[i].dre.cmv,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras + users[i]['divida'][1]*0.08,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                        users[i].set('divida', [users[i]['divida'][0], users[i]['divida'][1]/2 + gamb, users[i]['divida'][2]])
                    
                    }
                    else{
                        users[i].balanco_patrimonial = { // Adding despesas financeiras
                            ativo: {
                                circulante: {
                                    caixa: 0,
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar + (users[i]['divida'][1]*0.08 - users[i].taokeys)
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - users[i]['divida'][1]*0.08
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            cmv: users[i].dre.cmv,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras + users[i]['divida'][1]*0.08,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                        users[i].set('divida', [users[i]['divida'][0], users[i]['divida'][1] + (users[i]['divida'][1]*0.08 - users[i].taokeys), users[i]['divida'][2]])
                        users[i].taokeys = 0

                    }
        
                    if(users[i].taokeys >= users[i]['divida'][2]*1.08){
                        users[i].taokeys = users[i].taokeys - users[i]['divida'][2]*1.08
                        users[i].balanco_patrimonial = { // Adding despesas financeiras
                            ativo: {
                                circulante: {
                                    caixa: users[i].balanco_patrimonial.ativo.circulante.caixa - users[i]['divida'][2]*0.08 - users[i]['divida'][2],
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar - users[i]['divida'][2]
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - users[i]['divida'][2]*0.08
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            cmv: users[i].dre.cmv,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras + users[i]['divida'][2]*0.08,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                        users[i].set('divida', [0, users[i]['divida'][0], users[i]['divida'][1]]) //contabilizando a passagem de tempo
                    }
                    else if(users[i].taokeys > users[i]['divida'][2]*0.08){
                        let gamb = users[i]['divida'][2] + users[i]['divida'][2]*0.08 + (-1)*users[i].taokeys
                        users[i].balanco_patrimonial = { // Adding despesas financeiras
                            ativo: {
                                circulante: {
                                    caixa: 0,
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar - (users[i]['divida'][2] - gamb)
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - users[i]['divida'][2]*0.08
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            cmv: users[i].dre.cmv,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras + users[i]['divida'][2]*0.08,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                        //users[i]['divida'].pop();
                        //users[i]['divida'].unshift(gamb*1.08); //cobrar multa aqui
                        users[i].set('divida', [gamb + users[i]['divida'][2], users[i]['divida'][0], users[i]['divida'][1]])
                        users[i].taokeys = 0
                    }
                    else{
                        users[i].balanco_patrimonial = { // Adding despesas financeiras
                            ativo: {
                                circulante: {
                                    caixa: 0,
                                    estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                    contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber

                                },
                                n_circulante: {
                                    imobilizado: {
                                        pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                        frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                        depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                    },
                                },
                            },
                            passivo: {
                                contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar + (users[i]['divida'][2]*0.08 - users[i].taokeys)
                            },
                            patrimonio_liquido: {
                                capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados - users[i]['divida'][2]*0.08
                            }
                        }
                        users[i].dre = {
                            receita: users[i].dre.receita,
                            cmv: users[i].dre.cmv,
                            despesas_administrativas: users[i].dre.despesas_administrativas,
                            despesas_vendas: users[i].dre.despesas_vendas,
                            despesas_financeiras: users[i].dre.despesas_financeiras + users[i]['divida'][2]*0.08,
                            depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                            ir: users[i].dre.ir
                        }
                        users[i].set('divida', [users[i]['divida'][2] + (users[i]['divida'][2]*0.08 - users[i].taokeys), users[i]['divida'][0], users[i]['divida'][1]])
                        users[i].taokeys = 0
                    }
                    
                }
                for(let i = 0; i < users.length; i++){

                    //
                    Aluno.findOne({cooperativa: users[i].cooperativa, instancia: adm.instancia, temporario: 1, ativo: 1})
                                            .then((usert) => {
                                                usert.set('npesquisas', users[i].npesquisas)
                                                usert.set('turno', users[i].turno)
                                                usert.set('propaganda', users[i].propaganda)
                                                usert.set('propagandauni', users[i].propagandauni)
                                                usert.set('taokeys', users[i].taokeys)
                                                usert.set('comissao', users[i].comissao)
                                                //console.log('PASt: ' + userdef.pas)
                                                usert.set('pas', users[i].pas)
                                                usert.set('pas1', users[i].pas1)
                                                usert.set('pas2', users[i].pas2)
                                                usert.set('distribuidores', users[i].distribuidores)
                                                usert.set('promotores', users[i].promotores)
                                                usert.set('faturamento', users[i].faturamento)
                                                //console.log(index)
                                                usert.balanco_patrimonial = {
                                                    ativo: {
                                                        circulante: {
                                                            caixa: users[i].balanco_patrimonial.ativo.circulante.caixa,
                                                            estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                                            contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber
                        
                                                        },
                                                        n_circulante: {
                                                            imobilizado: {
                                                                pas: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.pas,
                                                                frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.frota,
                                                                depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.imobilizado.depreciacao_frota
                                                            },
                                                        },
                                                    },
                                                    passivo: {
                                                        contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                                    },
                                                    patrimonio_liquido: {
                                                        capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                                        lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                                                    }
                                                }
                                                usert.dre = {
                                                    receita: users[i].dre.receita,
                                                    cmv: users[i].dre.cmv,
                                                    despesas_administrativas: users[i].dre.despesas_administrativas,
                                                    despesas_vendas: users[i].dre.despesas_vendas,
                                                    despesas_financeiras: users[i].dre.despesas_financeiras,
                                                    depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                                                    ir: users[i].dre.ir
                                                }
                                                
                                                for(let s = 0; s < index.length; s++){
                                                    //console.log(index[s])
                                                    let serv = index[s]
                                                    usert.set(serv, [users[i][serv][0], users[i][serv][1], users[i][serv][2], users[i][serv][3], users[i][serv][4], users[i][serv][5], users[i][serv][6], users[i][serv][7]])
                                                }
                                                usert.save()
                                                    .then(() => {
                                                        socket.emit('feedback', ['success', 'turno foi finalizado (tem q implementar um socket.on no front q qnd recebe o socket debaixo pede pro server o seu faturamento!'])
                                                        sockets.emit('final-turno') //manda a info pra tds os sockets conectados de que acabou o turno e para eles requisitarem (!!socket.emit('receber-faturamento')!!) o novo state pós FATURAMENTO e se o jogador n esriver conectado qnd acontecer o processo de faturamento essa puxada de dados tb smp acontece qnd ele se loga
                                                    })
                                                    .catch((err) => {socket.emit('feedback', ['danger', 'falha ao salvar os dados no servidor (' + err + ')'])})
                                     
                                            })
                    // (IGUALANDO O BANCO TEMPORARIO COM O OFICIAL)
                    
                    users[i].turno = users[i].turno + 1

                    users[i].save()
                        .then(() => {console.log(users[i]['cooperativa'] + ' Teve seu faturamento processado com sucesso.')})
                        .catch((err) => { console.log('Erro ao salvar os FATURAMENTOS processados. Motivo ==> ' + err)})
                }
                sockets.emit('final-turno')

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
    }) //100% fatura sendo gerado mas falta coletar os dados para os demonstrativos BALAN Ok DRE OK
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
                        for(let i = 0; i < users.length; i++){
                            for(let h = 0; h < index.length; h++){
                                if(users[i][index[h]][1] == 1){
                                    serv.push(index[h])
                                }
                                if(users[i][index[h]][6] > 0){
                                    part[h] = part[h] + users[i][index[h]][6]
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
                        pesquisas['total_distribuidores'] = tdis
                        
                        pesquisas.iniciado = 1
                        pesquisas.ativo = 1

                        pesquisas.save()
                            .then(() => {
                                        for(let i = 0; i < users.length; i++){

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
                                                ativo: {
                                                    circulante: {
                                                        caixa: users[i].balanco_patrimonial.ativo.circulante.caixa,
                                                        estoque: users[i].balanco_patrimonial.ativo.circulante.estoque,
                                                        contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber
                    
                                                    },
                                                    n_circulante: {
                                                        imobilizado: {
                                                            pas: users[i].balanco_patrimonial.ativo.n_circulante.pas,
                                                            frota: users[i].balanco_patrimonial.ativo.n_circulante.frota,
                                                            depreciacao_frota: users[i].balanco_patrimonial.ativo.n_circulante.depreciacao_frota
                                                        }
                                                    }
                                                },
                                                passivo: {
                                                    contas_a_pagar: users[i].balanco_patrimonial.passivo.contas_a_pagar
                                                },
                                                patrimonio_liquido: {
                                                    capital_social: users[i].balanco_patrimonial.patrimonio_liquido.capital_social,
                                                    lucros_acumulados: users[i].balanco_patrimonial.patrimonio_liquido.lucros_acumulados
                                                }
                                            },
                                            dre: {
                                                receita: users[i].dre.receita,
                                                cmv: users[i].dre.cmv,
                                                despesas_administrativas: users[i].dre.despesas_administrativas,
                                                despesas_vendas: users[i].dre.despesas_vendas,
                                                despesas_financeiras: users[i].dre.despesas_financeiras,
                                                depreciacao_e_amortizacao: users[i].dre.depreciacao_e_amortizacao,
                                                ir: users[i].dre.ir
                                            },
                                            fluxo_de_caixa: {
                                                
                                            }
                                        });

                                        backup.fluxo_de_caixa = {

                                            lucro_bruto: users[i].dre.receita - users[i].dre.cmv,
                                            contas_a_receber: users[i].balanco_patrimonial.ativo.circulante.contas_a_receber,
                                            contas_a_receber_recebidas: users[i].fluxo_de_caixa.contas_a_receber_recebidas, //as contas a receber. recebidas nessa passagem de turno (q tiveram o valor somado a receita do período anterior)
                                            despesas: users[i].dre.despesas_administrativas + users[i].dre.despesas_financeiras + users[i].dre.despesas_vendas,
                                            fluxo_operacional: (users[i].dre.receita - users[i].dre.cmv) - users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - (users[i].dre.despesas_administrativas + users[i].dre.despesas_financeiras + users[i].dre.despesas_vendas),
                                            fluxo_financeiro: users[i].fluxo_de_caixa.fluxo_financeiro, // entra + emprestimos tomados e entra - empréstimos pagos 
                                            fluxo_investimento: users[i].fluxo_de_caixa.fluxo_investimento, // entra negativo tds as compras de VEICULOS e entra positivo todo o valor da venda de veiculos
                                            fluxo: ((users[i].dre.receita - users[i].dre.cmv) - users[i].balanco_patrimonial.ativo.circulante.contas_a_receber - (users[i].dre.despesas_administrativas + users[i].dre.despesas_financeiras + users[i].dre.despesas_vendas)) + users[i].fluxo_de_caixa.fluxo_financeiro
                                        
                                        }
                                        users[i].dre = {
                                            
                                            receita: 0,
                                            cmv: 0,
                                            despesas_administrativas: 0,
                                            despesas_vendas: 0,
                                            despesas_financeiras: 0,
                                            depreciacao_e_amortizacao: 0,
                                            ir: 0
                        
                                        }
                                        users[i].fluxo_de_caixa = {}

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
    socket.on('puxar-balancos-adm',  ([cooperativa, turno]) => {

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

    })

    socket.on('deletar-instancia', ([senha_mestra, instancia]) => {
        if(senha_mestra == 'senha-mestra'){
            Data.find({instancia: instancia})
                .then((data) => {

                    if(data.length > 0){ 

                        Aluno.find({instancia: instancia}) //pega os saves, status temporarios e n_temporarios
                            .then((alunos) => { 
                                alunos.remove()
                                    .then(() => {
                                        data.remove()
                                    })
                            })

                    }
                    else{
                        socket.emit('feedback', ['warning', 'instancia nao encontrada'])
                    }

                })
        }
        else{
            socket.emit('feedback', ['warning', 'senha-mestra incorreta'])
        }
    })
    

})
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
