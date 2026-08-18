import Logo from './Logo.jsx'
import NanField from './NanField.jsx'
import { content } from './content.js'
import './App.css'

export default function App() {
  return (
    <>
      <NanField />
      <main className="card">
      <div className="sheet">
        <header className="brand">
          <Logo className="pineapple" />
          <h1 className="wordmark">
            <span className="nan">NaN</span>
            <span className="as">AS</span>
          </h1>
          <p className="tagline">{content.tagline}</p>
        </header>

        <ul className="services">
          {content.services.map((service) => (
            <li key={service}>{service}</li>
          ))}
        </ul>

        <footer className="contact">
          <p className="name">{content.name}</p>
          <nav className="contact-links" aria-label="Contact">
            <a href={content.email.href}>{content.email.label}</a>
            <a
              href={content.linkedin.href}
              target="_blank"
              rel="noreferrer"
            >
              {content.linkedin.label}
            </a>
          </nav>
          <p className="addressAndOrgNumber">{content.address.join(', ')} <br /> {content.orgNumber}</p>
        </footer>
      </div>
    </main>
    </>
  )
}
