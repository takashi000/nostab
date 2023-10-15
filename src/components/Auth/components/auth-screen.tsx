import * as React from 'react';
import Button from "@mui/material/Button";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { useForm, SubmitHandler, Controller} from "react-hook-form";
import { NostrGenPrivKey, NostrGenPubKey, NostrPrivDecode, NostrPubkeyDecode} from '../../Nostr/Nostr';


import {
  LoginCredentials,
  useLogin,
  useRegister,
} from '../lib/auth';

export const AuthScreen = () => {
  const [mode, setMode] = React.useState<'register' | 'login' | 'nip07'>('register');

  return (
    <div>
      <Typography  variant="h5" component="h5">
        Nostab Beta (0.0.4)
      </Typography>
      {mode === 'login' && (
        <>
          <LoginForm />
          <Button onClick={() => setMode('register')}>Register</Button>
        </>
      )}
      {mode === 'register' && (
        <>
          <RegisterForm />
          <Button onClick={() => setMode('nip07')}>nip07</Button>
        </>
      )}
      {mode === 'nip07' && (
        <>
        <RegisterNIP07Form />
        <Button onClick={() => setMode('login')}>Login</Button>
      </>
      )}
    </div>
  );
};

const RegisterNIP07Form = () => {
  const generate = useRegister();
  const login = useLogin();

  function onSubmit(){
    if (window.nostr !== undefined){
      window.nostr?.getPublicKey().then((pubkey) => {
        generate.mutate({privkey:"nip07", pubkey:pubkey, mode:"nip07"});
        login.mutate({privkey:"nip07", pubkey:pubkey, mode: "nip07"});
      }).catch((error) => {
        console.log(error);
      });
    }
  }

  return (
    <Box>
      <Typography  variant="h6" component="h6">
        ブラウザ拡張機能(nip07仕様)でログイン
      </Typography>
      <Button disabled={generate.isLoading} type="submit" color="primary" variant="contained" size="medium" onClick={() => onSubmit()}>
        NIP07 Login
      </Button>
    </Box>
  );
};

const RegisterForm = () => {
  const generate = useRegister();
  const login = useLogin();

  function onSubmit(){
    const privkey = NostrGenPrivKey();
    const pubkey = NostrGenPubKey(privkey);
    generate.mutate({privkey:privkey, pubkey:pubkey, mode:""});
    login.mutate({privkey:privkey, pubkey:pubkey, mode:""})
  }

  return (
    <Box>
      <Typography  variant="h6" component="h6">
        アカウントを生成
      </Typography>
      <Button disabled={generate.isLoading} type="submit" color="primary" variant="contained" size="medium" onClick={() => onSubmit()}>
        Generate
      </Button>
    </Box>
  );
};

const LoginForm = () => {
  const registerKey = useRegister();
  const login = useLogin();
  const {
    register,
    handleSubmit,
    control,
    setValue,
  } = useForm<LoginCredentials>();
  const onSubmit: SubmitHandler<LoginCredentials> = (data) => {
    // nsecもしくはnpub形式の場合はhexに変換
    let privkey = NostrPrivDecode(data.privkey);
    let pubkey = NostrPubkeyDecode(data.pubkey);
    setValue('privkey',"");
    setValue('pubkey',"");

    registerKey.mutate({privkey:privkey, pubkey:pubkey, mode:""});
    login.mutate({privkey:privkey, pubkey:pubkey, mode: ""});
  }

  return (
    <Box>
      <Typography  variant="h6" component="h6">
        ログイン
      </Typography>
      <Controller name="privkey" control={control} 
        rules={{maxLength: {value: 64, message: "64 max"}}}
        render={() => (
        <TextField type="password" fullWidth label="PrivKey" id="privkey" placeholder="nsec or hex" variant="outlined" margin="dense" {...register("privkey")} />)}/>
      <Controller name="privkey" control={control} 
        rules={{maxLength: {value: 64, message: "64 max"}}}
        render={() => (
        <TextField fullWidth label="Pubkey" id="pubkey" placeholder="npub or hex" variant="outlined" margin="dense" {...register("pubkey")} />)}/>
      <Button disabled={login.isLoading} type="submit" color="primary" variant="contained" size="medium" onClick={handleSubmit(onSubmit)}>
        Login
      </Button>
    </Box>
  );
};
