"use client";

import Button from "@/app/components/Button";
import Input from "@/app/components/inputs/Input";
import { useCallback, useEffect, useState } from "react";
import { useForm, FieldValues, SubmitHandler } from "react-hook-form";
import AuthSocialButton from "./AuthSocialButton";
import { BsGithub, BsGoogle } from "react-icons/bs";
import axios from "axios";
import { toast } from "react-hot-toast";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type AuthVariant = "LOGIN" | "REGISTER";

const AuthForm = () => {
	const session = useSession();
	const router = useRouter();
	const [authVariant, setAuthVariant] = useState<AuthVariant>("LOGIN");
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (session?.status === "authenticated") {
			console.log("We're In");
			router.push("/users");
		}
	}, [session?.status, router]);

	const toggleAuthVariant = useCallback(() => {
		if (authVariant === "LOGIN") {
			setAuthVariant("REGISTER");
		} else {
			setAuthVariant("LOGIN");
		}
	}, [authVariant]);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FieldValues>({
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
	});

	const onSubmit: SubmitHandler<FieldValues> = (data) => {
		setIsLoading(true);
		if (authVariant === "REGISTER") {
			axios
				.post("/api/register", data)
				.then(() => signIn("credentials", data))
				.catch(() => toast.error("Something went wrong!"))
				.finally(() => setIsLoading(false));
		}
		if (authVariant === "LOGIN") {
			signIn("credentials", {
				...data,
				redirect: false,
			})
				.then((callback) => {
					if (callback?.error) {
						toast.error("Invalid Credentials");
					}
					if (callback?.ok && !callback.error) {
						router.push("/users");
						toast.success("Welcome Back");
					}
				})
				.finally(() => setIsLoading(false));
		}
	};

	const socialAction = async (action: string) => {
		setIsLoading(true);
		signIn(action, { redirect: false })
			.then((callback) => {
				if (callback?.error) {
					toast.error("Invalid Credentials");
				}
				if (callback?.ok && !callback?.error) {
					router.push("/users");
					toast.success("Welcome Back");
				}
			})
			.finally(() => setIsLoading(false));
	};
	return (
		<div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
			<div className=' bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10'>
				<form
					onSubmit={handleSubmit(onSubmit)}
					className='space-y-6'>
					{authVariant === "REGISTER" && (
						<Input
							label='Name'
							register={register}
							id='name'
							errors={errors}
							disabled={isLoading}
						/>
					)}
					<Input
						label='Email'
						register={register}
						id='email'
						errors={errors}
						type='email'
						disabled={isLoading}
					/>
					<Input
						label='Password'
						register={register}
						id='password'
						errors={errors}
						type='password'
						disabled={isLoading}
					/>
					<div>
						<Button
							disabled={isLoading}
							fullWidth
							type='submit'>
							{authVariant === "LOGIN" ? "Sign in" : "Sign up"}
						</Button>
					</div>
				</form>
				<div className='mt-6'>
					<div className='relative'>
						<div className='absolute inset-0 flex items-center'>
							<div className='w-full border-t border-gray-300' />
						</div>
						<div className='relative flex justify-center text-sm'>
							<span className='bg-white px-2 text-gray-500'>Or continue with</span>
						</div>
					</div>

					<div className='mt-6 flex gap-2'>
						<AuthSocialButton
							icon={BsGithub}
							onClick={() => socialAction("github")}
						/>
						<AuthSocialButton
							icon={BsGoogle}
							onClick={() => socialAction("google")}
						/>
					</div>
				</div>

				<div className='flex gap-2 justify-center text-sm mt-6 px-2 text-gray-500'>
					<div>
						{authVariant === "LOGIN" ? "New to Messenger" : "Already have an account"} ?
					</div>
					<div
						onClick={toggleAuthVariant}
						className='cursor-pointer underline'>
						{authVariant === "LOGIN" ? "Create an account" : "SignIn"}
					</div>
				</div>
			</div>
		</div>
	);
};

export default AuthForm;
