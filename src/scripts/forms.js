// Unified intake forms — panel switching, validation, and submission.
//
// The submit path is a Google Apps Script Web App that appends to a
// BLPAPA-owned Sheet and emails a copy (HANDOFF.md §5.8). Three constraints
// shape everything below:
//
//   1. POST as application/x-www-form-urlencoded, never JSON. JSON triggers a
//      CORS preflight that Apps Script does not answer, and that is the single
//      most common way this integration silently fails.
//   2. While content/site.json has no `forms.unifiedEndpoint`, the page goes
//      into preview mode and refuses to submit. A real vendor application
//      landing in an unmonitored spreadsheet is worse than no form at all.
//   3. The canonical Google Form stays visible under every form regardless.
//      A visitor with JavaScript off never reaches this file, and the fallback
//      link is their entire path.

const root = document.getElementById('forms');
if (root) {
  const endpoint = root.dataset.endpoint.trim();
  const panels = [...root.querySelectorAll('.form-panel')];
  const pickers = [...document.querySelectorAll('[data-picker]')];
  const loadedAt = Date.now();

  // -- Panel switching ------------------------------------------------------
  // The markup shows all five panels; JS narrows to one. That order matters:
  // without scripting the page degrades to a long but complete document rather
  // than to four hidden forms.

  const show = (id, { focus = false } = {}) => {
    const target = panels.find((panel) => panel.id === id) ?? panels[0];
    for (const panel of panels) panel.hidden = panel !== target;
    for (const picker of pickers) {
      picker.setAttribute('aria-current', String(picker.dataset.picker === target.id));
    }
    if (focus) {
      const heading = target.querySelector('h2');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  for (const picker of pickers) {
    picker.addEventListener('click', (event) => {
      event.preventDefault();
      const id = picker.dataset.picker;
      history.replaceState(null, '', `#${id}`);
      show(id, { focus: true });
    });
  }

  window.addEventListener('hashchange', () => show(location.hash.slice(1)));
  show(location.hash.slice(1) || panels[0].id);

  // -- Validation -----------------------------------------------------------

  const labelFor = (control) => {
    const label = control.form.querySelector(`label[for="${control.id}"]`);
    return label ? label.textContent.replace(/\(required\)/i, '').trim().replace(/[:*]$/, '') : 'This field';
  };

  const errorNode = (control) => document.getElementById(`${control.id}-error`);

  const setError = (control, message) => {
    const node = errorNode(control);
    control.setAttribute('aria-invalid', 'true');
    if (node) {
      node.textContent = message;
      node.classList.add('is-visible');
      control.setAttribute('aria-describedby',
        [control.dataset.describedby, node.id].filter(Boolean).join(' '));
    }
  };

  const clearError = (control) => {
    const node = errorNode(control);
    control.removeAttribute('aria-invalid');
    if (node) {
      node.textContent = '';
      node.classList.remove('is-visible');
      if (control.dataset.describedby) control.setAttribute('aria-describedby', control.dataset.describedby);
      else control.removeAttribute('aria-describedby');
    }
  };

  const validate = (control) => {
    const name = labelFor(control);
    if (control.type === 'checkbox') {
      return control.required && !control.checked ? 'Please tick this box to continue.' : '';
    }
    const value = control.value.trim();
    if (control.required && !value) return `${name} is required.`;
    if (!value) return '';
    if (control.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      return 'Please check this email address.';
    }
    if (control.type === 'tel' && value.replace(/\D/g, '').length < 7) {
      return 'Please enter a phone number we can reach you on.';
    }
    if (control.type === 'url' && !/^https?:\/\/.+\..+/.test(value)) {
      return 'Please include the full address, starting with https://';
    }
    if (control.type === 'number' && Number(value) < 0) {
      return 'Please enter zero or more.';
    }
    return '';
  };

  const status = (form, kind, html) => {
    const region = form.querySelector('.form__status');
    region.innerHTML = `<div class="callout${kind ? ` callout--${kind}` : ''}">${html}</div>`;
  };

  // -- Submission -----------------------------------------------------------

  for (const form of root.querySelectorAll('form[data-intake]')) {
    const controls = [...form.querySelectorAll('input, select, textarea')]
      .filter((control) => !control.name.startsWith('_'));

    // Remember any aria-describedby the markup set, so attaching an error
    // message does not detach the field's hint.
    for (const control of controls) {
      const existing = control.getAttribute('aria-describedby');
      if (existing) control.dataset.describedby = existing;
      control.addEventListener('blur', () => {
        const message = validate(control);
        if (message) setError(control, message);
        else clearError(control);
      });
    }

    if (!endpoint) {
      // The submit button stays fully operable on purpose. Marking it
      // aria-disabled would hide it from assistive tech and swallow the click,
      // so anyone who pressed it would get silence instead of being pointed at
      // the Google Form that does work.
      const notice = document.createElement('div');
      notice.className = 'form-preview-notice';
      notice.innerHTML =
        '<p class="form-preview-notice__title">Please use the form linked below</p>'
        + '<p>We are in the middle of moving our applications over to this page. '
        + 'Until that is finished, send yours through the form at the bottom of '
        + 'this section — it goes straight to us and we are watching it daily.</p>';
      form.prepend(notice);
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      // A group act has to name its members. The rule lives here rather than
      // in `required` because it only applies when Group is selected.
      const soloOrGroup = form.querySelector('[name="Solo or group"]');
      const members = form.querySelector('[name="Group members"]');
      if (soloOrGroup && members) members.required = soloOrGroup.value === 'Group';

      let firstInvalid = null;
      for (const control of controls) {
        const message = validate(control);
        if (message) {
          setError(control, message);
          firstInvalid ??= control;
        } else {
          clearError(control);
        }
      }

      if (firstInvalid) {
        status(form, 'red',
          '<p class="callout__title">Something needs another look</p>'
          + '<p>A few fields above need attention. They are marked in red.</p>');
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      if (!endpoint) {
        status(form, 'gold',
          '<p class="callout__title">Almost — one more step</p>'
          + '<p>This page is not taking applications yet. Please send yours '
          + 'through the form linked just below, which comes straight to us.</p>');
        return;
      }

      // Spam checks: an invisible field a person never sees, and the fact that
      // nobody fills in a form this long in under three seconds. No reCAPTCHA
      // — it is a third-party tracking script and CLAUDE.md §2 bans those.
      const trap = form.querySelector('[name="_website"]');
      if ((trap && trap.value) || Date.now() - loadedAt < 3000) {
        status(form, 'red',
          '<p class="callout__title">We could not send that</p>'
          + '<p>Please try once more, or use the Google Form linked below.</p>');
        return;
      }

      const button = form.querySelector('button[type="submit"]');
      const originalLabel = button.textContent;
      button.disabled = true;
      button.textContent = 'Sending…';
      status(form, '', '<p>Sending your application…</p>');

      const body = new URLSearchParams();
      body.set('_intake', form.dataset.intake);
      body.set('_submittedAt', new Date().toISOString());
      for (const control of controls) {
        if (control.type === 'checkbox') body.set(control.name, control.checked ? 'Yes' : 'No');
        else if (control.value.trim()) body.set(control.name, control.value.trim());
      }

      try {
        // urlencoded keeps this a CORS "simple request", so the browser sends
        // it without a preflight Apps Script would not answer.
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
          body: body.toString(),
        });
        const result = await response.json().catch(() => null);

        // The response is read rather than assumed. A hopeful "thanks!" over a
        // failed write is exactly the silent-failure mode this design exists
        // to avoid.
        if (!response.ok || !result || result.status !== 'ok') {
          throw new Error(result && result.message ? result.message : `HTTP ${response.status}`);
        }

        form.reset();
        status(form, 'gold',
          '<p class="callout__title">Salamat — we have your application</p>'
          + '<p>It has arrived with BLPAPA and somebody will be in touch. '
          + 'You will not get an automatic confirmation email, so it is worth '
          + 'noting that you sent it today.</p>');
      } catch (error) {
        status(form, 'red',
          '<p class="callout__title">That did not send</p>'
          + '<p>Something went wrong on our side, and we do not want to lose '
          + 'your application. Please use the Google Form linked just below — '
          + 'it goes straight to BLPAPA.</p>'
          + `<p><small>Technical detail: ${error.message}</small></p>`);
      } finally {
        button.disabled = false;
        button.textContent = originalLabel;
      }
    });
  }
}
