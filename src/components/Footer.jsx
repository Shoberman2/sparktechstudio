import './Footer.css'

export default function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <a href="#" className="logo">
              <img src="/logo.svg" alt="SparkTech Studios" className="logo-icon" />
              <span className="logo-text">sparktech-studios</span>
            </a>
            <p className="comment"># we build the crazy ideas other studios won't touch. fast, real, in production.</p>
          </div>
          <div className="footer-col">
            <h4>~/work</h4>
            <ul>
              <li><a href="https://ballotwatch.io" target="_blank" rel="noopener noreferrer">ballotwatch.io</a></li>
              <li><a href="https://utern.ai" target="_blank" rel="noopener noreferrer">utern.ai</a></li>
              <li><a href="https://spacialhealth.com" target="_blank" rel="noopener noreferrer">spacialhealth.com</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>~/studio</h4>
            <ul>
              <li><a href="#about">about</a></li>
              <li><a href="#services">services</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>~/connect</h4>
            <ul>
              <li><a href="#">linkedin</a></li>
              <li><a href="#">twitter / x</a></li>
              <li><a href="mailto:contactus@sparktechstudio.com">email</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} SparkTech Studios, LLC. all rights reserved.</p>
          <div className="footer-socials">
            <a href="#" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24"><path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" /></svg>
            </a>
            <a href="#" aria-label="Twitter">
              <svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
          </div>
        </div>

        <p className="footer-prompt">
          <span className="prompt-sign">spark@studio</span>:<span className="prompt-path">~</span>${' '}
          <span className="tw-caret" aria-hidden="true" />
        </p>
      </div>
    </footer>
  )
}
