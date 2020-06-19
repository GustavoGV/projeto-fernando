import React from 'react';
import Typography from '@material-ui/core/Typography'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';


//import socket from '../../connection';
//socket.emit("teste", "dados")

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2),
    //color: theme.palette.text.secondary,
  },
  title:{
    textAlign:'center'
  }
}))

export default function Manual() {

  //TODO: Move lists to here

  const classes = useStyles();

  function generateListItems(itensArray) {
    return itensArray.map(item=>(
      <ListItem>
        <ListItemText
          primary={item}
        />
      </ListItem>
    ))

  }

  return(
    <div style={{margin:'0 80px'}}>
    <Paper className={classes.paper}>
    <Typography variant="h4" className={classes.title}>Cooperative Business Game</Typography>
    <br/>
    <br/>
    <br/>
    <Typography variant="h5">Como funciona?</Typography>
    <Typography variant="body1">
      O jogo é separado por turnos e cada turno representa 1 bimestre, encerrando ao se completar
    1 ano. Cabe ao jogador fazer as melhores escolhas/compras e previsão para se sobressair no
    jogo.
    </Typography>
    <br/>
    <br/>
    <Typography variant="h5">Quais ações eu posso fazer por turno?</Typography>
    <br/>
    <Typography variant="h6">Ações básicas:</Typography>
    <List>
      <ListItem>
        <ListItemText
          primary="Compra de insumos"
        />
      </ListItem>
      <ListItem>
        <ListItemText
          primary="Troca de insumos: caso deseja desabilitar um serviço em troca de outro, todos os
          insumos daquele serviço é alternado pelo custo de 30$/unidade"
        />
      </ListItem>
      <ListItem>
        <ListItemText
          primary="Investimentos em propaganda Institucional e dos serviços individualmente"
        />
      </ListItem>
      <ListItem>
        <ListItemText
          primary="Alterar nº de vendedores: cada profissional possui um salário fixo de 2160$ + comissão
          sobre vendas."
        />
      </ListItem>
      <ListItem>
        <ListItemText
          primary="Vender ou comprar unidades para a frota de veículos"
        />
      </ListItem>
      <ListItem>
        <ListItemText
          primary="Alterar número de varejistas"
        />
      </ListItem>  
    </List>   
    <Typography variant="h6">Ações de consulta:</Typography> 
    <List>
      <ListItem>
        <ListItemText
          primary="Modelos de serviços oferecidos pela concorrência"
        />
      </ListItem>
      <ListItem>
        <ListItemText
          primary="Intensidade de distribuidores da concorrência"
        />
      </ListItem>
      <ListItem>
        <ListItemText
          primary="Quantidade de postos avançados de serviços (PAS)"
        />
      </ListItem>
      <ListItem>
        <ListItemText
          primary="Participação da concorrência – serviço único"
        />
      </ListItem>
      <ListItem>
        <ListItemText
          primary="Participação da concorrência – serviços múltiplos"
        />
      </ListItem> 
    </List>
    <br/>
    <br/>
    <Typography variant="h5">Qual o funcionamento por turno?</Typography>
    <Typography variant="body1">
    Ao iniciar um turno, cada jogador irá fazer as devidas alterações e consultas de acordo com sua
estratégia e ao final, o administrador encerrará essa primeira parte.
Cada jogador receberá a parte monetária do turno anterior baseado pelas métricas do sistema
e administrador. Cabem aos jogadores realizarem uma boa previsão de vendas e repartição de
serviços para que não se envolvam, por exemplo em aluguéis de veículos não planejados ou
uma grande quantidade de materiais estocados (Quais ações estão fora do controle do
jogador).
Caso o lucro relativo do jogador em algum momento do jogo seja menor que os valores de
despesas básicas, o sistema automaticamente acionará o empréstimo bancário, com 8% de
juros sobre o saldo devedor, e este deverá ser pago em no máximo 3 turnos, caso contrário
será decretada falência da coorporativa.
    </Typography>
    <br/>
    <br/>
    <Typography variant="h5">Quais ações estão fora do controle do jogador?</Typography>
    <Typography variant="body1">
    Ao não acerto da previsão de vendas, o jogador é exposto a uma séries de interações que
independem de suas escolhas, são elas:
    </Typography>
    <List>
      <ListItem>
        <ListItemText
          primary="Contratação de frota auxiliar"
        />
      </ListItem> 
      <ListItem>
        <ListItemText
          primary="Designação de hora extra aos atuais vendedores/promotores"
        />
      </ListItem> 
      <ListItem>
        <ListItemText
          primary="Estocagem de insumos não utilizados"
        />
      </ListItem> 
    </List>
    <Typography variant="body1">
    Para cada turno, há uma série de despesas básicas que englobam tanto salários dos diversos
funcionários quanto custos administrativos fixos como imposto de renda. As contas a serem
pagas ao jogador seguem a métrica de metade de imediato (no momento que a compra foi
efetuada) e a outra metade no próximo bimestre.
    </Typography>
    <br/>
    <br/>
    <Typography variant="h5">
      Mais dúvidas?
    </Typography>
    <Typography variant="body1">
    Caso seja encontrados bugs, ou dúvidas não esclarecidas por este manual ou afins, favor
reportar para e-mail@gmail.com
    </Typography>
    </Paper>
    </div>
  )
}