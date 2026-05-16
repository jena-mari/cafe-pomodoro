import React from 'react'

const FOOTER_CONFIG = {
  tagline: 'this timer was made with love. take breaks! ⋆.˚☕︎',

  credit: 'by jena bathan',

  links: [
    { label: 'github',    href: 'https://github.com/jena-mari' },
    { label: 'portfolio', href: 'https://jena-portfolio-xi.vercel.app/' },
  ],
}

// ─────────────────────────────────────────────

export default function Footer() {
  return (
    <>
      <style>{`
        .site-footer {
          width: 100%;
          padding: 2.5rem 3rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .footer-tagline {
          font-family: 'Urbanist', sans-serif;
          font-size: 0.9rem;
          color: var(--muted);
          letter-spacing: 0.06em;
          text-align: center;
          opacity: 0.85;
        }

        .footer-bottom {
          width: 100%;
          max-width: 72rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .footer-credit {
          font-family: 'Urbanist', sans-serif;
          font-size: 0.8rem;
          color: var(--muted);
          opacity: 0.6;
          letter-spacing: 0.04em;
        }

        .footer-links {
          display: flex;
          gap: 1.25rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .footer-link {
          font-family: 'Urbanist', sans-serif;
          font-size: 0.8rem;
          color: var(--muted);
          opacity: 0.65;
          text-decoration: none;
          letter-spacing: 0.04em;
          transition: opacity 150ms ease;
        }
        .footer-link:hover { opacity: 1; }

        @media (max-width: 600px) {
          .site-footer { padding: 2rem 1.5rem; }
          .footer-bottom { flex-direction: column; align-items: center; text-align: center; }
        }
      `}</style>

      <footer className="site-footer">
        <p className="footer-tagline">{FOOTER_CONFIG.tagline}</p>
        <div className="footer-bottom">
          <span className="footer-credit">{FOOTER_CONFIG.credit}</span>
          <nav className="footer-links" aria-label="Footer links">
            {FOOTER_CONFIG.links.map(link => (
              <a
                key={link.label}
                href={link.href}
                className="footer-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </>
  )
}
