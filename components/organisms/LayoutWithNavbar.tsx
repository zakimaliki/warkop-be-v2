"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";

export default function LayoutWithNavbar({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const hideNavbar = pathname === "/login" || pathname === "/register";
    return (
        <>
            {!hideNavbar && <Navbar />}
            {children}
        </>
    );
} 