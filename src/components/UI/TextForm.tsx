import { useContext, useEffect, useState } from "react";
import { useForm, SubmitHandler, Controller} from "react-hook-form";
import { NostrContext, NostrEncyptDM} from '../Nostr/Nostr';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from "@mui/material/Button";

type Inputs = {
    contents: string
}

export const TextForm = () => {
    const [NostrData, setNostrData] = useContext(NostrContext);
    const [nameSubmit, setnameSubmit] = useState("Post");
    function NameButtonSubmit (){
        return (<>{nameSubmit}</>);
    }

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
    } = useForm<Inputs>();
    const onSubmit: SubmitHandler<Inputs> = (data) => {
        NostrData.data.pubkey = NostrData.pkey;
        NostrData.data.created_at = Math.floor(Date.now() / 1000);

        if(nameSubmit === "DM"){
            NostrData.data.kind = 4;
            if(NostrData.skey === "nip07"){
                NostrData.directmsg = window.nostr?.nip04?.encrypt(NostrData.directMessage.pubkey, data.contents);
            }else{
                NostrData.directmsg = NostrEncyptDM(NostrData, NostrData.directMessage.pubkey, data.contents);
            }
            NostrData.data.content = "dummy";
        }else{
            NostrData.data.kind = 1;
            NostrData.data.content = data.contents
        }
        if (nameSubmit === "Post"){
            NostrData.data.tags = [["p", NostrData.pkey, NostrData.rs[0]]];
        }else if(nameSubmit === "Reply"){
            NostrData.data.tags = NostrData.replay.tags;
            NostrData.replay = {name:"", tags:null};
        }else{
            NostrData.data.tags = NostrData.directMessage.tags;
            NostrData.directMessage = {name:"", pubkey:"", tags:null};
        }
        NostrData.replay = {name:"", tags:null};
        NostrData.directMessage = {name:"", pubkey:"", tags:null};
        setNostrData({...NostrData,data:{...NostrData.data}});
        setValue('contents',"");
        setnameSubmit("Post");
    };
    const watchContents = watch('contents');

    useEffect(() => {
        let name = "";
        if (nameSubmit !== "Reply" && nameSubmit !== "DM"){
            if (NostrData.replay.name !== ""){
                setValue('contents',NostrData.replay.name);
                name = "Reply";
            }
        }
        if (nameSubmit !== "DM" && nameSubmit !== "Reply"){
            if(NostrData.directMessage.name !== ""){
                setValue('contents', NostrData.directMessage.name);
                name = "DM";
            }
        }
        if (name !== ""){
            setnameSubmit(name);
        }
    },[NostrData.replay.name, NostrData.directMessage.name, nameSubmit, setnameSubmit, setValue]);

    useEffect (() => {
        if (nameSubmit === "Reply"){
            watch((value) => {
                if(value.contents === "" && NostrData.replay.tags !== null){
                    NostrData.data.tags = NostrData.replay.tags;
                    NostrData.replay = {name:"", tags:null};
                    NostrData.directMessage = {name:"", pubkey:"", tags:null};
                    setnameSubmit("Post");
                }
            });
        }
    },[watchContents, NostrData, NostrData.data.tags, NostrData.replay, nameSubmit, setnameSubmit,watch]);
    useEffect (() => {
        if (nameSubmit === "DM"){
            watch((value) => {
                if(value.contents === "" && NostrData.directMessage !== null){
                    NostrData.data.tags = NostrData.directMessage.tags;
                    NostrData.replay = {name:"", tags:null};
                    NostrData.directMessage = {name:"", pubkey:"", tags:null};
                    setnameSubmit("Post");
                }
            });
        }
    },[watchContents, NostrData, NostrData.data.tags, NostrData.directMessage, nameSubmit, setnameSubmit, watch]);

    return (
        /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
        <Box sx={{ width: 'md', height: 'md', maxWidth: '100%'}}>
            <Controller name="contents" control={control} 
                rules={{required: "Requred", maxLength: {value: 150, message: "150 max"}}}
                render={() => (
                <TextField sx={{ width: 'md', height: 'md', maxWidth: '100%'}} fullWidth label="contents" id="contents" placeholder="Contets" multiline variant="outlined" margin="dense" {...register("contents")} />)}/>
            <Button type="submit" color="primary" variant="contained" size="large" onClick={handleSubmit(onSubmit)}>
                <NameButtonSubmit/>
            </Button>
        </Box>
    )
}
