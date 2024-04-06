import { LoginButton } from "./login-button"

export const LoginButtons = () => {
  return (
    <div className="mt-10 flex flex-col justify-center gap-3">
      <h2 className="text-center">Или войти через</h2>
      <LoginButton text='GitHub' provider='github' />
      <LoginButton text='Google' provider='google' />
    </div>
  )
}

