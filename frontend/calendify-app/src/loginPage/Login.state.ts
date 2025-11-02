
export type User={
    username: string,
    password: string
}

export type UserEntry = User & {userID: string}

export type LoginStatus = 
"Logged" |
"unlogged" 

export type LoginState = UserEntry & {
    loginStatus : LoginStatus
}