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
        console.warn('Falha ao se conectar com o banco de dados. Motivo:', error)
    })
//mongoose.set('useFindAndModify', false);

const app = express()
const appadm = express()
const server = http.createServer(app)
const serveradm = http.createServer(appadm)
const sockets = socketio(server)
const socketsadm = socketio(serveradm)

let pesquisas = []

app.use(express.static('public'))
appadm.use(express.static('publicadm'))

sockets.on('connection', (socket) => { //conversa do server com os clients(n ADM)
    console.log(` <=> Cooperativa ON. socket.id: ${socket.id}`)

    socket.on('disconnect', () => {
        console.log(` <=> Cooperativa OFF. socket.id: ${socket.id}`)
    })
    socket.on('login-client', (creden) => {
        Aluno.findOne({sockid: socket.id}) // se n achar retorna Null e se vc tentar fazer essa pesquisa com um String sendo q no Schema ta como Number vai ir pro Catch ou vai pro Catch tb se n conseguir se conectar com o MongoDB
            .then((ll) => {
                if(ll !== null){socket.emit('ja-conectado', socket.id)}
                else{
                    Aluno.findOne({ cooperativa: creden[0], senha: creden[1]})
                        .then((user) => { if(user == null){
                                socket.emit('login-negado', creden[0])
                                }
                                else{
                                    Aluno.findOneAndUpdate({ _id: user._id}, { sockid: socket.id })
                                        .then(() => { 
                                            socket.emit('login-aprovado', creden[0]) 
                                            socket.emit('dados-servicos', [user["147"],
                user["148"],
                user["149"],
                user["157"],
                user["158"],
                user["159"],
                user["257"],
                user["258"],
                user["259"],
                user["267"],
                user["268"],
                user["269"],
                user["347"],
                user["348"],
                user["349"],
                user["357"],
                user["358"],
                user["359"],
                user["367"],
                user["368"],
                user["369"],
                user["taokeys"],
                user["frota"],
                user["promotores"],
                user["comissao"],
                user["distribuidores"],
                user["pas"],
                user["propaganda"],
                user["propagandauni"]])
                                        })
                                        .catch((err) => console.log( err + ' <=> Falha ao registrar login do player com o socket especifico: ' + socket.id))
                            }})
                        .catch((err) => {console.log(err + ' <=> Falha na comunicacao com o Banco de dados n 403 ' + socket.id)})
                        }
            })
            .catch(() => {console.log('falha na comunicacao com o Banco de dados n 504 ' +socket.id)})

                       
    })
    socket.on('register-client', (creden) => {
        Aluno.findOne({sockid: socket.id}) // se n achar retorna Null e se vc tentar fazer essa pesquisa com um String sendo q no Schema ta como Number vai ir pro Catch ou vai pro Catch tb se n conseguir se conectar com o MongoDB
            .then((ll) => {
                if(ll !== null){socket.emit('ja-conectado', ll.cooperativa)}
                else{
        Aluno.findOne({cooperativa: creden[0]})
            .then((userx) => { 
                if(userx !== null){socket.emit('operacao-negada', 'ja existe uma cooperativa com esse nome')}
                else{
                    let jogador = new Aluno({ sockid: socket.id, scorepro: 0, scoremod: 0, scorepreco: [0,0], propaganda: 220, propagandauni: 300, faturamento: 0, ativo: 1, taokeys: 18720000, comissao: 0.05, frota: [10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], cooperativa: creden[0], pas: 30, pas1:0, pas2:0, distribuidores: 640, promotores: 40, senha: creden[1], 
                        147:[985,1,288,600,300],
                        159:[0,0,396,0,0],
                        149:[0,0,360,0,0],
                        148:[0,0,324,0,0],
                        158:[0,0,360,0,0],
                        157:[0,0,324,0,0],
                        257:[0,0,396,0,0],
                        258:[0,0,432,0,0],
                        259:[0,0,468,0,0],
                        267:[0,0,432,0,0],
                        268:[0,0,468,0,0],
                        269:[0,0,504,0,0],
                        347:[0,0,432,0,0],
                        348:[0,0,468,0,0],
                        349:[0,0,504,0,0],
                        357:[0,0,468,0,0],
                        358:[0,0,504,0,0],
                        359:[0,0,540,0,0],
                        367:[0,0,504,0,0],
                        368:[0,0,540,0,0],
                        369:[0,0,576,0,0]});
                        jogador.save()
                            .then(Aluno.find({ cooperativa: creden[0]}))
                            .then((user) => { 
                                if(user !== null){
                                socket.emit('login-aprovado', creden[0]) 
                                socket.emit('dados-servicos', [user["147"],
    user["148"],
    user["149"],
    user["157"],
    user["158"],
    user["159"],
    user["257"],
    user["258"],
    user["259"],
    user["267"],
    user["268"],
    user["269"],
    user["347"],
    user["348"],
    user["349"],
    user["357"],
    user["358"],
    user["359"],
    user["367"],
    user["368"],
    user["369"],
    user["taokeys"],
    user["frota"],
    user["promotores"],
    user["comissao"],
    user["distribuidores"],
    user["pas"],
    user["propaganda"]]) }
    else{ socket.emit('operacao-negada', 'ocorreu uma falha no processo de registro') }
                            }) 
                            .catch((wrr) => {console.log(wrr)})

                }

            }) } })
            .catch((err) => {console.log(err+'. id:' + socket.id)})
    })
    socket.on('trocar-servico', (dados) => {
        let velho = dados[0];
        let novo = dados[1];
        let qnt = dados[2];
        Aluno.findOne({sockid: socket.id})
            .then((userx) => {
                if(userx !== null){
                    if(userx['taokeys'] >= qnt*30 && userx[velho][0] >= qnt){
                        if(userx[novo][1] !== 2){ 
                        let insu_velho = Number(userx[velho][0]) - Number(qnt)
                        let array_dados_velho = [insu_velho,1,userx[velho][2], userx[velho][3], userx[velho][4]];
                        let insu_novo = Number(userx[novo][0]) + Number(qnt)
                        let array_dados_novo = [insu_novo,1,userx[novo][2], userx[novo][3], userx[novo][4]];
                        userx.set(velho, array_dados_velho)
                        userx.set(novo, array_dados_novo)
                        userx.taokeys = userx.taokeys - qnt*30
                        userx.save()
                            .then(() => Aluno.findOne({ _id: userx._id}))                 
                            .then((user) => {
                                console.log(userx[velho][0] + ' <----userx(Schema trabalhado aqui)')
                                console.log(user[velho][0] + ' <=====user(recem pesquisado)')
                                if(user.taokeys == userx.taokeys){
                                socket.emit('update', [user["147"],
                                user["148"],
                                user["149"],
                                user["157"],
                                user["158"],
                                user["159"],
                                user["257"],
                                user["258"],
                                user["259"],
                                user["267"],
                                user["268"],
                                user["269"],
                                user["347"],
                                user["348"],
                                user["349"],
                                user["357"],
                                user["358"],
                                user["359"],
                                user["367"],
                                user["368"],
                                user["369"],
                                user["taokeys"],
                                user["frota"],
                                user["promotores"],
                                user["comissao"],
                                user["distribuidores"],
                                user["pas"],
                                user["propaganda"],
                                user["propagandauni"]]);
        
                                    }                  
                                })
                            .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})
                    }
                    else{socket.emit('operacao-negada', 'voce nao pode transferir insumos para um servico cancelado')}
                    }
                }
                else{
                    socket.emit('acesso-negado')
                }
            
            })
    })
    socket.on('encerrar-servico', (tipo) => {
        Aluno.findOne({sockid: socket.id})
            .then((userx) => {
                if(userx !== null){
                    if(userx[tipo][0] == 0 && userx[tipo][1] == 1){
                        let array_dados = [0, 2, userx[tipo][2], userx[tipo][3], 0]
                        userx.set(tipo, array_dados) 
                        userx.save()
                            .then(() => Aluno.findOne({ _id: userx._id}))                 
                            .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        socket.emit('update', [user["147"],
                                user["148"],
                                user["149"],
                                user["157"],
                                user["158"],
                                user["159"],
                                user["257"],
                                user["258"],
                                user["259"],
                                user["267"],
                                user["268"],
                                user["269"],
                                user["347"],
                                user["348"],
                                user["349"],
                                user["357"],
                                user["358"],
                                user["359"],
                                user["367"],
                                user["368"],
                                user["369"],
                                user["taokeys"],
                                user["frota"],
                                user["promotores"],
                                user["comissao"],
                                user["distribuidores"],
                                user["pas"],
                                user["propaganda"],
                                user["propagandauni"]]);
        
                                    }                  
                                })
                        .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})

                    }
                    else if(userx[tipo][0] == 0 && userx[tipo][1] == 2){
                        socket.emit('operacao-negada', 'servico ja esta em processo de cancelamento')
                    }
                    else if(userx[tipo][0] == 0 && userx[tipo][1] == 0){
                        socket.emit('operacao-negada', 'esse servico ja esta inativo')
                    }
                    else{
                        socket.emit('operacao-negada', 'voce nao pode ter insumos de um servico para encerra-lo')
                    }
                }
                else{
                    socket.emit('acesso-negado')
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    })
    socket.on('alterar-volume', (dados) => {
        let tipo = dados[0];
        let volume = Number(dados[1]);
        Aluno.findOne({sockid: socket.id})
            .then((userx) => {
                if(userx !== null){
                        if(volume >= 0){
                            let array_dados = [userx[tipo][0], userx[tipo][1], userx[tipo][2], userx[tipo][3], volume]
                            userx.set(tipo, array_dados) 
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id}))                 
                                .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        socket.emit('update', [user["147"],
                                user["148"],
                                user["149"],
                                user["157"],
                                user["158"],
                                user["159"],
                                user["257"],
                                user["258"],
                                user["259"],
                                user["267"],
                                user["268"],
                                user["269"],
                                user["347"],
                                user["348"],
                                user["349"],
                                user["357"],
                                user["358"],
                                user["359"],
                                user["367"],
                                user["368"],
                                user["369"],
                                user["taokeys"],
                                user["frota"],
                                user["promotores"],
                                user["comissao"],
                                user["distribuidores"],
                                user["pas"],
                                user["propaganda"],
                                user["propagandauni"]]);
        
                                    }                  
                                })
                        .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})
                          
                    }
                    else{socket.emit('operacao-negada', 'o volume de vendas so aceita valores positivos')}
                    
                
             
            }
                else{
                    socket.emit('acesso-negado')
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    })
    socket.on('aumentar-frota', (dados) => {
        let qnt = Number(dados)
        Aluno.findOne({sockid: socket.id})
            .then((userx) => {
                if(userx !== null){
                        if(qnt > 0 && userx.taokeys > qnt*57600){
                            let novaf = userx['frota'][0] + qnt
                            let array_dados = [novaf, userx['frota'][1], userx['frota'][2], userx['frota'][3], userx['frota'][4], userx['frota'][5], userx['frota'][6], userx['frota'][7], userx['frota'][8], userx['frota'][9], userx['frota'][10], userx['frota'][11], userx['frota'][12], userx['frota'][13], userx['frota'][14], userx['frota'][15], userx['frota'][16], userx['frota'][17], userx['frota'][18], userx['frota'][19], userx['frota'][20], userx['frota'][21], userx['frota'][22], userx['frota'][23]]
                            userx.taokeys = userx.taokeys - 57600*Number(dados)
                            userx.set('frota', array_dados) 
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id}))                 
                                .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        socket.emit('update', [user["147"],
                                user["148"],
                                user["149"],
                                user["157"],
                                user["158"],
                                user["159"],
                                user["257"],
                                user["258"],
                                user["259"],
                                user["267"],
                                user["268"],
                                user["269"],
                                user["347"],
                                user["348"],
                                user["349"],
                                user["357"],
                                user["358"],
                                user["359"],
                                user["367"],
                                user["368"],
                                user["369"],
                                user["taokeys"],
                                user["frota"],
                                user["promotores"],
                                user["comissao"],
                                user["distribuidores"],
                                user["pas"],
                                user["propaganda"],
                                user["propagandauni"]]);
        
                                    }                  
                                })
                        .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})
                          
                    }
                    else if(qnt > 0 && userx.taokeys < qnt*57600){
                        socket.emit('operacao-negada', 'falta caixa')
                    }
                    else{socket.emit('operacao-negada', 'apenas valores positivos')}
                    
                
             
            }
                else{
                    socket.emit('acesso-negado')
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    })
    socket.on('checar-frota', () => {
        Aluno.findOne({sockid: socket.id})
            .then((userx) => {
                if(userx !== null){
                    let resp = userx['frota']
                    socket.emit('resp-checar-frota', resp)         
                
             
            }
                else{
                    socket.emit('acesso-negado')
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    })
    socket.on('alterar-preco', (dados) => {
        let tipo = dados[0];
        let preco = Number(dados[1]);
        Aluno.findOne({sockid: socket.id})
            .then((userx) => {
                if(userx !== null){
                    if(userx[tipo][1] == 1 || userx[tipo][1] == 0){
                        if(preco > 0 && preco < 9999){
                            let array_dados = [userx[tipo][0], userx[tipo][1], userx[tipo][2], preco, userx[tipo][4]]
                            userx.set(tipo, array_dados) 
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id}))                 
                                .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        socket.emit('update', [user["147"],
                                user["148"],
                                user["149"],
                                user["157"],
                                user["158"],
                                user["159"],
                                user["257"],
                                user["258"],
                                user["259"],
                                user["267"],
                                user["268"],
                                user["269"],
                                user["347"],
                                user["348"],
                                user["349"],
                                user["357"],
                                user["358"],
                                user["359"],
                                user["367"],
                                user["368"],
                                user["369"],
                                user["taokeys"],
                                user["frota"],
                                user["promotores"],
                                user["comissao"],
                                user["distribuidores"],
                                user["pas"],
                                user["propaganda"],
                                user["propagandauni"]]);
        
                                    }                  
                                })
                        .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})

                    }
                    else{socket.emit('operacao-negada', 'o valor do preco unitario deve estar entre 0 e 9999')}
                }
                else if(userx[tipo][0] == 0 && userx[tipo][1] == 2){
                    socket.emit('operacao-negada', ' servico ja foi cancelado')
                }
                else{
                    socket.emit('operacao-negada', ' voce nao pode ter insumos de um servico para encerra-lo')
                }
             
            }
                else{
                    socket.emit('acesso-negado')
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    })
    socket.on('aumentar-promotores', (dados) => {
        let qnt = Number(dados)
        Aluno.findOne({sockid: socket.id})
            .then((userx) => {
                if(userx !== null){
                        if(qnt > 0){
                            let novaf = userx['promotores'] + qnt
                            userx.set('promotores', novaf) 
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id}))                 
                                .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        socket.emit('update', [user["147"],
                                user["148"],
                                user["149"],
                                user["157"],
                                user["158"],
                                user["159"],
                                user["257"],
                                user["258"],
                                user["259"],
                                user["267"],
                                user["268"],
                                user["269"],
                                user["347"],
                                user["348"],
                                user["349"],
                                user["357"],
                                user["358"],
                                user["359"],
                                user["367"],
                                user["368"],
                                user["369"],
                                user["taokeys"],
                                user["frota"],
                                user["promotores"],
                                user["comissao"],
                                user["distribuidores"],
                                user["pas"],
                                user["propaganda"],
                                user["propagandauni"]]);
        
                                    }                  
                                })
                        .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})
                          
                    }
                    else if(qnt > 0 && userx.taokeys < qnt*57600){
                        socket.emit('operacao-negada', 'falta caixa')
                    }
                    else{socket.emit('operacao-negada', 'apenas valores positivos')}
                    
                
             
            }
                else{
                    socket.emit('acesso-negado')
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    })
    socket.on('diminuir-promotores', (dados) => {
        let qnt = Number(dados)
        Aluno.findOne({sockid: socket.id})
            .then((userx) => {
                if(userx !== null){
                        if(qnt > 0){
                            let novaf = userx['promotores'] - qnt
                            userx.set('promotores', novaf) 
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id}))                 
                                .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        socket.emit('update', [user["147"],
                                user["148"],
                                user["149"],
                                user["157"],
                                user["158"],
                                user["159"],
                                user["257"],
                                user["258"],
                                user["259"],
                                user["267"],
                                user["268"],
                                user["269"],
                                user["347"],
                                user["348"],
                                user["349"],
                                user["357"],
                                user["358"],
                                user["359"],
                                user["367"],
                                user["368"],
                                user["369"],
                                user["taokeys"],
                                user["frota"],
                                user["promotores"],
                                user["comissao"],
                                user["distribuidores"],
                                user["pas"],
                                user["propaganda"],
                                user["propagandauni"]]);
        
                                    }                  
                                })
                        .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})
                          
                    }
                    else if(qnt > 0 && userx.taokeys < qnt*57600){
                        socket.emit('operacao-negada', 'falta caixa')
                    }
                    else{socket.emit('operacao-negada', 'apenas valores positivos')}
                    
                
             
            }
                else{
                    socket.emit('acesso-negado')
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    })
    socket.on('aumentar-distribuidores', (dados) => {
        let qnt = Number(dados)
        Aluno.findOne({sockid: socket.id})
            .then((userx) => {
                if(userx !== null){
                        if(qnt > 0){
                            let novaf = userx['distribuidores'] + qnt
                            userx.set('distribuidores', novaf) 
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id}))                 
                                .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        socket.emit('update', [user["147"],
                                user["148"],
                                user["149"],
                                user["157"],
                                user["158"],
                                user["159"],
                                user["257"],
                                user["258"],
                                user["259"],
                                user["267"],
                                user["268"],
                                user["269"],
                                user["347"],
                                user["348"],
                                user["349"],
                                user["357"],
                                user["358"],
                                user["359"],
                                user["367"],
                                user["368"],
                                user["369"],
                                user["taokeys"],
                                user["frota"],
                                user["promotores"],
                                user["comissao"],
                                user["distribuidores"],
                                user["pas"],
                                user["propaganda"],
                                user["propagandauni"]]);
        
                                    }                  
                                })
                        .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})
                          
                    }
                    else if(qnt > 0 && userx.taokeys < qnt*57600){
                        socket.emit('operacao-negada', 'falta caixa')
                    }
                    else{socket.emit('operacao-negada', 'apenas valores positivos')}
                    
                
             
            }
                else{
                    socket.emit('acesso-negado')
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    })
    socket.on('diminuir-distribuidores', (dados) => {
        let qnt = Number(dados)
        Aluno.findOne({sockid: socket.id})
            .then((userx) => {
                if(userx !== null){
                        if(qnt > 0){
                            let novaf = userx['distribuidores'] - qnt
                            userx.set('distribuidores', novaf) 
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id}))                 
                                .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        socket.emit('update', [user["147"],
                                user["148"],
                                user["149"],
                                user["157"],
                                user["158"],
                                user["159"],
                                user["257"],
                                user["258"],
                                user["259"],
                                user["267"],
                                user["268"],
                                user["269"],
                                user["347"],
                                user["348"],
                                user["349"],
                                user["357"],
                                user["358"],
                                user["359"],
                                user["367"],
                                user["368"],
                                user["369"],
                                user["taokeys"],
                                user["frota"],
                                user["promotores"],
                                user["comissao"],
                                user["distribuidores"],
                                user["pas"],
                                user["propaganda"],
                                user["propagandauni"]]);
        
                                    }                  
                                })
                        .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})
                          
                    }
                    else{socket.emit('operacao-negada', 'apenas valores positivos')}
                    
                
             
            }
                else{
                    socket.emit('acesso-negado')
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    })
    socket.on('diminuir-pas', (dados) => {
        let qnt = Number(dados)
        Aluno.findOne({sockid: socket.id})
            .then((userx) => {
                if(userx !== null){
                        if(qnt > 0){
                            let novaf = userx['pas'] - qnt
                            userx.set('pas', novaf) 
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id}))                 
                                .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        socket.emit('update', [user["147"],
                                user["148"],
                                user["149"],
                                user["157"],
                                user["158"],
                                user["159"],
                                user["257"],
                                user["258"],
                                user["259"],
                                user["267"],
                                user["268"],
                                user["269"],
                                user["347"],
                                user["348"],
                                user["349"],
                                user["357"],
                                user["358"],
                                user["359"],
                                user["367"],
                                user["368"],
                                user["369"],
                                user["taokeys"],
                                user["frota"],
                                user["promotores"],
                                user["comissao"],
                                user["distribuidores"],
                                user["pas"],
                                user["propaganda"],
                                user["propagandauni"]]);
        
                                    }                  
                                })
                        .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})
                          
                    }
                    else{socket.emit('operacao-negada', 'apenas valores positivos')}
                    
                
             
            }
                else{
                    socket.emit('acesso-negado')
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    })
    socket.on('aumentar-pas', (dados) => {
        let qnt = Number(dados)
        Aluno.findOne({sockid: socket.id})
            .then((userx) => {
                if(userx !== null){
                        if(qnt > 0){
                            let novaf = userx['pas2'] + qnt
                            userx.set('pas2', novaf) 
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id}))                 
                                .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        socket.emit('update', [user["147"],
                                user["148"],
                                user["149"],
                                user["157"],
                                user["158"],
                                user["159"],
                                user["257"],
                                user["258"],
                                user["259"],
                                user["267"],
                                user["268"],
                                user["269"],
                                user["347"],
                                user["348"],
                                user["349"],
                                user["357"],
                                user["358"],
                                user["359"],
                                user["367"],
                                user["368"],
                                user["369"],
                                user["taokeys"],
                                user["frota"],
                                user["promotores"],
                                user["comissao"],
                                user["distribuidores"],
                                user["pas"],
                                user["propaganda"],
                                user["propagandauni"]]);
        
                                    }                  
                                })
                        .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})
                          
                    }
                    else{socket.emit('operacao-negada', 'apenas valores positivos')}
                    
                
             
            }
                else{
                    socket.emit('acesso-negado')
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    })
    socket.on('propaganda-unitaria', (dados) => {
        console.log(dados)
        let qnt = Number(dados[1])
        Aluno.findOne({sockid: socket.id})
            .then((userx) => {
                if(userx !== null){
                        if(qnt > 0 && userx.taokeys >= qnt){
                            let novaf = Number(userx['propagandauni']) + qnt
                            userx.taokeys = userx.taokeys - qnt
                            userx.set('propagandauni', novaf) 
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id}))                 
                                .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        socket.emit('update', [user["147"],
                                user["148"],
                                user["149"],
                                user["157"],
                                user["158"],
                                user["159"],
                                user["257"],
                                user["258"],
                                user["259"],
                                user["267"],
                                user["268"],
                                user["269"],
                                user["347"],
                                user["348"],
                                user["349"],
                                user["357"],
                                user["358"],
                                user["359"],
                                user["367"],
                                user["368"],
                                user["369"],
                                user["taokeys"],
                                user["frota"],
                                user["promotores"],
                                user["comissao"],
                                user["distribuidores"],
                                user["pas"],
                                user["propaganda"],
                                user["propagandauni"]]);
        
                                    }                  
                                })
                        .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})
                          
                    }
                    else{socket.emit('operacao-negada', 'apenas valores positivos')}
                    
                
             
            }
                else{
                    socket.emit('acesso-negado')
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    })
    socket.on('aumentar-propaganda', (dados) => {
        let qnt = Number(dados)
        Aluno.findOne({sockid: socket.id})
            .then((userx) => {
                if(userx !== null){
                        if(qnt > 0 && userx.taokeys >= qnt){
                            let novaf = userx['propaganda'] + qnt
                            userx.taokeys = userx.taokeys - qnt
                            userx.set('propaganda', novaf) 
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id}))                 
                                .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        socket.emit('update', [user["147"],
                                user["148"],
                                user["149"],
                                user["157"],
                                user["158"],
                                user["159"],
                                user["257"],
                                user["258"],
                                user["259"],
                                user["267"],
                                user["268"],
                                user["269"],
                                user["347"],
                                user["348"],
                                user["349"],
                                user["357"],
                                user["358"],
                                user["359"],
                                user["367"],
                                user["368"],
                                user["369"],
                                user["taokeys"],
                                user["frota"],
                                user["promotores"],
                                user["comissao"],
                                user["distribuidores"],
                                user["pas"],
                                user["propaganda"],
                                user["propagandauni"]]);
        
                                    }                  
                                })
                        .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})
                          
                    }
                    else{socket.emit('operacao-negada', 'apenas valores positivos')}
                    
                
             
            }
                else{
                    socket.emit('acesso-negado')
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    })
    socket.on('diminuir-pas', (dados) => {
        let qnt = Number(dados)
        Aluno.findOne({sockid: socket.id})
            .then((userx) => {
                if(userx !== null){
                        if(qnt > 0){
                            let novaf = userx['pas'] - qnt
                            userx.set('pas', novaf) 
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id}))                 
                                .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        socket.emit('update', [user["147"],
                                user["148"],
                                user["149"],
                                user["157"],
                                user["158"],
                                user["159"],
                                user["257"],
                                user["258"],
                                user["259"],
                                user["267"],
                                user["268"],
                                user["269"],
                                user["347"],
                                user["348"],
                                user["349"],
                                user["357"],
                                user["358"],
                                user["359"],
                                user["367"],
                                user["368"],
                                user["369"],
                                user["taokeys"],
                                user["frota"],
                                user["promotores"],
                                user["comissao"],
                                user["distribuidores"],
                                user["pas"],
                                user["propaganda"],
                                user["propagandauni"]]);
        
                                    }                  
                                })
                        .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})
                          
                    }
                    else{socket.emit('operacao-negada', 'apenas valores positivos')}
                    
                
             
            }
                else{
                    socket.emit('acesso-negado')
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    })
    socket.on('checar-pas', () => {
        Aluno.findOne({sockid: socket.id})
            .then((userx) => {
                if(userx !== null){
                    let resp = [userx['pas1'], userx['pas2']]
                    socket.emit('resp-checar-pas', resp)  
            }
                else{
                    socket.emit('acesso-negado')
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    })
    socket.on('comissao', (dados) => {
        let qnt = Number(dados)
        Aluno.findOne({sockid: socket.id})
            .then((userx) => {
                if(userx !== null){
                        if(qnt > 0 && qnt <= 1){
                            userx.set('comissao', qnt) 
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id}))                 
                                .then((user) => {
                                    if(user.taokeys == userx.taokeys){
                                        socket.emit('update', [user["147"],
                                user["148"],
                                user["149"],
                                user["157"],
                                user["158"],
                                user["159"],
                                user["257"],
                                user["258"],
                                user["259"],
                                user["267"],
                                user["268"],
                                user["269"],
                                user["347"],
                                user["348"],
                                user["349"],
                                user["357"],
                                user["358"],
                                user["359"],
                                user["367"],
                                user["368"],
                                user["369"],
                                user["taokeys"],
                                user["frota"],
                                user["promotores"],
                                user["comissao"],
                                user["distribuidores"],
                                user["pas"],
                                user["propaganda"],
                                user["propagandauni"]]);
        
                                    }                  
                                })
                        .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})
                          
                    }
                    else{socket.emit('operacao-negada', 'apenas valores entra 0 e 1')}
                    
                
             
            }
                else{
                    socket.emit('acesso-negado')
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    })
    socket.on('desfazer-encerramento', (tipo) => {
        Aluno.findOne({sockid: socket.id})
            .then((userx) => {
                if(userx !== null){
                    if(userx[tipo][0] == 0 && userx[tipo][1] == 2){
                        let array_dados = [0, 1, userx[tipo][2], userx[tipo][3], userx[tipo][4]]
                        userx.set(tipo, array_dados) 
                        userx.save()
                            .then(() => Aluno.findOne({ _id: userx._id}))                 
                            .then((user) => {
                                console.log(userx[tipo][1] + ' <----userx(Schema trabalhado aqui)')
                                console.log(user[tipo][1] + ' <=====user(recem pesquisado)')
                                    if(user.taokeys == userx.taokeys){
                                        socket.emit('update', [user["147"],
                                user["148"],
                                user["149"],
                                user["157"],
                                user["158"],
                                user["159"],
                                user["257"],
                                user["258"],
                                user["259"],
                                user["267"],
                                user["268"],
                                user["269"],
                                user["347"],
                                user["348"],
                                user["349"],
                                user["357"],
                                user["358"],
                                user["359"],
                                user["367"],
                                user["368"],
                                user["369"],
                                user["taokeys"],
                                user["frota"],
                                user["promotores"],
                                user["comissao"],
                                user["distribuidores"],
                                user["pas"],
                                user["propaganda"],
                                user["propagandauni"]]);
        
                                    }
                                    else{socket.emit('operacao-negada', 'falha ao atunteticar operacao')}                  
                                })
                        .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})

                    }
                    else{
                        socket.emit('operacao-negada', 'esse servico nao esta em processo de encerramento')
                    }
                }
                else{
                    socket.emit('acesso-negado')
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
    })
    socket.on('comprar-servico', (dados) => {
        let tipo = dados[0];
        let qnti = dados[1];
    

        Aluno.findOne({sockid: socket.id})
            .then((userx) => { 
                    if(userx !== null){
                        //console.log(user.taokeys + ' ccccccccccccccc');
                        if(userx['taokeys'] >= qnti*userx[tipo][2] && userx[tipo][1] !== 2){
                           console.log(userx[tipo][1] + " <====")
                           //userx[tipo][1] = 1
                           let soma_insu = Number(userx[tipo][0]) + Number(qnti)
                           let array_dados = [soma_insu, 1, userx[tipo][2], userx[tipo][3], userx[tipo][4]]
                           userx.set(tipo, array_dados)
                           userx.taokeys = userx.taokeys - qnti*userx[tipo][2]
                           userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id}))                 
                                .then((user) => {
                                    console.log(userx[tipo][1] + ' <----userx(Schema trabalhado aqui)')
                                    console.log(user[tipo][1] + ' <=====user(recem pesquisado)')
                                    if(user.taokeys == userx.taokeys){
                                        socket.emit('update', [user["147"],
                                        user["148"],
                                        user["149"],
                                        user["157"],
                                        user["158"],
                                        user["159"],
                                        user["257"],
                                        user["258"],
                                        user["259"],
                                        user["267"],
                                        user["268"],
                                        user["269"],
                                        user["347"],
                                        user["348"],
                                        user["349"],
                                        user["357"],
                                        user["358"],
                                        user["359"],
                                        user["367"],
                                        user["368"],
                                        user["369"],
                                        user["taokeys"],
                                        user["frota"],
                                        user["promotores"],
                                        user["comissao"],
                                        user["distribuidores"],
                                        user["pas"],
                                        user["propaganda"],
                                        user["propagandauni"]]);
                
                                            }                  
                                        })
                                .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})
                                    
                            
                            }
                            else if(userx['taokeys'] >= qnti*userx[tipo][2] && userx[tipo][1] == 2){
                                socket.emit('operacao-negada', 'esse servico esta em espera')
                            }
                        else{
                            socket.emit('operacao-negada', 'falta caixa');
                            //console.log('hlu')
                    }
                    //console.log(user.taokeys)
                    }
                    else{
                        socket.emit('acesso-negado')
                    }
            }) 
            .catch((err) => { console.log('falha na comunicacao com o banco de dados para o ' +socket.id+ " - " + err)
    })
    })
    /*
                    if(userx[tipo][1] == 2){
                        socket.emit('operacao-negada', 'esse servico esta em espera')
                    }
                    if(userx[tipo][1] == 1){
                        socket.emit('operacao-negada', 'voce ja possue esse servico')
                    }
                    if(userx[tipo][1] == 0){
                         }
                         */
    socket.on('pesquisar-pas', () => {
        Aluno.findOne({sockid: socket.id})
            .then((userx) => { 
                    if(userx !== null){
                        //console.log(user.taokeys + ' ccccccccccccccc');
                        if(userx['taokeys'] >= 2160){
                           //console.log(user.taokeys + " <====")
                           userx.taokeys = userx.taokeys - 2160
                           //console.log(user.taokeys)
                           userx.save()
                            .then(() => {Aluno.findOne({ _id: userx._id})
                                            .then((user) => {if(user.taokeys == userx.taokeys){
                                                //console.log(user.taokeys + ' <----')
                                                //console.log(user + ' <=====')
                                                socket.emit('update', [user["147"],
                user["148"],
                user["149"],
                user["157"],
                user["158"],
                user["159"],
                user["257"],
                user["258"],
                user["259"],
                user["267"],
                user["268"],
                user["269"],
                user["347"],
                user["348"],
                user["349"],
                user["357"],
                user["358"],
                user["359"],
                user["367"],
                user["368"],
                user["369"],
                user["taokeys"],
                user["frota"],
                user["promotores"],
                user["comissao"],
                user["distribuidores"],
                user["pas"],
                user["propaganda"],
                user["propagandauni"]]);
                socket.emit('resposta-pesquisar-pas');// <==== sistema de cobranca funcional falta apenas entregar o pacote solicitado
                                            }                  
                                        })
                                            .catch(() => {console.log('erro na confirmacao n 302')})
                                    })
                            .catch((err) => {console.log('falha em salvar transacao por pesquisa n 307' + err)})
                            }

                        else{
                            socket.emit('operacao-negada', 'falta caixa');
                            //console.log('hlu')
                    }
                    //console.log(user.taokeys)
                    }
                    else{
                        socket.emit('acesso-negado')
                    }
            }) 
            .catch(() => { console.log('falha na comunicacao com o banco de dados para o ' +socket.id)
    })
    })
    socket.on('check-turno', () => { 
        Aluno.findOne({sockid: socket.id})
            .then((userx) => {
                let faturamento = 0;
                if(userx !== null){
                        if(userx['faturamento'] !== 0){
                            faturamento = userx['faturamento']
                            userx['faturamento'] = 0; 
                            userx.save()
                                .then(() => Aluno.findOne({ _id: userx._id}))                 
                                .then((user) => {
                                    socket.emit('final-turno', faturamento)
                                    if(user.taokeys == userx.taokeys){
                                        socket.emit('update', [user["147"],
                                user["148"],
                                user["149"],
                                user["157"],
                                user["158"],
                                user["159"],
                                user["257"],
                                user["258"],
                                user["259"],
                                user["267"],
                                user["268"],
                                user["269"],
                                user["347"],
                                user["348"],
                                user["349"],
                                user["357"],
                                user["358"],
                                user["359"],
                                user["367"],
                                user["368"],
                                user["369"],
                                user["taokeys"],
                                user["frota"],
                                user["promotores"],
                                user["comissao"],
                                user["distribuidores"],
                                user["pas"],
                                user["propaganda"],
                                user["propagandauni"]]);
        
                                    }                  
                                })
                        .catch((err) => {console.log('erro na confirmacao n 302: ' + err)})
                          
                    }
                    else{}
                    
                
             
            }
                else{
                }
            })
            .catch((err) => {console.log(err + ' para o id: ' + socket.id)})
        })

})


