import * as React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ReplyIcon from '@mui/icons-material/Reply';
import Box from '@mui/material/Box';
import MailLockIcon from '@mui/icons-material/MailLock';
import InfiniteScroll from 'react-infinite-scroller';

import SessionStorage from 'react-native-session-storage';
import reactStringReplace from "react-string-replace";

import { NostrContext ,NostrPubkeyEncode, NostrDecyptDM} from '../Nostr/Nostr';
import { useContext, useState, useEffect, useCallback} from 'react';
import { ContentsContext } from './Contents';

import { BasicMenu } from './MenuList';

class DecodeContent extends React.Component {
  render () {
    const regExp_url  = /(https?:\/\/\S+)/g;
    const content = this.props.content;

    return (
      <Typography>
        {reactStringReplace(content, regExp_url, (match, i) => (<a key={i} href={match}>{match}</a>))}
      </Typography>
    );
  }
};

function handleOnGood(value, NostrData, setNostrData){
  NostrData.data.pubkey = NostrData.pkey;
  NostrData.data.content = "+";
  NostrData.data.kind = 7;
  NostrData.data.created_at = Math.floor(Date.now() / 1000);
  NostrData.data.tags = [["e", value.id, NostrData.rs[0]]];
  setNostrData({...NostrData,data:{...NostrData.data}});
}
function handleOnRepost(value, NostrData, setNostrData){
  NostrData.data.pubkey = NostrData.pkey;
  NostrData.data.content = JSON.stringify(NostrData.data);
  NostrData.data.kind = 6;
  NostrData.data.created_at = Math.floor(Date.now() / 1000);
  NostrData.data.tags = [["e", value.id, NostrData.rs[0]]];
  setNostrData({...NostrData,data:{...NostrData.data}});
}
function handleOnReplay(user_name, value, NostrData, setNostrData){
  NostrData.replay.name = '@'+user_name;
  NostrData.replay.tags = [["e", value.id, NostrData.rs[0]]];
  setNostrData({...NostrData,replay:{...NostrData.replay}});
}
function handleOnContact(value, NostrData, setNostrData){
  if (NostrData.contacts[0] !== undefined){
    NostrData.contacts[0].push(["p",value.pubkey]);
    NostrData.data.pubkey = NostrData.pkey;
    NostrData.data.content = "";
    NostrData.data.kind = 3;
    NostrData.data.created_at = Math.floor(Date.now() / 1000);
    NostrData.data.tags = NostrData.contacts[0];
    NostrData.filter_home["#p"] = NostrData.filter_home["#p"].concat(value.pubkey);
    setNostrData({...NostrData,data:{...NostrData.data}});
  }
}
function handleOnDM(user_name, value, NostrData, setNostrData){
  NostrData.directMessage.name    = '@'+user_name;
  NostrData.directMessage.pubkey  = value.pubkey;
  NostrData.directMessage.tags    = [["p", value.pubkey]];
  setNostrData({...NostrData,directMessage:{...NostrData.directMessage}});
}

const _renderDM = (props, value, NostrData, setNostrData) => {
  return (
    <Card sx={{ height: "md", width: "md", maxWidth: '100%', bgcolor:'secondary.main'}}>
      <CardHeader alignItems="flex-start"  component="div" disablePadding
        avatar={
          <Avatar alt="user" src={props.icon_url} />
        }
        title={props.user_name}
        subheader={props.date_string}/>
        <CardContent>
          <DecodeContent content={props.decoded_content}/>
          {!props.img_urls ?<></>  : props.img_urls.map((item) => {
            return (
              <CardMedia 
                component="img"
                height='md'
                image={item}
                alt="image"
              />);
          })}
          <Typography sx={{ mb: 1.5 }} color="text.secondary">
            {props.id}
          </Typography>
        </CardContent>
      <CardActions disableSpacing>
        <IconButton aria-label="directmessage" onClick={() => {handleOnDM(props.user_name, value, NostrData, setNostrData)}}>
          <MailLockIcon />
        </IconButton>
        <IconButton aria-label="addcontacts">
          <PersonAddIcon onClick={() => handleOnContact(value, NostrData, setNostrData)} />
        </IconButton>
        <IconButton aria-label="settings">
          <BasicMenu value={value} />
        </IconButton>
      </CardActions>
    </Card>
  );
}

