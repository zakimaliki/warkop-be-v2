import { useEffect } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import Link from "next/link";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        const token = Cookies.get('token');
        if (token) {
            router.replace("/dashboard");
        } else {
            router.replace("/login");
        }
    }, [router]);

    return null;
}

export function HomePage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-4">Welcome to the App!</h1>
            <div className="flex gap-4">
                <Link href="/login" className="text-blue-600 underline">Login</Link>
                <Link href="/register" className="text-blue-600 underline">Register</Link>
                <Link href="/dashboard" className="text-blue-600 underline">Dashboard</Link>
            </div>
        </div>
    );
} 