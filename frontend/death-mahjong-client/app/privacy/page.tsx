import type { Metadata } from "next";
import AppNav from "@/components/AppNav";

export const metadata: Metadata = {
  title: "Privacy Policy | Death Mahjong",
  description: "Privacy Policy for Death Mahjong",
};

const LAST_UPDATED = "September 7, 2026";
const CONTACT_EMAIL = "sofiefeline64@gmail.com";

export default function PrivacyPage() {
  return (
    <>
      <AppNav />

      <main
        className="min-h-screen bg-cover bg-center bg-no-repeat px-4 pb-4 pt-24 text-slate-950 dark:text-slate-100"
        style={{
          backgroundImage: "url('/images/backgrounds/DarkBackground.png')",
        }}
      >
        <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-3xl flex-col gap-6 rounded-3xl bg-white/85 p-6 shadow-2xl backdrop-blur-sm dark:bg-slate-950/85">
          <header className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-red-700 dark:text-red-400">
              Death Mahjong
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-wide">
              Privacy Policy
            </h1>

            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Last updated: {LAST_UPDATED}
            </p>
          </header>

          <article className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:text-slate-700 dark:[&_p]:text-slate-300 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6 [&_ul]:text-slate-700 dark:[&_ul]:text-slate-300">
            <section>
              <p>
                Death Mahjong (&quot;the app&quot;, &quot;we&quot;) is a
                multiplayer drinking game inspired by Solitaire Mahjong. This
                policy explains what information the app collects, how it is
                used, and the choices you have. It applies to the website and
                to the Android app, which loads the same website.
              </p>
            </section>

            <section>
              <h2>Information We Collect</h2>
              <p>We collect only what&apos;s needed to run the game:</p>
              <ul>
                <li>
                  <strong>Display name.</strong> The name you enter when
                  creating or joining a room. No email address, password, or
                  other account credentials are required to play.
                </li>
                <li>
                  <strong>Optional profile.</strong> If you use the
                  statistics/profile features, we create a lightweight
                  profile tied to your display name (a random ID and the date
                  it was created) so your game history can be looked up
                  later. We do not collect an email address or password for
                  this.
                </li>
                <li>
                  <strong>Game data.</strong> Room settings (e.g. hardcore
                  mode), moves made during a game, and resulting statistics
                  (drinks, dragons drawn, wins) are stored so that
                  leaderboards and game history can be shown.
                </li>
                <li>
                  <strong>Local device storage.</strong>{" "}
                  The app stores your
                  current room ID, player ID, and join code in your
                  browser&apos;s local storage, purely so you can refresh the
                  page or reconnect without losing your place in a game. This
                  data stays on your device and is not sent to us beyond the
                  normal game requests you make.
                </li>
                <li>
                  <strong>Standard server logs.</strong> Like virtually all
                  hosted web apps, our hosting providers may automatically
                  log technical information such as IP address and request
                  timestamps for security and reliability purposes. We do not
                  use this for tracking or advertising.
                </li>
              </ul>
            </section>

            <section>
              <h2>What We Don&apos;t Do</h2>
              <ul>
                <li>We don&apos;t use advertising or ad networks.</li>
                <li>
                  We don&apos;t use third-party analytics or tracking
                  cookies.
                </li>
                <li>We don&apos;t collect or process payment information.</li>
                <li>We don&apos;t sell or rent your data to anyone.</li>
              </ul>
            </section>

            <section>
              <h2>How We Use Information</h2>
              <p>
                Information is used solely to run the game: matching players
                in a room, calculating and displaying drink counts, showing
                statistics and leaderboards, and letting you reconnect to a
                game in progress.
              </p>
            </section>

            <section>
              <h2>Third-Party Service Providers</h2>
              <p>
                The app runs on infrastructure operated by third-party
                hosting providers, who process data on our behalf strictly to
                deliver the service (not for their own marketing purposes):
              </p>
              <ul>
                <li>Vercel &ndash; hosts the website/frontend</li>
                <li>Railway &ndash; hosts the backend server</li>
                <li>Neon &ndash; hosts the database</li>
              </ul>
            </section>

            <section>
              <h2>Data Retention &amp; Deletion</h2>
              <p>
                Game history and profile data are kept so statistics and
                leaderboards continue to work. If you&apos;d like your
                display name, profile, or game history deleted, email{" "}
                <a
                  className="text-red-700 underline dark:text-red-400"
                  href={`mailto:${CONTACT_EMAIL}`}
                >
                  {CONTACT_EMAIL}
                </a>{" "}
                and we&apos;ll remove it.
              </p>
            </section>

            <section>
              <h2>Your Rights</h2>
              <p>
                Depending on where you live, you may have the right to
                access, correct, or delete the data we hold about you. To
                exercise any of these rights, contact us using the email
                below.
              </p>
            </section>

            <section>
              <h2>Age &amp; Content Note</h2>
              <p>
                Death Mahjong is a drinking game and is intended for players
                of legal drinking age in their jurisdiction. It is not
                directed at children, and we do not knowingly collect
                information from children under 13.
              </p>
            </section>

            <section>
              <h2>Changes to This Policy</h2>
              <p>
                We may update this policy as the app changes. Material
                changes will be reflected by updating the &quot;Last
                updated&quot; date above.
              </p>
            </section>

            <section>
              <h2>Contact</h2>
              <p>
                Questions about this policy or your data? Email{" "}
                <a
                  className="text-red-700 underline dark:text-red-400"
                  href={`mailto:${CONTACT_EMAIL}`}
                >
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
