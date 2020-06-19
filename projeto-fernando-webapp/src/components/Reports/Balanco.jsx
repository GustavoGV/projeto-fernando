import React, { useState, useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';

import socket from '../../connection';



const useStyles = makeStyles(theme => ({
  class1:{
    border: '1px solid black'
  },
  class2:{
    borderCollapse: 'collapse',
    width: '35%',
    border: '1px solid black'
  },
  class3:{
    height: '25px',
    border: '1px solid black',
  },
}))

function Balanco (props) {
  
  const classes = useStyles();

  useEffect(()=>{
    socket.emit('puxar-balancos', props.round);
    socket.on('balancos', balanco => {
      console.log("balancos", balanco.balanco_patrimonial)
      if(balanco.balanco_patrimonial){
        update(balanco.balanco_patrimonial)
      }
    });
  },[])

  function update(b) {
    let table = document.getElementById("myTable");
    table.rows[1].cells[2].innerHTML = b.caixa
    table.rows[2].cells[2].innerHTML = b.estoque
    table.rows[4].cells[1].innerHTML = b.contas_a_receber60
    table.rows[5].cells[1].innerHTML = b.contas_a_receber120
    table.rows[5].cells[2].innerHTML = b.contas_a_receber120 + b.contas_a_receber60
    table.rows[5].cells[3].innerHTML = b.contas_a_receber120 + b.contas_a_receber60 + b.estoque + b.caixa
    table.rows[7].cells[1].innerHTML = b.maquinas
    table.rows[8].cells[1].innerHTML = b.depreciacao_maquinas
    table.rows[8].cells[2].innerHTML = b.maquinas - b.depreciacao_maquinas
    table.rows[9].cells[1].innerHTML = b.veiculos
    table.rows[10].cells[1].innerHTML = b.depreciacao_veiculos
    table.rows[10].cells[2].innerHTML = b.veiculos - b.depreciacao_veiculos
    table.rows[10].cells[3].innerHTML = b.maquinas - b.depreciacao_maquinas + b.veiculos - b.depreciacao_veiculos
    table.rows[11].cells[3].innerHTML = b.maquinas - b.depreciacao_maquinas + b.veiculos - b.depreciacao_veiculos + b.contas_a_receber120 + b.contas_a_receber60 + b.estoque + b.caixa
    table.rows[14].cells[2].innerHTML = b.tributos_a_pagar_anterior
    table.rows[15].cells[2].innerHTML = b.tributos_a_pagar_atual
    table.rows[16].cells[2].innerHTML = b.emprestimos
    table.rows[16].cells[3].innerHTML = b.tributos_a_pagar_atual + b.tributos_a_pagar_anterior + b.emprestimos
    table.rows[18].cells[2].innerHTML = b.capial
    table.rows[21].cells[2].innerHTML = b.lucros_acumulados
    table.rows[23].cells[3].innerHTML = b.lucros_acumulados + 2130849
    table.rows[24].cells[3].innerHTML = b.lucros_acumulados + 2130849 + b.tributos_a_pagar_atual + b.tributos_a_pagar_anterior + b.emprestimos
    table.rows[0].cells[0].style.backgroundColor = "gray"
    table.rows[6].cells[0].style.backgroundColor = "gray"
    table.rows[11].cells[0].style.backgroundColor = "gray"
    table.rows[12].cells[0].style.backgroundColor = "gray"
    table.rows[13].cells[0].style.backgroundColor = "gray"
    table.rows[17].cells[0].style.backgroundColor = "gray"
    table.rows[24].cells[0].style.backgroundColor = "gray"
  }

  return (
      <table className={classes.class2} id="myTable">
      <tr>
          <th className={classes.class3}>ATIVO CIRCULANTE</th>
          <td className={classes.class1}></td>
          <td className={classes.class1}></td>
          <td className={classes.class1}></td>
      </tr>
      <tr>
          <td className={classes.class1}>CAIXA E BANCOS ($)</td>
          <td className={classes.class1}></td>
          <td className={classes.class1}>1119081</td>
          <td className={classes.class1}></td>
      </tr>
      <tr>
          <td className={classes.class1}>INFRAESTRUTURA<br/> - INSUMOS JÁ DISPONÍVEIS ($)</td>
          <td className={classes.class1}></td>
          <td className={classes.class1}>283680</td>
          <td className={classes.class1}></td>
      </tr>
      <tr>
          <td className={classes.class1}>CONTAS A RECEBER<br/> (REPASSE DOS DISTRIBUIDORES)</td>
          <td className={classes.class1}></td>
          <td className={classes.class1}></td>
          <td className={classes.class1}></td>
      </tr>
      <tr>
          <td className={classes.class1} style={{padding:"8px"}}>em 60 dias</td>
          <td className={classes.class1}>2683845</td>
          <td className={classes.class1}></td>
          <td className={classes.class1}></td>
      </tr>

      <tr>
          <td className={classes.class1} style={{padding:"8px"}}>em 120 dias</td>
          <td className={classes.class1}>1405464</td>
          <td className={classes.class1}>4089309</td>
          <td className={classes.class1}>5492070</td>
      </tr>
      <tr>
          <th className={classes.class3}>ATIVO PERMANENTE</th>
          <td className={classes.class1}></td>
          <td className={classes.class1}></td>
          <td className={classes.class1}></td>
      </tr>
      <tr>
          <td className={classes.class1}>MÁQUINAS E EQUIPAMENTOS</td>
          <td className={classes.class1}>17280000</td>
          <td className={classes.class1}></td>
          <td className={classes.class1}></td>
      </tr>
      <tr>
          <td className={classes.class1}>(-) DEPRECIAÇÃO ($)</td>
          <td className={classes.class1}>1152000</td>
          <td className={classes.class1}>16128000</td>
          <td className={classes.class1}></td>
      </tr>
      <tr>
          <td className={classes.class1}>VEÍCULOS ($)</td>
          <td className={classes.class1}>576000</td>
          <td className={classes.class1}></td>
          <td className={classes.class1}></td>
      </tr>
      <tr>
          <td className={classes.class1}>(-) DEPRECIAÇÃO ($)</td>
          <td className={classes.class1}>144000</td>
          <td className={classes.class1}>432000</td>
          <td className={classes.class1}>16560000</td>
      </tr>
      <tr>
          <td className={classes.class1}>ATIVO TOTAL ($)</td>
          <td className={classes.class1}></td>
          <td className={classes.class1}></td>
          <td className={classes.class1}>22052070</td>
      </tr>
      <tr>
          <th className={classes.class3}>PASSIVO</th>
          <td className={classes.class1}></td>
          <td className={classes.class1}></td>
          <td className={classes.class1}></td>
      </tr>
      <tr>
          <th className={classes.class3}>PASSIVO CIRCULANTE</th>
          <td className={classes.class1}></td>
          <td className={classes.class1}></td>
          <td className={classes.class1}></td>
      </tr>
      <tr>
          <td className={classes.class1}>TRIBUTOS A PAGAR<br/>- EXERCÍCIO ANTERIOR ($)</td>
          <td className={classes.class1}></td>
          <td className={classes.class1}>913221</td>
          <td className={classes.class1}></td>
      </tr>
      <tr>
          <td className={classes.class1}>TRIBUTOS A PAGAR<br/> - DESTE EXERCÍCIO ($)</td>
          <td className={classes.class1}></td>  
          <td className={classes.class1}>0</td>
          <td className={classes.class1}></td>
      </tr>
      <tr>
          <td className={classes.class1}>FINANCIAMENTO DAS OPERAÇÕES<br/> (EMPRÉSTIMOS) ($)</td>
          <td className={classes.class1}></td>
          <td className={classes.class1}>288000</td>
          <td className={classes.class1}>1201221</td>
          
      </tr>
      <tr>
          <th className={classes.class3}>PATRIMÔNIO LIQUIDO</th>
          <td className={classes.class1}></td>
          <td className={classes.class1}></td>
          <td className={classes.class1}></td> 
      </tr>
      <tr>
          <td className={classes.class1}>CAPITAL ($)</td>
          <td className={classes.class1}></td>
          <td className={classes.class1}>18720000</td>
          <td className={classes.class1}></td>
      </tr>
      <tr>
          <td className={classes.class1}>RESULTADO OPERACIONAL<br/> ACUMULADO ($)</td>
          <td className={classes.class1}></td>
          <td className={classes.class1}></td>
          <td className={classes.class1}></td>
      </tr>
      <tr>
          <td className={classes.class1}>ANO X0 ($)</td>
          <td className={classes.class1}></td>
          <td className={classes.class1}>2130849</td>
          <td className={classes.class1}></td>
      </tr>
      <tr>
          <td className={classes.class1}>ANO X1 ($)</td>
          <td className={classes.class1}></td>
          <td className={classes.class1}>0</td>
          <td className={classes.class1}></td>
      </tr>
      <tr>
          <td className={classes.class1}>ANO X2 ($)</td>
          <td className={classes.class1}></td>
          <td className={classes.class1}>0</td>
          <td className={classes.class1}></td>
      </tr>
      <tr>
          <td className={classes.class1}></td>
          <td className={classes.class1}></td>
          <td className={classes.class1}></td>
          <td className={classes.class1}>20850849</td>
      </tr>
      <tr>
          <td className={classes.class1}>PASSIVO TOTAL ($)</td>
          <td className={classes.class1}></td>
          <td className={classes.class1}></td>
          <td className={classes.class1}>22052070</td>
      </tr>
    </table>
  );
}

export default Balanco;