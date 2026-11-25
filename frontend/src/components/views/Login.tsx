import { useState, type FormEvent } from 'react';
import { LockKeyhole } from 'lucide-react';
import { loginUser, registerUser } from '../../services/hortaService';
import type { UserProfile } from '../../types/garden';

interface LoginProps {
  onLogin: (user: UserProfile) => void;
  initialError?: string | null;
}

function Login({ onLogin, initialError }: LoginProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const user = isRegistering
        ? await registerUser(name, email, password)
        : await loginUser(email, password);
      onLogin(user);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Não foi possível autenticar sua conta.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen w-full bg-[#f8f9f7] md:grid md:grid-cols-2">
      <section className="relative hidden min-h-screen overflow-hidden md:block">
        <img
          src="/horta.png"
          alt="Horta escolar"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/15" />
        <div className="absolute inset-0 flex items-center justify-center -translate-y-[40px]">
          <div className="flex flex-col items-center px-6 text-center">
            <img
              src="/planta.png"
              alt="Logotipo da Horta Escolar"
              className="mb-2 h-20 w-20 object-contain drop-shadow-md"
            />
            <h2 className="text-2xl font-extrabold uppercase leading-tight tracking-wide text-white drop-shadow-lg">
              Gerenciador de Horta
              <br />
              Escolar
            </h2>
            <div className="mt-4 h-1 w-16 rounded-full bg-[#b5dc82]" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/45 to-transparent px-8 pb-7 pt-16">
          <p className="text-sm font-medium text-white/90">
            Cultivando conhecimento,
            <br />
            colhendo um futuro mais verde.
          </p>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-[#f8f9f7] px-5 py-10 sm:px-8">
        <div className="w-full max-w-[350px] rounded-[24px] border border-stone-200/80 bg-white px-7 py-8 shadow-[0_12px_35px_rgba(25,55,30,0.08)] sm:px-8 sm:py-9">
          <div className="mb-7">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#28613a]">
              {isRegistering ? 'HORTA ESCOLAR' : 'Bem-vindo(a) de volta!'}
            </span>
            <h1 className="text-[25px] font-extrabold leading-tight tracking-tight text-[#172b1d]">
              {isRegistering ? 'Criar uma conta' : 'Entrar na sua conta'}
            </h1>
            <p className="mt-2 text-[13px] leading-5 text-stone-500">
              {isRegistering
                ? 'Cadastre-se para acompanhar e gerenciar a horta escolar.'
                : 'Acesse sua conta para gerenciar a horta.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegistering && (
              <div>
                <label htmlFor="name" className="mb-2 block text-xs font-semibold text-stone-700">
                  Nome
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  minLength={2}
                  maxLength={120}
                  required
                  className="w-full rounded-xl border border-stone-200 bg-[#fdfdfc] px-4 py-3.5 text-[13px] text-[#172b1d] outline-none transition-all placeholder:text-stone-400 focus:border-[#39804e] focus:bg-white focus:ring-4 focus:ring-[#285d38]/10"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-2 block text-xs font-semibold text-stone-700">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="voce@exemplo.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                className="w-full rounded-xl border border-stone-200 bg-[#fdfdfc] px-4 py-3.5 text-[13px] text-[#172b1d] outline-none transition-all placeholder:text-stone-400 focus:border-[#39804e] focus:bg-white focus:ring-4 focus:ring-[#285d38]/10"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-xs font-semibold text-stone-700">
                Senha
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder={isRegistering ? 'Mínimo de 10 caracteres' : 'Digite sua senha'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
                minLength={isRegistering ? 10 : 1}
                maxLength={128}
                required
                className="w-full rounded-xl border border-stone-200 bg-[#fdfdfc] px-4 py-3.5 text-[13px] text-[#172b1d] outline-none transition-all placeholder:text-stone-400 focus:border-[#39804e] focus:bg-white focus:ring-4 focus:ring-[#285d38]/10"
              />
            </div>

            {errorMessage && (
              <p role="alert" className="text-xs font-medium text-red-700">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1b4d2a] px-4 py-3.5 text-[13px] font-semibold text-white shadow-sm transition-colors duration-300 hover:bg-[#153f22] hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[#285d38]/20 disabled:cursor-wait disabled:opacity-60"
            >
              <LockKeyhole className="h-4 w-4" />
              {isSubmitting ? 'Aguarde...' : isRegistering ? 'Criar conta' : 'Entrar'}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsRegistering((current) => !current);
                setErrorMessage(null);
              }}
              className="w-full text-center text-xs font-semibold text-[#1b4d2a] hover:underline"
            >
              {isRegistering ? 'Já tem conta? Entrar' : 'Ainda não tem conta? Cadastre-se'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default Login;
