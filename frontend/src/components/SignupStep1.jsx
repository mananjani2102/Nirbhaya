import React, { useState } from 'react';

const EyeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeOffIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

const CheckCircleIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
  </svg>
);

const EmptyCircleIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SignupStep1 = ({ formData, setFormData, errors, onContinue, isLoading }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      errors[name] = '';
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData(prev => ({
      ...prev,
      phone: value
    }));
    
    if (errors.phone) {
      errors.phone = '';
    }
  };

  // Password strength logic
  const pass = formData.password || '';
  const checks = {
    length: pass.length >= 8,
    cases: /(?=.*[a-z])(?=.*[A-Z])/.test(pass),
    number: /(?=.*\d)/.test(pass),
    special: /(?=.*[!@#$%^&*()_+{}:"|<>?`~\-=[\]\\;',./])/.test(pass)
  };
  
  const score = Object.values(checks).filter(Boolean).length;
  
  const strengthLabels = ['Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const strengthColors = ['bg-red-500', 'bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-[#2c7a40]'];
  const currentStrengthColor = strengthColors[score];

  return (
    <div className="fade-in">
      {/* Heading */}
      <h2 className="text-3xl font-bold font-serif text-[#2c2a1e] mb-2">
        Create your account
      </h2>
      <p className="text-sm text-[#6b6550] mb-8">
        Your safe journey starts here
      </p>

      {/* Form */}
      <div className="space-y-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold text-[#2c2a1e] mb-2 font-serif">
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            className={`w-full px-4 py-3 border-2 rounded-lg bg-[#eef2ff] focus:outline-none transition-colors ${
              errors.fullName 
                ? 'border-red-500 bg-white' 
                : 'border-transparent focus:border-[#7a8a42]'
            }`}
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
          )}
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-sm font-semibold text-[#2c2a1e] mb-2 font-serif">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="your@email.com"
            className={`w-full px-4 py-3 border-2 rounded-lg bg-[#eef2ff] focus:outline-none transition-colors ${
              errors.email 
                ? 'border-red-500 bg-white' 
                : 'border-transparent focus:border-[#7a8a42]'
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-semibold text-[#2c2a1e] mb-2 font-serif">
            Phone Number
          </label>
          <div className="flex gap-2">
            <div className="flex items-center px-4 py-3 border-2 border-transparent rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
              <span className="text-gray-600 font-medium">+91</span>
            </div>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="10-digit number"
              maxLength="10"
              className={`flex-1 px-4 py-3 border-2 rounded-lg bg-[#eef2ff] focus:outline-none transition-colors ${
                errors.phone 
                  ? 'border-red-500 bg-white' 
                  : 'border-transparent focus:border-[#7a8a42]'
              }`}
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-[#2c2a1e] mb-2 font-serif">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Create strong password"
              className={`w-full px-4 py-3 pr-12 border-2 rounded-lg bg-white ring-1 ring-gray-300 focus:outline-none transition-colors ${
                errors.password 
                  ? 'border-red-500' 
                  : 'border-transparent focus:border-[#7a8a42] focus:ring-[#7a8a42]'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#7a8a42] transition-colors"
            >
              {showPassword ? <EyeIcon className="w-5 h-5" /> : <EyeOffIcon className="w-5 h-5" />}
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          {pass.length > 0 && (
            <div className="mt-3 fade-in">
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4].map(idx => (
                  <div 
                    key={idx} 
                    className={`h-1.5 flex-1 rounded-full ${idx <= score ? currentStrengthColor : 'bg-gray-200'}`}
                  ></div>
                ))}
              </div>
              <p className={`text-sm font-semibold mb-2 ${score >= 3 ? 'text-[#2c7a40]' : 'text-[#7a8a42]'}`}>
                Password strength: {strengthLabels[score]}
              </p>
              <div className="space-y-1 text-sm">
                <div className={`flex items-center gap-2 ${checks.length ? 'text-[#2c7a40]' : 'text-[#7a8a42]'}`}>
                   {checks.length ? <CheckCircleIcon className="w-4 h-4" /> : <EmptyCircleIcon className="w-4 h-4" />}
                   <span className="font-medium">At least 8 characters</span>
                </div>
                <div className={`flex items-center gap-2 ${checks.cases ? 'text-[#2c7a40]' : 'text-[#7a8a42]'}`}>
                   {checks.cases ? <CheckCircleIcon className="w-4 h-4" /> : <EmptyCircleIcon className="w-4 h-4" />}
                   <span className="font-medium">Contains uppercase and lowercase letters</span>
                </div>
                <div className={`flex items-center gap-2 ${checks.number ? 'text-[#2c7a40]' : 'text-[#7a8a42]'}`}>
                   {checks.number ? <CheckCircleIcon className="w-4 h-4" /> : <EmptyCircleIcon className="w-4 h-4" />}
                   <span className="font-medium">Contains at least one number</span>
                </div>
                <div className={`flex items-center gap-2 ${checks.special ? 'text-[#2c7a40]' : 'text-[#7a8a42]'}`}>
                   {checks.special ? <CheckCircleIcon className="w-4 h-4" /> : <EmptyCircleIcon className="w-4 h-4" />}
                   <span className="font-medium">Contains at least one special character</span>
                </div>
              </div>
            </div>
          )}

          {errors.password && (
            <p className="mt-2 text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-semibold text-[#2c2a1e] mb-2 font-serif">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Re-enter password"
              className={`w-full px-4 py-3 pr-12 border-2 rounded-lg bg-[#eef2ff] focus:outline-none transition-colors ${
                errors.confirmPassword 
                  ? 'border-red-500 bg-white' 
                  : 'border-transparent focus:border-[#7a8a42]'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#7a8a42] transition-colors"
            >
              {showConfirmPassword ? <EyeIcon className="w-5 h-5" /> : <EyeOffIcon className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Terms and Privacy Policy */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={formData.termsAccepted || false}
              onChange={handleInputChange}
              className="mt-1 w-4 h-4 text-[#7a8a42] bg-white border-gray-300 rounded focus:ring-[#7a8a42]"
            />
            <span className="text-sm text-[#6b6550]">
              I agree to the <span className="font-bold text-[#7a8a42]">Terms of Service</span> and <span className="font-bold text-[#7a8a42]">Privacy Policy</span>
            </span>
          </label>
          {errors.termsAccepted && (
            <p className="mt-1 text-sm text-red-500">{errors.termsAccepted}</p>
          )}
        </div>
      </div>

      {/* Continue Button */}
      <button
        onClick={onContinue}
        disabled={isLoading}
        className="w-full mt-6 py-4 px-6 bg-[#7a8a42] text-white font-semibold text-lg rounded-lg hover:bg-[#6b7a3a] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Creating Account...' : 'Continue'}
      </button>

      {/* Bottom Link */}
      <div className="text-center mt-6 mb-8">
        <p className="text-sm text-[#6b6550]">
          Already have a sanctuary?{' '}
          <a href="/login" className="text-[#7a8a42] font-semibold hover:underline">
            Log in here
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignupStep1;
