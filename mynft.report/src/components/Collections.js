import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import collections from '../../data/collections';
import './Collections.css';

const MAX_OPTIONS = 100;

export default function Collections() {

    function handleFilter(options, state) {
        if(state.inputValue.length > 2)
        {
            const text = state.inputValue.toLowerCase();
            console.log('finding', text);
            const matches = collections.filter((c) => {
                // console.log(c.id, c.name);
                return (c.name.toLowerCase().indexOf(text) !== -1 || c.id.toLowerCase().indexOf(text) !== -1 );
            });
            console.log('found', matches.length);
            return matches.length > MAX_OPTIONS ? matches.slice(0, MAX_OPTIONS) : matches;
        } else {
            return [];
        }
    }

    return (
    <Autocomplete
      id="collection-select-demo"
      sx={{ width: 400 }}
      options={[]}
      filterOptions={handleFilter}
      noOptionsText="No matches"
      autoHighlight
      getOptionLabel={(option) => option.name}
      renderOption={(props, option) => (
        <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props} key={option.id}>
          <img
            loading="lazy"
            width="20"
            src={option.image}
            srcSet={`${option.image} 2x`}
            alt={option.name}
          />
          {option.name}
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          className="collections"
          {...params}
          label="Choose a collection"
          inputProps={{
            ...params.inputProps,
            autoComplete: 'new-password', // disable autocomplete and autofill
          }}
        />
      )}
    />
  );
}
