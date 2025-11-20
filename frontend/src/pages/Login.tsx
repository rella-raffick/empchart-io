import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { loginAsync, clearError } from '@/slices/auth.slice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { APP_TITLE, PAGE_TITLES, BUTTON_TEXT, FORM_LABELS, LINK_TEXT, ROUTES } from '@/constants/app.constants';
import { SVG_VIEWBOX } from '@/constants/defaults.constants';
import '@/styles/auth.css';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const result = await dispatch(loginAsync(formData));

    if (loginAsync.fulfilled.match(result)) {
      navigate(ROUTES.HOME);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (error) {
      dispatch(clearError());
    }
  };

  return (
    <div className="auth-container dotted-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">{APP_TITLE.MAIN}</CardTitle>
          <CardDescription>{PAGE_TITLES.LOGIN}</CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="auth-error mb-4">
              <svg
                className="error-icon"
                fill="currentColor"
                viewBox={SVG_VIEWBOX.ICON_20}
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{FORM_LABELS.EMAIL}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{FORM_LABELS.PASSWORD}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? BUTTON_TEXT.SIGNING_IN : BUTTON_TEXT.SIGN_IN}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            {LINK_TEXT.NO_ACCOUNT}{" "}
            <Link
              to={ROUTES.REGISTER}
              className="text-primary hover:underline font-medium"
            >
              {LINK_TEXT.SIGN_UP_LINK}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
