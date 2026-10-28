import { useState, type FormEvent } from 'react';
import { LockKeyhole } from 'lucide-react';

interface LoginProps {
  onLogin: (user: MockUser) => void;
}

export interface MockUser {
  name: string;
  role: string;
}

const MOCK_USERS: MockUser[] = [
  { name: 'Fernanda', role: 'Professora' },
  { name: 'João', role: 'Usuário' },
];

function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const user = MOCK_USERS.find(
      (mockUser) => mockUser.name.toLocaleLowerCase('pt-BR') === username.trim().toLocaleLowerCase('pt-BR'),
    );
    if (!user || password !== '123456') {
      setLoginError(true);
      return;
    }
    setLoginError(false);
    onLogin(user);
  }

  return (
    <main className="min-h-screen w-full bg-[#f8f9f7] md:grid md:grid-cols-2">

      {/* LADO ESQUERDO*/}
      <section className="relative hidden min-h-screen overflow-hidden md:block">

        <img
          src="/horta.png"
          alt="Horta escolar"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* Desfoque discreto*/}
        <div className="absolute inset-0 bg-black/15" />

        {/* imagem horta*/}
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

        {/* Identificação inferior */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/45 to-transparent px-8 pb-7 pt-16">
          <p className="text-sm font-medium text-white/90">
            Cultivando conhecimento,
            <br />
            colhendo um futuro mais verde.
          </p>
        </div>
      </section>

      {/* LADO DIREITO*/}
      <section className="flex min-h-screen items-center justify-center bg-[#f8f9f7] px-5 py-10 sm:px-8">

        {/* Cartão de login */}
        <div className="w-full max-w-[350px] rounded-[24px] border border-stone-200/80 bg-white px-7 py-8 shadow-[0_12px_35px_rgba(25,55,30,0.08)] sm:px-8 sm:py-9">

          {/* Logotipo centralizado */}
          {/* <div className="mb-7 flex justify-center">
            <img
              src="/planta.png"
              alt="Logotipo do Gerenciador de Horta"
              className="h-[76px] w-[76px] object-contain"
            />
          </div> */}

          {/* Cabeçalho */}
          <div className="mb-7">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#28613a]">
              Bem-vindo(a) de volta!
            </span>

            <h1 className="text-[25px] font-extrabold leading-tight tracking-tight text-[#172b1d]">
              Entrar na sua conta
            </h1>

            <p className="mt-2 text-[13px] leading-5 text-stone-500">
              Acesse sua conta para gerenciar a horta.
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-xs font-semibold text-stone-700"
              >
                Usuário
              </label>

              <input
                type="text"
                id="username"
                name="username"
                placeholder="Digite seu usuário"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                required
                className="w-full rounded-xl border border-stone-200 bg-[#fdfdfc] px-4 py-3.5 text-[13px] text-[#172b1d] outline-none transition-all placeholder:text-stone-400 focus:border-[#39804e] focus:bg-white focus:ring-4 focus:ring-[#285d38]/10"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-semibold text-stone-700"
              >
                Senha
              </label>

              <input
                type="password"
                id="password"
                name="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setLoginError(false);
                }}
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-stone-200 bg-[#fdfdfc] px-4 py-3.5 text-[13px] text-[#172b1d] outline-none transition-all placeholder:text-stone-400 focus:border-[#39804e] focus:bg-white focus:ring-4 focus:ring-[#285d38]/10"
              />
              
            </div>

            {loginError && (
              <p role="alert" className="text-xs font-medium text-red-700">
                Confira o usuário e a senha de demonstração 123456.
              </p>
            )}

            <div className="flex items-center">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-stone-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded border-stone-300 accent-[#1b4d2a] focus:ring-[#285d38]/20"
                />
                Lembrar de mim
              </label>
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1b4d2a] px-4 py-3.5 text-[13px] font-semibold text-white shadow-sm transition-colors duration-300 hover:bg-[#153f22] hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[#285d38]/20"
            >
              <LockKeyhole className="h-4 w-4" />
              Entrar
            </button>

          </form>
        </div>
      </section>

      {/* IMAGEM PARA CELULARES */}
      <div className="fixed left-0 top-0 -z-10 h-full w-full md:hidden">
        <img
          src="/horta.png"
          alt=""
          className="h-full w-full object-cover"
        />
      </div>

    </main>
  );
}

export default Login;
