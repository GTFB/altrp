'use client'
import { useEffect } from 'react'
export default function PwaLoader() {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
              .register('/pwa/sw.js')
              .catch(console.error);
          }
    }, [])
    return ('')
}