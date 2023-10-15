import { useState, useCallback, useEffect ,useContext, createContext} from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import SessionStorage from 'react-native-session-storage';
import { NostrContext,NostrGetEventHash, NostrGetSignature, NostrDecyptDM} from '../Nostr/Nostr';
import { ContentsContext } from '../UI/Contents';

const WebSockContext = createContext();

const WebSocketNostrSenderREQ = () => {
  const [NostrData, setNostrData] = useContext(NostrContext);
  const [SubscrState, setSubscrState] = useContext(ContentsContext);
  const [WebSock, setWebSock] = useContext(WebSockContext);
  //Public API that will echo messages sent to it back to the client
  const [socketUrl, setSocketUrl] = useState(null);
  const getSocketUrl = useCallback((url) => {
    if(url === null || url === undefined){
      return null;
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(url);
      }, 100);
    });
  }, []);
  const { sendMessage } = useWebSocket(
    socketUrl,
    {
      shouldReconnect: () => true,
      reconnectAttempts: 10,
      reconnectInterval: (attemptNumber) =>
        Math.min(Math.pow(2, attemptNumber) * 1000, 10000),
      share: true
    });

  const handleSendReq     = useCallback((id, filter) => sendMessage(JSON.stringify(["REQ",id,filter])), [sendMessage]);
  const handleSendClose   = useCallback((id) => sendMessage(JSON.stringify(["CLOSE",id])),[sendMessage]);

  useEffect(() => {
    setSocketUrl(getSocketUrl(WebSock.relay_url_r));
  },[WebSock, getSocketUrl]);

  const SendREQ = useCallback(() => {
    handleSendClose(NostrData.subscription_id.notify);
    handleSendClose(NostrData.subscription_id.myrelay);
    handleSendReq(NostrData.subscription_id.myrelay, NostrData.filter_myrelay);
    handleSendReq(NostrData.subscription_id.notify, NostrData.filter_notify);
  },[handleSendReq, handleSendClose,
      NostrData.subscription_id,
      NostrData.filter_notify, NostrData.filter_myrelay]);
  const SendREQ_meta = useCallback(() => {
    handleSendClose(NostrData.subscription_id.mymeta);
    handleSendClose(NostrData.subscription_id.meta);
    handleSendReq(NostrData.subscription_id.meta,NostrData.filter_meta);
    handleSendReq(NostrData.subscription_id.mymeta, NostrData.filter_mymeta);
  },[handleSendReq, handleSendClose,
      NostrData.subscription_id, NostrData.filter_meta, NostrData.filter_mymeta]);
  const [prevconnection, setprevconnection] = useState('Uninstantiated');
  useEffect(() => {
    if (prevconnection !== 'Open' && WebSock.connectionStatus === 'Open'){
      // リレーサーバとコネクション確立時に通知購読REQ要求
      SendREQ();
    }
    return () => {
      setprevconnection(WebSock.connectionStatus);
    }
  },[WebSock, SendREQ, prevconnection]);
  useEffect(() => {
    // kind0購読を定期要求
    const intervalId = setInterval(() => {
      SendREQ_meta();
    }, 6000);
    return () => {
      clearInterval(intervalId);
    }
  },[SendREQ_meta]);

  useEffect(() => {
    // 表示タブごとのREQ要求
    let subscription_id = "", filter = "";
    switch(SubscrState){
      case 0:
        subscription_id = NostrData.subscription_id.mymeta;
        filter = NostrData.filter_mymeta;
        break;
      case 1:
        break;
      case 2:
        subscription_id = NostrData.subscription_id.mycontact;
        filter = NostrData.filter_mycontact;
        break;
      case 3:
        subscription_id = NostrData.subscription_id.home;
        filter = NostrData.filter_home;
        break;
      case 4:
        if(NostrData.filter_search !== null){
          subscription_id = NostrData.subscription_id.search;
          filter = NostrData.filter_search;
        }
        break;
      case 5:
        subscription_id = NostrData.subscription_id.directmsg;
        filter = NostrData.filter_dm;
        break;
      case 6:
        subscription_id = NostrData.subscription_id.notify;
        filter = NostrData.filter_notify;
        break;
      case 7:
        subscription_id = NostrData.subscription_id.myrelay;
        filter = NostrData.filter_myrelay;
        break;
      default:
        break;
    }
    
    if (subscription_id !== "" && filter !== ""){
      handleSendClose(subscription_id);
      handleSendReq(subscription_id, filter);
    }
  },[SubscrState, NostrData.subscription_id,
    NostrData.filter, NostrData.filter_home, NostrData.filter_dm, 
    NostrData.filter_mycontact, NostrData.filter_mymeta, NostrData.filter_search,
    NostrData.filter_notify,NostrData.filter_myrelay,
    handleSendReq, handleSendClose]);

  return (<></>);
}

