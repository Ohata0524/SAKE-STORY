import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authRepository } from '@/infrastructure/repositories/authRepository';
import { signupSchema, type SignupInput } from '@/domain/schemas/schemas';

export const useSignup = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
  });

  const onSubmit = async (values: SignupInput) => {
    try {
      await authRepository.signUp(values);
      alert('アカウントを作成しました！ログインしてください。');
      router.push('/login');
    } catch (error) {
      console.error('Signup failed', error);
      const message = error instanceof Error ? error.message : '不明なエラー';
      alert('登録に失敗しました: ' + message);
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting,
  };
};
