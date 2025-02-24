import React from "react";

const Sidebar = () => {
    return (
        <div className='w-[300px] p-5' style={{ color: "var(--text-primary)" }}>
            <div
                className='flex flex-col p-5 rounded-lg mb-5'
                style={{ backgroundColor: "var(--secondary)" }}>
                <ul className='flex flex-col list-none text-left'>
                    <li className='inline-block mx-5 my-2'>
                        <div className='flex flex-col text-left'>
                            <h2
                                className='text-lg font-bold'
                                style={{ color: "var(--text-primary)" }}>
                                Newest and recent
                            </h2>
                            <p
                                className='text-xs'
                                style={{ color: "var(--text-light)" }}>
                                Find the latest updates
                            </p>
                        </div>
                    </li>
                    <li className='inline-block mx-5 my-2'>
                        <div className='flex flex-col text-left'>
                            <h2
                                className='text-lg font-bold'
                                style={{ color: "var(--text-primary)" }}>
                                Popular of the day
                            </h2>
                            <p
                                className='text-xs'
                                style={{ color: "var(--text-light)" }}>
                                Posts featured today
                            </p>
                        </div>
                    </li>
                    <li className='inline-block mx-5 my-2'>
                        <div className='flex flex-col text-left'>
                            <h2
                                className='text-lg font-bold'
                                style={{ color: "var(--text-primary)" }}>
                                Following
                            </h2>
                            <p
                                className='text-xs'
                                style={{ color: "var(--text-light)" }}>
                                Posts from people you follow
                            </p>
                        </div>
                    </li>
                </ul>
            </div>

            <div
                className='flex flex-col p-5 rounded-lg mb-5'
                style={{ backgroundColor: "var(--secondary)" }}>
                <h2
                    className='text-xl mb-4'
                    style={{ color: "var(--text-primary)" }}>
                    Popular Mentrs
                </h2>
                <ul className='flex flex-col list-none text-left'>
                    <li className='inline-block mx-5 my-2'>
                        <div className='flex flex-col text-left'>
                            <h2
                                className='text-lg font-bold'
                                style={{ color: "var(--text-primary)" }}>
                                Matthew Sigit
                            </h2>
                            <p
                                className='text-xs'
                                style={{ color: "var(--text-light)" }}>
                                86,200 posts
                            </p>
                        </div>
                    </li>
                    <li className='inline-block mx-5 my-2'>
                        <div className='flex flex-col text-left'>
                            <h2
                                className='text-lg font-bold'
                                style={{ color: "var(--text-primary)" }}>
                                Peter Kang
                            </h2>
                            <p
                                className='text-xs'
                                style={{ color: "var(--text-light)" }}>
                                50,000 posts
                            </p>
                        </div>
                    </li>
                    <li className='inline-block mx-5 my-2'>
                        <div className='flex flex-col text-left'>
                            <h2
                                className='text-lg font-bold'
                                style={{ color: "var(--text-primary)" }}>
                                Leo Gu
                            </h2>
                            <p
                                className='text-xs'
                                style={{ color: "var(--text-light)" }}>
                                30,240 posts
                            </p>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;