const WebSocketNostrSenderEVENT = () => {
  const [NostrData, setNostrData] = useContext(NostrContext);
  const [WebSock, setWebSock] = useContext(WebSockContext);
  //Public API that will echo messages sent to it back to the client
  const [socketUrl, setSocketUrl] = useState(null);
  const getSocketUrl = useCallback((url) => {
    if(url === null || url === undefined){
      return null;
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(url);
      }, 100);
    });
  }, []);
  const { sendMessage} = useWebSocket(
    socketUrl,
    {
      shouldReconnect: () => true,
      reconnectAttempts: 10,
      reconnectInterval: (attemptNumber) =>
        Math.min(Math.pow(2, attemptNumber) * 1000, 10000),
      share: true
    });
  
  const handleSendEvent   = useCallback((data) => sendMessage(JSON.stringify(["EVENT",data])),[sendMessage]);

  useEffect(() => {
    setSocketUrl(getSocketUrl(WebSock.relay_url_w));
  },[WebSock, getSocketUrl]);

  useEffect(() => {
    // EVENT 送信
    function sendEvent(sender){
      if (sender.data.content !== null){
        if (sender.data.kind === 4){
          sender.directmsg.then((value) => {
            sender.data.content = value;
            if(sender.skey === "nip07"){
              sender.data = window.nostr?.signEvent(sender.data).then((event) => {
                handleSendEvent(event);
                sender.directmsg = "";
              }).catch((error) => {
                console.log(error);
              })
            }else{
              sender.data.id = NostrGetEventHash(sender);
              sender.data.sig = NostrGetSignature(sender);
              handleSendEvent(sender.data);
              sender.directmsg = "";
            }
          });
        }else{
          if(sender.skey === "nip07"){
            sender.data = window.nostr?.signEvent(NostrData.data).then((event) => {
              handleSendEvent(event);
              sender.directmsg = "";
            }).catch((error) => {
              console.log(error);
            })
          }else{
            sender.data.id = NostrGetEventHash(sender);
            sender.data.sig = NostrGetSignature(sender);
            handleSendEvent(sender.data);
          }
        }
        sender.data.content = null;
        return sender;
      }
      return null;
    }
    if (sendEvent(NostrData) !== null){
      setNostrData({...NostrData});
    }
  },[handleSendEvent, NostrData, setNostrData]);

  return (<></>);
}

