import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// No jsdom/testing-library is set up in this repo (vitest runs in the
// 'node' environment, tests/**/*.test.ts only), so this is a source-level
// regression guard rather than a rendered-DOM test: it asserts the wiring
// that hides the investor-credit badge and "Get Credits" CTA on /contact
// stays in place, without introducing new test dependencies.

const navbarSrc = readFileSync(
  join(__dirname, '../../src/components/Navbar.tsx'),
  'utf8'
);
const smartNavbarSrc = readFileSync(
  join(__dirname, '../../src/components/SmartNavbar.tsx'),
  'utf8'
);
const contactPageSrc = readFileSync(
  join(__dirname, '../../src/app/contact/page.tsx'),
  'utf8'
);

describe('hideCreditUi wiring', () => {
  it('AuthenticatedNavbar accepts a hideCreditUi prop defaulting to false', () => {
    expect(navbarSrc).toMatch(/hideCreditUi\s*=\s*false/);
  });

  it('gates the investor-credit badge on hideCreditUi (desktop and mobile)', () => {
    const badgeGates = navbarSrc.match(/!\(hideCreditUi && !isToolsPage\)/g) ?? [];
    expect(badgeGates.length).toBe(2);
  });

  it('gates the "Get Credits" CTAs on hideCreditUi (desktop button and mobile menu item)', () => {
    const ctaGates = navbarSrc.match(/\{!hideCreditUi && \(/g) ?? [];
    expect(ctaGates.length).toBe(2);
    expect(navbarSrc).toMatch(/Get Credits/);
    expect(navbarSrc).toMatch(/Get More Credits/);
  });

  it('does not gate the calculator credit status on hideCreditUi', () => {
    // isToolsPage branch (calculator credits) must stay visible regardless
    // of hideCreditUi — only the investor-credit badge is in scope.
    expect(navbarSrc).toMatch(/isToolsPage \? \(/);
  });

  it('SmartNavbar forwards hideCreditUi to AuthenticatedNavbar', () => {
    expect(smartNavbarSrc).toMatch(/hideCreditUi\s*=\s*false/);
    expect(smartNavbarSrc).toMatch(/<AuthenticatedNavbar hideCreditUi=\{hideCreditUi\}\s*\/>/);
  });

  it('the /contact page passes hideCreditUi to SmartNavbar', () => {
    expect(contactPageSrc).toMatch(/<SmartNavbar hideCreditUi\s*\/>/);
  });
});
