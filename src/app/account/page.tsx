"use client";

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Account</h1>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-sm uppercase tracking-widest text-gray-400 mb-4">Profile</h2>
          <div className="space-y-4">
            {session?.user?.name && (
              <div>
                <div className="text-xs text-gray-500 mb-1">Name</div>
                <div className="text-white">{session.user.name}</div>
              </div>
            )}
            <div>
              <div className="text-xs text-gray-500 mb-1">Email</div>
              <div className="text-white">{session?.user?.email}</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-sm uppercase tracking-widest text-gray-400 mb-4">Actions</h2>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="bg-red-600 hover:bg-red-500 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}