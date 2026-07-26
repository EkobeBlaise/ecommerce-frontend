import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { emailVerificationService } from '../../services/emailVerificationService';
import toast from 'react-hot-toast';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setVerifying(false);
      setError('No verification token provided');
    }
  }, [token]);

  const verifyEmail = async () => {
    setVerifying(true);
    try {
      const result = await emailVerificationService.verify(token!);
      if (result.success) {
        setSuccess(true);
        toast.success('Email verified successfully!');
        // Store the email for resend if needed
        if (result.email) setEmail(result.email);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
      toast.error('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const resendVerification = async () => {
    // Try to get email from URL params or from the verification attempt
    let emailToUse = email;
    
    // If we don't have email, try to extract from token or prompt user
    if (!emailToUse) {
      // Show a prompt to enter email
      const userEmail = window.prompt('Please enter your email address to resend verification:');
      if (userEmail) {
        emailToUse = userEmail;
        setEmail(emailToUse);
      } else {
        toast.error('Email is required to resend verification');
        return;
      }
    }

    try {
      const result = await emailVerificationService.resendVerification(emailToUse);
      if (result.success) {
        toast.success('Verification email resent! Please check your inbox.');
      } else {
        toast.error(result.message || 'Failed to resend verification');
      }
    } catch (error) {
      toast.error('Failed to resend verification. Please try again.');
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-pink-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Verifying your email...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Email Verified! 🎉
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your email has been successfully verified. You can now login to your account.
          </p>
          <Link
            to="/login"
            className="w-full inline-block bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-semibold transition text-center"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Verification Failed
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error || 'Unable to verify your email. The link may have expired.'}
        </p>
        <div className="space-y-3">
          <button
            onClick={resendVerification}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Resend Verification Email
          </button>
          <Link
            to="/login"
            className="w-full inline-block text-pink-600 hover:underline text-sm"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;