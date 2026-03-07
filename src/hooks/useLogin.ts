import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authRepository } from '@/infrastructure/repositories/authRepository';
import { loginSchema, type LoginInput } from '@/domain/schemas/schemas';

export const useLogin = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      await authRepository.login(data);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Login failed', error);
      const message = error instanceof Error ? error.message : 'メールかパスワードが違います';
      alert('ログインに失敗しました: ' + message);
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting,
  };
};
