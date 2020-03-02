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
                user["pas"]])
                                        })
                                        .catch((err) => console.log( err + ' <=> Falha ao registrar login do player com o socket especifico: ' + socket.id))
                            }})
                        .catch((err) => {console.log(err + ' <=> Falha na comunicacao com o Banco de dados n 403 ' + socket.id)})
                        }
            })
            .catch(() => {console.log('falha na comunicacao com o Banco de dados n 504 ' +socket.id)})

                       
    })
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
                user["pas"]]);
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


    socket.on('alterar-porcetagem-comissao', () => { //continuar essa logica dentro do sockets.on('connection', ...) para outros comandos! como um comando do admin-client mudando uma variavel ou um client normal querendo mandar alguma informacao para o server
        Aluno.findOne({sockid: socket.id})
            .then((ll) => {console.log(ll['147'])}) //'se o player ja estiver conectado esse ll sera o Schema dele, pronto para ser tratado'
            .then(() => console.log('meuu'))
            .catch(() => {socket.emit('acesso-negado')}) //cai aqui se ll['147'] n conseguir ser lido, logo qnd o usuario n esta logado
        })  
})


server.listen(3000, () => {
    console.log(`--> Server escutando porta: 3000`)
})
let admid = "31415926"
socketsadm.on('connection', (socket) => { //conversa do server com o client do ADM
    let auten = 0
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
        console.log('putz')
        if(creden[0] == "elefantiase" && creden[1] == "GVcodeRULES"){
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
    let demanda = 100 //n eh um valor fixo kkk
    socket.on('finalizar-turno', () => {
        console.log('foii')
        Aluno.find({ativo: 1})
            .then((users) => {
                let soma = 0;
                let soma1 = 0;
                let soma2 = 0;
                let soma3 = 0;
                let scorex = 0;
                let scorey = 0;
                let scorep = 0;
                //let soma4 = 0
                let soma5 = 0
                for(let i = 0; i < users.length; i++){
                    soma = soma + users[i]['distribuidores']
                    soma1 = soma1 + users[i]['pas']
                    soma2 = soma2 + users[i]['promotores']
                    soma3 = soma3 + users[i]['comissao']
                    //soma4 = soma4 + users[i]['distribuidores']
                    soma5 = soma5 + users[i]['propaganda']



                    // <><><>
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


                    // <><><>
                


                    //

                    if(users[i]['147'][0] > 0){
                        users[i]['scorepreco'] = users[i]['scorepreco'] + users[i]['147'][2]*users[i]['147'][0] //insumos vezes preco unico
           
                      }
                    if(users[i]['159'][0] > 0){
                        users[i]['scorepreco'] = users[i]['scorepreco'] + users[i]['159'][2]*users[i]['159'][0]
           
                      }
                    if(users[i]['149'][0] > 0){
                        users[i]['scorepreco'] = users[i]['scorepreco'] + users[i]['149'][2]*users[i]['149'][0]          
                            }
                    if(users[i]['148'][0] > 0){
                        users[i]['scorepreco'] = users[i]['scorepreco'] + users[i]['148'][2]*users[i]['148'][0]            
                            }
                    if(users[i]['158'][0] > 0){
                        users[i]['scorepreco'] = users[i]['scorepreco'] + users[i]['158'][2]*users[i]['158'][0]        
                            }
                    if(users[i]['157'][0] > 0){
                        users[i]['scorepreco'] = users[i]['scorepreco'] + users[i]['157'][2]*users[i]['157'][0]            
                            }
                    if(users[i]['257'][0] > 0){
                        users[i]['scorepreco'] = users[i]['scorepreco'] + users[i]['257'][2]*users[i]['257'][0]         
                    }
                    if(users[i]['258'][0] > 0){
                        users[i]['scorepreco'] = users[i]['scorepreco'] + users[i]['258'][2]*users[i]['258'][0]        
                    }
                    if(users[i]['259'][0] > 0){
                        users[i]['scorepreco'] = users[i]['scorepreco'] + users[i]['259'][2]*users[i]['259'][0]          
                    }
                    if(users[i]['267'][0] > 0){
                        users[i]['scorepreco'] = users[i]['scorepreco'] + users[i]['267'][2]*users[i]['267'][0]          
                    }
                    if(users[i]['268'][0] > 0){
                        users[i]['scorepreco'] = users[i]['scorepreco'] + users[i]['268'][2]*users[i]['268'][0]           
                    }
                    if(users[i]['269'][0] > 0){
                        users[i]['scorepreco'] = users[i]['scorepreco'] + users[i]['269'][2]*users[i]['269'][0]          
                    }
                    if(users[i]['347'][0] > 0){
                        users[i]['scorepreco'] = users[i]['scorepreco'] + users[i]['347'][2]*users[i]['347'][0]           
                    }
                    if(users[i]['348'][0] > 0){
                        users[i]['scorepreco'] = users[i]['scorepreco'] + users[i]['348'][2]*users[i]['348'][0]            
                    }
                    if(users[i]['349'][0] > 0){
                        users[i]['scorepreco'] = users[i]['scorepreco'] + users[i]['349'][2]*users[i]['349'][0]           
                    }
                    if(users[i]['357'][0] > 0){
                        users[i]['scorepreco'] = users[i]['scorepreco'] + users[i]['357'][2]*users[i]['357'][0]          
                    }
                    if(users[i]['358'][0] > 0){
                        users[i]['scorepreco'] = users[i]['scorepreco'] + users[i]['358'][2]*users[i]['358'][0]          
                    }
                    if(users[i]['359'][0] > 0){
                        users[i]['scorepreco'] = users[i]['scorepreco'] + users[i]['359'][2]*users[i]['359'][0]          
                    }
                    if(users[i]['367'][0] > 0){
                        users[i]['scorepreco'] = users[i]['scorepreco'] + users[i]['367'][2]*users[i]['367'][0]         
                    }
                    if(users[i]['368'][0] > 0){
                        users[i]['scorepreco'] = users[i]['scorepreco'] + users[i]['368'][2]*users[i]['368'][0]           
                    }
                    if(users[i]['369'][0] > 0){
                        users[i]['scorepreco'] = users[i]['scorepreco'] + users[i]['369'][2]*users[i]['369'][0]      
                    } ////









                    //
                    ////
                    if(users[i]['147'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['147'][0]*5
           
                      }
                    if(users[i]['159'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['159'][0]*5
           
                      }
                    if(users[i]['149'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['149'][0]*5          
                            }
                    if(users[i]['148'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['148'][0]*5            
                            }
                    if(users[i]['158'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['158'][0]*5        
                            }
                    if(users[i]['157'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['157'][0]*5            
                            }
                    if(users[i]['257'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['257'][0]*6         
                    }
                    if(users[i]['258'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['258'][0]*6        
                    }
                    if(users[i]['259'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['259'][0]*6          
                    }
                    if(users[i]['267'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['267'][0]*6          
                    }
                    if(users[i]['268'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['268'][0]*6           
                    }
                    if(users[i]['269'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['269'][0]*6          
                    }
                    if(users[i]['347'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['347'][0]*7           
                    }
                    if(users[i]['348'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['348'][0]*7            
                    }
                    if(users[i]['349'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['349'][0]*7           
                    }
                    if(users[i]['357'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['357'][0]*7          
                    }
                    if(users[i]['358'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['358'][0]*7          
                    }
                    if(users[i]['359'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['359'][0]*7          
                    }
                    if(users[i]['367'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['367'][0]*7         
                    }
                    if(users[i]['368'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['368'][0]*7           
                    }
                    if(users[i]['369'][1] == 1){
                        users[i]['scoremod'] = users[i]['scoremod'] + users[i]['369'][0]*7      
                    } ////
                }
                for(let i = 0; i < users.length; i++){
                    scorex = scorex + users[i]['scoremod']
                    scorey = scorey + users[i]['scorepreco']
                    scorep = scorep + users[i]['scorepro']
                }
                for(let i = 0; i < users.length; i++){

                     users[i]['faturamento'] = 0.09*demanda*users[i]['distribuidores']/soma + 0.09*demanda*users[i]['pas']/soma1 + 0.07*demanda*users[i]['promotores']/soma2 + 0.09*demanda*users[i]['comissao']/soma3 + 0.1*demanda*users[i]['propaganda']/soma5 + 0.12*demanda*users[i]['scoremod']/scorex + 0.3*demanda*users[i]['scorepreco']/scorey + 0.10*demanda*users[i]['scorepro']/scorep
                     
                     console.log("Parcela de mercado adquirida para o player (" + users[i]['cooperativa'] + ')   -dsitribuidores (max 0.09)-> ' +0.09*users[i]['distribuidores']/soma + ' -pas (max 0.09)->  ' + 0.09*users[i]['pas']/soma1 + ' -promotores (max 0.07)-> ' + 0.07*users[i]['promotores']/soma2 + ' -comissao (max 0.09)-> ' + 0.09*users[i]['comissao']/soma3 + ' -propaganda (max 0.10)-> ' + 0.1*users[i]['propaganda']/soma5 + ' -modelos_de_servicos (max 0.12)-> ' + 0.12*users[i]['scoremod']/scorex + ' -precos_unitario (max 0.30)-> ' + 0.3*users[i]['scorepreco']/scorey + ' -propaganda_unitaria (max 0.10)-> ' + 0.1*users[i]['scorepro']/scorep)
                     console.log(0.09*users[i]['distribuidores']/soma + 0.09*users[i]['pas']/soma1 + 0.07*users[i]['promotores']/soma2 + 0.09*users[i]['comissao']/soma3 + 0.1*users[i]['propaganda']/soma5 + 0.12*users[i]['scoremod']/scorex + 0.3*users[i]['scorepreco']/scorey + 0.10*users[i]['scorepro']/scorep)
                    }
                for(let i = 0; i < users.length; i++){
                    
                    users[i].save()
                        .then(() => {console.log(users[i]['cooperativa'] + ' Teve seu faturamento processado com sucesso.')})
                        .catch((err) => { console.log('Erro ao salvar os FATURAMENTOS processados. Motivo ==> ' + err)})
                }

            })
           .catch((err) => {console.log('erro n 708 =>' + err)})
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
    })
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


        let jogador = new Aluno({ sockid: 123456, scorepro: 0, scoremod: 0, scorepreco: 0, propaganda: 220, faturamento: 0, ativo: 1, taokeys: 18720000, comissao: 0.25, frota: 10, cooperativa: '3irmas', pas: 32, distribuidores: 420, promotores: 300, senha: '666', 
        147:[100,1,288,600,300],
        159:[0,0,396,600,320],
        149:[0,0,360,600,320],
        148:[0,0,324,600,320],
        158:[0,0,360,600,320],
        157:[0,1,324,600,320],
        257:[0,0,396,600,320],
        258:[0,0,432,600,320],
        259:[0,0,468,600,320],
        267:[0,0,432,600,320],
        268:[0,0,468,600,320],
        269:[0,0,504,600,320],
        347:[0,0,432,600,320],
        348:[0,0,468,600,320],
        349:[0,0,504,600,320],
        357:[0,0,468,600,320],
        358:[0,0,504,600,320],
        359:[0,0,540,600,320],
        367:[0,0,504,600,320],
        368:[0,0,540,600,320],
        369:[0,0,576,600,320]});
        //jogador.save()
        //    .then(Aluno.find({ nome: 'Pedro'}))
         //   .then((users) => {console.log(users)})
            //.catch(() => {console.log('erros')})
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
    