const _renderRepost = (props) => {
  return (
    <Card sx={{ height: "md", width: "md", maxWidth: '100%', }}>
      <CardHeader alignItems="flex-start"  component="div" disablePadding
        avatar={
          <Avatar alt="user" src={props.icon_url} />
        }
        title={props.user_name}
        subheader={props.date_string}/>
        <CardContent>
          <DecodeContent content={props.decoded_content}/>
          {!props.img_urls ?<></>  : props.img_urls.map((item) => {
            return (
              <CardMedia 
                component="img"
                height='md'
                image={item}
                alt="image"
              />);
          })}
          <Typography sx={{ mb: 1.5 }} color="text.secondary">
            {props.id}
          </Typography>
        </CardContent>
    </Card>
  );
}

const _renderSub = (props, value, NostrData, setNostrData) => {
  let post_value = value.kind === 6 ? props.event_parm : value;
  let post_user_name = value.kind === 6 ?  NostrPubkeyEncode(props.event_parm.pubkey) : props.user_name;

  return (
    <Card sx={{ height: "md", width: "md", maxWidth: '100%'}}>
      <CardHeader alignItems="flex-start"  component="div" disablePadding
        avatar={
          <Avatar alt="user" src={props.icon_url} />
        }
        title={props.user_name}
        subheader={props.date_string}/>
        <CardContent>
          {value.kind === 6 ? 
              <Typography sx={{ mb: 0.5 }} color="text.secondary">
                以下のポストをリポストしました
              </Typography>
            :
              <></>
          }
          {
            value.kind === 1 && value.pubkey !== NostrData.data.pubkey ?
              props.event_parm.tags.map((tag) => {
                if (tag[0] === "p" && tag[1] === NostrData.data.pubkey){
                  return (
                    <Typography sx={{ mb: 0.5 }} color="text.secondary">
                      あなた宛ての返信です
                    </Typography>
                  );
                }
                return (<></>);
              })
              :
              <></>
          }
          <DecodeContent content={props.decoded_content}/>
          {!props.img_urls ?<></>  : props.img_urls.map((item) => {
            return (
              <CardMedia 
                component="img"
                height='md'
                image={item}
                alt="image"
              />);
          })}
          <Typography sx={{ mb: 1.5 }} color="text.secondary">
            {props.id}
          </Typography>
        </CardContent>
      <CardActions disableSpacing>
        <IconButton aria-label="add to favorites" onClick={() => {handleOnGood(post_value, NostrData, setNostrData)}}>
            <FavoriteIcon />
        </IconButton>
        <IconButton aria-label="share" onClick={() => {handleOnRepost(post_value, NostrData, setNostrData)}}>
          <ShareIcon />
        </IconButton>
        <IconButton aria-label="reply" onClick={() => {handleOnReplay(post_user_name, post_value, NostrData, setNostrData)}}>
          <ReplyIcon />
        </IconButton>
        <IconButton aria-label="directmessage" onClick={() => {handleOnDM(post_user_name, post_value, NostrData, setNostrData)}}>
          <MailLockIcon />
        </IconButton>
        <IconButton aria-label="addcontacts">
          <PersonAddIcon onClick={() => handleOnContact(post_value, NostrData, setNostrData)} />
        </IconButton>
        <BasicMenu value={value}/>
      </CardActions>
    </Card>
  );
}

