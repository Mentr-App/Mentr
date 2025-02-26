import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [step, setStep] = useState<'security' | 'setPassword'>('security');
  const [newPassword, setNewPassword] = useState<string>('');

  useEffect(() => {
    if (token) {
      fetch('/api/get-security-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      .then(res => res.json())
      .then(data => setQuestions(data.questions || []))
      .catch(console.error);
    }
  }, [token]);

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers(prev => ({ ...prev, [index]: value }));
  };

  const verifyAnswers = async () => {
    const res = await fetch('/api/verify-answers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, answers })
    });
    const data = await res.json();
    if (data.success) setStep('setPassword');
  };

  const handlePasswordReset = async () => {
    const res = await fetch('/api/set-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password: newPassword })
    });
    const data = await res.json();
    if (data.success) alert('Password successfully reset');
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-5 border rounded-lg shadow-lg">
      {step === 'security' ? (
        <>
          <h2 className="text-xl font-bold mb-4">Answer Security Questions</h2>
          {questions.map((q, index) => (
            <div key={index} className="mb-4">
              <p>{q}</p>
              <Input type="text" onChange={(e) => handleAnswerChange(index, e.target.value)} />
            </div>
          ))}
          <Button onClick={verifyAnswers}>Verify Answers</Button>
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold mb-4">Set New Password</h2>
          <Input type="password" onChange={(e) => setNewPassword(e.target.value)} />
          <Button onClick={handlePasswordReset}>Reset Password</Button>
        </>
      )}
    </div>
  );
}
