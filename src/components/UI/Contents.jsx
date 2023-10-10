import { useState, createContext} from 'react';
import { TextForm } from './TextForm';
import { SubScreen } from './SubScreen';
import { NotifyScreen } from './NotifyScreen';
import { ProfileForm, UserProfileForm } from './ProfileForm';
import { SearchForm } from './SearchForm';
import { ContactScreen } from './ContactScreen';
import { RelayForm, RelayAddForm } from './RelayForm';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import './UI.css'
import { Box} from '@mui/material';
import { WebSocketNostr } from '../WebSocket/WebSock';

export const ContentsContext = createContext();

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    color: theme.palette.text.secondary,
  }));

export const Contents = () => {

    const [SubscrState, setSubscrState] = useState(0);
    return (
        <ContentsContext.Provider value = {[SubscrState, setSubscrState]}>
            <WebSocketNostr/>
            <Item>
                <Tabs selectedIndex={SubscrState} onSelect={(index) => setSubscrState(index)}>
                    <TabList>
                        <Tab>MyProfile</Tab>
                        <Tab>UserProfile</Tab>
                        <Tab>Contacts</Tab>
                        <Tab>Home</Tab>
                        <Tab>Search</Tab>
                        <Tab>DM</Tab>
                        <Tab>Notify</Tab>
                        <Tab>Relay</Tab>
                    </TabList>
                    <TabPanel>
                        <Paper variant='elevation0' sx={{ width: 'md', height: 400, maxWidth: '100%'}}>
                            <ProfileForm/>
                        </Paper>
                    </TabPanel>
                    <TabPanel>
                        <Paper variant='elevation0' sx={{ width: 'md', height: 400, maxWidth: '100%'}}>
                            <UserProfileForm/>
                        </Paper>
                    </TabPanel>
                    <TabPanel>
                        <Paper variant='elevation0' sx={{ width: 'md', height: 400, maxWidth: '100%'}}>
                            <ContactScreen/>
                        </Paper>
                    </TabPanel>
                    <TabPanel>
                        <Paper variant='elevation0' sx={{ width: 'md', height: 400, maxWidth: '100%'}}>
                            <SubScreen/>
                        </Paper>
                        <Paper sx={{ width: 'md', height: 'md', maxWidth: '100%'}}>
                            <TextForm/>
                        </Paper>
                    </TabPanel>
                    <TabPanel>
                        <Box sx={{p:'2px 4px', width: 'md', height: 'md', maxWidth: '100%'}}>
                            <SearchForm/>
                        </Box>
                        <Paper variant='elevation0' sx={{width: 'md', height: 400, maxWidth: '100%'}}>
                            <SubScreen/>
                        </Paper>
                    </TabPanel>
                    <TabPanel>
                        <Paper variant='elevation0' sx={{ width: 'md', height: 400, maxWidth: '100%'}}>
                            <SubScreen/>
                        </Paper>
                        <Paper sx={{ width: 'md', height: 'md', maxWidth: '100%'}}>
                            <TextForm/>
                        </Paper>
                    </TabPanel>
                    <TabPanel>
                        <Paper variant='elevation0' sx={{ width: 'md', height: 400, maxWidth: '100%'}}>
                            <NotifyScreen/>
                        </Paper>
                    </TabPanel>
                    <TabPanel>
                        <Paper variant='elevation0' sx={{ width: 'md', height: 400, maxWidth: '100%'}}>
                            <RelayForm/>
                        </Paper>
                        <Paper sx={{ width: 'md', height: 'md', maxWidth: '100%'}}>
                            <RelayAddForm/>
                        </Paper>
                    </TabPanel>
                </Tabs>
            </Item>
        </ContentsContext.Provider>
    );
}