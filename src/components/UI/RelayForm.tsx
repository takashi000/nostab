import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import InfiniteScroll from 'react-infinite-scroller';
import { useForm, SubmitHandler, Controller} from "react-hook-form";
import TextField from '@mui/material/TextField';
import Button from "@mui/material/Button";
import Switch from '@mui/material/Switch';
import { Checkbox } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';

import { NostrContext} from '../Nostr/Nostr';
import { useContext, useState, useEffect, useCallback, ChangeEvent} from 'react';

import { ContentsContext } from './Contents';

type _kind10002_tags = [
  tag: string,
  url: string,
  mode: string
];
type kind10002_tags = [
  tags: _kind10002_tags
];
type Inputs = {
    url: string,
    mode: string,
    index: number
}
const switchlabel = { inputProps: { 'aria-label': 'R/W' } };

const RelayListForm = (props:Inputs) => {
  const [NostrData, setNostrData] = useContext(NostrContext);
  const [readchecked, setreadChecked] = useState(false);
  const [writechecked, setwriteChecked] = useState(false);
  const handlereadChange = (event: ChangeEvent<HTMLInputElement>) => {
    setreadChecked(event.target.checked);
  };
  const handlewriteChange = (event: ChangeEvent<HTMLInputElement>) => {
    setwriteChecked(event.target.checked);
  };
  const {
        register,
        handleSubmit,
        control,
        setValue
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    let index = props.index;
    NostrData.relay.splice(index, 1);
    setNostrData({...NostrData});
  }

  const [SubscrState, setSubscrState] = useContext(ContentsContext);
  const initRelay = useCallback(() => {
      setValue('url', props.url);
      if(props.mode === "read"){
        setreadChecked(true);
        setwriteChecked(false);
      }else if (props.mode === "write"){
        setreadChecked(false);
        setwriteChecked(true);
      }else{
        setreadChecked(true);
        setwriteChecked(true);        
      }
  },[setValue, setreadChecked, setwriteChecked, props]);

  useEffect(() => {
      if(SubscrState === 7){
         initRelay();
      }
  },[SubscrState, initRelay]);

  const _CheckBoxRW = () => {
    if (readchecked === true && writechecked === false){
      return(
        <>
          <FormControlLabel control={<Checkbox checked={readchecked} onChange={(e) => handlereadChange(e)} {...switchlabel} disabled defaultChecked size="small"/>} label="R"/>
          <FormControlLabel control={<Checkbox checked={writechecked} onChange={(e) => handlewriteChange(e)} {...switchlabel} disabled size="small"/>} label="W"/>
        </>
      );
    }else if(readchecked === false && writechecked === true){
      return(
        <>
          <FormControlLabel control={<Checkbox checked={readchecked} onChange={(e) => handlereadChange(e)} {...switchlabel} disabled size="small"/>} label="R"/>
          <FormControlLabel control={<Checkbox checked={writechecked} onChange={(e) => handlewriteChange(e)} {...switchlabel} disabled defaultChecked size="small"/>} label="W"/>
        </>
      );
    }else{
      return(
      <>
        <FormControlLabel control={<Checkbox checked={readchecked} onChange={(e) => handlereadChange(e)} {...switchlabel} disabled defaultChecked size="small"/>} label="R"/>
        <FormControlLabel control={<Checkbox checked={writechecked} onChange={(e) => handlewriteChange(e)} {...switchlabel} disabled defaultChecked size="small"/>} label="W"/>
      </>
      );
    }
  }
  return (
      /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
      <Box sx={{ width: 'md', height: 'md', maxWidth: '100%'}}>
          <Controller name="url" control={control} 
              rules={{required: "Requred", maxLength: {value: 150, message: "150 max"}}}
              render={() => (
                <List sx={{ width: 'md', height: 'md', maxWidth: '100%'}}>
                <ListItem>
                  <TextField sx={{ width: 'md', height: 'md', maxWidth: '100%'}} fullWidth label="url" id="url" size="small"
                    placeholder="wss://" multiline variant="outlined" margin="dense" {...register("url")} />
                  <_CheckBoxRW />
                  <Button type="submit" color="primary" variant="contained" size="small" onClick={handleSubmit(onSubmit)}>削除</Button>
                </ListItem>
                </List>)}/>          
      </Box>
  )
}

