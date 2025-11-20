import { useState, type FormEvent, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { registerAsync, clearError as clearAuthError } from '@/slices/auth.slice';
import { fetchDesignationsByDepartmentAsync, fetchAllDepartmentsAsync } from '@/slices/designation.slice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  APP_TITLE,
  PAGE_TITLES,
  BUTTON_TEXT,
  FORM_LABELS,
  PLACEHOLDERS,
  LINK_TEXT,
  VALIDATION_MESSAGES,
  HELPER_TEXT,
  ERROR_MESSAGES,
  LABELS,
  BUTTON_LABELS,
  ROUTES,
} from '@/constants/app.constants';
import { DEFAULT_AVATAR, SVG_VIEWBOX } from '@/constants/defaults.constants';
import { convertImageToBase64, validateImageFile } from '@/utils/image.utils';
import { Upload, X } from 'lucide-react';
import '@/styles/auth.css';

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const { designationsByDepartment, departments = [], isLoading: loadingDesignations } = useAppSelector((state) => state.designation);

  // Load departments on mount - only once
  useEffect(() => {
    dispatch(fetchAllDepartmentsAsync());
  }, [dispatch]);

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    designation: '',
    phone: '',
    profileImage: DEFAULT_AVATAR,
  });

  const [validationError, setValidationError] = useState('');
  const [imagePreview, setImagePreview] = useState<string>(DEFAULT_AVATAR);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get designations for the selected department
  const designations = designationsByDepartment[formData.department] || [];

  // Load designations when department changes
  useEffect(() => {
    if (formData.department && !designationsByDepartment[formData.department]) {
      dispatch(fetchDesignationsByDepartmentAsync(formData.department));
    }
  }, [formData.department, designationsByDepartment, dispatch]);

  const validateStep = (step: number): boolean => {
    setValidationError('');

    if (step === 1) {
      // Validate personal info
      if (!formData.name.trim()) {
        setValidationError(ERROR_MESSAGES.FULL_NAME_REQUIRED);
        return false;
      }
      if (!formData.email.trim()) {
        setValidationError(ERROR_MESSAGES.EMAIL_REQUIRED);
        return false;
      }
      if (!formData.phone.trim()) {
        setValidationError(ERROR_MESSAGES.PHONE_REQUIRED);
        return false;
      }
    } else if (step === 2) {
      // Validate work info
      if (!formData.department) {
        setValidationError(ERROR_MESSAGES.DEPARTMENT_REQUIRED);
        return false;
      }
      if (!formData.designation) {
        setValidationError(ERROR_MESSAGES.DESIGNATION_REQUIRED);
        return false;
      }
    } else if (step === 3) {
      // Validate passwords
      if (!formData.password) {
        setValidationError(ERROR_MESSAGES.PASSWORD_REQUIRED);
        return false;
      }
      if (formData.password.length < 8) {
        setValidationError(VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH);
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setValidationError(VALIDATION_MESSAGES.PASSWORDS_DONT_MATCH);
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setValidationError('');
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateStep(3)) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...credentials } = formData;
    const result = await dispatch(registerAsync(credentials));

    if (registerAsync.fulfilled.match(result)) {
      navigate('/');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (error) {
      dispatch(clearAuthError());
    }
    if (validationError) {
      setValidationError('');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid image file');
      return;
    }

    try {
      // Convert to base64
      const base64 = await convertImageToBase64(file);
      setFormData({ ...formData, profileImage: base64 });
      setImagePreview(base64);
      setValidationError('');
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Failed to process image');
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, profileImage: DEFAULT_AVATAR });
    setImagePreview(DEFAULT_AVATAR);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayError = error || validationError;

  return (
    <div className="auth-container dotted-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">{APP_TITLE.MAIN}</CardTitle>
          <CardDescription>{PAGE_TITLES.REGISTER}</CardDescription>
        </CardHeader>

        <CardContent>
          {displayError && (
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
              <span>{displayError}</span>
            </div>
          )}

          <form onSubmit={currentStep === totalSteps ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="space-y-4">
            {/* Step 1: Profile & Personal Info */}
            {currentStep === 1 && (
              <>
                {/* Profile Image Upload */}
                <div className="space-y-2">
                  <Label>{LABELS.PROFILE_PHOTO}</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Profile preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-border"
                      />
                      {imagePreview !== DEFAULT_AVATAR && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="profileImage"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {LABELS.UPLOAD_PHOTO}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        {HELPER_TEXT.IMAGE_UPLOAD_REQUIREMENTS}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">{FORM_LABELS.FULL_NAME}</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{FORM_LABELS.EMAIL}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{FORM_LABELS.PHONE}</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            {/* Step 2: Work Information */}
            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="department">{FORM_LABELS.DEPARTMENT}</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => {
                      setFormData({ ...formData, department: value, designation: '' });
                      if (error) dispatch(clearAuthError());
                      if (validationError) setValidationError("");
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={PLACEHOLDERS.SELECT_DEPARTMENT} />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.length === 0 && (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          {loadingDesignations ? LABELS.LOADING_DEPARTMENTS : LABELS.NO_DEPARTMENTS}
                        </div>
                      )}
                      {departments.map((dept) => (
                        <SelectItem key={dept.code} value={dept.code}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.department && (
                  <div className="space-y-2">
                    <Label htmlFor="designation">{FORM_LABELS.DESIGNATION}</Label>
                    <Select
                      value={formData.designation}
                      disabled={loadingDesignations || designations.length === 0}
                      onValueChange={(value) => {
                        setFormData({ ...formData, designation: value });
                        if (error) dispatch(clearAuthError());
                        if (validationError) setValidationError("");
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={loadingDesignations ? LABELS.LOADING_DESIGNATIONS : LABELS.SELECT_DESIGNATION} />
                      </SelectTrigger>
                      <SelectContent>
                        {designations.map((designation) => (
                          <SelectItem key={designation.id} value={designation.title}>
                            {designation.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.designation && (
                      <p className="text-xs text-muted-foreground">
                        {LABELS.LEVEL}: {designations.find(d => d.title === formData.designation)?.level}
                      </p>
                    )}
                  </div>
                )}

                {!formData.department && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {HELPER_TEXT.SELECT_DEPARTMENT_FIRST}
                  </p>
                )}
              </>
            )}

            {/* Step 3: Security */}
            {currentStep === 3 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password">{FORM_LABELS.PASSWORD}</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    {HELPER_TEXT.PASSWORD_REQUIREMENT}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{FORM_LABELS.CONFIRM_PASSWORD}</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-2">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                >
                  {BUTTON_LABELS.BACK}
                </Button>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {currentStep === totalSteps
                  ? isLoading
                    ? BUTTON_TEXT.CREATING_ACCOUNT
                    : BUTTON_TEXT.SIGN_UP
                  : BUTTON_LABELS.NEXT}
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            {LINK_TEXT.HAVE_ACCOUNT}{" "}
            <Link
              to={ROUTES.LOGIN}
              className="text-primary hover:underline font-medium"
            >
              {LINK_TEXT.SIGN_IN_LINK}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
