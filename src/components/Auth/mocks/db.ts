export type DBUser = {
  privkey:string,
  pubkey:string,
  mode:string
};

const users: Record<string, DBUser> = JSON.parse(
  window.localStorage.getItem('db_users') || '{}'
);

export function setUser(data: DBUser) {
  if (data?.privkey) {
    users[data.privkey] = data;
    window.localStorage.setItem('db_users', JSON.stringify(users));
    return data;
  } else {
    return null;
  }
}

export function getUser(privkey: string | null) {
  if (privkey) {
    return users[privkey];
  }
}
