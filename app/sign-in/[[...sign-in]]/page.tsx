import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-[#F5F0E6] py-20 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[#2D5F3F]">Welcome Back</h1>
                    <p className="text-gray-500 mt-2">Sign in to your CircuCity account</p>
                </div>
                <SignIn
                    appearance={{
                        elements: {
                            formButtonPrimary: 'bg-[#2D5F3F] hover:bg-[#1a3a28] text-sm normal-case',
                            card: 'rounded-2xl shadow-xl border-0',
                            headerTitle: 'text-[#2D5F3F]',
                            headerSubtitle: 'text-gray-500',
                            socialButtonsBlockButton: 'rounded-xl border-gray-200',
                            formFieldInput: 'rounded-xl border-gray-200',
                            footerActionLink: 'text-[#2D5F3F] hover:text-[#1a3a28]',
                        },
                    }}
                />
            </div>
        </div>
    );
}