server.listen(3000, () => {
    console.log(`--> Server escutando porta: 3000`)
})
let admid = "31415926"
socketsadm.on('connection', (socket) => { //conversa do server com o client do ADM
 // a autenticacao deve ocorrer AQUI. Utilizando-se do socket.id para rastrear momentaneamente qual jogador esta conetado nesse socket especifico, logo conversar direto com o banco de dados e dar autoricao para manter a conexcap
    console.log(` <=> Conexao administrador ON. socket.id: ${socket.id}`)


    socket.on('disconnect', () => {
        if(admid == socket.id){
            admid = "31415926"
        }
        // colocar um if aqui q checa tds os socket.id(s) q desconetarem e se for o socket do ADM tirar as permissoes de ADM relacionadas nesse socket
        console.log(` <=> Conexao administrador OFF. socket.id: ${socket.id}`)
    })
    socket.on('login-adm', (creden) => { 
        if(creden[0] == "gvcode" && creden[1] == "123"){
            socket.emit('login-aprovado')
            admid = socket.id // esse auten = 1 talvez seja valido para tds que se conectarem a porta 5000, logo necessita-se conveesa com o banco de dados para esse verificacao
        }
        else if(socket.id == admid){
            socket.emit('alerta', 'voce ja esta logado')
        }
        else{
            socket.emit('login-negado', socket.id)
        }
        
    })
    let demanda = 10000000 //n eh um valor fixo kkk
    socket.on('finalizar-turno', () => { if(socket.id == admid){
        
    
        Aluno.find({ativo: 1})
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
                for(let i = 0; i < users.length; i++){
                    soma = soma + users[i]['distribuidores']
                    soma1 = soma1 + users[i]['pas']
                    soma2 = soma2 + users[i]['promotores']
                    soma3 = soma3 + users[i]['comissao']
                    //soma4 = soma4 + users[i]['distribuidores']
                    soma5 = soma5 + users[i]['propaganda']
                    soma6 = soma6 + users[i]['propagandauni']



                    // <><><>
                function modo_de_rateio_propaganda_por_servico_score(params) {
                    
                
                    if(users[i]['147'][3] > 0){
                        let c = 0;
                        for(let k = 0; k < users.length; k++){
                            c = c + users[k]['147'][3]
                        }
                        users[i]['scorepro'] = users[i]['scorepro'] + users[i]['147'][3]/c
                    }

                    
                    if(users[i]['148'][3] > 0){
                        let c = 0;
                        for(let k = 0; k < users.length; k++){
                            c = c + users[k]['148'][3]
                        }
                        users[i]['scorepro'] = users[i]['scorepro'] + users[i]['148'][3]/c
                    }
                    if(users[i]['149'][3] > 0){
                        let c = 0;
                        for(let k = 0; k < users.length; k++){
                            c = c + users[k]['149'][3]
                        }
                        users[i]['scorepro'] = users[i]['scorepro'] + users[i]['149'][3]/c
                    }
                    if(users[i]['157'][3] > 0){
                        let c = 0;
                        for(let k = 0; k < users.length; k++){
                            c = c + users[k]['157'][3]
                        }
                        users[i]['scorepro'] = users[i]['scorepro'] + users[i]['157'][3]/c
                    }
                    if(users[i]['158'][3] > 0){
                        let c = 0;
                        for(let k = 0; k < users.length; k++){
                            c = c + users[k]['158'][3]
                        }
                        users[i]['scorepro'] = users[i]['scorepro'] + users[i]['158'][3]/c
                    }
                    if(users[i]['159'][3] > 0){
                        let c = 0;
                        for(let k = 0; k < users.length; k++){
                            c = c + users[k]['159'][3]
                        }
                        users[i]['scorepro'] = users[i]['scorepro'] + users[i]['159'][3]/c
                    }
                    if(users[i]['257'][3] > 0){
                        let c = 0;
                        for(let k = 0; k < users.length; k++){
                            c = c + users[k]['257'][3]
                        }
                        users[i]['scorepro'] = users[i]['scorepro'] + users[i]['257'][3]/c
                    }
                    if(users[i]['258'][3] > 0){
                        let c = 0;
                        for(let k = 0; k < users.length; k++){
                            c = c + users[k]['258'][3]
                        }
                        users[i]['scorepro'] = users[i]['scorepro'] + users[i]['258'][3]/c
                    }
                    if(users[i]['259'][3] > 0){
                        let c = 0;
                        for(let k = 0; k < users.length; k++){
                            c = c + users[k]['259'][3]
                        }
                        users[i]['scorepro'] = users[i]['scorepro'] + users[i]['259'][3]/c
                    }
                    if(users[i]['267'][3] > 0){
                        let c = 0;
                        for(let k = 0; k < users.length; k++){
                            c = c + users[k]['267'][3]
                        }
                        users[i]['scorepro'] = users[i]['scorepro'] + users[i]['267'][3]/c
                    }
                    if(users[i]['268'][3] > 0){
                        let c = 0;
                        for(let k = 0; k < users.length; k++){
                            c = c + users[k]['268'][3]
                        }
                        users[i]['scorepro'] = users[i]['scorepro'] + users[i]['268'][3]/c
                    }
                    if(users[i]['269'][3] > 0){
                        let c = 0;
                        for(let k = 0; k < users.length; k++){
                            c = c + users[k]['269'][3]
                        }
                        users[i]['scorepro'] = users[i]['scorepro'] + users[i]['269'][3]/c
                    }
                    if(users[i]['347'][3] > 0){
                        let c = 0;
                        for(let k = 0; k < users.length; k++){
                            c = c + users[k]['347'][3]
                        }
                        users[i]['scorepro'] = users[i]['scorepro'] + users[i]['347'][3]/c
                    }
                    if(users[i]['348'][3] > 0){
                        let c = 0;
                        for(let k = 0; k < users.length; k++){
                            c = c + users[k]['348'][3]
                        }
                        users[i]['scorepro'] = users[i]['scorepro'] + users[i]['348'][3]/c
                    }
                    if(users[i]['349'][3] > 0){
                        let c = 0;
                        for(let k = 0; k < users.length; k++){
                            c = c + users[k]['349'][3]
                        }
                        users[i]['scorepro'] = users[i]['scorepro'] + users[i]['349'][3]/c
                    }
                    if(users[i]['357'][3] > 0){
                        let c = 0;
                        for(let k = 0; k < users.length; k++){
                            c = c + users[k]['357'][3]
                        }
                        users[i]['scorepro'] = users[i]['scorepro'] + users[i]['357'][3]/c
                    }
                    if(users[i]['358'][3] > 0){
                        let c = 0;
                        for(let k = 0; k < users.length; k++){
                            c = c + users[k]['358'][3]
                        }
                        users[i]['scorepro'] = users[i]['scorepro'] + users[i]['358'][3]/c
                    }
                    if(users[i]['359'][3] > 0){
                        let c = 0;
                        for(let k = 0; k < users.length; k++){
                            c = c + users[k]['359'][3]
                        }
                        users[i]['scorepro'] = users[i]['scorepro'] + users[i]['359'][3]/c
                    }
                    if(users[i]['367'][3] > 0){
                        let c = 0;
                        for(let k = 0; k < users.length; k++){
                            c = c + users[k]['367'][3]
                        }
                        users[i]['scorepro'] = users[i]['scorepro'] + users[i]['367'][3]/c
                    }
                    if(users[i]['368'][3] > 0){
                        let c = 0;
                        for(let k = 0; k < users.length; k++){
                            c = c + users[k]['368'][3]
                        }
                        users[i]['scorepro'] = users[i]['scorepro'] + users[i]['368'][3]/c
                    }
                    if(users[i]['369'][3] > 0){
                        let c = 0;
                        for(let k = 0; k < users.length; k++){
                            c = c + users[k]['369'][3]
                        }
                        users[i]['scorepro'] = users[i]['scorepro'] + users[i]['369'][3]/c
                    }
                }

                    // <><><>
                


                    //
                
                    
                
                    if(users[i]['147'][4] > 0 && users[i]['147'][1] == 1){
                        users[i]['scorepreco'][0] = users[i]['scorepreco'][0] + users[i]['147'][4] //insumos vezes preco unico
                        users[i]['scorepreco'][1] = users[i]['scorepreco'][1] + users[i]['147'][4]*users[i]['147'][3]
                      }
                    if(users[i]['159'][4] > 0 && users[i]['159'][1] == 1){
                        users[i]['scorepreco'][0] = users[i]['scorepreco'][0] + users[i]['159'][4]
                        users[i]['scorepreco'][1] = users[i]['scorepreco'][1] + users[i]['159'][4]*users[i]['159'][3]
           
                      }
                    if(users[i]['149'][4] > 0 && users[i]['149'][1] == 1){
                        users[i]['scorepreco'][0] = users[i]['scorepreco'][0] + users[i]['149'][4]
                        users[i]['scorepreco'][1] = users[i]['scorepreco'][1] + users[i]['149'][4]*users[i]['149'][3]          
                            }
                    if(users[i]['148'][4] > 0 && users[i]['148'][1] == 1){
                        users[i]['scorepreco'][0] = users[i]['scorepreco'][0] + users[i]['148'][4]
                        users[i]['scorepreco'][1] = users[i]['scorepreco'][1] + users[i]['148'][4]*users[i]['148'][3]            
                            }
                    if(users[i]['158'][4] > 0 && users[i]['158'][1] == 1){
                        users[i]['scorepreco'][0] = users[i]['scorepreco'][0] + users[i]['158'][4]
                        users[i]['scorepreco'][1] = users[i]['scorepreco'][1] + users[i]['158'][4]*users[i]['158'][3]        
                            }
                    if(users[i]['157'][4] > 0 && users[i]['157'][1] == 1){
                        users[i]['scorepreco'][0] = users[i]['scorepreco'][0] + users[i]['157'][4]
                        users[i]['scorepreco'][1] = users[i]['scorepreco'][1] + users[i]['157'][4]*users[i]['157'][3]            
                            }
                    if(users[i]['257'][4] > 0 && users[i]['257'][1] == 1){
                        users[i]['scorepreco'][0] = users[i]['scorepreco'][0] + users[i]['257'][4]
                        users[i]['scorepreco'][1] = users[i]['scorepreco'][1] + users[i]['257'][4]*users[i]['257'][3]         
                    }
                    if(users[i]['258'][4] > 0 && users[i]['258'][1] == 1){
                        users[i]['scorepreco'][0] = users[i]['scorepreco'][0] + users[i]['258'][4]
                        users[i]['scorepreco'][1] = users[i]['scorepreco'][1] + users[i]['258'][4]*users[i]['258'][3]        
                    }
                    if(users[i]['259'][4] > 0 && users[i]['259'][1] == 1){
                        users[i]['scorepreco'][0] = users[i]['scorepreco'][0] + users[i]['259'][4]
                        users[i]['scorepreco'][1] = users[i]['scorepreco'][1] + users[i]['259'][4]*users[i]['259'][3]          
                    }
                    if(users[i]['267'][4] > 0 && users[i]['267'][1] == 1){
                        users[i]['scorepreco'][0] = users[i]['scorepreco'][0] + users[i]['267'][4]
                        users[i]['scorepreco'][1] = users[i]['scorepreco'][1] + users[i]['267'][4]*users[i]['267'][3]          
                    }
                    if(users[i]['268'][4] > 0 && users[i]['268'][1] == 1){
                        users[i]['scorepreco'][0] = users[i]['scorepreco'][0] + users[i]['268'][4]
                        users[i]['scorepreco'][1] = users[i]['scorepreco'][1] + users[i]['268'][4]*users[i]['268'][3]           
                    }
                    if(users[i]['269'][4] > 0 && users[i]['269'][1] == 1){
                        users[i]['scorepreco'][0] = users[i]['scorepreco'][0] + users[i]['269'][4]
                        users[i]['scorepreco'][1] = users[i]['scorepreco'][1] + users[i]['269'][4]*users[i]['269'][3]          
                    }
                    if(users[i]['347'][4] > 0 && users[i]['347'][1] == 1){
                        users[i]['scorepreco'][0] = users[i]['scorepreco'][0] + users[i]['347'][4]
                        users[i]['scorepreco'][1] = users[i]['scorepreco'][1] + users[i]['347'][4]*users[i]['347'][3]           
                    }
                    if(users[i]['348'][4] > 0 && users[i]['348'][1] == 1){
                        users[i]['scorepreco'][0] = users[i]['scorepreco'][0] + users[i]['348'][4]
                        users[i]['scorepreco'][1] = users[i]['scorepreco'][1] + users[i]['348'][4]*users[i]['348'][3]            
                    }
                    if(users[i]['349'][4] > 0 && users[i]['349'][1] == 1){
                        users[i]['scorepreco'][0] = users[i]['scorepreco'][0] + users[i]['349'][4]
                        users[i]['scorepreco'][1] = users[i]['scorepreco'][1] + users[i]['349'][4]*users[i]['349'][3]           
                    }
                    if(users[i]['357'][4] > 0 && users[i]['357'][1] == 1){
                        users[i]['scorepreco'][0] = users[i]['scorepreco'][0] + users[i]['357'][4]
                        users[i]['scorepreco'][1] = users[i]['scorepreco'][1] + users[i]['357'][4]*users[i]['357'][3]          
                    }
                    if(users[i]['358'][4] > 0 && users[i]['358'][1] == 1){
                        users[i]['scorepreco'][0] = users[i]['scorepreco'][0] + users[i]['358'][4]
                        users[i]['scorepreco'][1] = users[i]['scorepreco'][1] + users[i]['358'][4]*users[i]['358'][3]          
                    }
                    if(users[i]['359'][4] > 0 && users[i]['359'][1] == 1){
                        users[i]['scorepreco'][0] = users[i]['scorepreco'][0] + users[i]['359'][4]
                        users[i]['scorepreco'][1] = users[i]['scorepreco'][1] + users[i]['359'][4]*users[i]['359'][3]          
                    }
                    if(users[i]['367'][4] > 0 && users[i]['367'][1] == 1){
                        users[i]['scorepreco'][0] = users[i]['scorepreco'][0] + users[i]['367'][4]
                        users[i]['scorepreco'][1] = users[i]['scorepreco'][1] + users[i]['367'][4]*users[i]['367'][3]         
                    }
                    if(users[i]['368'][4] > 0 && users[i]['368'][1] == 1){
                        users[i]['scorepreco'][0] = users[i]['scorepreco'][0] + users[i]['368'][4]
                        users[i]['scorepreco'][1] = users[i]['scorepreco'][1] + users[i]['368'][4]*users[i]['368'][3]           
                    }
                    if(users[i]['369'][4] > 0 && users[i]['369'][1] == 1){
                        users[i]['scorepreco'][0] = users[i]['scorepreco'][0] + users[i]['369'][4]
                        users[i]['scorepreco'][1] = users[i]['scorepreco'][1] + users[i]['369'][4]*users[i]['369'][3]      
                    } ////
                








                    //
                    ////
                    if(users[i]['147'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['147'][4]*5
           
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
                    } ////
                }
                for(let i = 0; i < users.length; i++){
                    scorex = scorex + users[i]['scoremod']
                    scorey1 = scorey1 + users[i]['scorepreco'][0]
                    scorey2 = scorey2 + users[i]['scorepreco'][1]
                    //scorep = scorep + users[i]['scorepro']
                }
                console.log(scorey1 + ' <-- scorey1 - ' + scorey2 + ' <-- scorey2')
                let preco_medio = scorey2/scorey1; //continuar daqui o rateio do faturamento pelo preco unitario usando esse preco medio global
                let dist = 0;
                console.log(preco_medio + ' <-- preco medio')
                for(let i = 0; i < users.length; i++){
                    let media_user = users[i]['scorepreco'][1]/users[i]['scorepreco'][0]
                    dist = dist + preco_medio/media_user
                    users[i]['frota'].pop(); //depreciacao do veiculo! a cada turno apaga o ultimo elemtno do array e adiciona um 0 no inicio, logo tds os elemtos q sobram avancam uma casa pra direita ou seja depreciam mais
                    users[i]['frota'].unshift(0);
                }
                
                for(let i = 0; i < users.length; i++){

                    let media_user = users[i]['scorepreco'][1]/users[i]['scorepreco'][0]
                    let scorepp = preco_medio/media_user
                    users[i]['faturamento'] = (0.09*users[i]['distribuidores']/soma + 0.09*users[i]['pas']/soma1 + 0.07*users[i]['promotores']/soma2 + 0.09*users[i]['comissao']/soma3 + 0.1*users[i]['propaganda']/soma5 + 0.12*users[i]['scoremod']/scorex + 0.3*(scorepp/dist) + 0.10*users[i]['propagandauni']/soma6)*demanda
                    console.log("Parcela de mercado adquirida para o player (" + users[i]['cooperativa'] + ')   -dsitribuidores (max 0.09)-> ' +0.09*users[i]['distribuidores']/soma + ' -pas (max 0.09)->  ' + 0.09*users[i]['pas']/soma1 + ' -promotores (max 0.07)-> ' + 0.07*users[i]['promotores']/soma2 + ' -comissao (max 0.09)-> ' + 0.09*users[i]['comissao']/soma3 + ' -propaganda (max 0.10)-> ' + 0.1*users[i]['propaganda']/soma5 + ' -modelos_de_servicos (max 0.12)-> ' + 0.12*users[i]['scoremod']/scorex + ' -precos_unitario (max 0.30)-> ' + 0.3*(scorepp/dist) + ' -propaganda_unitaria (max 0.10)-> ' + 0.1*users[i]['propagandauni']/soma6)
                    console.log((0.09*users[i]['distribuidores']/soma + 0.09*users[i]['pas']/soma1 + 0.07*users[i]['promotores']/soma2 + 0.09*users[i]['comissao']/soma3 + 0.1*users[i]['propaganda']/soma5 + 0.12*users[i]['scoremod']/scorex + 0.3*(scorepp/dist) + 0.10*users[i]['propagandauni']/soma6)*demanda)
                    //users[i]['faturamento']/users[i]['scorepreco'][1]  <-- qnts % vendeu do que foi planejado
                    
                    
                    //  -_-_-_-
                    //Apos a computacao do faturamento do player no codigo abaixo altera-se no Schema o lucro resultante desse faturamento levando em conta o faturamento planejado do player, como o professor instruiu \/
                  
                    let uso_frota = 0;
                    if(users[i]['147'][4] > 0){
                        users[i].taokeys = users[i].taokeys + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['147'][4]*(users[i]['147'][3] - users[i]['147'][2])
                        users[i]['147'][0] = users[i]['147'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['147'][4]
                        if(users[i]['147'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['147'][0]*36
                        }
                        else{
                            users[i].taokeys = users[i].taokeys + users[i]['147'][0]*users[i]['147'][2]*1.2}
           
                      }
                    if(users[i]['159'][4] > 0){
                        users[i].taokeys = users[i].taokeys + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['159'][4]*(users[i]['159'][3] - users[i]['159'][2])
                        users[i]['159'][0] = users[i]['159'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['159'][4]
                        if(users[i]['159'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['159'][0]*36
                        }
                        else{users[i].taokeys = users[i].taokeys + users[i]['159'][0]*users[i]['159'][2]*1.2}
                        uso_frota = uso_frota + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['149'][4]
                      }
                    if(users[i]['149'][4] > 0){
                        users[i].taokeys = users[i].taokeys + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['149'][4]*(users[i]['149'][3] - users[i]['149'][2])
                        users[i]['149'][0] = users[i]['149'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['149'][4]
                        if(users[i]['149'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['149'][0]*36
                        }
                        else{users[i].taokeys = users[i].taokeys + users[i]['149'][0]*users[i]['149'][2]*1.2}
                        uso_frota = uso_frota + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['149'][4]        
                            }
                    if(users[i]['148'][4] > 0){
                        users[i].taokeys = users[i].taokeys + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['148'][4]*(users[i]['148'][3] - users[i]['148'][2])
                        users[i]['148'][0] = users[i]['148'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['148'][4]
                        if(users[i]['148'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['148'][0]*36
                        }   
                        else{users[i].taokeys = users[i].taokeys + users[i]['148'][0]*users[i]['148'][2]*1.2}
                        uso_frota = uso_frota + ((users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['149'][4])/2
                    }
                    if(users[i]['158'][4] > 0){
                        users[i].taokeys = users[i].taokeys + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['158'][4]*(users[i]['158'][3] - users[i]['158'][2])
                        users[i]['158'][0] = users[i]['158'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['158'][4]
                        if(users[i]['158'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['158'][0]*36
                        }   
                        else{users[i].taokeys = users[i].taokeys + users[i]['158'][0]*users[i]['158'][2]*1.2}
                        uso_frota = uso_frota + ((users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['149'][4])/2
                    }
                    if(users[i]['157'][4] > 0){
                        users[i].taokeys = users[i].taokeys + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['157'][4]*(users[i]['157'][3] - users[i]['157'][2])
                        users[i]['157'][0] = users[i]['157'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['157'][4]
                        if(users[i]['157'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['157'][0]*36
                        }   
                        else{users[i].taokeys = users[i].taokeys + users[i]['157'][0]*users[i]['157'][2]*1.2}
                            }
                    if(users[i]['257'][4] > 0){
                        users[i].taokeys = users[i].taokeys + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['257'][4]*(users[i]['257'][3] - users[i]['257'][2])
                        users[i]['257'][0] = users[i]['257'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['257'][4]
                        if(users[i]['257'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['257'][0]*36
                        
                        }   
                        else{users[i].taokeys = users[i].taokeys + users[i]['257'][0]*users[i]['257'][2]*1.2}
                    }
                    if(users[i]['258'][4] > 0){
                        users[i].taokeys = users[i].taokeys + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['258'][4]*(users[i]['258'][3] - users[i]['258'][2])
                        users[i]['258'][0] = users[i]['258'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['258'][4]
                        if(users[i]['258'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['258'][0]*36
                        }   
                        else{users[i].taokeys = users[i].taokeys + users[i]['258'][0]*users[i]['258'][2]*1.2}
                        uso_frota = uso_frota + ((users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['149'][4])/2
                    }
                    if(users[i]['259'][4] > 0){
                        users[i].taokeys = users[i].taokeys + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['259'][4]*(users[i]['259'][3] - users[i]['259'][2])
                        users[i]['259'][0] = users[i]['259'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['259'][4]
                        if(users[i]['259'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['259'][0]*36
                        }   
                        else{users[i].taokeys = users[i].taokeys + users[i]['259'][0]*users[i]['259'][2]*1.2}
                        uso_frota = uso_frota + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['149'][4]
                    }
                    if(users[i]['267'][4] > 0){
                        users[i].taokeys = users[i].taokeys + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['267'][4]*(users[i]['267'][3] - users[i]['267'][2])
                        users[i]['267'][0] = users[i]['267'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['267'][4]
                        if(users[i]['267'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['267'][0]*36
                        }   
                        else{users[i].taokeys = users[i].taokeys + users[i]['267'][0]*users[i]['267'][2]*1.2}
                    }
                    if(users[i]['268'][4] > 0){
                        users[i].taokeys = users[i].taokeys + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['268'][4]*(users[i]['268'][3] - users[i]['268'][2])
                        users[i]['268'][0] = users[i]['268'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['268'][4]
                        if(users[i]['268'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['268'][0]*36
                        }   
                        else{users[i].taokeys = users[i].taokeys + users[i]['268'][0]*users[i]['268'][2]*1.2}
                        uso_frota = uso_frota + ((users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['149'][4])/2
                    }
                    if(users[i]['269'][4] > 0){
                        users[i].taokeys = users[i].taokeys + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['269'][4]*(users[i]['269'][3] - users[i]['269'][2])
                        users[i]['269'][0] = users[i]['269'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['269'][4]
                        if(users[i]['269'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['269'][0]*36
                        }   
                        else{users[i].taokeys = users[i].taokeys + users[i]['269'][0]*users[i]['269'][2]*1.2}
                        uso_frota = uso_frota + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['149'][4]
                    }
                    if(users[i]['347'][4] > 0){
                        users[i].taokeys = users[i].taokeys + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['347'][4]*(users[i]['347'][3] - users[i]['347'][2])
                        users[i]['347'][0] = users[i]['347'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['347'][4]
                        if(users[i]['347'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['347'][0]*36
                        }   
                        else{users[i].taokeys = users[i].taokeys + users[i]['347'][0]*users[i]['347'][2]*1.2}
                    }
                    if(users[i]['348'][4] > 0){
                        users[i].taokeys = users[i].taokeys + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['348'][4]*(users[i]['348'][3] - users[i]['348'][2])
                        users[i]['348'][0] = users[i]['348'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['348'][4]
                        if(users[i]['348'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['348'][0]*36
                        }   
                        else{users[i].taokeys = users[i].taokeys + users[i]['348'][0]*users[i]['348'][2]*1.2}
                        uso_frota = uso_frota + ((users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['149'][4])/2
                    }
                    if(users[i]['349'][4] > 0){
                        users[i].taokeys = users[i].taokeys + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['349'][4]*(users[i]['349'][3] - users[i]['349'][2])
                        users[i]['349'][0] = users[i]['349'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['349'][4]
                        if(users[i]['349'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['349'][0]*36
                        }   
                        else{users[i].taokeys = users[i].taokeys + users[i]['349'][0]*users[i]['349'][2]*1.2}
                        uso_frota = uso_frota + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['149'][4]
                    }
                    if(users[i]['357'][4] > 0){
                        users[i].taokeys = users[i].taokeys + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['357'][4]*(users[i]['357'][3] - users[i]['357'][2])
                        users[i]['357'][0] = users[i]['357'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['357'][4]
                        if(users[i]['357'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['357'][0]*36
                        }   
                        else{users[i].taokeys = users[i].taokeys + users[i]['357'][0]*users[i]['357'][2]*1.2}
                    }
                    if(users[i]['358'][4] > 0){
                        users[i].taokeys = users[i].taokeys + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['358'][4]*(users[i]['358'][3] - users[i]['358'][2])
                        users[i]['358'][0] = users[i]['358'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['358'][4]
                        if(users[i]['358'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['358'][0]*36
                        }   
                        else{users[i].taokeys = users[i].taokeys + users[i]['358'][0]*users[i]['358'][2]*1.2}
                        uso_frota = uso_frota + ((users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['149'][4])/2
                    }
                    if(users[i]['359'][4] > 0){
                        users[i].taokeys = users[i].taokeys + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['359'][4]*(users[i]['359'][3] - users[i]['359'][2])
                        users[i]['359'][0] = users[i]['359'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['359'][4]
                        if(users[i]['359'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['359'][0]*36
                        }   
                        else{users[i].taokeys = users[i].taokeys + users[i]['359'][0]*users[i]['359'][2]*1.2}
                        uso_frota = uso_frota + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['149'][4]
                    }
                    if(users[i]['367'][4] > 0){
                        users[i].taokeys = users[i].taokeys + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['367'][4]*(users[i]['367'][3] - users[i]['367'][2])
                        users[i]['367'][0] = users[i]['367'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['367'][4]
                        if(users[i]['367'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['367'][0]*36
                        }   
                        else{users[i].taokeys = users[i].taokeys + users[i]['367'][0]*users[i]['367'][2]*1.2}
                    }
                    if(users[i]['368'][4] > 0){
                        users[i].taokeys = users[i].taokeys + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['368'][4]*(users[i]['368'][3] - users[i]['368'][2])
                        users[i]['368'][0] = users[i]['368'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['368'][4]
                        if(users[i]['368'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['368'][0]*36
                        }   
                        else{users[i].taokeys = users[i].taokeys + users[i]['368'][0]*users[i]['368'][2]*1.2} 
                        uso_frota = uso_frota + ((users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['149'][4])/2
                    }
                    if(users[i]['369'][4] > 0){
                        users[i].taokeys = users[i].taokeys + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['369'][4]*(users[i]['369'][3] - users[i]['369'][2])
                        users[i]['369'][0] = users[i]['369'][0] - (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['369'][4]
                        if(users[i]['369'][0] >= 0){
                            users[i].taokeys = users[i].taokeys - users[i]['369'][0]*36
                        }   
                        else{users[i].taokeys = users[i].taokeys + users[i]['369'][0]*users[i]['369'][2]*1.2}
                        uso_frota = uso_frota + (users[i]['faturamento']/users[i]['scorepreco'][1])*users[i]['149'][4]
                    }
                    //
users[i]['scoremod'] = 0
if(users[i]['147'][1] == 2){
    users[i]['147'][1] = 3
}
else if(users[i]['147'][1] == 3){
    users[i]['147'][1] = 0

}
if(users[i]['159'][1] == 2){
    users[i]['159'][1] = 3
}
else if(users[i]['159'][1] == 3){
    users[i]['159'][1] = 0

}
if(users[i]['149'][1] == 2){
    users[i]['149'][1] = 3
}
else if(users[i]['149'][1] == 3){
    users[i]['149'][1] = 0

}
if(users[i]['148'][1] == 2){
    users[i]['148'][1] = 3
}
else if(users[i]['148'][1] == 3){
    users[i]['148'][1] = 0

}
if(users[i]['158'][1] == 2){
    users[i]['158'][1] = 3
}
else if(users[i]['158'][1] == 3){
    users[i]['158'][1] = 0

}
if(users[i]['157'][1] == 2){
    users[i]['157'][1] = 3
}
else if(users[i]['157'][1] == 3){
    users[i]['157'][1] = 0

}
if(users[i]['257'][1] == 2){
    users[i]['257'][1] = 3
}
else if(users[i]['257'][1] == 3){
    users[i]['257'][1] = 0

}
if(users[i]['258'][1] == 2){
    users[i]['258'][1] = 3
}
else if(users[i]['258'][1] == 3){
    users[i]['258'][1] = 0

}
if(users[i]['259'][1] == 2){
    users[i]['259'][1] = 3
}
else if(users[i]['259'][1] == 3){
    users[i]['259'][1] = 0

}
if(users[i]['267'][1] == 2){
    users[i]['267'][1] = 3
}
else if(users[i]['267'][1] == 3){
    users[i]['267'][1] = 0

}
if(users[i]['268'][1] == 2){
    users[i]['268'][1] = 3
}
else if(users[i]['268'][1] == 3){
    users[i]['268'][1] = 0

}
if(users[i]['269'][1] == 2){
    users[i]['269'][1] = 3
}
else if(users[i]['269'][1] == 3){
    users[i]['269'][1] = 0

}
if(users[i]['347'][1] == 2){
    users[i]['347'][1] = 3
}
else if(users[i]['347'][1] == 3){
    users[i]['347'][1] = 0

}
if(users[i]['348'][1] == 2){
    users[i]['348'][1] = 3
}
else if(users[i]['348'][1] == 3){
    users[i]['348'][1] = 0

}
if(users[i]['349'][1] == 2){
    users[i]['349'][1] = 3
}
else if(users[i]['349'][1] == 3){
    users[i]['349'][1] = 0

}
if(users[i]['357'][1] == 2){
    users[i]['357'][1] = 3
}
else if(users[i]['357'][1] == 3){
    users[i]['357'][1] = 0

}
if(users[i]['358'][1] == 2){
    users[i]['358'][1] = 3
}
else if(users[i]['358'][1] == 3){
    users[i]['358'][1] = 0

}
if(users[i]['359'][1] == 2){
    users[i]['359'][1] = 3
}
else if(users[i]['359'][1] == 3){
    users[i]['359'][1] = 0

}
if(users[i]['367'][1] == 2){
    users[i]['367'][1] = 3
}
else if(users[i]['367'][1] == 3){
    users[i]['367'][1] = 0

}
if(users[i]['368'][1] == 2){
    users[i]['368'][1] = 3
}
else if(users[i]['368'][1] == 3){
    users[i]['368'][1] = 0

}
if(users[i]['369'][1] == 2){
    users[i]['369'][1] = 3
}
else if(users[i]['369'][1] == 3){
    users[i]['369'][1] = 0

}

                    //
                    
                    
                    let frota_soma = 0;
                    for(let h = 0; h < users[i]['frota']; h++){

                        frota_soma = frota_soma + users[i]['frota'][h]
                    }
                    if(frota_soma > 0){
                        users[i].taokeys = users[i].taokeys - frota_soma*10800
                    }
                    users[i].pas = users[i].pas + users[i].pas1;
                    users[i].pas1 = users[i].pas2;
                    users[i].pas2 = 0;

                    if(uso_frota/2000 > frota_soma){
                        let j = (uso_frota%2000)
                        users[i].taokeys = users[i].taokeys - (((uso_frota-j)/2000)-frota_soma+1)*60 //desconta o valor gasto com frota terceirizada
                    }
                    if(users[i]['promotores'] > 0){
                        users[i].taokeys = users[i].taokeys - users[i]['promotores']*2160
                    }
                    
                }
                    
                    

                    // -_-_-_-
                for(let i = 0; i < users.length; i++){
                    
                    users[i].save()
                        .then(() => {console.log(users[i]['cooperativa'] + ' Teve seu faturamento processado com sucesso.')})
                        .catch((err) => { console.log('Erro ao salvar os FATURAMENTOS processados. Motivo ==> ' + err)})
                }

            })
            .then((hope) => {console.log(hope + ' <-hope')})
           .catch((err) => {console.log('erro n 708 =>' + err + ' .id:' + socket.id)})


          // \/ essa parte de baixo calcula o resultado das pesquisas para serem mostradas no proximo turno mas CUIDADO porque esse bloco debaixo e o e cima rodarao simultaneamente do jeito q estra (precisa botar .then(() = > {logo qnd terminar esse logica botar ela antes do  botar .save() de cim botar a ;)})
    }
    else{socket.emit('acesso-negado', socket.id)}
})

    
    /*
          Aluno.find({ativo: 1})
            .then((users) => {
                //console.log(users)
                
                let npas = 0;
                let ndistri = 0;

                let s147 = 0 
                let s159 = 0
                let s149 = 0
                let s148 = 0
                let s158 = 0
                let s157 = 0
                let s257 = 0
                let s258 = 0
                let s259 = 0
                let s267 = 0
                let s268 = 0
                let s269 = 0
                let s347 = 0
                let s348 = 0
                let s349 = 0
                let s357 = 0
                let s358 = 0
                let s359 = 0
                let s367 = 0
                let s368 = 0
                let s369 = 0
                
                for(let i = 0; i < users.length; i++){

        s147 = s147 + users[i]['147'][1];
        s159 = s159 + users[i]['159'][1];
        s149 = s149 + users[i]['149'][1];
        s148 = s148 + users[i]['148'][1];
        s158 = s158 + users[i]['158'][1];
        s157 = s157 + users[i]['157'][1];
        s257 = s257 + users[i]['257'][1];
        s258 = s258 + users[i]['258'][1];
        s259 = s259 + users[i]['259'][1];
        s267 = s267 + users[i]['267'][1];
        s268 = s268 + users[i]['268'][1];
        s269 = s269 + users[i]['269'][1];
        s347 = s347 + users[i]['347'][1];
        s348 = s348 + users[i]['348'][1];
        s349 = s349 + users[i]['349'][1];
        s357 = s357 + users[i]['357'][1];
        s358 = s358 + users[i]['358'][1];
        s359 = s359 + users[i]['359'][1];
        s367 = s367 + users[i]['367'][1];
        s368 = s368 + users[i]['368'][1];
        s369 = s369 + users[i]['369'][1]
       

            }
            let servicos_existentes = []
                if(s147 > 0){
                    servicos_existentes.push('147')
                }
                if(s159 > 0){
                    servicos_existentes.push('159')
                }
                if(s149 > 0){
                    servicos_existentes.push('149')
                }
                if(s148 > 0){
                    servicos_existentes.push('148')
                }
                if(s158 > 0){
                    servicos_existentes.push('158')
                }
                if(s157 > 0){
                    servicos_existentes.push('157')
                }
                if(s257 > 0){
                    servicos_existentes.push('257')
                }
                if(s258 > 0){
                    servicos_existentes.push('258')
                }
                if(s259 > 0){
                    servicos_existentes.push('259')
                }
                if(s267 > 0){
                    servicos_existentes.push('267')
                }
                if(s268 > 0){
                    servicos_existentes.push('268')
                }
                if(s269 > 0){
                    servicos_existentes.push('269')
                }
                if(s347 > 0){
                    servicos_existentes.push('347')
                }
                if(s348 > 0){
                    servicos_existentes.push('348')
                }
                if(s349 > 0){
                    servicos_existentes.push('349')
                }
                if(s357 > 0){
                    servicos_existentes.push('357')
                }
                if(s358 > 0){
                    servicos_existentes.push('358')
                }
                if(s359 > 0){
                    servicos_existentes.push('359')
                }
                if(s367 > 0){
                    servicos_existentes.push('367')
                }
                if(s368 > 0){
                    servicos_existentes.push('368')
                }
                if(s369 > 0){
                    servicos_existentes.push('369')
                }
            //console.log(servicos_existentes)
            
            })
            .catch((errr)=> {console.log('Falha ao tentar puxar os dados do MongoDB (banco de dados) para o inicio do turno. Motivo: ' + errr)})
            
    */
    socket.on('mudar-dolar-adm', (valor) => {
        console.log("valor_de_mudar_dolar_adm: " + valor)
        if(socket.id == admid){
            console.log('dolar alterado com sucesso')
            //madar pro MONGO q o socket.id q passou por esse IF eh o ID do ADM
            //alterar o banco de DADOS
        }
        else{
            console.log('aceeso-negado ' + socket.id)
            socket.emit('acesso-negado', socket.id)
        }
        
        
    })
    socket.on('mudar-SELIC-adm', (valor) => {
        if(auten == 1){
            //alterar o banco de DADOS
        }
        else{
            socket.emit('acesso-negado', socket.id)
        }
        
    })
        })
serveradm.listen(5000, () => {
    console.log('--> Server escutando porta 5000 para ADM')
})//OeoyESUTIp-NeB0bAAAE
//81, 84 e 85 contro
//INTERACAO COM O BANCO DE DAOS \/


        let jogador = new Aluno({ sockid: 123456, scorepro: 0, scoremod: 0, scorepreco: [0,0], propaganda: 220, propagandauni: 300, faturamento: 0, ativo: 1, taokeys: 18720000, comissao: 0.05, frota: [10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], cooperativa: '3irmas', pas: 30, pas1:0, pas2:0, distribuidores: 640, promotores: 40, senha: '666', 
        147:[985,1,288,600,300],
        159:[0,0,396,0,0],
        149:[0,0,360,0,0],
        148:[0,0,324,0,0],
        158:[0,0,360,0,0],
        157:[0,0,324,0,0],
        257:[0,0,396,0,0],
        258:[0,0,432,0,0],
        259:[0,0,468,0,0],
        267:[0,0,432,0,0],
        268:[0,0,468,0,0],
        269:[0,0,504,0,0],
        347:[0,0,432,0,0],
        348:[0,0,468,0,0],
        349:[0,0,504,0,0],
        357:[0,0,468,0,0],
        358:[0,0,504,0,0],
        359:[0,0,540,0,0],
        367:[0,0,504,0,0],
        368:[0,0,540,0,0],
        369:[0,0,576,0,0]});
        //jogador.save()
        //    .then(Aluno.find({ nome: 'Pedro'}))
        //    .then((users) => {console.log(users)})
        //    .catch((wrr) => {console.log(wrr)})
        //mongoose.connection.collections.alunos.drop()
        
        //jogador.save()
        //    .then(Aluno.find({ nome: 'Pedo'}))
        //    .then((pessoa) => {console.log(pessoa)})
        //    .catch((err) => {console.log('eerro: ' + err)})
            
          //  jogador.save(() => {
          //      Aluno.findOne({ nome: 'Pedro'})
          //          .then((array) => {console.log(array)})
          //          
          //  })
            //Aluno.updateOne({ nome: 'Pedro'}, { 257: [0,1]})
          /*  Aluno.findOne({ sockid: socket.id})
                .then((user) => { if(user.taokeys > x*custo){
                    Aluno.updateOne({sockid: socket.id},{ taokeys: user.taokeys - x*custo})
                }})
                .catch(() => )
                */
            //
    
