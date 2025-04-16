'use client'

export const logout= async(setUser: (user: any) => void) => {

    try{
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, {
            method : "POST",
            credentials : "include",
        })

        if(!res.ok) {
            throw new Error("로그아웃 실패")
        }
        setUser(null)
        console.log(res.json())
        window.location.href = '/'
    }catch(err) {
        console.error('로그아웃 에러', err);
    }
}