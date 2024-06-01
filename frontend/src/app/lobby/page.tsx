import React from 'react'
import { getSession } from '@/actions'
import { redirect } from 'next/navigation';

const page = async () => { 
  const session = await getSession();
    if (!session.isLogin) {
        redirect('/signin');
    }
  return (
    <div>
      this is the lobby 
    </div>
  )
}

export default page
