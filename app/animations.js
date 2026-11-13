'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function SiteAnimations() {
  const pathname = usePathname();
  const router = useRouter();
  const navigating = useRef(false);
  const leaveTimer = useRef(null);

  useEffect(() => {
    navigating.current = false;
    const main = document.querySelector('main');
    if (main) main.classList.remove('page-leave');
  }, [pathname]);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const main = document.querySelector('main');
    if (!main) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('reveal-in');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });

    function register(element) {
      if (!(element instanceof HTMLElement)) return;
      if (element.closest('#home') || element.classList.contains('reveal-in')) return;

      if (!element.classList.contains('reveal-init')) {
        const rect = element.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;

        if (inView) {
          element.classList.add('reveal-in');
          return;
        }

        element.classList.add('reveal-init');
      }

      observer.observe(element);
    }

    function scan() {
      main.querySelectorAll('section').forEach(section => {
        if (section.closest('section') === section) register(section);
      });
      main.querySelectorAll('.anim-card').forEach(register);
    }

    scan();
    const mutations = new MutationObserver(scan);
    mutations.observe(main, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [pathname]);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    function onClick(event) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = event.target.closest?.('a[href]');
      if (!anchor || (anchor.target && anchor.target !== '_self') || anchor.hasAttribute('download') || anchor.dataset.noAnimation !== undefined) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || (url.protocol !== 'http:' && url.protocol !== 'https:')) return;
      if (url.pathname === window.location.pathname) return;

      const main = document.querySelector('main');
      if (!main) return;

      if (navigating.current) {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      navigating.current = true;
      main.classList.add('page-leave');
      leaveTimer.current = window.setTimeout(() => {
        leaveTimer.current = null;
        router.push(`${url.pathname}${url.search}${url.hash}`);
      }, 180);
    }

    function resetNavigation() {
      navigating.current = false;
      if (leaveTimer.current) {
        window.clearTimeout(leaveTimer.current);
        leaveTimer.current = null;
      }
      document.querySelector('main')?.classList.remove('page-leave');
    }

    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', resetNavigation);
    window.addEventListener('pageshow', resetNavigation);

    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', resetNavigation);
      window.removeEventListener('pageshow', resetNavigation);
      if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
    };
  }, [router]);

  return null;
}
