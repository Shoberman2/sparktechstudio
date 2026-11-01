import { EMAIL } from './content.jsx'
import { Shell, Head } from './Layout.jsx'

// What this site actually does with data, and nothing more. Update if analytics, a form, or any third party is added.
export default function Privacy() {
  return <Shell title="Privacy | SparkTech Studio">
    <Head h1="Privacy, kept simple." lede="This site runs no analytics, no ads, and no tracking cookies." cta={false} />
    <section className="sec wrap prose">
      <h2>What we collect</h2>
      <p>Nothing while you browse. If you email us, we get what you send. If you book a call, Calendly collects your name, email, and the time you pick, under <a href="https://calendly.com/privacy" target="_blank" rel="noreferrer">Calendly’s privacy policy</a>, and shares the booking with us.</p>
      <h2>What we do with it</h2>
      <p>We use it to reply and to talk about your project. We don’t sell it, rent it, or add you to a mailing list.</p>
      <h2>Hosting</h2>
      <p>The site is hosted on Vercel, which keeps standard server logs. Fonts load from Google Fonts.</p>
      <h2>Deleting your data</h2>
      <p><a href={`mailto:${EMAIL}`}>Email us</a> and we will delete what we hold.</p>
    </section>
  </Shell>
}
