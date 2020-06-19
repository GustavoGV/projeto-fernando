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

function Dre(props){

  useEffect(()=>{
    socket.emit('puxar-balancos', props.round);
    socket.on('balancos', balanco => {
      console.log("fluxo", balanco.fluxo)
      if(balanco.fluxo){
        update(balanco.fluxo)
      }
    });
  },[])

  const classes = useStyles();

  function update(f) {
    let table = document.getElementById("myTable");
    table.rows[1].cells[3].innerHTML = f.saldo_anterior
    table.rows[2].cells[3].innerHTML = f.emprestimos_contratados
    table.rows[3].cells[2].innerHTML = f.faturamento
    table.rows[4].cells[2].innerHTML = f.veiculos_vendidos
    table.rows[5].cells[2].innerHTML = f.depreciacao_de_veiculos
    table.rows[6].cells[2].innerHTML = f.depreciacao_de_maquinas
    table.rows[6].cells[3].innerHTML = f.faturamento + f.depreciacao_de_veiculos + f.depreciacao_de_maquinas + f.veiculos_vendidos
    table.rows[7].cells[4].innerHTML = f.saldo_anterior + f.emprestimos_contratados + f.faturamento + f.veiculos_vendidos + f.depreciacao_de_veiculos + f.depreciacao_de_maquinas //soma entradas
    table.rows[9].cells[2].innerHTML = f.custo_de_servico_prestado
    table.rows[10].cells[2].innerHTML = f.veiculos_comprados
    table.rows[11].cells[2].innerHTML = f.maquinas
    table.rows[12].cells[2].innerHTML = f.tributos
    table.rows[14].cells[1].innerHTML = f.promotores
    table.rows[15].cells[1].innerHTML = f.propaganda
    table.rows[16].cells[1].innerHTML = f.depreciacao_de_maquinas
    table.rows[17].cells[1].innerHTML = f.pesquisas
    table.rows[18].cells[1].innerHTML = f.pas
    table.rows[19].cells[1].innerHTML = f.uso_frota
    table.rows[20].cells[1].innerHTML = f.despesas_operacionais_n_planejadas
    table.rows[21].cells[1].innerHTML = f.despesas_administrativas
    table.rows[22].cells[1].innerHTML = f.encargos_financiamento
    table.rows[23].cells[2].innerHTML = f.promotores + f.depreciacao_de_maquinas + f.propaganda + f.pesquisas + f.pas + f.uso_frota + f.despesas_operacionais_n_planejadas + f.despesas_administrativas + f.encargos_financiamento
    table.rows[24].cells[4].innerHTML = f.promotores + f.depreciacao_de_maquinas + f.propaganda + f.pesquisas + f.pas + f.uso_frota + f.despesas_operacionais_n_planejadas + f.despesas_administrativas + f.encargos_financiamento + f.custo_de_servico_prestado + f.veiculos_comprados + f.maquinas + f.tributos
    table.rows[26].cells[4].innerHTML = f.financiamento + f.promotores + f.depreciacao_de_maquinas + f.propaganda + f.pesquisas + f.pas + f.veiculos_comprados + f.despesas_operacionais_n_planejadas + f.despesas_administrativas + f.encargos_financiamento + f.custo_de_servico_prestado  + f.maquinas + f.tributos + f.saldo_anterior + f.emprestimos_contratados + f.faturamento + f.uso_frota + f.depreciacao_de_veiculos + f.depreciacao_de_maquinas
    let totalF = f.financiamento + f.saldo_anterior + f.emprestimos_contratados + f.faturamento + f.uso_frota + f.depreciacao_de_veiculos + f.depreciacao_de_maquinas
    table.rows[14].cells[5].innerHTML = f.promotores/totalF*100 + '%'
    table.rows[15].cells[5].innerHTML = f.propaganda/totalF*100 + '%'
    table.rows[17].cells[5].innerHTML = f.pesquisas/totalF*100 + '%'
    table.rows[18].cells[5].innerHTML = f.pas/totalF*100 + '%'
    table.rows[19].cells[5].innerHTML = f.uso_frota/totalF*100 + '%'
    table.rows[20].cells[5].innerHTML = f.despesas_operacionais_n_planejadas/totalF*100 + '%'
    table.rows[21].cells[5].innerHTML = f.despesas_administrativas/totalF*100 + '%'
    table.rows[22].cells[5].innerHTML = f.encargos_financiamento/totalF*100 + '%'
    table.rows[25].cells[5].innerHTML = f.financiamento/totalF*100 + '%'
    table.rows[25].cells[4].innerHTML = f.financiamento
    table.rows[26].cells[5].innerHTML = '100%'
    table.rows[0].cells[0].style.backgroundColor = "gray"
    table.rows[8].cells[0].style.backgroundColor = "gray"
    table.rows[13].cells[0].style.backgroundColor = "gray"
    table.rows[26].cells[0].style.backgroundColor = "gray"
  }

  return(
    <>
      <table className={classes.class3} id="myTable">
            <tr>
                <th className={classes.class3}>(+) ENTRADAS</th>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <td className={classes.class1}>SALDO ANTERIOR ($)</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>18720000</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <td className={classes.class1}>EMPRÉSTIMOS CONTRATADOS ($)</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>288000</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
            </tr> 
            <tr>
                <td className={classes.class1}>FATURAMENTO ($)</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>32828091</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <td className={classes.class1}>VEÍCULOS VENDIDOS ($)</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>0</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
            </tr>

            <tr>
                <td className={classes.class1}>DEPRECIAÇÃO DE VEÍCULOS</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>144000</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <td className={classes.class1}>DEPRECIAÇÃO DE MÁQUINAS E <br/>EQUIPAMENTOS ($)</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>1152000</td>
                <td className={classes.class1}>34124091</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>53132091</td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <th className={classes.class3}>(-) SAÍDAS</th>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <td className={classes.class1}>CUSTO DE PRESTAÇÃO DOS<br/> SERVIÇOS ($)</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>21502500</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <td className={classes.class1}>VEÍCULOS COMPRADOS ($)</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>576000</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <td className={classes.class1}>MÁQUINAS E EQUIPAMENTOS</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>17280000</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <td className={classes.class1}>PAGAMENTO DE PARCELA DE TRIBUTOS ($)</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>0</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <td className={classes.class1}>DESPESAS OPERACIONAIS</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <td className={classes.class1}>VENDEDORES / PROMOTORES DA <br/> COOPERATIVA ($)</td>
                <td className={classes.class1}>2364270</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>18,68%</td>
            </tr>
            <tr>
                <td className={classes.class1}>PROPAGANDA E PROMOCAO ($)</td>
                <td className={classes.class1}>1929600</td>  
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>15,25%</td>
            </tr>
            <tr>
                <td className={classes.class1}>DEPRECIAÇÃO DE MÁQUINAS ($)</td>
                <td className={classes.class1}>1152000</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                
            </tr>
            <tr>
                <td className={classes.class1}>PESQUISAS CONTRATADAS ($)</td>
                <td className={classes.class1}>0</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>0,00%</td>
                
            </tr>
            <tr>
                <td className={classes.class1}>POSTOS AVANÇADOS DE SERVIÇO ($)</td>
                <td className={classes.class1}>691200</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>5,46%</td>
            </tr>
            <tr>
                <td className={classes.class1}>FROTA DE VEÍCULOS ($)</td>
                <td className={classes.class1}>792000</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>6,26%</td>
            </tr>
            <tr>
                <td className={classes.class1}>DESPESAS OPERACIONAIS NÃO PLANEJADAS ($)</td>
                <td className={classes.class1}>1382400</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>10,92%</td>
            </tr>
            <tr>
                <td className={classes.class1}>DESPESAS ADMINISTRATIVAS ($)</td>
                <td className={classes.class1}>4320000</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>34,14%</td>
            </tr>
            <tr>
                <td className={classes.class1}>ENCARGOS SOBRE FINANCIAMENTO DAS<br/> OPERAÇÕES ($)</td>
                <td className={classes.class1}>23040</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>0,18%</td>
            </tr>
            <tr>
                <td className={classes.class1} style={{textAlign:'right'}}>TOTAL</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>12654510</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>52013010</td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <td className={classes.class1}>FINANCIAMENTO / ADIANTAMENTO PARA<br/>OPERAÇÕES ($)</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>0</td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <th className={classes.class3}>SALDO ATUAL ($)</th>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>1119081</td>
                <td className={classes.class1}>100%</td>
            </tr>
          </table>
    </>
  )
}

export default Dre;