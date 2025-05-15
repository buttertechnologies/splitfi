"use client";

import React, { useState, useEffect } from "react";
import { useCurrentFlowUser } from "@onflow/kit";
import { useRouter } from "next/navigation";
import Image from "next/image";
import FAQ from "./FAQ";

export default function LandingPage() {
  const { user, authenticate } = useCurrentFlowUser();
  const router = useRouter();
  const [waitingForLogin, setWaitingForLogin] = useState(false);

  useEffect(() => {
    if (waitingForLogin && user?.loggedIn) {
      router.push("/groups");
      setWaitingForLogin(false);
    }
  }, [waitingForLogin, user, router]);

  const handleLoginAndRedirect = async () => {
    if (user?.loggedIn) {
      router.push("/groups");
    } else {
      setWaitingForLogin(true);
      await authenticate();
      // Do not redirect here; useEffect will handle it
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* HERO */}
      <section className="relative flex flex-col items-center justify-center py-12 px-4 sm:px-12 overflow-hidden">
        <h1 className="relative z-10 text-5xl sm:text-7xl font-extrabold leading-tight tracking-tight text-center mb-4">
          SplitFi
          <span className="block text-2xl sm:text-3xl font-medium mt-2">
            Split bills. Stay friends. No waiting.
          </span>
        </h1>
        <p className="relative z-10 text-lg sm:text-2xl text-center max-w-2xl mb-8">
          Track group expenses and close the tab in one Flow-powered USDF
          payment.
        </p>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleLoginAndRedirect();
          }}
          className="relative z-10 inline-flex items-center gap-2 px-8 py-4 font-bold rounded-full text-lg hover:underline transition group"
        >
          Start Splitting{" "}
          <span className="group-hover:translate-x-1 transition-transform">
            ›
          </span>
        </a>
      </section>

      {/* KEY BENEFITS */}
      <section className="relative z-10 py-8 px-4 sm:px-12">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
          Why SplitFi?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          <BenefitCard
            title="Instant settlement"
            desc="Settle up in seconds—no more waiting for bank transfers or paybacks."
          />
          <BenefitCard
            title="Dollar-pegged clarity"
            desc="Balances are always stable with USDF, a $1-backed stablecoin."
          />
          <BenefitCard
            title="No more awkward math"
            desc="SplitFi auto-calculates and nets out what everyone owes."
          />
          <BenefitCard
            title="Penny-level fees"
            desc="Flow gas costs fractions of a cent, so splitting is always worth it."
          />
        </div>
      </section>

      {/* FEATURE SPOTLIGHT */}
      <section className="relative z-10 py-12 px-4 sm:px-12">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
          Feature Spotlight
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          <FeatureCard
            feature="Auto-netting engine"
            why="Collapses all group debts into a single, simple payment."
          />
          <FeatureCard
            feature="One-tap settle"
            why="Sign once and every balance hits $0 instantly."
          />
          <FeatureCard
            feature="Pay-Spin"
            why="Let Flow's randomness pick who pays for fun, then settle in one tap."
          />
          <FeatureCard
            feature="Flexible Splits"
            why="Split equally, assign to select people, or use percentages—no calculator needed."
          />
        </div>
      </section>

      {/* BLURB */}
      <section className="relative z-10 py-12 px-4 sm:px-12 flex flex-col items-center">
        <blockquote className="max-w-2xl text-xl sm:text-2xl text-center font-medium px-8 py-8">
          <span className="font-bold">SplitFi</span> keeps money from ruining
          good times. Log shared bills, let our engine crunch who owes what, and
          wipe the slate clean with one USDF payment on Flow. It's Splitwise
          simplicity plus blockchain speed—no banks, no waiting, and fees that
          round to zero. Feeling brave? Try{" "}
          <span className="font-bold">Pay-Spin</span>: Flow's verifiable
          randomness picks who foots the tab. Try SplitFi and make splitting
          painless.
        </blockquote>
      </section>

      {/* FAQ */}
      <section className="relative z-10 py-12 px-4 sm:px-12 max-w-3xl mx-auto">
        <h3 className="text-2xl font-bold mb-6 text-center">Quick FAQ</h3>
        <div className="space-y-4">
          <FAQ
            q="Is crypto still volatile?"
            a={
              <span>
                Your balances are in USDF, a dollar-pegged stablecoin issued by
                U.S.-regulated banks.{" "}
                <a
                  href="https://www.coindesk.com/business/2022/01/12/us-banks-form-group-to-offer-usdf-stablecoin?utm_source=chatgpt.com"
                  target="_blank"
                >
                  Learn more
                </a>
              </span>
            }
          />
          <FAQ
            q="How much are fees?"
            a={
              <span>
                Flow gas is usually well below one cent—far cheaper than bank
                rails.{" "}
                <a
                  href="https://forum.flow.com/t/proposing-transaction-fee-changes-and-flow-evm-gas-charges-for-flow-crescendo-launch/5817?utm_source=chatgpt.com"
                  target="_blank"
                >
                  See details
                </a>
              </span>
            }
          />
          <FAQ
            q="Can you really pick a random payer fairly?"
            a={
              <span>
                Yes. Flow supplies built-in verifiable randomness, so no one can
                game the draw.{" "}
                <a
                  href="https://developers.flow.com/build/advanced-concepts/randomness?utm_source=chatgpt.com"
                  target="_blank"
                >
                  How it works
                </a>
              </span>
            }
          />
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="relative z-10 py-16 px-4 sm:px-12 flex flex-col items-center mt-12">
        <h4 className="text-2xl sm:text-3xl font-bold mb-4 text-center">
          Ready to settle up in seconds?
        </h4>
        <p className="text-lg mb-6 text-center max-w-xl">
          Try SplitFi, start your first group, and clear the next tab before the
          waiter's back.
        </p>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleLoginAndRedirect();
          }}
          className="inline-flex items-center gap-2 px-8 py-4 font-bold rounded-full text-lg hover:underline transition group"
        >
          Start Splitting{" "}
          <span className="group-hover:translate-x-1 transition-transform">
            ›
          </span>
        </a>
      </section>
    </div>
  );
}

function BenefitCard({
  title,
  desc,
  link,
}: {
  title: string;
  desc: string;
  link?: string;
}) {
  return (
    <div className="rounded-2xl p-6 flex flex-col items-start gap-2 border hover:shadow transition">
      <div className="text-xl font-bold mb-1">{title}</div>
      <div className="text-base mb-2">{desc}</div>
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs underline"
        >
          Learn more
        </a>
      )}
    </div>
  );
}

function FeatureCard({ feature, why }: { feature: string; why: string }) {
  return (
    <div className="rounded-xl p-6 flex flex-col items-start gap-2 border">
      <div className="text-lg font-bold mb-1">{feature}</div>
      <div className="text-base">{why}</div>
    </div>
  );
}
