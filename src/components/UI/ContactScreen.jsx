import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import { IconButton } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroller';
import SessionStorage from 'react-native-session-storage';
import { ContactsMenu } from './MenuList';

import { NostrContext ,NostrPubkeyEncode} from '../Nostr/Nostr';
import { useContext, useState, useEffect, useCallback} from 'react';

import { ContentsContext } from './Contents';

const  _renderRow = (value) => {
  if (value[1].length <= 1){
    return (<></>);
  }
  const metadata = SessionStorage.getItem(value[1]);
  const icon_url = metadata !== undefined ? metadata.picture : "";
  const user_name = metadata !== undefined ? metadata.name : NostrPubkeyEncode(value[1]);
   
  return (
    <Card sx={{ height: "md", width: "md", maxWidth: '100%', }}>
      <CardHeader alignItems="flex-start"  component="div" disablePadding
        avatar={
          <Avatar alt="user" src={icon_url} />
        }
        action={
          <IconButton aria-label="settings">
            <ContactsMenu value={value} metadata={metadata}/>
          </IconButton>
        }
        title={user_name}
      />
    </Card>
  );
}

const renderRow = (value) =>{
  return (
    value.map((member) => (member.length > 0 && member[0] === "p" ? _renderRow(member) : <></>))
  );
}

export const ContactScreen = () => {
  const [NostrData, setNostrData] = useContext(NostrContext);
  const [SubscrState, setSubscrState] = useContext(ContentsContext);
  const [jsonData, setjsonData] = useState([]);

  const loadMore = () => {
    //console.log("JSON", jsonData);
  }

  const CallbackJSON = useCallback((props) => {
    if (props.subscriptionJSON.length <= 0){
      return null;
    }else{
      if (SubscrState === 2){
        return props.subscriptionJSON.map(
          (member) => (member.length >= 3 && member[0] === "EVENT" && member[1] === props.subscription_id.mycontact &&
          (member[2].kind === 3) && (member[2].tags !== undefined) ? member[2].tags : "NoContents"));
      }
    }
  },[SubscrState]);
  useEffect(() => {
    let data = NostrData.contacts.length <= 0 ? CallbackJSON(NostrData) : null;
    if (data !== null){
      let contacts = data.findLast((element) => element !== "NoContents");
      if (contacts !== undefined){
        NostrData.contacts = [contacts];
        NostrData.filter_home["#p"] = NostrData.filter_home["#p"].concat(contacts.map((item) => (item[1])));
        setjsonData(NostrData.contacts);
      }
    }else{
      setjsonData(NostrData.contacts);
    }
    console.log("Contacts", NostrData.contacts);
  },[NostrData, CallbackJSON]);

  return (
    <Box sx={{ width: 'md', height: 'md', bgcolor: 'background.paper' }}>
        <InfiniteScroll
            pageStart={1}
            loadMore={loadMore}
            hasMore={false}
            loader={<div className="Contacts" key={0}>Contacts</div>}
            threshold={50}
            isReverse={true}
            useWindow={false}
        >
          {jsonData.map((value) => (value !== "NoContents" ? renderRow(value, NostrData, setNostrData) : <></>)).toReversed()}
        </InfiniteScroll>
    </Box>
  );
}