import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import InfiniteScroll from 'react-infinite-scroller';

import SessionStorage from 'react-native-session-storage';

import { NostrContext ,NostrPubkeyEncode} from '../Nostr/Nostr';
import { useContext, useState, useEffect, useCallback} from 'react';

const  renderRow = (value) => {
  if (!value.id || !value.pubkey || !value.created_at || !value.content || !value.kind ||!value.sig)
  {
    return(<></>);
  }

  const metadata = SessionStorage.getItem(value.pubkey);
  const icon_url = metadata !== undefined ? metadata.picture : "";
  const user_name = metadata !== undefined ? metadata.name : NostrPubkeyEncode(value.pubkey);
 
  let date = new Date(value.created_at * 1000);
  let date_string = date.toLocaleString('ja-JP');
  
  function ReactionOrRepost(props){
    if(props.kind === 1){
      return(
        <Typography>あなたの投稿へ返信しました</Typography>
      );
    }else if(props.kind === 3){
      return(
        <Typography>あなたをフォローしました</Typography>
      );
    }else if(props.kind === 4){
      return(
        <Typography>あなたへメッセージを送信しました</Typography>
      );
    }else if(props.kind === 6){
      return (
        <Typography>あなたの投稿をリポストしました</Typography>
      );
    }else{
      return (        
        <Typography>あなたの投稿にいいねしました</Typography>
      );
    }  
  }

  return (
    <Card sx={{ height: "md", width: "md", maxWidth: '100%', }}>
      <CardHeader alignItems="flex-start"  component="div" disablePadding
        avatar={
          <Avatar alt="user" src={icon_url} />
        }
        title={user_name}
        subheader={date_string}
      />
      <CardContent>
        <ReactionOrRepost kind={value.kind}/>
      </CardContent>
    </Card>
  );
}

export const NotifyScreen = () => {
  const [NostrData, setNostrData] = useContext(NostrContext);
  const [jsonData, setjsonData] = useState([]);

  const loadMore = () => {
    //console.log("JSON", jsonData);
  }
  
  function MatchTags(prop, tag){
    let index = -1;
    prop.forEach((item, idx) => {
      if (item[0] === "p" && item[1] === tag){
        index = idx;
      }
    });
    return index >= 0 ? true : false;
  }
  const CallbackJSON = useCallback((props) => {
    if (props.subscriptionJSON.length <= 0){
      return null;
    }else{
      return props.subscriptionJSON.map((
        member) => (member.length >= 3 && member[0] === "EVENT" && member[1] === props.subscription_id.notify &&
        (member[2].kind === 1 || member[2].kind === 3 || member[2].kind === 4 || member[2].kind === 6 || member[2].kind === 7) && 
        MatchTags(member[2].tags, props.filter_notify["#p"][0]) ? member[2] : "NoContents"));
    }
  },[]);
  useEffect(() => {
    let data = CallbackJSON(NostrData);
    if (data !== null){
      setjsonData(data);
    }
  },[NostrData, CallbackJSON]);

  useEffect(() => {
    jsonData.forEach((value) => {
      if(value.pubkey !== undefined){
        NostrData.filter_meta.authors.push(value.pubkey);
      }});
  },[jsonData, setjsonData, NostrData.filter_meta.authors]);

  return (
    <Box sx={{ width: 'md', height: 'md', bgcolor: 'background.paper' }}>
        <InfiniteScroll
            pageStart={1}
            loadMore={loadMore}
            hasMore={false}
            loader={<div className="Notify" key={0}>Notification</div>}
            threshold={50}
            isReverse={true}
            useWindow={false}
        >
          {jsonData.map((value) => (value !== "NoContents" ? renderRow(value, NostrData, setNostrData) : <></>)).toReversed()}
        </InfiniteScroll>
    </Box>
  );
}