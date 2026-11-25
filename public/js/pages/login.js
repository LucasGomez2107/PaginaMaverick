import { t, registerStrings, el, api, loadCSS, setUser, navigate, getLang } from '../core.js';

registerStrings({
  es: {
    'login.title': 'Ingresar', 'login.registerTitle': 'Crear cuenta', 'login.why': '¿Para qué una cuenta?',
    'login.whyText': 'Con tu cuenta jugás al prode, guardás tus puntajes de Tateti y Adiviná y aparecés en el ranking. Solo pedimos usuario y contraseña, sin mail.',
    'login.submitLogin': 'Entrar', 'login.submitRegister': 'Crear mi cuenta', 'login.noAccount': '¿No tenés cuenta?', 'login.haveAccount': '¿Ya tenés cuenta?',
    'login.rules': '3 a 20 caracteres: letras, números o guión bajo', 'login.minPass': 'Mínimo 6 caracteres', 'login.perk1': 'Prode de cada partido', 'login.perk2': 'Puntajes guardados', 'login.perk3': 'Lugar en el ranking',
  },
  en: {
    'login.title': 'Log in', 'login.registerTitle': 'Sign up', 'login.why': 'Why an account?',
    'login.whyText': 'With an account you play the prode, keep your Tic-tac-toe and Guess scores and show up in the ranking. We only ask for a username and password, no email.',
    'login.submitLogin': 'Log in', 'login.submitRegister': 'Create my account', 'login.noAccount': 'No account yet?', 'login.haveAccount': 'Already have an account?',
    'login.rules': '3 to 20 characters: letters, numbers or underscore', 'login.minPass': 'At least 6 characters', 'login.perk1': 'Prode for every game', 'login.perk2': 'Saved scores', 'login.perk3': 'A spot in the ranking',
  },
  pt: {
    'login.title': 'Entrar', 'login.registerTitle': 'Criar conta', 'login.why': 'Para que uma conta?',
    'login.whyText': 'Com uma conta você joga o bolão, guarda suas pontuações do Jogo da velha e do Adivinhe e aparece no ranking. Só pedimos usuário e senha, sem e-mail.',
    'login.submitLogin': 'Entrar', 'login.submitRegister': 'Criar minha conta', 'login.noAccount': 'Ainda não tem conta?', 'login.haveAccount': 'Já tem conta?',
    'login.rules': '3 a 20 caracteres: letras, números ou sublinhado', 'login.minPass': 'Mínimo 6 caracteres', 'login.perk1': 'Bolão de cada jogo', 'login.perk2': 'Pontuações salvas', 'login.perk3': 'Lugar no ranking',
  },
});

function form(mode, query) {
  const reg = mode === 'register';
  const err = el('div', { class: 'form-error', role: 'alert', hidden: true });
  const user = el('input', { class: 'input', id: 'f-user', name: 'username', autocomplete: 'username', required: true, minlength: 3, maxlength: 20, pattern: '[A-Za-z0-9_]+', autocapitalize: 'none' });
  const pass = el('input', { class: 'input', id: 'f-pass', name: 'password', type: 'password', autocomplete: reg ? 'new-password' : 'current-password', required: true, minlength: reg ? 6 : null });
  const btn = el('button', { class: 'btn btn-primary', type: 'submit' }, reg ? t('login.submitRegister') : t('login.submitLogin'));
  const next = query.get('next');
  const sfx = next ? '?next=' + encodeURIComponent(next) : '';
  return el('form', { class: 'ticket auth-form', novalidate: false, onsubmit: async e => {
    e.preventDefault(); err.hidden = true; btn.disabled = true;
    try {
      const body = { username: user.value.trim(), password: pass.value };
      if (reg) body.lang = getLang();
      const r = await api('/auth/' + (reg ? 'register' : 'login'), { method: 'POST', body });
      setUser(r.user);
      navigate(next || '/');
    } catch (ex) { err.textContent = ex.message; err.hidden = false; btn.disabled = false; }
  } },
    el('h2', {}, reg ? t('login.registerTitle') : t('login.title')),
    err,
    el('div', { class: 'field' }, el('label', { for: 'f-user' }, t('common.username')), user, reg ? el('span', { class: 'hint' }, t('login.rules')) : null),
    el('div', { class: 'field' }, el('label', { for: 'f-pass' }, t('common.password')), pass, reg ? el('span', { class: 'hint' }, t('login.minPass')) : null),
    btn,
    el('p', { class: 'switch' }, reg ? t('login.haveAccount') + ' ' : t('login.noAccount') + ' ',
      el('a', { href: (reg ? '#/login' : '#/register') + sfx }, reg ? t('common.login') : t('common.register'))));
}

function page(mode) {
  return {
    path: '/' + mode, titleKey: mode === 'login' ? 'login.title' : 'login.registerTitle',
    render(container, params, query) {
      loadCSS('/css/pages/login.css');
      const reg = mode === 'register';
      container.append(el('div', { class: 'page-head' }, el('span', { class: 'kicker' }, 'MavSudamerica'), el('h1', {}, reg ? t('login.registerTitle') : t('login.title'))),
        el('div', { class: 'auth-grid' }, form(mode, query),
          el('aside', { class: 'why card' }, el('h3', {}, t('login.why')), el('p', {}, t('login.whyText')),
            el('ul', {}, [t('login.perk1'), t('login.perk2'), t('login.perk3')].map(x => el('li', {}, x))))));
    },
  };
}
export default [page('login'), page('register')];
