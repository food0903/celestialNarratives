import { SessionOptions } from "iron-session";

export interface SessionData{
    id?: string
    username?: string
    name?: string
    isLogin: boolean
}

export const defaultSession: SessionData = {
    isLogin: false,
}


export const sessionOptions: SessionOptions = {
    password: process.env.SECRET_KEY!,
    cookieName: 'session',
    cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' ? true : false,
    }
}