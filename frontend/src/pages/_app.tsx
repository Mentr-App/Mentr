import Navbar from "@/components/Navbar/Navbar";
import Sidebar from "@/components/Sidebar/Sidebar";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Navbar/>
      <main className="bg-[#1E252B] min-w-screen min-h-[90vh] flex flex-row">
        <Sidebar/>
        <Component {...pageProps}/>
      </main>
    </>
  )
}
