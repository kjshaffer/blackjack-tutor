"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-900/30 border border-emerald-800/50 rounded-full px-4 py-1.5 text-sm text-emerald-400 mb-8">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          250+ hand combinations to master
        </div>
        <h1 className="text-6xl font-bold tracking-tight mb-6 leading-tight">
          Master Blackjack
          <br />
          <span className="text-yellow-400">Basic Strategy</span>
        </h1>
        <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Stop guessing. Learn the mathematically optimal play for every hand
          through adaptive practice with AI-powered explanations.
        </p>
        <div className="flex justify-center gap-4">
          {isLoggedIn ? (
            <Link
              href="/practice"
              className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-8 py-3.5 rounded-lg text-lg transition-colors"
            >
              Start Practicing
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-8 py-3.5 rounded-lg text-lg transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-semibold px-8 py-3.5 rounded-lg text-lg transition-colors"
              >
                Log In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-sm uppercase tracking-widest text-gray-500 text-center mb-10">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-emerald-900/40 border border-emerald-800/50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-emerald-400 text-xl">1</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Get Dealt a Hand</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              See your two cards and the dealer&#39;s upcard. The system tells you
              if it&#39;s a hard hand, soft hand, or pair.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-emerald-900/40 border border-emerald-800/50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-emerald-400 text-xl">2</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Make Your Decision</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Choose Hit, Stand, Double Down, or Split. Get instant feedback
              on whether you played it right.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-emerald-900/40 border border-emerald-800/50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-emerald-400 text-xl">3</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Learn Why</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              When you&#39;re wrong, AI explains the probability reasoning
              so you understand, not just memorize.
            </p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="text-yellow-400 text-sm font-semibold uppercase tracking-widest mb-3">
              AI-Powered
            </div>
            <h3 className="font-semibold text-xl mb-2">Smart Explanations</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Not just &ldquo;wrong&rdquo; — the AI explains dealer bust probabilities,
              expected values, and why the correct play gives you the best edge.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">
              Adaptive
            </div>
            <h3 className="font-semibold text-xl mb-2">Focused Practice</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              The system tracks your accuracy on hard hands, soft hands, and pairs
              separately, then deals you more of what you struggle with.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">
              Progress
            </div>
            <h3 className="font-semibold text-xl mb-2">Track Your Growth</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              A dashboard with accuracy charts and per-category breakdowns
              so you can see yourself improving over time.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="text-red-400 text-sm font-semibold uppercase tracking-widest mb-3">
              Complete
            </div>
            <h3 className="font-semibold text-xl mb-2">Every Scenario</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              All 250+ hand-upcard combinations from the standard basic strategy
              chart, with the mathematically optimal play for each one.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      {!isLoggedIn && (
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to play smarter?</h2>
          <p className="text-gray-400 mb-8">
            Create a free account and start mastering basic strategy today.
          </p>
          <Link
            href="/signup"
            className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-8 py-3.5 rounded-lg text-lg transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-800 mt-8">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          ♠ ♥ ♦ ♣ Blackjack Strategy Trainer
        </div>
      </div>
    </div>
  );
}
