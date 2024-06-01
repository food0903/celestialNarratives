"use server";
import { getIronSession } from "iron-session"
import { sessionOptions, SessionData, defaultSession } from "./libs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const getSession = async()=>{
    const session = await getIronSession<SessionData>(cookies(),sessionOptions)

    if(!session.isLogin){
        session.isLogin = defaultSession.isLogin
    }

    return session
}

export const register = async(formData:FormData)=>{
    const session = await getSession()

    const formUsername = formData.get('username') as string
    const formPassword = formData.get('password') as string
    const formName = formData.get('name') as string

    const response = await fetch('http://127.0.0.1:5000/register', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        username: formUsername,
        password: formPassword,
        name: formName
        }),
        credentials : 'include'
    });

    if (response.ok) {
        const user = await response.json();
        session.isLogin = true;
        session.username = user.username;
        session.name = user.name;
        session.id = user.id;
        await session.save();
        return user;
        
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }
}

export const login = async(formData:FormData)=>{
    const session = await getSession()

    const formUsername = formData.get('username') as string
    const formPassword = formData.get('password') as string


    //check user in the db
    const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        username: formUsername,
        password: formPassword,
        }),
        credentials : 'include'
    });


    if (response.ok) {
        const user = await response.json();
        session.isLogin = true;
        session.username = user.username;
        session.name = user.name;
        session.id = user.id;
        await session.save();
        return user;
        
      } else {
        throw new Error('Invalid credentials');
      }
 

}
export const logout = async()=>{
    const session = await getSession()
    session.destroy()
    redirect('/');
}