function decodeData(value, content){
  let Data = {
    id:"",
    icon_url:"",
    user_name:"",
    img_urls:"",
    decoded_content:"",
    date_string:"",
    event_parm:{}
  };

  function getUserName(props){
    return props.display_name === "" || props.display_name === undefined ? 
                        props.name : props.display_name + '@' + props.name;
  }

  const metadata = SessionStorage.getItem(value.pubkey);
  const icon_url = metadata !== undefined ? metadata.picture : "";
  const user_name = metadata !== undefined ? getUserName(metadata) : NostrPubkeyEncode(value.pubkey);
  let img_urls = content.match(/(https?:\/\/\S+(jpg|jpeg|gif|png|bmp)$)/g);
  let decoded_content = "";
  let id = value.id;

  if (!img_urls){
    decoded_content = content;
  }else{
    img_urls.forEach((item) => {
      decoded_content = content.replace(item,"");
    });
  }
  let date = new Date(value.created_at * 1000);
  let date_string = date.toLocaleString('ja-JP');

  Data = {id: id, icon_url: icon_url, user_name: user_name, img_urls:img_urls, 
          decoded_content:decoded_content, date_string: date_string, event_parm: value};

  if (value.kind === 6){
    let value_repost = JSON.parse(decoded_content);
    let content_repost = value_repost.content;
    if (value_repost.kind === 1 && content_repost !== null && value_repost.id !== "" && value_repost.sig !== ""){
      // Nostrの仕様上kind1以外のEVENTへのkind6をリレーサーバは転送するため
      let Data_repost = decodeData(value_repost, content_repost);
      decoded_content = _renderRepost(Data_repost);
      Data = {...Data,decoded_content:decoded_content, event_parm:Data_repost.event_parm};
    }else{
      // リポスト元データが不正の場合
      return null;
    }
  }

  return Data;
}
const _renderRow = (value, NostrData, setNostrData, content) => {
  
  let DataParm = decodeData(value, content);

  if (DataParm === null){
    return (<></>);
  }

  if ( value.kind === 4){
    return _renderDM(DataParm, value, NostrData, setNostrData);
  }else{
    return _renderSub(DataParm, value, NostrData, setNostrData);
  }
}
const renderRow = (value, NostrData, setNostrData) => {
  if (!value.id || !value.pubkey || !value.created_at || !value.content || !value.sig || !value.tags)
  {
    return(<></>);
  }

  let content = value.content;
  
  return _renderRow(value, NostrData, setNostrData, content);
}
const renderThread = (jsonData, NostrData, setNostrData) => {
  return jsonData.map((value) => (value !== "NoContents" ? renderRow(value, NostrData, setNostrData) : <></>));
}
export const SubScreen = () => {
  const [NostrData, setNostrData] = useContext(NostrContext);
  const [SubscrState, setSubscrState] = useContext(ContentsContext);
  const [jsonData, setjsonData] = useState([]);

  const loadMore = () => {
    // console.log("JSON", jsonData);
  }

  const getsubscriptionJSON = useCallback((props) => {
    if (props.subscriptionJSON.length <= 0){
      return null;
    }else{
      // console.log("NOSTR", props.subscriptionJSON);
      if (SubscrState === 3){
        return props.subscriptionJSON.map(
          (member) => (member.length >= 3 && member[0] === "EVENT" && 
          (member[1] === props.subscription_id.home) &&
          (member[2].kind === 1 || member[2].kind === 6)? member[2] : "NoContents"));
      }else if(SubscrState === 4){
        return props.subscriptionJSON.map(
          (member) => (member.length >= 3 && member[0] === "EVENT" && 
          (member[1] === props.subscription_id.search) &&
          (member[2].kind === 1 || member[2].kind === 6)? member[2] : "NoContents"));
      }else if(SubscrState === 5){
        return props.subscriptionJSON.map(
          (member) => (member.length >= 3 && member[0] === "EVENT" && 
          (member[1] === props.subscription_id.directmsg) &&
          (member[2].kind === 4)? member[2] : "NoContents"));
      }
    }
  },[SubscrState]);

  useEffect(() => {
    let data = getsubscriptionJSON(NostrData);
    if (data !== null){
      setjsonData(data);
    }
  },[NostrData,getsubscriptionJSON]);

  useEffect(() => {
    jsonData.forEach((value) => {
      if(value.pubkey !== undefined){
        NostrData.filter_meta.authors.push(value.pubkey);
      }});
  },[jsonData, setjsonData, NostrData.filter_meta.authors]);
  return (
    <Box sx={{ width: 'md', height: 'md', bgcolor: 'background.paper'}}>
        <InfiniteScroll
            pageStart={1}
            loadMore={loadMore}
            hasMore={false}
            loader={<div className="Subscription" key={0}>Subscription</div>}
            threshold={50}
            isReverse={true}
            useWindow={false}
        >
          {renderThread(jsonData, NostrData, setNostrData)}
        </InfiniteScroll>
    </Box>
  );
}