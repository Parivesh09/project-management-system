import { Inter } from 'next/font/google';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../redux/store';
import { SocketProvider } from '@/contexts/SocketContext';
import NotificationHandler from '@/components/NotificationHandler';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Project Management App',
  description: 'A comprehensive project management solution',
  manifest: '/manifest.json',
  themeColor: '#000000',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }) {
  console.log('Rendering RootLayout');
  
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <SocketProvider>
              <NotificationHandler />
              {children}
            </SocketProvider>
          </PersistGate>
        </Provider>
      </body>
    </html>
  );
} 