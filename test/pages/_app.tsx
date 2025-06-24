import '../public/tailwind.css'
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import LayoutWithNavbar from '../components/organisms/LayoutWithNavbar';
import { Provider } from 'react-redux';
import { store } from '../store/store';

const inter = Inter({ subsets: ['latin'] });

export default function MyApp({ Component, pageProps }: AppProps) {
    return (
        <div className={inter.className}>
            <Provider store={store}>
                <LayoutWithNavbar>
                    <Component {...pageProps} />
                </LayoutWithNavbar>
            </Provider>
        </div>
    );
} 