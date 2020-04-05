import React, { useState } from 'react'

function useRound(){
  const [roundData, setRoundData] = useState({});
  function addNewValue(newValue){
    let newRoundData = { ...roundData, ...newValue };
    setRoundData(newRoundData);
    return roundData;
  }
  return [roundData, addNewValue]
}

export default useRound;