import React, { useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';

const AutoCompleteSearch = (props) => {
  const autoOptions = props.options;
  // useEffect(() => {
  //   console.log('value changed!', props.options)
  // }, [props.options]);

  return (
    <Autocomplete
      options={autoOptions}
      getOptionLabel={(option) => option.medical_billing}
      style={{ width: 200, float: "left" }}
      renderInput={(params) => <TextField {...params} label="Auto Complete Search" variant="outlined" />}
      size="small"
      onChange={(e, option) => {
        props.setScanOption(option);
      }
      }
    />
  );
}

export default AutoCompleteSearch;