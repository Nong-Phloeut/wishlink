import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  title: 'WishLink — Send wishes via QR',
  description: 'Create personalised QR wishes for birthdays, anniversaries, weddings and more.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Plus+Jakarta+Sans:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#f8f7f4] min-h-screen">
        {children}
        <Toaster position="bottom-center" toastOptions={{ style: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13 } }} />
      </body>
    </html>
  )
}
