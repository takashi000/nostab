import { useState, useContext} from "react";
import { useForm, SubmitHandler, Controller} from "react-hook-form";
import { NostrContext } from '../Nostr/Nostr';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';
import IconButton, { IconButtonProps }  from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import MenuIcon from '@mui/icons-material/Menu';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { Divider } from "@mui/material";

interface ExpandMoreProps extends IconButtonProps {
    expand: boolean;
  }
  
  const ExpandMore = styled((props: ExpandMoreProps) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
  })(({ theme, expand }) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  }));

type Inputs = {
   "ids": string,
   "authors": string,
   "since": string,
   "until": string,
   "search": string
}

export const SearchForm = () => {
    const [NostrData, setNostrData] = useContext(NostrContext);
    const [expanded, setExpanded] = useState(false);
    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const {
        register,
        handleSubmit,
        control,
    } = useForm<Inputs>({
        defaultValues: {
            "ids":"",
            "authors":"",
            "until":"",
            "since":"",
            "search":""
        }
    });
    const onSubmit: SubmitHandler<Inputs> = (data) => {
        NostrData.filter_search = {
            "ids":[],
            "authors":[],
            "until":0,
            "since":0,
            "search":"",
            "kinds":[1],
            "limit":100
        }
        if (data.ids !== ""){
            NostrData.filter_search.ids.push(data.ids);
        }else{
            delete NostrData.filter_search.ids;
        }
        if (data.authors !== ""){
            NostrData.filter_search.authors.push(data.authors);
        }else{
            delete NostrData.filter_search.authors;
        }
        if (data.until !== ""){
            let date = new Date(data.until);
            NostrData.filter_search.until =  Math.round(date.getTime() / 1000);
        }else{
            NostrData.filter_search.until = NostrData.lastDate.search;
        }
        if(data.since !== ""){
            let date = new Date(data.since);
            NostrData.filter_search.since = Math.round(date.getTime() / 1000);
        }else{
            delete NostrData.filter_search.since;
        };
        if(data.search !== ""){
            NostrData.filter_search.search = data.search;
        }else{
            delete NostrData.filter_search.search;
        };
        setNostrData({...NostrData, filter_search:NostrData.filter_search});
    };
    return (
        /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
        <>
        <Paper component="form" sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 'md' }} >
            <ExpandMore
                expand={expanded}
                onClick={() => (handleExpandClick())}
                aria-expanded={expanded}
                aria-label="show more" >
                <IconButton sx={{ p: '10px' }} aria-label="menu">
                    <MenuIcon />
                </IconButton>
            </ExpandMore>
            <Controller name="ids" control={control} 
                rules={{maxLength: {value: 64, message: "128 max"}}}
                render={() => (
                    <InputBase sx={{ ml: 1, flex: 1 }} placeholder="Search Post" inputProps={{ 'aria-label': 'search post' }} {...register("search")}/>)}/>
            <IconButton type="button" sx={{ p: '10px' }} aria-label="search" onClick={handleSubmit(onSubmit)}>
                <SearchIcon />
            </IconButton>
        </Paper>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Paper component="form" sx={{width: 'md', maxWidth:'100%'}} >
                <List>
                    <ListItem>
                    <Controller name="ids" control={control} 
                        rules={{maxLength: {value: 64, message: "64 max"}}}
                        render={() => (
                    <InputBase sx={{ ml: 1, flex: 1 }} placeholder="authors" inputProps={{ 'aria-label': 'search authors' }} {...register("authors")}/>)}/>
                    </ListItem>
                    <Divider />
                    <ListItem>
                    <Controller name="authors" control={control} 
                        rules={{maxLength: {value: 64, message: "64 max"}}}
                        render={() => (
                            <InputBase sx={{ ml: 1, flex: 1}} placeholder="ids" inputProps={{ 'aria-label': 'search ids' }} {...register("ids")}/>)}/>
                    </ListItem>
                    <Divider />
                    <ListItem>
                    <Controller name="since" control={control} 
                        rules={{maxLength: {value: 32, message: "32 max"}}}
                        render={() => (
                            <InputBase sx={{ ml: 1, flex: 1 }} placeholder="since" inputProps={{ 'aria-label': 'search since' }} {...register("since")}/>)}/>
                    </ListItem>
                    <Divider />
                    <ListItem>
                    <Controller name="until" control={control} 
                        rules={{maxLength: {value: 32, message: "32 max"}}}
                        render={() => (
                            <InputBase sx={{ ml: 1, flex: 1 }} placeholder="until" inputProps={{ 'aria-label': 'search until' }} {...register("until")}/>)}/>
                    </ListItem>
                </List>
                </Paper>
            </Collapse>
        </>
    )
}