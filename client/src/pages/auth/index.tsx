import {
  FC,
  FormEvent,
  InputHTMLAttributes,
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
} from 'react';
import { Input } from '../../components/ui/Input';
import { mergeClassNames } from '../../utils';
import { URL_BASE } from '../../config';
import { useNavigate, useLocation } from 'react-router';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import { UserSession } from '../../types/userSession';
import { Link } from 'react-router-dom';
import ImageUpload from '../../components/ImageUpload';

enum formState {
  LOGIN,
  SIGNUP,
}

interface loginProps {
  initialState?: formState;
}

type formInputType = {
  id: number;
  label: string;
  renderCondition: formState[];
  inputProps?: Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>;
};

const LoginRegisterForm = ({ initialState = formState.LOGIN }: loginProps) => {
  const { setAuth } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [state, setState] = useState<formState>(initialState);
  const [errors, setErrors] = useState<string[]>([]);
  const [formKey, setFormKey] = useState(0);

  const formInputs: formInputType[] = useMemo(
    () => [
      {
        id: 1,
        inputProps: {
          name: 'username',
          type: 'text',
          placeholder: 'Username',
          required: true,
          pattern: '[A-Za-z0-9_]+',
          title: 'Only letters, numbers, underscores, and hyphens are allowed.',
        },
        label: 'Username',
        renderCondition: [formState.LOGIN, formState.SIGNUP],
      },
      {
        id: 2,
        inputProps: {
          name: 'displayName',
          type: 'text',
          placeholder: 'Display Name',
          required: true,
        },
        label: 'Display Name',
        renderCondition: [formState.SIGNUP],
      },
      {
        id: 3,
        inputProps: {
          name: 'password',
          type: 'password',
          placeholder: 'Password',
          required: true,
        },
        label: 'Password',
        renderCondition: [formState.LOGIN, formState.SIGNUP],
      },
      {
        id: 4,
        inputProps: {
          name: 'repassword',
          type: 'password',
          placeholder: 'Retype password',
          required: true,
        },
        label: 'Retype password',
        renderCondition: [formState.SIGNUP],
      },
      {
        id: 5,
        inputProps: {
          name: 'email',
          type: 'email',
          placeholder: 'email',
          required: true,
        },
        label: 'email',
        renderCondition: [formState.SIGNUP],
      },
      {
        id: 6,
        inputProps: {
          name: 'profileImage',
          type: 'file',
          placeholder: 'Profile Picture',
          accept: 'image/*',
        },
        label: 'Profile Picture',
        renderCondition: [formState.SIGNUP],
      },
    ],
    [],
  );

  const formRef = useRef<HTMLFormElement>(null);

  const validateForm = useCallback(
    (payload: Record<string, FormDataEntryValue>) => {
      const errors: string[] = [];

      switch (state) {
        case formState.LOGIN: {
          if (!payload.username) errors.push('Username can not be empty');
          if (!payload.password) errors.push('Password can not be empty');
          break;
        }
        case formState.SIGNUP: {
          if (!payload.username) errors.push('Username can not be empty');
          if (!payload.password) errors.push('Password can not be empty');
          if (!payload.repassword)
            errors.push('Retype password can not be empty');
          if (!payload.email) errors.push('Email can not be empty');

          const username = payload.username as string;
          if (username.length < 4 || username.length > 16)
            errors.push(
              'Username must contains at least 4 and maximum 16 characters',
            );

          const password = payload.password as string;
          const repassword = payload.repassword as string;
          if (password.localeCompare(repassword))
            errors.push('Retyped password and password are not the same');
          if (password.length < 8)
            errors.push('Password must be at least 8 characters');
          break;
        }
      }

      setErrors(errors);
      if (errors.length > 0) {
        return false;
      } else {
        return true;
      }
    },
    [state],
  );

  const resetForm = useCallback(() => {
    if (formRef.current) {
      formRef.current.reset();
    }
    setErrors([]);
    setFormKey((prevKey) => prevKey + 1);
  }, []);

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const formData = new FormData(e.currentTarget);
      const payload = Object.fromEntries(formData.entries());

      if (!validateForm(payload)) {
        return;
      }
      if (state === formState.SIGNUP) {
        const endpoint = `${URL_BASE}/register`;

        const profilePictureFile = payload.profilePicture as File;
        if (profilePictureFile) {
          formData.append('profilePicture', profilePictureFile);
        }

        const register = async () => {
          try {
            const res = await fetch(endpoint, {
              method: 'POST',
              body: formData,
            });

            const data = await res.json();

            if (res.ok) {
              resetForm();
              navigate('/login');
            } else if (res.status >= 400 && res.status < 500) {
              setErrors([data.message]);
              throw Error;
            }
          } catch (e) {
            throw new Error('Failed to register');
          }
        };

        toast.showAsync(register, {
          loading: {
            title: 'Loading...',
          },
          success: (_) => ({
            title: `Registered successfully`,
          }),
          error: (_) => ({
            title: 'Failed to register',
          }),
        });
      }

      if (state === formState.LOGIN) {
        const endpoint = `${URL_BASE}/login`;
        const body = {
          username: payload.username as string,
          password: payload.password as string,
        };
        const login = async () => {
          try {
            const res = await fetch(endpoint, {
              method: 'POST',
              body: JSON.stringify(body),
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
            });

            const data = await res.json();

            if (res.ok) {
              setAuth({
                user: data as UserSession,
              });
              resetForm();
              return navigate('/');
            } else if (res.status >= 400 && res.status < 500) {
              setErrors([data.message]);
              throw Error;
            }
          } catch (e) {
            throw new Error('Failed to login');
          }
        };

        toast.showAsync(login, {
          loading: {
            title: 'Loading...',
          },
          success: (_) => ({
            title: `Signed in successfully`,
          }),
          error: (_) => ({
            title: 'Failed to login',
          }),
        });
      }
    },
    [navigate, setAuth, state, toast, validateForm, resetForm],
  );

  useEffect(() => {
    if (pathname === '/login') {
      setState(formState.LOGIN);
    }
    if (pathname === '/register') {
      setState(formState.SIGNUP);
    }
  }, [pathname]);

  return (
    <section className="relative flex w-svw min-h-dvh items-center justify-center bg-background p-24">
      <div className="fixed top-0 left-0 h-svh w-svw overflow-hidden">
        <div className="absolute top-[65%] left-[60%] -translate-x-1/2 -translate-y-1/2 size-[80vw] blur-3xl z-10 bg-primary opacity-5 rounded-full"></div>
      </div>
      <form
        key={formKey}
        ref={formRef}
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="z-20"
      >
        <div className="p-12 border-solid rounded-lg shadow-lg shadow-card flex flex-col gap-16 bg-card">
          <div className="flex flex-col gap-2">
            <img
              className="size-12 object-cover mx-auto"
              style={{ maskSize: 'cover', WebkitMaskSize: 'cover' }}
              src="/logo.svg"
              alt="SnapMate logo"
            />
            <p className="font-bold text-xl text-center">SnapMate</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-center">Welcome</p>
            <h1 className="text-5xl font-bold text-center">
              {state === formState.LOGIN ? 'Sign in now' : 'Sign up now'}
            </h1>
          </div>
          <div className="flex flex-col gap-8">
            {formInputs.map((input) => {
              if (!input.renderCondition.includes(state)) return null;
              return (
                <FormInput
                  key={input.id}
                  label={input.label}
                  {...input.inputProps}
                />
              );
            })}
          </div>
          {errors.length > 0 && (
            <div className="flex flex-col gap-2 max-h-24 overflow-y-scroll">
              {errors.map((err, idx) => {
                return (
                  <span key={idx} className="text-danger">
                    * {err}
                  </span>
                );
              })}
            </div>
          )}
          {state === formState.LOGIN ? (
            <p className="py-4">
              Don't have an account?{' '}
              <Link
                to="/register"
                onClick={() => {
                  setErrors([]);
                  setState(formState.SIGNUP);
                }}
                className="font-bold cursor-pointer hover:underline"
              >
                Register
              </Link>
            </p>
          ) : (
            <p className="py-4">
              Already had an account?{' '}
              <Link
                to="/login"
                onClick={() => {
                  setErrors([]);
                  setState(formState.LOGIN);
                }}
                className="font-bold cursor-pointer hover:underline"
              >
                Login
              </Link>
            </p>
          )}
          <button type="submit" className="bg-primary py-4 px-20 rounded-full">
            {state === formState.LOGIN ? 'Sign in' : 'Sign up'}
          </button>
        </div>
      </form>
    </section>
  );
};

interface FormInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
  className?: string;
}

const FormInput: FC<FormInputProps> = ({ label, className, ...inputProps }) => {
  return (
    <div
      className={mergeClassNames('flex flex-col gap-2 items-start', className)}
    >
      <label htmlFor="email">{label}</label>
      {inputProps.type !== 'file' ? (
        <Input
          {...inputProps}
          className="p-4 py-6 rounded-lg min-w-[25vw]"
          id={inputProps.name}
        />
      ) : (
        <ImageUpload {...inputProps} className="rounded-lg size-full" />
      )}
    </div>
  );
};

export { formState };
export default LoginRegisterForm;