export const RelayAddForm = () => {
  const [NostrData, setNostrData] = useContext(NostrContext);
  const [readchecked, setreadChecked] = useState(false);
  const [writechecked, setwriteChecked] = useState(false);
  const handlereadChange = (event: ChangeEvent<HTMLInputElement>) => {
    setreadChecked(event.target.checked);
  };
  const handlewriteChange = (event: ChangeEvent<HTMLInputElement>) => {
    setwriteChecked(event.target.checked);
  };

  const {
      register,
      handleSubmit,
      control,
      setValue,
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = (data) => {

    NostrData.data.kind = 10002;
    NostrData.data.pubkey = NostrData.pkey;
    NostrData.data.created_at = Math.floor(Date.now() / 1000);
    NostrData.data.content = "";
    NostrData.data.tags = NostrData.relay;
    
    if(readchecked === true && writechecked === false){
      NostrData.relay.push(["r", data.url, "read"]);
    }else if(readchecked === false && writechecked === true){
      NostrData.relay.push(["r", data.url, "write"]);
    }else{
      NostrData.relay.push(["r", data.url]);
    }
    
    setValue('url',"");
    setNostrData({...NostrData});
  }

  return (
      /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
      <Box sx={{ width: 'md', height: 'md', maxWidth: '100%'}}>
          <Controller name="url" control={control} 
              rules={{required: "Requred", maxLength: {value: 150, message: "150 max"}}}
              render={() => (
                <List sx={{ width: 'md', height: 'md', maxWidth: '100%'}}>
                  <ListItem>
                    <TextField sx={{ p:1, width: 'md', height: 'md', maxWidth: '100%'}} fullWidth label="url" id="url" size="small"
                      placeholder="wss://" multiline variant="outlined" margin="dense" {...register("url")} />
                    <FormControlLabel control={<Checkbox checked={readchecked} onChange={(e) => handlereadChange(e)} {...switchlabel} size="small"/>} label="R"/>
                    <FormControlLabel control={<Checkbox checked={writechecked} onChange={(e) => handlewriteChange(e)} {...switchlabel} size="small"/>} label="W"/>
                    <Button type="submit" color="primary" variant="contained" size="small" onClick={handleSubmit(onSubmit)}>追加</Button>
                  </ListItem>
                </List>)}/>            
      </Box>
  )
}

const  renderRow = (value:_kind10002_tags, idx:number) => {
  if (value.length <= 1){
    return (<></>);
  }
  const relay_url = value[1];
  const relay_mode = value[2] !== undefined ? value[2] : "rw";

  return (
    <RelayListForm url={relay_url} mode={relay_mode} index={idx}/>
  );
}

export const RelayForm = () => {
  const [NostrData, setNostrData] = useContext(NostrContext);
  const [SubscrState, setSubscrState] = useContext(ContentsContext);
  const [jsonData, setjsonData] = useState<kind10002_tags>([["","",""]]);
  const loadMore = () => {
    //console.log("JSON", jsonData);
  }
  type nostr = [
    val1: string,
    val2: string,
    val3: typeof NostrData.data
  ];
  const CallbackJSON = useCallback((props:typeof NostrData) => {
    if (props.subscriptionJSON.length <= 0){
      return null;
    }else{
      if (SubscrState === 7){
        return props.subscriptionJSON.map(
          (member: nostr) => (member.length >= 3 && member[0] === "EVENT" && member[1] === props.subscription_id.myrelay &&
          (member[2].kind === 10002) && (member[2].tags !== undefined) ? member[2].tags : null));
      }
    }
  },[SubscrState]);
  useEffect(() => {
    let data = NostrData.relay.length <= 0 ? CallbackJSON(NostrData) : null;
    if (data !== null){
      let relay = data.findLast((element:_kind10002_tags) => element !== null);
      if (relay !== undefined){
        NostrData.relay = relay;
        setjsonData(NostrData.relay);
      }
    }else{
      setjsonData(NostrData.relay);
    }
  },[NostrData, CallbackJSON]);

  return (
    <Box sx={{ width: 'md', height: 'md', bgcolor: 'background.paper' }}>
        <InfiniteScroll
            pageStart={1}
            loadMore={loadMore}
            hasMore={false}
            loader={<div className="Relay" key={0}>Relay</div>}
            threshold={50}
            isReverse={true}
            useWindow={false}
        >
          {jsonData.map((value:_kind10002_tags, idx) => (value !== null ? renderRow(value, idx) : <></>))}
        </InfiniteScroll>
    </Box>
  );
}