import { useState, useEffect, createContext} from 'react';
import { generatePrivateKey, getPublicKey, getSignature, getEventHash,nip04,nip19} from 'nostr-tools';
import { Contents } from '../UI/Contents';
import { useUser } from '../Auth/lib/auth';

export const NostrContext = createContext();

export const NostrGenPrivKey = () => {
    const sk = generatePrivateKey();
    return (
        sk
    );
}
export const NostrGenPubKey = (sk) => {
    const pk = getPublicKey(sk);
    return (
        pk
    );
}
export const NostrPrivEncode = (value) => {
    const nsec = value.length === 64 ? nip19.nsecEncode(value) : "";
    return (
        nsec
    );
}
export const NostrPubkeyEncode = (value) => {
    const npub = value.length === 64 ? nip19.npubEncode(value) : "";
    return (
        npub
    );
}
export const NostrPrivDecode = (value) => {
    const hex = value.indexOf("nsec") === 0 ? nip19.decode(value) : null;
    return (
        hex !== null ? hex.data : value
    );
}
export const NostrPubkeyDecode = (value) => {
    const hex = value.indexOf("npub") === 0 ? nip19.decode(value) : null;
    return (
        hex !== null ? hex.data : value
    );
}
export const NostrGetEventHash = (value) => {
    const hash = getEventHash(value.data);
    return (
        hash
    );
}
export const NostrGetSignature = (value) => {
    const sig = getSignature(value.data,value.skey);
    return (
        sig
    );
}
export function NostrEncyptDM (value, spub, message) {
    return nip04.encrypt(value.skey, spub, message);
}
export function NostrDecyptDM (value, rpub, message) {
    return nip04.decrypt(value.skey, rpub, message);
}
export const Nostr = () => {

    const user = useUser();
    const _skey = user.data.privkey;
    const _pkey = user.data.pubkey;
    const _rs = 'wss://relay-jp.nostr.wirednet.jp';
    const _rs2 = 'wss://nrelay.c-stellar.net/';
    const _rs3 = 'wss://relay.nostr.wirednet.jp';
    const _rs4 = 'wss://yabu.me';
    let date = new Date();

    const [NostrData, setNostrData] = useState(
    {
        skey: _skey,
        pkey: _pkey,
        rs: [_rs,_rs2,_rs3,_rs4],
        data:{
            id: null,
            pubkey: _pkey,
            created_at: Math.floor(date / 1000),
            kind: 1,
            tags: [["p", _pkey, _rs]],
            content: null,
            sig: null
        },
        relay:[["r", _rs, "read"],["r",_rs4,"write"]],
        relay_list:[[_rs],[_rs4]],
        contacts:[],
        directmsg:"",
        subscription_id:{ 
            default: _pkey,
            myevent: "RequestMyEvent",
            mymeta: "RequestMyMetadata", 
            mycontact: "RequestMyContact",
            notify: "RequestNotify",
            search: "RequestSearch",
            directmsg: "RequestDM",
            home: "RequestHome",
            meta: "RequestMeta",
            myrelay: "RequestMyRelay"
        },
        filter:{
            kinds: [1, 6],
            limit: 100
        },
        filter_meta:{
            authors: [],
            kinds: [0]
        },
        filter_my:{
            authors:[_pkey], 
            kinds:[1]
        },
        filter_mymeta:{
            authors:[_pkey],
            kinds: [0],
            until:  Math.floor(date / 1000)
        },
        filter_mycontact:{
            authors:[_pkey],
            kinds: [3]
        },
        filter_myrelay:{
            kinds: [10002],
            authors:[_pkey],
        },
        filter_notify:{
            "kinds":[4, 6, 7],
            "#p": [_pkey],
            until:  Math.floor(date / 1000)
        },
        filter_search:null,
        filter_dm:{
            "kinds":[4],
            "#p":[_pkey]
        },
        filter_home:{
            kinds: [1, 6],
            "#p":[_pkey],
            limit: 100
        },
        profile:{
            name: "",
            about: "",
            picture: "" ,
            display_name: "",
            website: "",
            banner: "",
            nip05: ""
        },
        user_profile:{
            name: "",
            about: "",
            picture: "" ,
            display_name: "",
            website: "",
            banner: "",
            nip05: "",
        },
        user_data:{
            pubkey: ""
        },
        replay:{
            name: "",
            tags: []
        },
        directMessage:{
            name:"",
            pubkey:"",
            tags:[]
        },
        subscriptionJSON:[],
        lastDate_search: Math.floor(date / 1000)
    });

    function getProfileContent(props){
        // 自分アカウントのmetadataを取得
        if(props.profile.name === "" && props.profile.about === "" && props.profile.picture === ""){
            let profile = props.subscriptionJSON.findLast((value) => value && value.length >= 3 && 
            value[0] === "EVENT" && value[2].kind === 0 && value[2].pubkey === props.pkey);
            return profile !== undefined ? JSON.parse(profile[2].content) : null; 
        }else{
            return null;
        }
    }
    useEffect(() => {
        let profile = getProfileContent(NostrData); 
        if (profile !== null){
            setNostrData({...NostrData, profile:profile});
        }
    },[NostrData, setNostrData]);

    return (
        <div>
            <NostrContext.Provider value = {[NostrData, setNostrData]}>
                <Contents/>
            </NostrContext.Provider>
        </div>
    );
};
