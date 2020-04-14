import React from 'react';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles, useTheme } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  navbarButton: {
    color:'white',
  }
}));

export default function SelectRound() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const classes = useStyles()

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const generateRounds = rounds =>{
    return rounds.map((round, index)=>{
      return(
        <MenuItem key={index} onClick={handleClose}>{round}</MenuItem>
      )
    })
  }

  const rounds = ["Projeção","Decisões","Resultados","DRE","Fluxo de Caixa","BP","Pesquisas Contratadas","Resultados das Pesquisas", "CBG News"]

  return (
    <div>
      <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick} className={classes.navbarButton}>
        Relatórios
      </Button>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {generateRounds(rounds)}
      </Menu>
    </div>
  );
}