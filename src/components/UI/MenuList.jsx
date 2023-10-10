import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { NostrPubkeyEncode, NostrPrivEncode} from '../Nostr/Nostr';
import { useContext } from 'react';
import { NostrContext } from '../Nostr/Nostr';
import SessionStorage from 'react-native-session-storage';

export function BasicMenu(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const id = props.value.id !== undefined ? props.value.id:"";
  const pubkey = props.value.pubkey !== undefined ? props.value.pubkey:"";
  const npub = props.value.pubkey !== undefined ? NostrPubkeyEncode(props.value.pubkey):"";
  const jsonData = props.value !== undefined ? JSON.stringify(props.value):"";
  const [NostrData, setNostrData] = useContext(NostrContext);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleCloseProfile = () => {
    let profile = SessionStorage.getItem(pubkey);
    if (profile !== undefined){
      NostrData.user_profile = profile;
      NostrData.user_data.pubkey = pubkey;
      setNostrData({...NostrData});
    }
    setAnchorEl(null);
  }

  return (
    <div>
      <IconButton
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >

        <MenuItem onClick={handleCloseProfile}>Profile</MenuItem>
        <CopyToClipboard text={npub}>
          <MenuItem onClick={handleClose}>Copy npub</MenuItem>
        </CopyToClipboard>
        <CopyToClipboard text={pubkey}>
          <MenuItem onClick={handleClose}>Copy pubkey(hex)</MenuItem>
        </CopyToClipboard>
        <CopyToClipboard text={id}>
          <MenuItem onClick={handleClose}>Copy id</MenuItem>
        </CopyToClipboard>
        <CopyToClipboard text={jsonData}>
          <MenuItem onClick={handleClose}>Copy JSON</MenuItem>
        </CopyToClipboard>
      </Menu>
    </div>
  );
}

export function ProfileMenu(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const privkey = props.value.skey !== undefined ? props.value.skey:"";
  const nsec = props.value.skey !== undefined ? NostrPrivEncode(props.value.skey):"";
  const pubkey = props.value.pkey !== undefined ? props.value.pkey:"";
  const npub = props.value.pkey !== undefined ? NostrPubkeyEncode(props.value.pkey):"";
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="myprofile-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <CopyToClipboard text={nsec}>
          <MenuItem onClick={handleClose}>Copy nsec</MenuItem>
        </CopyToClipboard>
        <CopyToClipboard text={privkey}>
          <MenuItem onClick={handleClose}>Copy privkey(hex)</MenuItem>
        </CopyToClipboard>
        <CopyToClipboard text={npub}>
          <MenuItem onClick={handleClose}>Copy npub</MenuItem>
        </CopyToClipboard>
        <CopyToClipboard text={pubkey}>
          <MenuItem onClick={handleClose}>Copy pubkey(hex)</MenuItem>
        </CopyToClipboard>
      </Menu>
    </div>
  );
}

export function UserProfileMenu(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const pubkey = props.value.pubkey !== undefined ? props.value.pubkey:"";
  const npub = props.value.pubkey !== undefined ? NostrPubkeyEncode(props.value.pubkey):"";
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="myprofile-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <CopyToClipboard text={npub}>
          <MenuItem onClick={handleClose}>Copy npub</MenuItem>
        </CopyToClipboard>
        <CopyToClipboard text={pubkey}>
          <MenuItem onClick={handleClose}>Copy pubkey(hex)</MenuItem>
        </CopyToClipboard>
      </Menu>
    </div>
  );
}

export function ContactsMenu(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const pubkey = props.value[1] !== undefined ? props.value[1]:"";
  const npub = props.value[1] !== undefined ? NostrPubkeyEncode(props.value[1]):"";
  const [NostrData, setNostrData] = useContext(NostrContext);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCloseProfile = () => {
    let profile = props.metadata;
    if (profile !== undefined){
      NostrData.user_profile = profile;
      NostrData.user_data.pubkey = pubkey;
      setNostrData({...NostrData});
    }
    setAnchorEl(null);
  }

  return (
    <div>
      <IconButton
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="contacts-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >

        <MenuItem onClick={handleCloseProfile}>Profile</MenuItem>
        <CopyToClipboard text={npub}>
          <MenuItem onClick={handleClose}>Copy npub</MenuItem>
        </CopyToClipboard>
        <CopyToClipboard text={pubkey}>
          <MenuItem onClick={handleClose}>Copy pubkey(hex)</MenuItem>
        </CopyToClipboard>
      </Menu>
    </div>
  );
}
