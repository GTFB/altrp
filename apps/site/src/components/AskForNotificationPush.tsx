import { useEffect, useState } from "react"
import { subscribeUserToPush, askForNotificationPermission } from "@/utils/pushNotifications"

export const AskForNotificationPush = () => {

    const [VAPID_PUBLIC_KEY, setVapidKey] = useState<string | null>(null)

    useEffect(() => {
        const fetchVapidKey = async () => {
            const res = await fetch('/api/get-vapid-public')
            const data: { vapidPublicKey: string } = await res.json()
            setVapidKey(data.vapidPublicKey)
        }
        fetchVapidKey().catch((error) => {
            console.error('Failed to fetch VAPID public key', error)
        })
    }, [])
    useEffect(() => {
        if(!VAPID_PUBLIC_KEY) {
            return
        }
        console.log('Ask for notification permission')
        askForNotificationPermission().then((result) => {
            console.log('Ask for notification permission result:', result)
            if (result === 'granted') {
                subscribeUserToPush(VAPID_PUBLIC_KEY || '').then((result) => {
                    console.log('Subscribe user to push result:', result)
                })
            }
        })
    }, [VAPID_PUBLIC_KEY])
    return null
}