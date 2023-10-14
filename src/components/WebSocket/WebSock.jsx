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
  const { sendMessage} = useWebSocket(
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
    handleSendClose(NostrData.subscription_id.mymeta);
    handleSendClose(NostrData.subscription_id.myrelay);
    handleSendClose(NostrData.subscription_id.meta);
    handleSendReq(NostrData.subscription_id.meta,NostrData.filter_meta);
    handleSendReq(NostrData.subscription_id.myrelay, NostrData.filter_myrelay);
    handleSendReq(NostrData.subscription_id.mymeta, NostrData.filter_mymeta);
    handleSendReq(NostrData.subscription_id.notify, NostrData.filter_notify);
  },[handleSendReq, handleSendClose,
      NostrData.subscription_id,
      NostrData.filter_meta, NostrData.filter_mymeta, NostrData.filter_notify, NostrData.filter_myrelay]);
  useEffect(() => {
    // 通知購読REQ要求
    const intervalId = setInterval(() => {
      SendREQ();
    }, 6000);
    return () => {
        clearInterval(intervalId)
    }
  },[SendREQ]);

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
            // 検索日時更新
            if (data.length >= 3 && data[0] === "EVENT" && data[1] === NostrData.subscription_id.search &&
              (data[2].kind === 1 || data[2].kind === 6)){
                NostrData.lastDate_search = data[2].created_at-1;
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
    // リレーからREQ受信
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
    relay_url: NostrData.relay_list[0][0],
    relay_url_r: NostrData.relay_list[0][0],
    relay_url_w: NostrData.relay_list[1][0],
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
      if(WebSock.connectionStatus === 'Open'){
        WebSock.relay_url_r = NostrData.relay_list[0][relayNumber % NostrData.relay_list[0].length];
        WebSock.relay_url_w = NostrData.relay_list[1][relayNumber % NostrData.relay_list[1].length];
        WebSock.relay_url = relayNumber % 2 === 0 ? WebSock.relay_url_r : WebSock.relay_url_w;
        setWebSock({...WebSock});
        setrelayNumber((prev) => prev + 1);
      }
    }, 800);
    return () => {
        clearInterval(intervalId)
    }
  },[WebSock, NostrData.relay_list, relayNumber]);

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

/*
export const  WebSocketNostr = () => {
  const [NostrData, setNostrData] = useContext(NostrContext);
  const [SubscrState, setSubscrState] = useContext(ContentsContext);
  const rs_url = NostrData.rs[0];
  //Public API that will echo messages sent to it back to the client
  const [socketUrl, setSocketUrl] = useState(rs_url);
  const [messageHistory, setMessageHistory] = useState([]);

  const getSocketUrl = useCallback((url) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(url);
      }, 2000);
    });
  }, []);
  const { sendMessage, lastMessage, readyState} = useWebSocket(
    socketUrl,
    {
      shouldReconnect: () => true,
      reconnectAttempts: 10,
      reconnectInterval: (attemptNumber) =>
        Math.min(Math.pow(2, attemptNumber) * 1000, 10000),
    });
    const connectionStatus = {
      [ReadyState.CONNECTING]: 'Connecting',
      [ReadyState.OPEN]: 'Open',
      [ReadyState.CLOSING]: 'Closing',
      [ReadyState.CLOSED]: 'Closed',
      [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];
  
  const handleSendEvent   = useCallback((data) => sendMessage(JSON.stringify(["EVENT",data])),[sendMessage]);
  const handleSendReq     = useCallback((id, filter) => sendMessage(JSON.stringify(["REQ",id,filter])), [sendMessage]);
  const handleSendClose   = useCallback((id) => sendMessage(JSON.stringify(["CLOSE",id])),[sendMessage]);

  const GetMessage = useCallback((value) => {
      if (lastMessage !== null) {
        if(messageHistory.length > 800){
          setMessageHistory(messageHistory.filter((word, idx) => idx >= 250));
        } else if (messageHistory.length === 0 || messageHistory[messageHistory.length-1].data !== lastMessage.data){
          let member = JSON.parse(lastMessage.data);
          let metadata = member.length >= 3 && member[0] === "EVENT" && member[1] === NostrData.subscription_id.meta 
            && member[2].kind === 0 ? member[2] : null;
          if (metadata !== null){
            SessionStorage.setItem(metadata.pubkey, JSON.parse(metadata.content));
          }else{
            setMessageHistory((prev) => prev.concat(lastMessage));
            setNostrData({...NostrData, subscriptionJSON:  messageHistory.map((member) => {
              return JSON.parse(member.data);
          })});
        }
      }
    }
  },[lastMessage, NostrData, messageHistory, setNostrData]);
  useEffect(() => {
    // リレーからREQ受信
    GetMessage(lastMessage);
  }, [lastMessage, GetMessage]);

  const SendREQ = useCallback(() => {
    handleSendClose(NostrData.subscription_id.notify);
    handleSendClose(NostrData.subscription_id.mymeta);
    handleSendClose(NostrData.subscription_id.myrelay);
    handleSendClose(NostrData.subscription_id.meta);
    handleSendReq(NostrData.subscription_id.meta,NostrData.filter_meta);
    handleSendReq(NostrData.subscription_id.myrelay, NostrData.filter_myrelay);
    handleSendReq(NostrData.subscription_id.mymeta, NostrData.filter_mymeta);
    handleSendReq(NostrData.subscription_id.notify, NostrData.filter_notify);
  },[handleSendReq, handleSendClose,
      NostrData.subscription_id,
      NostrData.filter_meta, NostrData.filter_mymeta, NostrData.filter_notify, NostrData.filter_myrelay]);
  useEffect(() => {
    // 通知購読REQ要求
    const intervalId = setInterval(() => {
      SendREQ();
    }, 5000);
    return () => {
        clearInterval(intervalId)
    }
  },[SendREQ]);

  useEffect(() => {
    // EVENT 送信
    if (NostrData.data.content !== null)
    {
      if (NostrData.data.kind === 4){
        NostrData.directmsg.then((value) => {
          NostrData.data.content = value;
          NostrData.data.id = NostrGetEventHash(NostrData);
          NostrData.data.sig = NostrGetSignature(NostrData);
          handleSendEvent(NostrData.data);
          NostrData.directmsg = "";
        });
      }else{
        NostrData.data.id = NostrGetEventHash(NostrData);
        NostrData.data.sig = NostrGetSignature(NostrData);
        handleSendEvent(NostrData.data);
      }
    }
    return () => {
      NostrData.data.content = null;
    }
  },[handleSendEvent, NostrData, NostrData.data, NostrData.directmsg]);

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

  return (
    <></>
  );
};
*/