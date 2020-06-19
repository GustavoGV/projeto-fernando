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
      console.log("dre", balanco.dre)
      if(balanco.dre){
        update(balanco.dre)
      }
    });
  },[])

  const classes = useStyles();

  function update(d) {
    let table = document.getElementById("myTable");
    if(d.servicos.length == 1){
    table.rows[0].cells[6].innerHTML = 'Serviços: ' + d.servicos[0][0] + ' e ' + d.servicos[1][0]
    }
    else{
    table.rows[0].cells[6].innerHTML = 'Serviço ' + d.servicos[0][0]
    }
    table.rows[1].cells[3].innerHTML = d.receita
    table.rows[2].cells[7].innerHTML = d.atendimentos
    table.rows[3].cells[6].innerHTML = 'Custo ' + d.servicos[0][0]
    table.rows[3].cells[7].innerHTML = d.servicos[0][1]
    if(d.servicos.length == 2){
        table.rows[4].cells[6].innerHTML = 'Custo ' + d.servicos[1][0]
        table.rows[4].cells[7].innerHTML = d.servicos[1][1]
    }
    table.rows[5].cells[2].innerHTML = d.estoque_inicial
    table.rows[5].cells[7].innerHTML = d.estoque_inicial
    table.rows[6].cells[1].innerHTML = d.custo_prestacao_servico
    table.rows[7].cells[1].innerHTML = d.custo_estocagem
    table.rows[7].cells[7].innerHTML = d.custo_estocagem/36
    table.rows[8].cells[1].innerHTML = d.custo_troca_insumos
    table.rows[9].cells[1].innerHTML = d.hora_extra
    table.rows[9].cells[2].innerHTML = d.custo_prestacao_servico + d.hora_extra + d.custo_troca_insumos + d.custo_estocagem
    table.rows[10].cells[2].innerHTML = d.custo_prestacao_servico + d.hora_extra + d.custo_troca_insumos + d.custo_estocagem + d.estoque_inicial
    table.rows[11].cells[2].innerHTML = d.capacidade_n_utilizada
    table.rows[11].cells[7].innerHTML = d.insumos_em_estoque
    table.rows[12].cells[3].innerHTML = d.custo_prestacao_servico + d.hora_extra + d.custo_troca_insumos + d.custo_estocagem + d.estoque_inicial - d.capacidade_n_utilizada
    table.rows[13].cells[3].innerHTML = d.receita - (d.custo_prestacao_servico + d.hora_extra + d.custo_troca_insumos + d.custo_estocagem + d.estoque_inicial - d.capacidade_n_utilizada)
    table.rows[14].cells[3].innerHTML = d.receita - (d.custo_prestacao_servico + d.hora_extra + d.custo_troca_insumos + d.custo_estocagem + d.estoque_inicial - d.capacidade_n_utilizada)
    table.rows[15].cells[5].innerHTML = d.atendimentos
    table.rows[17].cells[2].innerHTML = d.despesas_administrativas
    table.rows[17].cells[7].innerHTML = '???'
    table.rows[18].cells[7].innerHTML = d.salario_promotores/2160
    table.rows[19].cells[1].innerHTML = d.salario_promotores
    table.rows[19].cells[7].innerHTML = d.comissao
    table.rows[20].cells[1].innerHTML = d.comissao*d.receita
    table.rows[20].cells[2].innerHTML = d.comissao*d.receita + d.salario_promotores
    table.rows[22].cells[1].innerHTML = d.propaganda_institucional
    table.rows[23].cells[1].innerHTML = d.propaganda_unitaria
    table.rows[23].cells[2].innerHTML = d.propaganda_unitaria + d.propaganda_institucional
    table.rows[24].cells[2].innerHTML = d.depreciacao_de_maquinas
    table.rows[26].cells[2].innerHTML = d.encargos_financiamento
    table.rows[27].cells[7].innerHTML = d.salario_frota/4800
    table.rows[28].cells[1].innerHTML = d.salario_frota
    table.rows[29].cells[1].innerHTML = d.manutencao_frota
    table.rows[30].cells[1].innerHTML = d.depreciacao_de_veiculos
    table.rows[31].cells[1].innerHTML = d.frota_terceirizada
    table.rows[31].cells[2].innerHTML = d.salario_frota + d.frota_terceirizada + d.manutencao_frota + d.depreciacao_de_veiculos
    table.rows[33].cells[2].innerHTML = d.despesas_operacionais_n_planejadas
    table.rows[34].cells[2].innerHTML = d.pas
    table.rows[34].cells[7].innerHTML = d.pas/2160
    table.rows[35].cells[2].innerHTML = d.pesquisas
    table.rows[37].cells[3].innerHTML = d.despesas_administrativas + d.salario_promotores + d.comissao*d.receita + d.propaganda_institucional + d.propaganda_unitaria + d.depreciacao_de_maquinas + d.encargos_financiamento + d.salario_frota + d.manutencao_frota + d.depreciacao_de_veiculos + d.despesas_operacionais_n_planejadas + d.pas + d.pesquisas
    table.rows[38].cells[3].innerHTML = d.receita - (d.custo_prestacao_servico + d.hora_extra + d.custo_troca_insumos + d.custo_estocagem + d.estoque_inicial - d.capacidade_n_utilizada) - (d.despesas_administrativas + d.salario_promotores + d.comissao*d.receita + d.propaganda_institucional + d.propaganda_unitaria + d.depreciacao_de_maquinas + d.encargos_financiamento + d.salario_frota + d.manutencao_frota + d.depreciacao_de_veiculos + d.despesas_operacionais_n_planejadas + d.pas + d.pesquisas)
    if((d.receita - (d.custo_prestacao_servico + d.hora_extra + d.custo_troca_insumos + d.custo_estocagem + d.estoque_inicial - d.capacidade_n_utilizada) - (d.despesas_administrativas + d.salario_promotores + d.comissao*d.receita + d.propaganda_institucional + d.propaganda_unitaria + d.depreciacao_de_maquinas + d.encargos_financiamento + d.salario_frota + d.manutencao_frota + d.depreciacao_de_veiculos + d.despesas_operacionais_n_planejadas + d.pas + d.pesquisas)) > 0){
        table.rows[39].cells[3].innerHTML = (d.receita - (d.custo_prestacao_servico + d.hora_extra + d.custo_troca_insumos + d.custo_estocagem + d.estoque_inicial - d.capacidade_n_utilizada) - (d.despesas_administrativas + d.salario_promotores + d.comissao*d.receita + d.propaganda_institucional + d.propaganda_unitaria + d.depreciacao_de_maquinas + d.encargos_financiamento + d.salario_frota + d.manutencao_frota + d.depreciacao_de_veiculos + d.despesas_operacionais_n_planejadas + d.pas + d.pesquisas))*0.3
        table.rows[40].cells[3].innerHTML =  (d.receita - (d.custo_prestacao_servico + d.hora_extra + d.custo_troca_insumos + d.custo_estocagem + d.estoque_inicial - d.capacidade_n_utilizada) - (d.despesas_administrativas + d.salario_promotores + d.comissao*d.receita + d.propaganda_institucional + d.propaganda_unitaria + d.depreciacao_de_maquinas + d.encargos_financiamento + d.salario_frota + d.manutencao_frota + d.depreciacao_de_veiculos + d.despesas_operacionais_n_planejadas + d.pas + d.pesquisas))*0.7
    }
    else{
        table.rows[39].cells[3].innerHTML = 0
        table.rows[40].cells[3].innerHTML = (d.receita - (d.custo_prestacao_servico + d.hora_extra + d.custo_troca_insumos + d.custo_estocagem + d.estoque_inicial - d.capacidade_n_utilizada) - (d.despesas_administrativas + d.salario_promotores + d.comissao*d.receita + d.propaganda_institucional + d.propaganda_unitaria + d.depreciacao_de_maquinas + d.encargos_financiamento + d.salario_frota + d.manutencao_frota + d.depreciacao_de_veiculos + d.despesas_operacionais_n_planejadas + d.pas + d.pesquisas))
    }
    
    //table.rows[28].cells[7].innerHTML = 
    table.rows[0].cells[0].style.backgroundColor = "gray"
    table.rows[17].cells[0].style.backgroundColor = "gray"
    table.rows[18].cells[0].style.backgroundColor = "gray"
    table.rows[21].cells[0].style.backgroundColor = "gray"
    table.rows[24].cells[0].style.backgroundColor = "gray"
    table.rows[26].cells[0].style.backgroundColor = "gray"
    table.rows[27].cells[0].style.backgroundColor = "gray"
    table.rows[33].cells[0].style.backgroundColor = "gray"
    table.rows[34].cells[0].style.backgroundColor = "gray"
    table.rows[35].cells[0].style.backgroundColor = "gray"
    table.rows[37].cells[0].style.backgroundColor = "gray"
    table.rows[39].cells[0].style.backgroundColor = "gray"
  }

  return(
    <>
      <table className={classes.class2} id="myTable">
            <tr>
                <td className={classes.class1}>TIPO DE SERVIÇO</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>147</td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <th className={classes.class3}>FATURAMENTO TOTAL</th>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>100%</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>$ Preço Médio</td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}># Atendimentos</td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <th className={classes.class3}>(-) CUSTOS SERVIÇOS PRESTADOS (CSP)</th>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>Custo 147</td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>Custo 157</td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <td className={classes.class1}>CAPACIDADE INSTALADA INICIAL DE <br/> PRESTAÇÃO DE SERVIÇO</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}># Estoque Inicial</td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <td className={classes.class1}>CUSTO DE PRESTAÇÃO DOS SERVIÇOS</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <td className={classes.class1}>CUSTO DE CAPACIDADE INSTALADA NÃO<br/>UTILIZADA PARA A PRESTAÇÃO DE SERVIÇOS<br/>($ 36 / unit.)</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}># Total não<br/> utilizado</td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <td className={classes.class1}>CUSTO DE ALTERAÇÃO DE TIPO DE SERVIÇO</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <td className={classes.class1}>ATENDIMENTO NA BASE DE HORA EXTRA</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <td className={classes.class1}>TOTAL EM DISPONIBILIDADE</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <td className={classes.class1}>(-) CAPACIDADE INSTALADA NÃO UTILIZADA</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}># Serviços não prestados</td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <th className={classes.class3}>(-) CSP</th>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <th className={classes.class3}>MARGEM BRUTA</th>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <th className={classes.class3}>MARGEM BRUTA TOTAL</th>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <th className={classes.class3}>TOTAL DE SERVIÇOS PRESTADOS</th>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <th className={classes.class3}>(-) DESPESAS OPERACIONAIS</th>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <td className={classes.class1}>DESPESAS ADMINISTRATIVAS</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>Unitário</td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <td className={classes.class1}>VENDEDORES / PROMOTORES</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}># Promotores</td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <td className={classes.class1}> - SALÁRIOS</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>% Comissão</td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <td className={classes.class1}> - COMISSÕES</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>$ Salário Unitário</td>
                <td className={classes.class1}>$ 2.160</td>
            </tr>
            <tr>
                <td className={classes.class1}>PROPAGANDA</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <td className={classes.class1}> - INSTITUCIONAL</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <td className={classes.class1}> - PRODUTOS</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <td className={classes.class1}>DEPRECIAÇÃO DE MÁQUINAS & EQUIPAMENTOS</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>Período depreciação<br/>máquinas (ANOS)</td>
                <td className={classes.class1}># 15</td>
            </tr>
            <tr>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>Valor unitário</td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <td className={classes.class1}>ENCARGOS SOBRE FINANCIAMENTO</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>Taxa de juros</td>
                <td className={classes.class1}>8%</td>
            </tr>
            <tr>
                <td className={classes.class1}>TRANSPORTE</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}># Motorista</td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <td className={classes.class1}> - SALÁRIOS</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>Salários Unitário</td>
                <td className={classes.class1}>$ 4.800</td>
            </tr>
            <tr>
                <td className={classes.class1}> - LUBRIFICAÇÃO E MANUTENÇÃO</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>Manutenção</td>
                <td className={classes.class1}>$ 6000</td>
            </tr>
            <tr>
                <td className={classes.class1}> - DEPRECIAÇÃO DE VEÍCULOS</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>Valor de Veículo</td>
                <td className={classes.class1}>$ 57.600</td>
            </tr>
            <tr>
                <td className={classes.class1}> - FROTA DE TERCEIROS</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>Depreciação<br/>(ANOS)</td>
                <td className={classes.class1}>4</td>
            </tr>
            <tr>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>Valor unitário</td>
                <td className={classes.class1}>$ 2.400</td>
            </tr>
            <tr>
                <td className={classes.class1}>DESPESAS NÃO PLANEJADAS</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <td className={classes.class1}>POSTOS AVANÇADOS DE<br/>SERVIÇO (PAS)</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}># Postos</td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <td className={classes.class1}>PESQUISAS DE MERCADO CONTRATADAS</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>Custo Unitário</td>
                <td className={classes.class1}>$ 2.160</td>
            </tr>
            <tr>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}>Custo Fixo</td>
                <td className={classes.class1}>$ 50.400</td>
            </tr>
            <tr>
                <td className={classes.class1}>TOTAL DESPESAS OPERACIONAIS</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <th className={classes.class3}>RESULTADOS ANTES DE CONSIDERAR OS TRIBUTOS</th>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <td className={classes.class1}>TRIBUTOS E TAXAS TOTAIS</td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
            </tr>
            <tr>
                <th className={classes.class3} style={{color: 'green'}}>RESULTADO DA OPERAÇÃO</th>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
                <td className={classes.class1}></td>
            </tr>
          </table>
    </>
  )
}

export default Dre;