"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import AuthenticatedNavbar from "@/components/Navbar";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

interface Post {
    id: string;
    title: string;
    brief: string;
    slug: string;
    coverImage?: {
        url: string;
    };
    publishedAt: string;
    author: {
        name: string;
        profilePicture?: string;
    };
    readTimeInMinutes: number;
    tags?: Array<{
        name: string;
        slug: string;
    }>;
}

interface BlogClientProps {
    initialPosts: Post[];
}

export default function BlogClient({ initialPosts }: BlogClientProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setIsAuthenticated(!!user);
        };

        checkAuth();
    }, [supabase]);

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) console.error("Google Login Error:", error);
    };

    // Format date helper
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <>
            {/* Conditional Navbar */}
            {isAuthenticated ? (
                <AuthenticatedNavbar />
            ) : (
                <nav className="fixed top-0 left-0 w-full z-50 bg-[rgba(255,255,255,0.95)] border-b border-[rgba(49,55,43,0.12)] backdrop-blur-md px-8 py-4">
                    <div className="max-w-[1400px] mx-auto flex justify-between items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <Image
                                src="/Logo.png"
                                alt="Logo"
                                width={100}
                                height={40}
                                className="h-[38px] w-auto"
                            />
                        </Link>

                        <button
                            onClick={handleGoogleLogin}
                            className="bg-[#31372B] text-[#FAF7EE] px-6 py-2 rounded-lg font-bold shadow hover:opacity-90 transition cursor-pointer"
                        >
                            Sign In
                        </button>
                    </div>
                </nav>
            )}

            <div className="min-h-screen bg-[#FAF7EE] font-[Arial] text-[#31372B]">
                {/* Header */}
                <div className="max-w-[1200px] mx-auto pt-24 px-6">
                    <div className="mb-8">
                        <h1 className="text-[40px] font-bold text-[#31372B] mb-3">Blogs</h1>
                        <p className="text-[#717182] text-lg">
                            Insights, updates, and resources for startup founders and investors
                        </p>
                    </div>

                    {/* Blog Posts Grid */}
                    {initialPosts.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-[#717182] text-lg">No blog posts found.</p>
                            <p className="text-[#717182] text-sm mt-2">
                                Check back soon for new content!
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                            {initialPosts.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/blog/${post.slug}`}
                                    className="group"
                                >
                                    <article className="bg-white border border-[#31372B1F] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
                                        {/* Cover Image */}
                                        {post.coverImage?.url ? (
                                            <div className="relative w-full h-48 bg-[#F5F5F5] overflow-hidden">
                                                <Image
                                                    src={post.coverImage.url}
                                                    alt={post.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full h-48 bg-gradient-to-br from-[#31372B] to-[#717182] flex items-center justify-center">
                                                <svg
                                                    className="w-16 h-16 text-[#FAF7EE] opacity-50"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                                                    />
                                                </svg>
                                            </div>
                                        )}

                                        {/* Content */}
                                        <div className="p-5 flex flex-col flex-1">
                                            {/* Tags */}
                                            {post.tags && post.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {post.tags.slice(0, 2).map((tag) => (
                                                        <span
                                                            key={tag.slug}
                                                            className="bg-[#F5F5F5] border border-[#31372B1F] text-[#31372B] text-xs px-2 py-1 rounded-md"
                                                        >
                                                            {tag.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Title */}
                                            <h2 className="text-[20px] font-bold text-[#31372B] mb-2 group-hover:text-[#717182] transition-colors line-clamp-2">
                                                {post.title}
                                            </h2>

                                            {/* Brief */}
                                            <p className="text-[#717182] text-sm mb-4 line-clamp-3 flex-1">
                                                {post.brief}
                                            </p>

                                            {/* Meta Info */}
                                            <div className="flex items-center justify-between text-xs text-[#717182] pt-3 border-t border-[#31372B0D]">
                                                <div className="flex items-center gap-2">
                                                    {post.author.profilePicture ? (
                                                        <Image
                                                            src={post.author.profilePicture}
                                                            alt={post.author.name}
                                                            width={24}
                                                            height={24}
                                                            className="rounded-full"
                                                        />
                                                    ) : (
                                                        <div className="w-6 h-6 bg-[#F5F5F5] rounded-full flex items-center justify-center text-[10px] font-bold">
                                                            {post.author.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <span className="font-medium">{post.author.name}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span>{formatDate(post.publishedAt)}</span>
                                                    <span>•</span>
                                                    <span>{post.readTimeInMinutes} min read</span>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </>
    );
}
