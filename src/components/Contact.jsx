import { ArrowOut } from './Icons'
import './Contact.css'
export default function Contact() {
  return <section className="contact" id="contact" aria-labelledby="contact-title"><div className="wrap">
    <p className="section-label">Have something in mind?</p>
    <a className="contact-title-link" href="mailto:contactus@sparktechstudio.com"><h2 id="contact-title">Let’s make it.</h2><ArrowOut /></a>
    <div className="contact-bottom"><p>Start with a sentence. We’ll take it from there.</p><a className="contact-email" href="mailto:contactus@sparktechstudio.com">contactus@sparktechstudio.com</a></div>
  </div></section>
}
