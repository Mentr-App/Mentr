import Navbar from "@/components/Navbar/Navbar";
import Sidebar from "@/components/Sidebar/Sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
    return (
        <AuthProvider>
            <div
                style={{
                    backgroundColor: "var(--background)",
                    minHeight: "100vh",
                    width: "100vw",
                }}>
                <Navbar />
                <div className='flex flex-row'>
                    <Sidebar />
                    <Component {...pageProps} />
                </div>
            </div>
        </AuthProvider>
    );
}
