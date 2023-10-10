import * as React from 'react';
import { useContext, useEffect, useCallback} from "react";
import { useForm, SubmitHandler, Controller} from "react-hook-form";
import { NostrContext } from '../Nostr/Nostr';
import TextField from '@mui/material/TextField';
import Button from "@mui/material/Button";
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import { ContentsContext } from './Contents';
import { Divider, Paper, Typography } from '@mui/material';
import { ProfileMenu, UserProfileMenu } from './MenuList';


type Inputs = {
    name: string,
    about: string,
    picture: string,
    display_name: string,
    website: string,
    banner: string,
    nip05: string
}

export const ProfileForm = () => {
    const [NostrData, setNostrData] = useContext(NostrContext);
    const {
        register,
        handleSubmit,
        control,
        setValue,
    } = useForm<Inputs>();
    const onSubmit: SubmitHandler<Inputs> = (data) => {
        NostrData.profile = {name:data.name, about:data.about, picture:data.picture,
                                display_name:data.display_name, website:data.website,
                                banner:data.banner, nip05:data.nip05};
        NostrData.data.content = JSON.stringify(NostrData.profile);
        NostrData.data.kind = 0;
        NostrData.data.created_at = Math.floor(Date.now() / 1000);
        setNostrData({...NostrData,data:{...NostrData.data}});
    };

    const [SubscrState, setSubscrState] = useContext(ContentsContext);
    const initProfile = useCallback(() => {
        setValue('name', NostrData.profile.name);
        setValue('about', NostrData.profile.about);
        setValue('picture', NostrData.profile.picture);
        setValue('display_name', NostrData.profile.display_name);
        setValue('website', NostrData.profile.website);
        setValue('banner', NostrData.profile.banner);
        setValue('nip05', NostrData.profile.nip05);
    },[NostrData.profile, setValue]);
    useEffect(() => {
        if(SubscrState === 0){
           initProfile();
        }
    },[SubscrState, initProfile]);

    let displayName = NostrData.profile.display_name === "" ? 
                        NostrData.profile.name : NostrData.profile.display_name + '@' + NostrData.profile.name;
    let WebSite = NostrData.profile.website !== undefined && NostrData.profile.website !== "" ? 
                    <a href={NostrData.profile.website}>{NostrData.profile.website}</a> : <></>;
    let nip05 = NostrData.profile.nip05 !== undefined && NostrData.profile.nip05 !== "" ?
                    <a href={NostrData.profile.nip05}>{NostrData.profile.nip05}</a> : <></>;
    let banner = NostrData.profile.banner !== undefined && NostrData.profile.banner !== "" ?
                    { backgroundImage: `url(${NostrData.profile.banner})`,
                      width: 'md',
                      height: "100px"} : {};
    return (
        /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
        <Card sx={{ height:'md', width:'md', maxWidth: '100%' }}>
            <CardHeader
                style={banner}
                avatar={
                    <Avatar sx={{ width: 128, height: 128 }} alt="your" src={NostrData.profile.picture}/>
                }
                action={
                <IconButton aria-label="settings">
                    <ProfileMenu value={NostrData}/>
                </IconButton>
                }
            />
            <CardContent>
                <Paper>
                    <Typography>
                        {displayName}
                    </Typography>
                    <Typography>
                        {NostrData.profile.about}
                    </Typography>
                    <Typography>
                        WebSite: {WebSite}
                    </Typography>
                    <Typography>
                        nip05: {nip05}
                    </Typography>
                </Paper>

                <Divider />
                <Controller name="display_name" control={control} 
                    rules={{maxLength: {value: 100, message: "100 max"}}}
                    render={() => (
                    <TextField fullWidth label="Display" id="display_name" placeholder="your names" variant="outlined" margin="dense" {...register("display_name")} />)}/>
                <Controller name="name" control={control} 
                    rules={{required: "Requred", maxLength: {value: 25, message: "10 max"}}}
                    render={() => (
                    <TextField fullWidth label="Name" id="name" placeholder="@your names" variant="outlined" margin="dense" {...register("name")} />)}/>
                <Controller name="about" control={control} 
                    rules={{ maxLength: {value: 500, message: "500 max"}}}
                    render={() => (
                    <TextField fullWidth label="About" id="about" placeholder="about you" variant="outlined" margin="dense" {...register("about")} />)}/> 
                <Controller name="website" control={control} 
                    rules={{maxLength: {value: 100, message: "100 max"}}}
                    render={() => (
                    <TextField fullWidth label="Website" id="website" placeholder="URL" variant="outlined" margin="dense" {...register("website")} />)}/>
                <Controller name="picture" control={control} 
                    rules={{maxLength: {value: 100, message: "100 max"}}}
                    render={() => (
                    <TextField fullWidth label="Picture" id="picture" placeholder="Image URL" variant="outlined" margin="dense" {...register("picture")} />)}/>
                <Controller name="banner" control={control} 
                    rules={{maxLength: {value: 100, message: "100 max"}}}
                    render={() => (
                    <TextField fullWidth label="Banner" id="banner" placeholder="Image URL" variant="outlined" margin="dense" {...register("banner")} />)}/>
                <Controller name="nip05" control={control} 
                    rules={{maxLength: {value: 100, message: "100 max"}}}
                    render={() => (
                    <TextField fullWidth label="nip05" id="nip05" placeholder="nip05 URL" variant="outlined" margin="dense" {...register("nip05")} />)}/>
                <Button type="submit" color="primary" variant="contained" size="large" onClick={handleSubmit(onSubmit)}>
                    変更
                </Button>
            </CardContent>
        </Card>
    );
}

export const UserProfileForm = () => {
    const [NostrData, setNostrData] = useContext(NostrContext);
    const [SubscrState, setSubscrState] = useContext(ContentsContext);

    let displayName = NostrData.user_profile.display_name === "" ? 
                        NostrData.user_profile.name : NostrData.user_profile.display_name + '@' + NostrData.user_profile.name;
    let WebSite = NostrData.user_profile.website !== undefined && NostrData.user_profile.website !== "" ? 
                    <a href={NostrData.user_profile.website}>{NostrData.user_profile.website}</a> : <></>;
    let nip05 = NostrData.user_profile.nip05 !== undefined && NostrData.user_profile.nip05 !== "" ?
                    <a href={NostrData.user_profile.nip05}>{NostrData.user_profile.nip05}</a> : <></>;
    let banner = NostrData.user_profile.banner !== undefined && NostrData.user_profile.banner !== "" ?
                    { backgroundImage: `url(${NostrData.user_profile.banner})`,
                      width: 'md',
                      height: "100px"} : {};
    return (
        /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
        <Card sx={{ height:'md', width:'md', maxWidth: '100%' }}>
            <CardHeader
                style={banner}
                avatar={
                    <Avatar sx={{ width: 128, height: 128 }} alt="your" src={NostrData.user_profile.picture}/>
                }
                action={
                <IconButton aria-label="settings">
                    <UserProfileMenu value={NostrData.user_data}/>
                </IconButton>
                }
            />
            <CardContent>
                <Paper>
                    <Typography>
                        {displayName}
                    </Typography>
                    <Typography>
                        {NostrData.user_profile.about}
                    </Typography>
                    <Typography>
                        WebSite: {WebSite}
                    </Typography>
                    <Typography>
                        nip05: {nip05}
                    </Typography>
                </Paper>
            </CardContent>
        </Card>
    );
}
