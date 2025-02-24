import React from "react";
import Forum from "../components/Forum/Forum";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";

export default function Home() {
    return (
        <div
            style={{
                backgroundColor: "var(--background)",
                minHeight: "100vh",
                width: "100vw",
            }}>
            <Navbar />
            <div className='flex flex-row'>
                <Sidebar />
                <Forum />
            </div>
        </div>
    );
}
