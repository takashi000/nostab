import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import InfiniteScroll from 'react-infinite-scroller';
import { useForm, SubmitHandler, Controller} from "react-hook-form";
import TextField from '@mui/material/TextField';
import Button from "@mui/material/Button";
import Switch from '@mui/material/Switch';
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
  const [checked, setChecked] = useState(false);
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };
  const {
        register,
        handleSubmit,
        control,
        setValue
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    let index = props.index;
    let url = data.url;
    NostrData.relay.splice(index, 1);

    // NOTE: 上から最初に見つかったリレーを削除する (同じ設定が重複する場合は必ず先のものが削除される!!)
    if(checked){
      index = NostrData.relay_list[1].findIndex((element:string) => element === url);
      NostrData.relay_list[1].splice(index, 1);
    }else{
      index = NostrData.relay_list[0].findIndex((element:string) => element === url);
      NostrData.relay_list[0].splice(index, 1);
    }
    console.log(NostrData.relay, NostrData.relay_list);
    setNostrData({...NostrData});
  }

  const [SubscrState, setSubscrState] = useContext(ContentsContext);
  const initRelay = useCallback(() => {
      setValue('url', props.url);
      if(props.mode === "write"){
        setChecked(true);
      }else{
        setChecked(false);
      }
  },[setValue, setChecked, props]);

  useEffect(() => {
      if(SubscrState === 7){
         initRelay();
      }
  },[SubscrState, initRelay]);

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
                  <FormControlLabel control={
                    checked ? 
                    <Switch checked={checked} onChange={(e) => handleChange(e)} {...switchlabel} disabled defaultChecked />
                    :
                    <Switch checked={checked} onChange={(e) => handleChange(e)} {...switchlabel} disabled />
                    } label="R/W"/>
                  <Button type="submit" color="primary" variant="contained" size="small" onClick={handleSubmit(onSubmit)}>削除</Button>
                </ListItem>
                </List>)}/>          
      </Box>
  )
}

export const RelayAddForm = () => {
  const [NostrData, setNostrData] = useContext(NostrContext);
  const [checked, setChecked] = useState(false);
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };

  const {
      register,
      handleSubmit,
      control,
      setValue,
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = (data) => {

    NostrData.data.kind = 10003;
    NostrData.data.pubkey = NostrData.pkey;
    NostrData.data.created_at = Math.floor(Date.now() / 1000);
    NostrData.data.content = "";
    let mode = checked ? "write" : "read";
    NostrData.relay.push(["r", data.url, mode]);
    NostrData.data.tags = NostrData.relay;

    if(mode === 'read'){
      NostrData.relay_list[0] = NostrData.relay_list[0].concat(data.url);
    }else{
      NostrData.relay_list[1] = NostrData.relay_list[1].concat(data.url);
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
                    <FormControlLabel control={<Switch checked={checked} onChange={(e) => handleChange(e)} {...switchlabel} />} label="R/W"/>
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
  const relay_mode = value[2] !== undefined ? value[2] : "read";

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
        NostrData.relay = [relay];
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