import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupStep1 from './SignupStep1';
import SignupStep2 from './SignupStep2';
import ProgressBar from './ProgressBar';
import './Signup.css';

const Signup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    termsAccepted: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.fullName || formData.fullName.length < 2 || formData.fullName.length > 50) {
      newErrors.fullName = 'Full name must be between 2 and 50 characters';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phone || !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit Indian phone number (starts with 6-9)';
    }
    
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase, one lowercase, and one number';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the Terms of Service and Privacy Policy';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (formData.emergencyContactName && (formData.emergencyContactName.length < 2 || formData.emergencyContactName.length > 50)) {
      newErrors.emergencyContactName = 'Contact name must be between 2 and 50 characters';
    }
    
    const phoneRegex = /^[6-9]\d{9}$/;
    if (formData.emergencyContactPhone && !phoneRegex.test(formData.emergencyContactPhone)) {
      newErrors.emergencyContactPhone = 'Please enter a valid 10-digit Indian phone number (starts with 6-9)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Continue = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleStep2Continue = async () => {
    if (validateStep2()) {
      setIsLoading(true);
      try {
        // Map frontend field names to what backend expects
        const payload = {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactPhone: formData.emergencyContactPhone,
          emergencyContactRelationship: formData.emergencyContactRelationship,
        };

        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        
        const data = await response.json();
        
        if (data.success) {
          localStorage.setItem('authToken', data.accessToken);
          if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
          }
          if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
          }
          navigate('/dashboard');
        } else {
          setErrors({ submit: data.message });
        }
      } catch (error) {
        console.error('Registration error:', error);
        setErrors({ submit: 'Registration failed. Please check your connection and try again.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleStep2Skip = async () => {
    setIsLoading(true);
    try {
      // Map frontend field names to what backend expects
      const skipData = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      };
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(skipData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('authToken', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        navigate('/dashboard');
      } else {
        setErrors({ submit: data.message });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: 'Registration failed. Please check your connection and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side - Hidden on Mobile */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt="Indian women traveling safely"
            className="w-full h-full object-cover"
            src="/auth-illustration.png"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2c2a1e]/90 via-[#2c2a1e]/60 to-[#2c2a1e]/40"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 h-full">
          {/* Logo */}
          <div className="text-3xl font-bold font-serif text-white mb-2">Nirbhaya</div>
          <div className="text-xs tracking-widest text-gray-300 mb-12">YOUR SAFETY. OUR PRIORITY</div>
          
          {/* Heading */}
          <h1 className="text-5xl font-bold font-serif text-white leading-tight mb-8 text-center">
            Begin your journey
          </h1>
          
          {/* Features List */}
          <div className="space-y-6 mb-12">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-3xl text-white">notifications_active</span>
              <div>
                <h3 className="text-white font-semibold text-lg">SOS Alerts</h3>
                <p className="text-gray-300 text-sm">Instant emergency notifications to your trusted circle with precise location tracking</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-3xl text-white">map</span>
              <div>
                <h3 className="text-white font-semibold text-lg">Safe Zone Maps</h3>
                <p className="text-gray-300 text-sm">Navigate confidently with community-verified safe routes and shelter locations</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-3xl text-white">group</span>
              <div>
                <h3 className="text-white font-semibold text-lg">Guardian Network</h3>
                <p className="text-gray-300 text-sm">Connect with verified volunteers and authorities in your immediate vicinity</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-3xl text-white">support_agent</span>
              <div>
                <h3 className="text-white font-semibold text-lg">24/7 Priority Helpline</h3>
                <p className="text-gray-300 text-sm">Direct access to our dedicated support team and emergency dispatchers at any time</p>
              </div>
            </div>
          </div>
          
          {/* Stats Row */}
          <div className="flex justify-center gap-12">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">10k+</div>
              <div className="text-sm text-gray-300">Protected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">50+</div>
              <div className="text-sm text-gray-300">Cities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-sm text-gray-300">Support</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Side - Form Area */}
      <div className="w-full lg:w-3/5 bg-white h-full overflow-y-auto flex items-center justify-center px-6 py-8 lg:px-12 lg:py-16">
        <div className="w-full max-w-xl">
          {/* Progress Bar */}
          <ProgressBar currentStep={currentStep} />
          
          {/* Error Message */}
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}
          
          {/* Step Content */}
          {currentStep === 1 ? (
            <SignupStep1
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              onContinue={handleStep1Continue}
              isLoading={isLoading}
            />
          ) : (
            <SignupStep2
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              onContinue={handleStep2Continue}
              onSkip={handleStep2Skip}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