const WebSocketNostrListener = () => {
  const [NostrData, setNostrData] = useContext(NostrContext);
  const [SubscrState, setSubscrState] = useContext(ContentsContext);
  const [WebSock, setWebSock] = useContext(WebSockContext);
  //Public API that will echo messages sent to it back to the client
  const [socketUrl, setSocketUrl] = useState(null);
  const [messageHistory, setMessageHistory] = useState([]);
  const getSocketUrl = useCallback((url) => {
    if(url === null || url === undefined){
      return null;
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(url);
      }, 100);
    });
  }, []);
  const { lastMessage} = useWebSocket(
    socketUrl,
    {
      shouldReconnect: () => true,
      reconnectAttempts: 10,
      reconnectInterval: (attemptNumber) =>
        Math.min(Math.pow(2, attemptNumber) * 1000, 10000),
      share:true,
    });
  
  useEffect(() => {
    setSocketUrl(getSocketUrl(WebSock.relay_url));
  },[WebSock, getSocketUrl]);

  const DestoryHistory = useCallback(() => {
    if (messageHistory.length <= 800){
      return null;
    }
    let ignore_subscription_id = "";
    switch(SubscrState){
      case 0:
        ignore_subscription_id = NostrData.subscription_id.mymeta;
        break;
      case 1:
        break;
      case 2:
        ignore_subscription_id = NostrData.subscription_id.mycontact;
        break;
      case 3:
        ignore_subscription_id = NostrData.subscription_id.home;
        break;
      case 4:
        ignore_subscription_id = NostrData.subscription_id.search;
        break;
      case 5:
        ignore_subscription_id = NostrData.subscription_id.directmsg
        break;
      case 6:
        ignore_subscription_id = NostrData.subscription_id.notify
        break;
      case 7:
        break;
      default:
        break;
    }
    setMessageHistory((prev) => prev.filter((word) => word[1] === ignore_subscription_id));
  },[NostrData.subscription_id,SubscrState,messageHistory]);
  const GetMessage = useCallback(async (value) => {
      if (lastMessage !== null) {
        DestoryHistory();
        if (messageHistory.length === 0 || JSON.stringify(messageHistory[messageHistory.length-1]) !== lastMessage.data){
          let data = JSON.parse(lastMessage.data);
          let metadata = data.length >= 3 && data[0] === "EVENT" && data[1] === NostrData.subscription_id.meta 
            && data[2].kind === 0 ? data[2] : null;
          if (metadata !== null){
            SessionStorage.setItem(metadata.pubkey, JSON.parse(metadata.content));
          }else{
            async function decryptDM(data){
              if (NostrData.skey === "nip07"){
                return await window.nostr?.nip04?.decrypt(data.pubkey, data.content);
              }else{
                return await NostrDecyptDM(NostrData, data.pubkey, data.content);
              }
            }
            // DM復号化
            if (data.length >= 3 && data[0] === "EVENT" && data[1] === NostrData.subscription_id.directmsg &&
                data[2].kind === 4 && data[2].content !== ""){
                  data[2].content = await decryptDM(data[2]);
            }
            // 検索最終日時更新
            if (data.length >= 3 && data[0] === "EVENT" && data[1] === NostrData.subscription_id.search &&
                (data[2].kind === 1 || data[2].kind === 6)){
                NostrData.lastDate.search = data[2].created_at-1;
            }
            // ホーム最終日時更新
            if (data.length >= 3 && data[0] === "EVENT" && data[1] === NostrData.subscription_id.home &&
                (data[2].kind === 1 || data[2].kind === 6)){
                  NostrData.lastDate.home = data[2].created_at-1;
                  NostrData.filter_home.until = NostrData.lastDate.home;
            }
            // 通知最終日時更新
            function MatchTags(prop, tag){
              let index = -1;
              prop.forEach((item, idx) => {
                if (item[0] === "p" && item[1] === tag){
                  index = idx;
                }
              });
              return index >= 0 ? true : false;
            }
            if (data.length >= 3 && data[0] === "EVENT" && data[1] === NostrData.subscription_id.notify &&
                (data[2].kind === 1 || data[2].kind === 3 || data[2].kind === 4 || data[2].kind === 6 || data[2].kind === 7) &&
                MatchTags(data[2].tags, NostrData.filter_notify["#p"][0])){
                  NostrData.lastDate.notify = data[2].created_at-1;
                  NostrData.filter_notify.until = NostrData.lastDate.notify;
            }
            setMessageHistory((prev) => prev.concat([data]));
            setNostrData({...NostrData, subscriptionJSON:  await Promise.all(messageHistory.map(async (member) => {
              return member;
            }))});
        }
      }
    }
  },[lastMessage, NostrData, messageHistory, setNostrData, DestoryHistory]);
  useEffect(() => {
    // リレーから受信REQを取得
    GetMessage(lastMessage);
  }, [lastMessage, GetMessage]);

  const [prevSubscr, setprevSubscr] = useState(null);
  useEffect(() => {
    if(NostrData.filter_search !== null && prevSubscr === 4 && SubscrState !== 4){
      // 検索タブからほかのタブに遷移したとき、検索結果を削除する
      let ignore_subscription_id = NostrData.subscription_id.search;
      setMessageHistory((prev) => prev.filter((word) => word[1] !== ignore_subscription_id));
      setNostrData({...NostrData, filter_search: null});
    }
    return () => {
      setprevSubscr(SubscrState);
    }
  },[SubscrState, prevSubscr, NostrData, setNostrData]);

  return (<></>);
}

