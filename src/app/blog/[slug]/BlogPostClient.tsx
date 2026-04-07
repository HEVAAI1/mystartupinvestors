"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import AuthenticatedNavbar from "@/components/Navbar";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

import { PortableText, PortableTextComponents } from "@portabletext/react";

import Prism from "prismjs";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-javascript";

// -----------------------------
// TYPES
// -----------------------------

type PortableTextChild = {
  text: string;
};

type PortableTextBlock = {
  _type: string;
  children?: PortableTextChild[];
  style?: string;
  listItem?: "bullet" | "number";
};

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
  content: PortableTextBlock[];
  readTimeInMinutes: number;
  tags?: Array<{
    name: string;
    slug: string;
  }>;
}

interface BlogPostClientProps {
  post: Post;
}

// -----------------------------
// COMPONENT
// -----------------------------

export default function BlogPostClient({ post }: BlogPostClientProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };

    checkAuth();
  }, [supabase]);

  useEffect(() => {
    Prism.highlightAll();
  }, [post]);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) console.error("Google Login Error:", error);
  };

  // -----------------------------
  // PORTABLE TEXT COMPONENTS
  // -----------------------------

  const components: PortableTextComponents = {
    block: {
      h1: ({ children }) => (
        <h1 className="text-4xl font-bold mt-10 mb-4">{children}</h1>
      ),
      h2: ({ children }) => (
        <h2 className="text-3xl font-semibold mt-8 mb-3">{children}</h2>
      ),
      h3: ({ children }) => (
        <h3 className="text-2xl font-semibold mt-6 mb-2">{children}</h3>
      ),
      normal: ({ children }) => (
        <p className="mb-5 leading-relaxed text-[#4a4a4a]">{children}</p>
      ),
    },

    list: {
      bullet: ({ children }) => (
        <ul className="list-disc pl-6 mb-4">{children}</ul>
      ),
      number: ({ children }) => (
        <ol className="list-decimal pl-6 mb-4">{children}</ol>
      ),
    },

    listItem: {
      bullet: ({ children }) => <li className="mb-2">{children}</li>,
      number: ({ children }) => <li className="mb-2">{children}</li>,
    },

    marks: {
      link: ({ children, value }) => {
        const href = value?.href || "";

        return (
          <a
            href={href}
            className="text-blue-600 font-medium hover:underline"
          >
            {children}
          </a>
        );
      },

      strong: ({ children }) => (
        <strong className="text-[#31372B] font-semibold">
          {children}
        </strong>
      ),
    },
  };

  // -----------------------------
  // UI
  // -----------------------------

  return (
    <>
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

      <div className="min-h-screen bg-[#FAF7EE] text-[#31372B]">
        <div className="max-w-[900px] mx-auto pt-24 px-6">
          <div className="mb-6">
            <Link href="/blog">
              <button className="bg-white border border-[#31372B] text-[#31372B] rounded-md px-6 py-2 text-sm font-medium hover:bg-[#31372B] hover:text-[#FAF7EE] transition-colors">
                ← Back to Blog
              </button>
            </Link>
          </div>

          <article className="bg-white border border-[#31372B1F] rounded-2xl overflow-hidden shadow-sm mb-8 p-8 md:p-12">
            <h1 className="text-[40px] md:text-[48px] font-bold mb-4">
              {post.coverImage?.url && (
                <div className="relative w-full h-[400px] bg-[#F5F5F5] rounded-xl overflow-hidden mb-8">
                  <Image
                    src={post.coverImage.url}
                    alt={post.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              {post.title}
            </h1>

            <p className="text-[#717182] text-lg mb-8">{post.brief}</p>

            <div
              className="
                prose prose-lg max-w-none

                prose-headings:text-[#31372B]
                prose-headings:font-semibold

                prose-h1:text-4xl
                prose-h2:text-3xl
                prose-h3:text-2xl

                prose-p:text-[#4a4a4a]
                prose-p:leading-relaxed

                prose-a:text-blue-600 prose-a:font-medium hover:prose-a:underline

                prose-strong:text-[#31372B]

                prose-li:marker:text-[#31372B]

                prose-code:bg-[#f5f5f5] prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                prose-pre:bg-[#1e1e1e] prose-pre:text-white
                prose-pre:rounded-xl prose-pre:shadow-lg prose-pre:p-6

                prose-blockquote:border-l-4 prose-blockquote:border-[#31372B] prose-blockquote:pl-4 prose-blockquote:text-[#555]
              "
            >
              <PortableText value={post.content} components={components} />
            </div>
          </article>
        </div>
      </div>

      <Footer />
    </>
  );
}