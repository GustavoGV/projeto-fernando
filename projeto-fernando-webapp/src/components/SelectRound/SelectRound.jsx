import React from 'react';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Link } from 'react-router-dom'

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
        <Link key={index} to={`/game/inputs?round=${round.identifier}`}>
          <MenuItem onClick={handleClose}>{round.label}</MenuItem>
        </Link>
      )
    })
  }

  const rounds = [{
    label:'Turno 1',
    identifier:'t1'
  },{
    label:'Turno 2',
    identifier:'t2',
  },{
    label:'Turno 3',
    identifier:'t3',
  },{
    label:'Turno 4',
    identifier:'t4',
  },{
    label:'Turno 5',
    identifier:'t5',
  },{
    label:'Turno 6',
    identifier:'t6',
  }]

  return (
    <div>
      <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick} className={classes.navbarButton}>
        Período
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