export const  WebSocketNostr = () => {
  const [NostrData, setNostrData] = useContext(NostrContext);
  const [socketUrl, setSocketUrl] = useState(null);
  const getSocketUrl = useCallback((url) => {
    if(url === null || url === undefined){
      return null;
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(url);
      }, 100);
    });
  }, []);
  const {readyState} = useWebSocket(
    socketUrl,
    {
      shouldReconnect: () => true,
      reconnectAttempts: 10,
      reconnectInterval: (attemptNumber) =>
        Math.min(Math.pow(2, attemptNumber) * 1000, 10000),
      share: true
    });
  const [WebSock, setWebSock] = useState({
    relay_url: null,
    relay_url_r: null,
    relay_url_w: null,
    connectionStatus:{
      [ReadyState.CONNECTING]: 'Connecting',
      [ReadyState.OPEN]: 'Open',
      [ReadyState.CLOSING]: 'Closing',
      [ReadyState.CLOSED]: 'Closed',
      [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState]
  });
  const [relayNumber, setrelayNumber] = useState(1);

  useEffect(() => {
    // リレーサーバを定周期で切替
    const intervalId = setInterval(() => {
      let relayIndex = relayNumber % NostrData.relay.length;
      if(NostrData.relay.length >= 1 &&
          (WebSock.connectionStatus === 'Open'||
          WebSock.relay_url === null || WebSock.relay_url_r === null || WebSock.relay_url_w === null)){
        let relay_url_r = NostrData.relay[relayIndex].length === 2 || 
                      NostrData.relay[relayIndex][2] === 'read' ? NostrData.relay[relayIndex][1] : null;
        let relay_url_w = NostrData.relay[relayIndex].length === 2 || 
                      NostrData.relay[relayIndex][2] === 'write' ? NostrData.relay[relayIndex][1] : null;
        if (relay_url_r !== null){
          WebSock.relay_url_r = relay_url_r;
        }
        if (relay_url_w !== null){
          WebSock.relay_url_w = relay_url_w;
        }
        WebSock.relay_url = relayNumber % 2 === 0 ? WebSock.relay_url_r : WebSock.relay_url_w;
        setWebSock({...WebSock});
        setrelayNumber((prev) => prev + 1);
      }
    }, 800);
    return () => {
      clearInterval(intervalId);
    }
  },[WebSock, NostrData.relay, relayNumber]);

  useEffect(() => {
    setSocketUrl(getSocketUrl(WebSock.relay_url));
  },[WebSock, getSocketUrl]);
  return (
    <>
      <WebSockContext.Provider value = {[WebSock, setWebSock]}>
        <WebSocketNostrListener />
        <WebSocketNostrSenderEVENT />
        <WebSocketNostrSenderREQ />
      </WebSockContext.Provider>
    </>
  );
}
